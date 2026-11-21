# Apostle Oluwaseun Israel: Official Website (no-build version)

Plain HTML, CSS and JavaScript. There is **nothing to build or install**. Upload the files to GitHub and the site opens directly.

## 1. Put the site on GitHub Pages
1. In your repository, **delete the old files** (`src`, `package.json`, `index.html` from the earlier version, the `.github` folder and everything else). The old `.github` workflow must go, or GitHub will keep trying to build the old version.
2. Unzip, then upload **every file** to the repository (Add file > Upload files). There are no folders in this version, so it works from a phone. `index.html` must be at the top level, next to the 13 picture files (`cover-*.webp`, `apostle-israel.webp`, `og.jpg`).
3. Settings > Pages > Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**. Save.
4. After a minute the site opens at `https://oluwaseunisrael3-boop.github.io/apostle-oluwaseun-israel/`. Until Supabase is connected, a "Setup mode" banner shows, the 11 books and the TSC Radio work, and forms are switched off.

## 2. Connect Supabase (your account)
1. Create a project at supabase.com.
2. SQL Editor: run (from the separate `supabase-files.zip`, not uploaded to GitHub) `migrations/001_schema.sql`, `002_rls.sql`, `003_storage.sql`, `004_seed.sql` in that order.
3. Authentication > Providers > Email: turn **off** "Allow new users to sign up". Authentication > Users: **Add user** (your email and a strong password).
4. SQL Editor, to make that user the administrator:
   ```sql
   insert into public.admin_profiles (id, email)
   select id, email from auth.users where email = 'oluwaseunisrael3@gmail.com';
   ```
5. Project Settings > API: copy the **Project URL** and **anon public** key.
6. On GitHub, open `config.js`, click the pencil, paste both values between the quotes, and commit. Use only the anon key, never service_role.

## 3. Turn on the forms (invitations, enquiries, newsletter)
Forms go through the Supabase Edge Function in `functions/submit-form` in `supabase-files.zip`. With the Supabase CLI:
```
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set RESEND_API_KEY=... ADMIN_EMAIL=oluwaseunisrael3@gmail.com FROM_EMAIL=onboarding@resend.dev ALLOWED_ORIGIN=https://oluwaseunisrael3-boop.github.io
supabase functions deploy submit-form --no-verify-jwt
```
- Resend (free) sends you an email for each new invitation. Verify your own domain in Resend later and change `FROM_EMAIL`.
- Optional spam check: create a free Cloudflare Turnstile widget, set `TURNSTILE_SECRET` with `supabase secrets set`, and paste the site key into `config.js`.
- When your custom domain is live, set `ALLOWED_ORIGIN` to `https://apostleoluwaseunisrael.com`.

## 4. Administrator dashboard
Open `admin.html` on your site (for example `.../apostle-oluwaseun-israel/admin.html`) and sign in. From there you can:
- **Live control**: one tap to show ON AIR for TSC Radio.
- **Audio messages**: upload audio for visitors when you are not live.
- **Pictures**: change the home and About portraits; add many gallery pictures at once; change captions; reorder, replace and delete.
- Invitations, video broadcasts and messages, books, resources, speaking archive, enquiries, subscribers, biography and pages, settings.

## 5. Custom domain (later)
1. At your registrar add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` to `oluwaseunisrael3-boop.github.io`.
2. Add a file named `CNAME` at the repository root containing exactly `apostleoluwaseunisrael.com`. Do **not** add it earlier; it redirects the github.io address.
3. Settings > Pages > Custom domain, then tick **Enforce HTTPS**.

## Limits
- Audio uploads: 50 MB per file on the free Supabase plan.
- Supabase free projects pause after about a week of no activity. Opening the site or the dashboard regularly keeps it awake.
- Each page is a real HTML file, so Google can read the page titles, descriptions and structured data.

## Troubleshooting
- Pictures missing: confirm the `cover-*.webp` files and `apostle-israel.webp` are in the repository root next to `index.html`.
- Blank or unstyled page: make sure `index.html`, `style.css` and `site.js` are at the repository root, not inside a folder.
- "Setup mode" banner after connecting: check `config.js` for typos and clear your browser cache.
- Forms say the website is not connected: the Edge Function is not deployed yet (section 3).
- Cannot sign in: confirm the user exists and the `admin_profiles` row was added.
