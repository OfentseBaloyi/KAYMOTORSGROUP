# Go-live checklist

Work through these in order.

## Database
- [ ] Run `supabase/migrations/20261019000100_initial_schema.sql` in the Supabase SQL editor ([SUPABASE_SETUP.md](SUPABASE_SETUP.md)).
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (secret key) to `.env.local`. Never commit it or share it.
- [ ] Test locally: add a car with photos in `/admin`, check it on the site, submit a viewing request, see it in `/admin/viewings`.

## Content
- [ ] Confirm the finance wording with the client (`src/config/site.ts`, marked `TODO: confirm with client`).
- [ ] Confirm service areas and the "Buy safely" text on `/how-it-works`.
- [ ] Add the real cars with good photos. Mark recent sales as Sold so "Recently sold" isn't empty.

## Admin login
- [ ] Turn off public sign-ups: Supabase → Authentication → Sign In / Providers → **Allow new users to sign up: off**.
- [ ] Create the client's user: Authentication → Users → **Add user → Create new user**, tick **Auto Confirm User**, set a strong password.
- [ ] Add his email (and yours) to `ADMIN_EMAILS`, comma separated.
- [ ] Sign in on his phone and add a car together.

## Hosting (Vercel)
- [ ] Push to GitHub and import the repo in Vercel.
- [ ] Environment variables (Production):
  - `NEXT_PUBLIC_SITE_URL=https://kaymotorsgroup.co.za`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_EMAILS=client@example.com,you@example.com`
  - `ADMIN_ENABLED=true`
- [ ] Deploy, then open a car page and share its link on WhatsApp to check the preview image.

## Domain
- [ ] Add `kaymotorsgroup.co.za` and `www.kaymotorsgroup.co.za` in Vercel → Domains, and set the DNS records it shows at the domain registrar.
- [ ] Redirect `www` to the bare domain (or the other way round) in Vercel.

## Google
- [ ] **Google Search Console:** add the domain property, verify by DNS, submit `https://kaymotorsgroup.co.za/sitemap.xml`.
- [ ] **Google Business Profile:** create it as a **service-area business** (hide the address), service areas Centurion and Pretoria, category "Used car dealer", phone 068 330 1795, website link, Instagram photos.
- [ ] Run PageSpeed Insights on the live home and a car page (target 90+ on mobile).

## Instagram
- [ ] Put `kaymotorsgroup.co.za` in the Instagram bio and use the caption generator's car link in posts.
