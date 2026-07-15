# OptoAcademy

DHA / MOH / HAAD mock exam platform. Next.js 14 (App Router) + TypeScript + Tailwind + Prisma.

## What's included

- Marketing site: homepage, pricing, exam landing pages (`/exams/dha`, `/exams/moh`, `/exams/haad`)
- Auth UI shells: `/login`, `/signup` (not wired to a real provider yet — see Step 3 below)
- Dashboard shell: `/dashboard`
- **Working exam engine**: `/mock-exam/[attemptId]` — question navigator, timer, flagging, practice-mode explanation toggle, all functional in the browser
- Prisma schema for users, subscriptions, questions, attempts, answers

## What's NOT included yet (by design — these need your credentials)

- Real authentication (Clerk/Auth.js) — UI exists, needs API keys
- 
- Real database connection — schema exists, needs a Postgres URL
- Stripe subscription billing
- Admin panel for entering questions
- API routes connecting the exam engine to real question data (currently uses one sample question)

This gets you a real, running codebase you (or a developer) can plug credentials into — not a mockup.

---

## Step 1 — Run it locally

You'll need [Node.js 18+](https://nodejs.org) installed.

```bash
cd optoacademy
npm install
npm run dev
```

Open `http://localhost:3000` — you should see the homepage. Try `http://localhost:3000/mock-exam/demo` to see the working exam interface.

---

## Step 2 — Set up the database

1. Create a free Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) (both have generous free tiers).
2. Copy `.env.example` to `.env` and paste your connection string into `DATABASE_URL`.
3. Run:
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates all the tables from `prisma/schema.prisma` in your database.

---

## Step 3 — Add authentication (Clerk recommended)

1. Create a free account at [clerk.com](https://clerk.com), create an application.
2. Copy your publishable key and secret key into `.env`.
3. Install: `npm install @clerk/nextjs`
4. Wrap `app/layout.tsx` with `<ClerkProvider>` and swap the `/login` and `/signup` page contents for Clerk's `<SignIn />` and `<SignUp />` components (their docs have a copy-paste snippet for App Router).

---

## Step 4 — Add payments (Stripe)

1. Create a Stripe account, create three Products (1-month, 3-month, lifetime) matching your pricing page.
2. Copy price IDs and secret key into `.env`.
3. Build a `/api/checkout` route that creates a Stripe Checkout session, and a `/api/stripe/webhook` route that listens for `checkout.session.completed` to activate the user's `Subscription` row.

(If you want, I can write these two API routes for you once your Stripe account is set up — just share the price IDs.)

---

## Step 5 — Deploy to Vercel

1. Push this project to a GitHub repository (create one at github.com, then):
   ```bash
   git init
   git add .
   git commit -m "Initial OptoAcademy scaffold"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/optoacademy.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), sign up (free), click **Add New → Project**, and import the GitHub repo.
3. In the import screen, add your environment variables (everything from your `.env` file) under **Environment Variables**.
4. Click **Deploy**. Vercel will build and give you a live URL like `optoacademy-xyz.vercel.app`.

---

## Step 6 — Point your subdomain at it

Once you share your subdomain (e.g. `prep.optoacademy.com` or `app.optoacademy.com`), here's the general process — I'll give you exact values once I know it:

1. In your Vercel project, go to **Settings → Domains** and add your subdomain (e.g. `prep.optoacademy.com`).
2. Vercel will show you a DNS record to add — almost always a **CNAME** record:
   - **Type**: CNAME
   - **Name/Host**: the subdomain part only (e.g. `prep`)
   - **Value/Target**: `cname.vercel-dns.com`
3. Go to wherever your domain `optoacademy.com` is registered (GoDaddy, Namecheap, Cloudflare, etc.), find the DNS settings, and add that CNAME record.
4. DNS changes can take a few minutes to a few hours to propagate. Vercel's dashboard will show a green checkmark once it detects the domain is correctly pointed.
5. Vercel automatically issues a free SSL certificate once the domain resolves — so `https://prep.optoacademy.com` works with no extra steps.

---

## Project structure reference

```
app/
  (marketing)/        → public pages: homepage, pricing, exam landing pages
  (auth)/              → login, signup
  (app)/               → authenticated pages: dashboard, mock-exam, practice
components/
  exam/                → ExamTimer, QuestionNavigator, QuestionPanel
  marketing/           → Header, Footer
prisma/
  schema.prisma        → full database schema
```
