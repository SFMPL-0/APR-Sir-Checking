<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e1ff1625-e96a-44bb-b2c9-2df5ad92f098

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Data storage (Supabase)

All calculations, settings and scenarios are persisted to Supabase instead of
localStorage, so they sync across devices/browsers.

1. In your Supabase project's SQL Editor, run [`supabase-schema.sql`](supabase-schema.sql)
   once to create the `app_state` and `saved_calculations` tables.
2. The project URL and anon/publishable key are already set as defaults in
   `src/services/supabaseClient.ts`. To point at a different Supabase project,
   copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` instead of editing the source file.
3. That's it — the app fetches everything from Supabase on load and saves
   changes back automatically (debounced ~600ms after you stop typing).

**Security note:** the anon key is public (it ships inside the app bundle).
The included RLS policies allow anyone with that key to read/write this
data, which is fine for a personal/team tool with no login screen. If you
add user accounts later, tighten the policies in `supabase-schema.sql` to
check `auth.uid()`.
