# Kay Motors Group — Website Build Prompt (Version 1)

You are helping me (a junior full-stack developer on Windows, using VS Code + PowerShell) build a production-quality website for a real client. Read this whole file before writing any code.

## How I want you to work

1. **Inspect first.** Look at the current folder before doing anything. Do not assume any files, packages, env variables or database tables exist.
2. **Work in phases** (listed at the bottom). After each phase, stop and give me a short summary: what you built, which files changed, how to test it, and anything I need to do manually.
3. **Explain before big changes.** Never delete or overwrite existing work without asking me first. No destructive commands (`rm -rf`, `git reset --hard`, dropping tables, etc.) without my explicit approval.
4. **Give exact commands** for PowerShell, and tell me which folder to run them in.
5. Write clean, maintainable, typed code with sensible file names. Add short comments only where the "why" isn't obvious.
6. `npm run lint` and `npm run build` must pass at the end of every phase.

---

## The client

**Kay Motors Group (Pty) Ltd**: an independent, pre-owned car seller based in **Centurion / Pretoria, South Africa**. He currently sells through Instagram and Facebook only. Tagline idea from his page: *immaculate pre-owned vehicles at reasonable prices.*

| Detail | Value |
|---|---|
| Phone | 068 330 1795 |
| WhatsApp | +27 68 330 1795 (link: `https://wa.me/27683301795`) |
| Email | kaymotorsgroup@gmail.com |
| Instagram | `kaymotorsgroup_` (https://instagram.com/kaymotorsgroup_) |
| Domain | kaymotorsgroup.co.za |

**How he sells (the site must reflect this):**
- **No showroom.** Viewings are **by appointment only**, at a location agreed with the buyer over WhatsApp or a call. Never show a street address or a map pin.
- **Cash / EFT deals.** Buyers using their own bank finance are welcome (he mentions Capitec and MotoData Vehicle Finance in his posts). There is **no** in-house finance, **no** finance calculator, **no** credit application.
- **No trade-ins.**
- **Serious buyers only.** He hates time-wasters and "joyriders."
- **WhatsApp is his main channel.**

Put all these business details in **one config file** (e.g. `src/config/site.ts`) so they can be edited in one place. Mark the finance wording with a `// TODO: confirm with client` comment.

---

## Core requirements

### 1. Public site — no login, ever, for visitors
Visitors must be able to do **everything** without creating an account: browse, search, filter, view cars, share cars, contact him on WhatsApp, and request a viewing.

### 2. Admin portal — no authentication yet (temporary)
I'm not adding Supabase Auth yet. Build the admin portal at `/admin` **without login for now**, but protect it like this:
- In **development** (`npm run dev`) `/admin` works normally.
- In **production**, `/admin` must be **blocked** (return 404) by `middleware.ts` **unless** the env variable `ADMIN_ENABLED=true` is set. Default is blocked.
- All admin reads/writes go through **Next.js Server Actions / route handlers using the Supabase service role key on the server only**. The service role key must never reach the browser (no `NEXT_PUBLIC_` prefix).
- Structure the code so adding Supabase Auth later only means adding a session check in middleware and in one `requireAdmin()` helper, which is a no-op for now. Put a clear `// TODO: add Supabase Auth` there.

### 3. Supabase may not exist yet
I still need to create the Supabase project. So:
- Build a small **data access layer** (`src/lib/data/…`) that every page uses. If the Supabase env variables are missing, it falls back to **local seed data** (6–8 realistic South African used cars, e.g. VW Polo, Toyota Corolla Cross, Ford Ranger, Toyota Fortuner, Suzuki Swift, Hyundai Grand i10, BMW 320i, Kia Picanto) with placeholder images. When the env variables are present, it uses Supabase.
- Write the database schema as SQL migration files in `supabase/migrations/` that I can paste into the Supabase SQL editor. Don't try to connect to or modify any Supabase project yourself.
- Create `.env.local.example` listing every env variable with a comment. Make sure `.env.local` is in `.gitignore`.

### 4. Mobile-first and responsive
Most visitors arrive from Instagram on a phone. Design for ~375px width first, then scale up. Tap targets at least 44px. On mobile car pages, use a **sticky bottom bar** with "WhatsApp" and "Book viewing" buttons.

### 5. Use his logo
The logo is at `public/brand/kay-motors-logo.png` (I'll place it there). It's a retro kombi van with a surfboard, "KAY MOTORS" in navy and orange, and "GROUP" underneath. It has a **white background**, so place it on white/light surfaces only, or tell me if you need a transparent version. Also use it to generate the favicon and default Open Graph image.

---

## Design direction — it must NOT look AI-generated

This should look like it was designed by a person for this specific business. Think of a confident independent dealer's site, not a SaaS landing page template.

**Brand:**
- Colours come from the logo: **deep navy** (approx `#1C2630`) and **burnt orange** (approx `#EE7D23`). Check the logo file and adjust the hex values to match. Use warm off-white (e.g. `#FAF8F5`) for backgrounds and real neutrals for text. Orange is for accents and key actions only, not everywhere.
- Personality: friendly, laid-back, trustworthy. The retro kombi feel can show up in small details (the double-line stripe under "GROUP" in the logo works well as a section divider motif), but keep it subtle.
- Typography: a strong condensed display font for headings (e.g. **Barlow Condensed**, uppercase for key headings, like the logo) and a clean readable body font (e.g. **Barlow** or **DM Sans**). Load them with `next/font`.

**Avoid these "AI template" signs:**
- Purple/blue gradients, glassmorphism, glowing blobs, gradient text
- Generic hero copy like "Welcome to Kay Motors — Your Journey Starts Here" or "Drive Your Dreams"
- Rows of three identical feature cards with icons in circles
- Emojis used as icons, stock "happy family with car" imagery, fake testimonials, fake stats ("10,000+ happy customers")
- Everything centred, oversized rounded corners on everything, excessive shadows, generic fade-up animations on every section

**Do this instead:**
- **Cars are the hero.** The homepage should show actual stock near the top (e.g. "In stock now"), not a big empty banner.
- Real dealer information density: price, year, mileage, transmission and fuel type visible on every card at a glance.
- Left-aligned, editorial layouts with varied section structures. Use whitespace with intention.
- Plain, direct copy in a South African tone. Short and confident. Example: *"Viewings by appointment. WhatsApp us to arrange a time and place."*
- Small, purposeful motion only (hover states, image gallery transitions).
- Use a consistent icon set (e.g. `lucide-react`) sparingly.
- Accessibility: semantic HTML, proper headings, alt text, visible focus states, colour contrast that passes WCAG AA.

**Formatting (South Africa):**
- Prices: `R 189 900` (space as thousands separator, no decimals). Use `Intl.NumberFormat('en-ZA')`.
- Mileage: `142 000 km`.
- Dates in `en-ZA` format.

---

## Pages and features

### Public
1. **Home `/`**
   - Logo + simple nav (Cars, How it works, Contact) + WhatsApp button
   - "In stock now": featured/latest available cars
   - Short "How buying from us works" strip (see below)
   - "Recently sold" strip (sold cars with a SOLD badge)
   - Footer with contact details, Instagram link, "Kay Motors Group (Pty) Ltd"
2. **Inventory `/cars`**
   - Filters: make, model, price range, year range, max mileage, transmission, fuel type, body type
   - Sort: newest, price low–high, price high–low, lowest mileage
   - Filters stored in **URL search params** (so filtered results can be shared)
   - On mobile, filters open in a bottom sheet / drawer
   - Show available and reserved cars by default, with a toggle to include sold
   - Good empty state ("Nothing matching right now. WhatsApp us what you're looking for.")
3. **Car detail `/cars/[slug]`**
   - Swipeable photo gallery with thumbnails and full-screen view
   - Title (year, make, model, variant), price, status badge (Available / Reserved / Sold)
   - Key specs grid: year, mileage, transmission, fuel, body type, colour, engine, number of owners
   - Feature list with check marks (from the feature checklist)
   - Trust badges where true: "Service history", "Accident free", "Spare keys", "Papers in order"
   - Description
   - **WhatsApp button** opening `https://wa.me/27683301795?text=...` with a prefilled message: *"Hi Kay Motors, I'm interested in the 2019 VW Polo 1.0 TSI Highline (Stock KM023). Is it still available?"*
   - **Book a viewing** form (see below)
   - Share button (Web Share API, with copy-link fallback)
   - "You might also like": similar available cars
   - Sold cars stay viewable with a clear SOLD state and the action buttons replaced by "This one's gone. See what's in stock."
4. **How it works `/how-it-works`**
   - Steps: find a car, then book a viewing, then inspect and test drive at an agreed place, then sign the sale agreement, then pay (Cash/EFT or your bank's finance), then paperwork and handover
   - **"Buy safely"** section: never pay before seeing the car in person; only deal through his official numbers and Instagram; beware of scammers copying his photos
5. **Contact `/contact`**: phone, WhatsApp, email, Instagram, service areas (Centurion, Pretoria and surrounds), "viewings by appointment" note. No address, no map.
6. **404 page** in the brand style.

### Book a viewing (no login)
Fields: name, phone (SA format validation), preferred date, preferred time slot (morning / afternoon / evening), **"How will you pay?"** (Cash/EFT ready · Bank finance pre-approved · Still arranging), optional message, and a required checkbox: *"I understand viewings are by appointment and for serious buyers only."*
- Validate with **zod** on client and server.
- Add a hidden **honeypot field** to block spam bots.
- On submit: save to the `viewing_requests` table, show a clear success screen, and offer a button to **also send the request on WhatsApp** (prefilled with the details).

### Admin `/admin` (no auth for now — see rules above)
1. **Dashboard**: counts (available, reserved, sold this month, new viewing requests) and latest requests.
2. **Cars list**: table on desktop, cards on mobile; search; quick status change (Available / Reserved / Sold); edit; delete (with a confirmation dialog).
3. **Add / edit car form** — must be fast to use on a phone:
   - Fields matching the `cars` table
   - Auto-generated stock number (e.g. `KM001`, `KM002`) and slug (e.g. `2019-volkswagen-polo-1-0-tsi-highline-km023`)
   - **Photo upload**: multiple images, **compressed in the browser before upload** (e.g. `browser-image-compression`, max ~1600px wide, ~200–300 KB), drag to reorder (e.g. `@dnd-kit`), first image is the cover, delete images
   - **Feature checklist**: tick boxes for common features (one owner, service history with books, recently serviced, accident free, paint free, spare keys, cruise control, auto headlights, rain sensors, parking sensors, reverse camera, Bluetooth, Apple CarPlay/Android Auto, sunroof, leather seats, alloy wheels, new tyres, factory alarm, Isofix, airbags, etc.) **plus** an "add custom feature" input
   - "Featured on homepage" toggle
4. **Instagram caption generator** (on each car's edit page): a "Copy caption" button that generates a caption in **his posting style**:
   ```
   2014 Volkswagen Polo 1.2 TSI Highline (81kW) 🔥

   - One Owner Since New ✅
   - Service History with Books ✅
   - Accident Free ✅
   - Only 142 000 km
   - 6 Speed Manual Transmission
   ...

   R 129 900

   NB‼️ Viewing on appointment only. No casual viewing without intention to buy, no time wasters, no joyrides whatsoever.

   CASH/EFT DEALS ✅  No Trade-ins
   📍 Pretoria / Centurion

   Call/WhatsApp ☎️ Kay Motors Group (Pty) Ltd
   068 330 1795
   🔗 kaymotorsgroup.co.za/cars/<slug>
   ```
   (Emojis are fine **in the generated caption only**, because that's his Instagram style. Not in the website UI.) Make the template easy to edit in one file.
5. **Viewing requests**: list sorted with the most ready buyers first (Cash/EFT ready, then finance pre-approved, then still arranging), then by date. Statuses: New, Confirmed, Completed, No-show, Cancelled. A "Confirm on WhatsApp" button that opens WhatsApp to the buyer's number with a prefilled confirmation message.

---

## Database (Supabase / Postgres)

Write migrations for:

- **`cars`**: `id` uuid pk, `slug` unique, `stock_number` unique, `make`, `model`, `variant`, `year` int, `price` int (rands), `mileage_km` int, `transmission` (manual/automatic), `fuel_type` (petrol/diesel/hybrid/electric), `body_type` (hatchback/sedan/suv/bakkie/mpv/coupe/other), `colour`, `engine`, `owners` int null, `service_history` bool, `accident_free` bool, `spare_keys` bool, `papers_in_order` bool, `features` text[], `description` text, `status` (available/reserved/sold) default available, `is_featured` bool, `sold_at` timestamptz null, `created_at`, `updated_at` (with trigger)
- **`car_images`**: `id`, `car_id` fk (on delete cascade), `storage_path`, `sort_order` int, `alt`, `created_at`
- **`viewing_requests`**: `id`, `car_id` fk, `name`, `phone`, `preferred_date` date, `preferred_time` (morning/afternoon/evening), `payment_readiness` (cash_ready/finance_preapproved/arranging), `message`, `status` (new/confirmed/completed/no_show/cancelled) default new, `created_at`
- Indexes on the columns used for filtering and sorting.
- **Storage bucket** `car-images` (public read).

**Row Level Security (enable on all tables):**
- `cars` and `car_images`: public **SELECT** only.
- `viewing_requests`: public **INSERT** only (no public select/update/delete).
- No public insert/update/delete on cars or images. Admin writes use the service role key server-side, which bypasses RLS.
- Storage: public read; uploads only via server-side code with the service role key.

---

## SEO and performance

- Per-page metadata. Car pages titled like *"2019 Volkswagen Polo 1.0 TSI Highline for sale in Pretoria | Kay Motors"*.
- Dynamic **Open Graph image per car** (cover photo + price + logo) so links look great when shared on WhatsApp.
- `sitemap.ts` (include all car pages) and `robots.ts` (block `/admin`).
- JSON-LD structured data (`Car` / `Offer` schema) on car pages, and `AutoDealer` for the business without a street address.
- Use `next/image` everywhere (configure `remotePatterns` for the Supabase storage domain). Lazy-load gallery images.
- Revalidate pages after admin changes (`revalidatePath`) so new cars appear immediately.
- Aim for Lighthouse 90+ on mobile.

---

## Tech stack

- **Next.js** (latest stable, App Router, `src/` directory) + **TypeScript** (strict)
- **Tailwind CSS**
- **Supabase** via `@supabase/supabase-js` and `@supabase/ssr`
- **zod** for validation, `lucide-react` for icons
- Check the latest docs/versions before installing. Don't add packages we don't need.

---

## Build phases (stop after each one)

1. **Setup**: inspect the folder, scaffold the Next.js project, Tailwind, fonts, brand colours, config file, folder structure, `.env.local.example`, and the data access layer with seed data.
2. **Public site**: layout, header/footer, home, inventory with filters, car detail page, how it works, contact, 404. Fully responsive.
3. **Database**: SQL migrations, RLS policies, storage bucket setup, and step-by-step instructions for me to create the Supabase project and run them. Switch the data layer to Supabase when env variables exist.
4. **Viewing requests**: form, validation, honeypot, saving to Supabase, WhatsApp handoff.
5. **Admin portal**: dashboard, car management, image upload/reorder, feature checklist, caption generator, viewing requests. Production block via middleware.
6. **SEO and polish**: metadata, OG images, sitemap, robots, JSON-LD, accessibility pass, performance check, final lint and build.

At the end, give me:
- A checklist of everything I must do before going live (create the Supabase project, env variables on Vercel, add real cars, **add Supabase Auth before enabling the admin in production**, connect the domain, Google Search Console, Google Business Profile as a service-area business).
- A short `README.md` explaining how to run, how the project is structured, and how to add a car.
