# Kay Motors Group website

Website and admin portal for Kay Motors Group (Pty) Ltd, an independent pre-owned car seller in Centurion and Pretoria. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Supabase.

## Run it locally

Requires Node.js 20 or newer. In PowerShell, from the project folder:

```powershell
npm install
Copy-Item .env.local.example .env.local   # then fill in the values
npm run dev                               # http://localhost:3000
```

Without Supabase values in `.env.local`, the site runs on demo cars from `src/lib/data/seed.ts`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. `/admin` is open. |
| `npm run build` | Production build (also type-checks). |
| `npm start` | Runs the production build. `/admin` is blocked unless `ADMIN_ENABLED=true`. |
| `npm run lint` | ESLint. |

Database setup: see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Before launch: see [docs/GO_LIVE.md](docs/GO_LIVE.md).

## Adding a car

1. Open `/admin` (http://localhost:3000/admin locally) and sign in.
2. **Add a car** → fill in the details → **Save and add photos**. The stock number (`KM001`, `KM002`, …) and web address are created automatically.
3. On the next screen, tap **Add photos**. Photos are shrunk on the phone/computer before upload (about 1600px, ~250 KB). Drag to reorder (long-press on a phone) or tap the star to make one the cover.
4. Tap **Copy caption** for a ready-made Instagram post.

The car appears on the public site immediately. Mark it **Sold** when it goes: it moves to "Recently sold" and its page stays up with a "This one's gone" message.

## How the project is organised

```
src/
  app/
    (site)/           Public pages: home, /cars, /cars/[slug], /how-it-works, /contact
    admin/            Admin portal (dashboard, cars, viewing requests)
    sitemap.ts, robots.ts, opengraph-image.png, icon.png
  components/
    cars/             Car card, gallery, filters, specs, actions
    viewing/          Book-a-viewing form
    admin/            Admin form, photo manager, caption generator, lists
    layout/, ui/, icons/
  config/
    site.ts           ALL business details (phone, WhatsApp, wording). Edit here.
    features.ts       Feature checklist used in the admin form
    instagram-caption.ts  The Instagram caption template
  lib/
    data/             Data access layer used by every page (Supabase or seed data)
    actions/          Server Actions (viewing requests, admin changes)
    admin/            Admin gate (requireAdmin) and admin queries
    supabase/         Supabase clients (public + server-only secret key)
    validation/       zod schemas shared by browser and server
    format.ts         Rands, kilometres, dates in en-ZA format
  proxy.ts            Blocks /admin in production (Next 16's name for middleware)
supabase/migrations/  SQL to paste into the Supabase SQL editor
```

### Key decisions

- **One data layer.** Pages call `src/lib/data/cars.ts`, which picks Supabase or seed data. Reads are cached and tagged `cars`; admin changes call `updateTag("cars")` so the site updates immediately.
- **Secret key stays on the server.** Only `src/lib/supabase/admin-client.ts` uses `SUPABASE_SERVICE_ROLE_KEY`, and it imports `server-only` so the build fails if a browser component ever imports it.
- **Admin login.** `/admin` needs an email + password (Supabase Auth) and the email must be in `ADMIN_EMAILS`. `src/proxy.ts` refreshes the session and redirects signed-out visitors; `requireAdmin()` in `src/lib/admin/require-admin.ts` re-checks on every admin page and Server Action (the real gate). In production `/admin` is also switched off unless `ADMIN_ENABLED=true`.
- **Visitors never log in.** Viewing requests are inserted with the publishable key; Row Level Security only allows inserting, never reading.

## Environment variables

See `.env.local.example`. On Vercel, add the same variables under Project → Settings → Environment Variables.
