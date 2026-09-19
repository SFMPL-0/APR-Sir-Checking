# Freight Profit & Tax Calculator

Professional freight business profit, interest, expenses and TDS claim
calculator with configurable financial engines, scenarios, and reports. Data
is persisted to Supabase (Postgres) so it syncs across devices and browsers.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Copy `.env.example` to `.env` if you want to point the app at
   your own Supabase project instead of the default one already configured
   in `src/services/supabaseClient.ts`.
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Deploy: GitHub → Vercel

1. **Push this project to a GitHub repository.**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. **Import the repo in Vercel.**
   - Go to https://vercel.com/new
   - Select "Import Git Repository" and choose your repo
   - Vercel auto-detects this as a Vite project:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - No environment variables are required (Supabase URL/key already have
     working defaults). If you want to use your own Supabase project instead,
     add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under
     Project Settings → Environment Variables.
3. Click **Deploy**. Every subsequent push to `main` auto-deploys.

That's it — no other services or accounts are needed.

## Data storage (Supabase)

All calculations, settings and scenarios are persisted to Supabase instead of
localStorage, so they sync across devices/browsers.

1. In your Supabase project's SQL Editor, run [`supabase-schema.sql`](supabase-schema.sql)
   once to create the `app_state`, `saved_calculations` and
   `calculation_history` tables (with their indexes).
2. The project URL and anon/publishable key are already set as defaults in
   `src/services/supabaseClient.ts`. To point at a different Supabase project,
   set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (via `.env` locally, or
   as Environment Variables in Vercel) instead of editing the source file.
3. That's it — the app fetches everything from Supabase on load and saves
   changes back automatically (debounced ~600ms after you stop typing).

Every calculation is also auto-logged in the background to
`calculation_history` (separate from the explicit "Save Current Trip"
button), so nothing is ever lost — browsable from the "Auto Log" tab under
History & Reports.

**Security note:** the anon key is public (it ships inside the app bundle).
The included RLS policies allow anyone with that key to read/write this
data, which is fine for a personal/team tool with no login screen. If you
add user accounts later, tighten the policies in `supabase-schema.sql` to
check `auth.uid()`.
