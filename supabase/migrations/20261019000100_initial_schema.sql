-- Kay Motors Group: initial schema
-- Paste into Supabase Dashboard -> SQL Editor -> New query, then Run.
-- Safe to run once on an empty project.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Stock numbers: KM001, KM002, ... (grows to KM1000+ automatically).
create sequence if not exists public.car_stock_number_seq start 1;

create or replace function public.next_stock_number()
returns text
language sql
set search_path = ''
as $$
  select 'KM' || lpad(nextval('public.car_stock_number_seq')::text, 3, '0');
$$;

-- Only the server (service role) may hand out stock numbers.
revoke all on function public.next_stock_number() from public, anon, authenticated;
revoke all on sequence public.car_stock_number_seq from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- cars
-- ---------------------------------------------------------------------------

create table public.cars (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  stock_number     text not null unique,
  make             text not null check (char_length(make) between 1 and 50),
  model            text not null check (char_length(model) between 1 and 50),
  variant          text check (char_length(variant) <= 100),
  year             int  not null check (year between 1950 and 2100),
  price            int  not null check (price >= 0),          -- whole rands
  mileage_km       int  not null check (mileage_km >= 0),
  transmission     text not null check (transmission in ('manual', 'automatic')),
  fuel_type        text not null check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),
  body_type        text not null check (body_type in ('hatchback', 'sedan', 'suv', 'bakkie', 'mpv', 'coupe', 'other')),
  colour           text check (char_length(colour) <= 50),
  engine           text check (char_length(engine) <= 100),
  owners           int  check (owners >= 0),
  service_history  boolean not null default false,
  accident_free    boolean not null default false,
  spare_keys       boolean not null default false,
  papers_in_order  boolean not null default false,
  features         text[] not null default '{}',
  description      text check (char_length(description) <= 5000),
  status           text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  is_featured      boolean not null default false,
  sold_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.cars.price is 'Asking price in whole rands, no cents.';

create trigger cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();

-- Keep sold_at in step with status, so "sold this month" is always right.
create or replace function public.cars_track_sold_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'sold' and (tg_op = 'INSERT' or old.status is distinct from 'sold') then
    new.sold_at = coalesce(new.sold_at, now());
  elsif new.status <> 'sold' then
    new.sold_at = null;
  end if;
  return new;
end;
$$;

create trigger cars_track_sold_at
  before insert or update of status on public.cars
  for each row execute function public.cars_track_sold_at();

-- Indexes for inventory filters and sorting.
create index cars_status_created_idx on public.cars (status, created_at desc);
create index cars_status_price_idx   on public.cars (status, price);
create index cars_status_mileage_idx on public.cars (status, mileage_km);
create index cars_make_model_idx     on public.cars (lower(make), lower(model));
create index cars_year_idx           on public.cars (year);
create index cars_body_type_idx      on public.cars (body_type);
create index cars_featured_idx       on public.cars (is_featured) where is_featured;
create index cars_sold_at_idx        on public.cars (sold_at desc) where status = 'sold';

-- ---------------------------------------------------------------------------
-- car_images
-- ---------------------------------------------------------------------------

create table public.car_images (
  id            uuid primary key default gen_random_uuid(),
  car_id        uuid not null references public.cars (id) on delete cascade,
  storage_path  text not null,      -- path inside the car-images bucket
  sort_order    int  not null default 0,   -- 0 = cover photo
  alt           text check (char_length(alt) <= 200),
  created_at    timestamptz not null default now()
);

create index car_images_car_sort_idx on public.car_images (car_id, sort_order);

-- ---------------------------------------------------------------------------
-- viewing_requests
-- ---------------------------------------------------------------------------

create table public.viewing_requests (
  id                 uuid primary key default gen_random_uuid(),
  -- Keep the request if the car is later deleted.
  car_id             uuid references public.cars (id) on delete set null,
  name               text not null check (char_length(name) between 2 and 80),
  phone              text not null check (phone ~ '^\+27[0-9]{9}$'),   -- stored as +27XXXXXXXXX
  preferred_date     date not null,
  preferred_time     text not null check (preferred_time in ('morning', 'afternoon', 'evening')),
  payment_readiness  text not null check (payment_readiness in ('cash_ready', 'finance_preapproved', 'arranging')),
  message            text check (char_length(message) <= 1000),
  status             text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'no_show', 'cancelled')),
  created_at         timestamptz not null default now()
);

create index viewing_requests_status_created_idx on public.viewing_requests (status, created_at desc);
create index viewing_requests_car_idx on public.viewing_requests (car_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The service role key (server only) bypasses RLS for admin work.
-- ---------------------------------------------------------------------------

alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.viewing_requests enable row level security;

create policy "Public can read cars"
  on public.cars for select
  to anon, authenticated
  using (true);

create policy "Public can read car images"
  on public.car_images for select
  to anon, authenticated
  using (true);

-- Visitors can submit a request, but can't read, change or delete any.
-- New requests must start as 'new' and be for a car that isn't sold.
create policy "Public can submit viewing requests"
  on public.viewing_requests for insert
  to anon, authenticated
  with check (
    status = 'new'
    and preferred_date >= current_date
    and (
      car_id is null
      or exists (
        select 1 from public.cars c
        where c.id = car_id and c.status <> 'sold'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: public bucket for car photos
-- Public bucket = anyone can read by URL. There are no insert/update/delete
-- policies, so only the service role (server side) can upload or remove files.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-images',
  'car-images',
  true,
  5242880,  -- 5 MB per file (photos are compressed in the browser first)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
