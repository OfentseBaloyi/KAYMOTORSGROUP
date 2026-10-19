# Supabase setup

You already have a project at `https://uvhcmvtbwgdxipwzwjwp.supabase.co`. These steps create the tables, security rules and photo storage.

## 1. Run the migration

1. Open the Supabase dashboard → your project → **SQL Editor** → **New query**.
2. Open `supabase/migrations/20261019000100_initial_schema.sql` in VS Code, copy everything, paste it into the editor.
3. Click **Run**. You should see "Success. No rows returned".

Run it **once**. Running it again fails with "relation already exists", which is harmless but means nothing changed.

## 2. Check it worked

- **Table Editor** shows `cars`, `car_images` and `viewing_requests`, each with a "RLS enabled" label.
- **Storage** shows a public bucket called `car-images`.
- **Authentication → Policies** shows:
  - `cars`: "Public can read cars" (SELECT)
  - `car_images`: "Public can read car images" (SELECT)
  - `viewing_requests`: "Public can submit viewing requests" (INSERT)

## 3. Environment variables

In `.env.local` (project root, not committed):

| Variable | Where to find it | Browser-safe? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API Keys / Data API | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → Publishable key (`sb_publishable_…`) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → Secret key (`sb_secret_…`) | **No — server only** |

The secret key bypasses all security rules. Never commit it, never paste it in chat, never give it a `NEXT_PUBLIC_` prefix.

Restart `npm run dev` after changing `.env.local`.

## 4. Admin login

1. **Authentication → Sign In / Providers**: make sure **Email** is enabled and turn **Allow new users to sign up** off. Admin accounts are only created by you.
2. **Authentication → Users → Add user → Create new user**: enter the email and a strong password, tick **Auto Confirm User**.
3. Add that email to `ADMIN_EMAILS` in `.env.local` (comma separated for more than one), restart `npm run dev`, and sign in at `/admin/login`.

A Supabase account alone isn't enough: the email must also be in `ADMIN_EMAILS`. To remove someone, delete them from that list (and from Supabase Users).

There's no "forgot password" page yet. To change a password, delete the user in Authentication → Users and create them again with the new one.

## 5. What the security rules allow

| | Visitors (publishable key) | Admin (secret key, server only) |
|---|---|---|
| Read cars and photos | ✅ | ✅ |
| Add / edit / delete cars | ❌ | ✅ |
| Upload / delete photos | ❌ | ✅ |
| Submit a viewing request | ✅ (status must be `new`, date not in the past, car not sold) | ✅ |
| Read / update viewing requests | ❌ | ✅ |

## How the site picks its data

- Supabase env vars **missing** → local demo cars from `src/lib/data/seed.ts`.
- Env vars **set** but migration **not run** → demo cars, with a warning in the terminal.
- Env vars set and migration run → real data from Supabase (empty until you add cars in `/admin`).

## Changing the schema later

Add a new file in `supabase/migrations/` with a later timestamp (e.g. `20261101000100_add_vin.sql`) and run only that file in the SQL editor. Don't edit migrations that have already been run.
