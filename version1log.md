#dont delete
#no ai allowed beyond this point
#restricted

Built the RETURNi system from your README. Here’s what’s in place:

RETURNi – Customer Retention Platform
Implemented features
Merchant setup & login

/merchant/setup – create business profile
/merchant/login – log in by email
Merchant dashboard (/merchant/dashboard)

Today’s visits, this week, total visits
Unique customers
Total points given
Recent visits list
QR code (/merchant/qr)

Printable QR linking to the scan page
Customers scan to earn points
Scan & add points (/scan)

Phone number capture
10 points per visit
Works for both merchant entry and customer self-scan
Offline-first

IndexedDB (Dexie) for offline visits
Sync when back online
Manual “Sync now” button
Auto-sync when connection returns
PWA

Installable on phones
Service worker for offline caching
Tech stack
Next.js 14 (App Router)
Supabase (Postgres)
Tailwind CSS
Dexie (IndexedDB)
qrcode.react (QR generation)
Deploying on Vercel
Supabase

Create a project at supabase.com
Run supabase/schema.sql in the SQL Editor
Environment variables

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Deploy

Push to GitHub and import into Vercel
Add the env vars in the Vercel project settings
Deploy
Local run
npm install
cp .env.example .env.local   # Add your Supabase credentials
npm run dev
The app is ready for Vercel. Supabase env vars are required for the API routes; without them, the app returns a clear error instead of crashing.