# 🥗 Diet Buddy Tracker

A mobile-first web app for tracking weight-loss and fitness progress with friends.
Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Dashboard | BMI, progress bar, water tracker, daily stats, motivational quote |
| 📊 Weight Progress | Log weight, trend charts (1m / 3m / all), full history |
| 💪 Exercise Tracker | 20 built-in exercises + custom ones, streak tracking, calories burned |
| 🥗 Meal Tracker | Log any meal, Indonesian meal suggestions, quick-pick ingredients |
| 👥 Group & Leaderboard | Create/join groups via invite code, weight-loss leaderboard |
| 🏁 Challenges | Monthly challenges with per-member progress tracking |
| 📋 Monthly Report | Weight chart, exercise heatmap, meal consistency, highlights |
| 🔐 Auth | Email/password + Google OAuth via Supabase Auth |
| 📱 PWA | Installable on iOS and Android |

---

## 🚀 Quick Start (Local)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd diet-buddy-tracker
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Wait for the project to finish provisioning
3. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial_schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` / public key
   - `service_role` key (keep this secret!)

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Enable Google OAuth (optional)

1. Supabase Dashboard → **Authentication → Providers → Google**
2. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
3. Add `https://your-project-ref.supabase.co/auth/v1/callback` as authorised redirect URI
4. Paste Client ID + Secret into Supabase

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm i -g vercel
vercel
# Follow prompts: link to project, set environment variables
```

### Option B — GitHub + Vercel dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Vercel auto-detects Next.js — click **Deploy**
4. Add environment variables in **Project Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL   ← set to your Vercel URL, e.g. https://diet-buddy.vercel.app
```

5. Redeploy after adding env vars

### Update Supabase redirect URLs

After deploying, go to Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`

---

## 🗄️ Database Schema

```
profiles          — user profiles (extends auth.users)
weight_logs       — daily weigh-in entries
exercises         — exercise library (default + custom)
exercise_logs     — user's completed exercises per day
meal_logs         — logged meals per day
water_logs        — daily water intake (glasses)
groups            — friend squads
group_members     — group membership
challenges        — group fitness challenges
challenge_progress — per-user challenge scores
monthly_reports   — cached monthly summaries
```

All tables use **Row Level Security (RLS)** — users can only read/write their own data, with appropriate policies for group-shared data.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/         ← login page
│   │   └── register/      ← registration page
│   ├── api/auth/          ← OAuth callback handler
│   ├── dashboard/         ← home dashboard
│   ├── progress/          ← weight logging + charts
│   ├── exercise/          ← exercise library + logging
│   ├── meals/             ← meal logging + suggestions
│   ├── group/             ← squads, leaderboard, challenges
│   ├── report/            ← monthly analytics report
│   └── globals.css        ← design tokens + base styles
├── lib/
│   ├── supabase.ts        ← Supabase client helpers
│   └── utils.ts           ← utilities, meal data, constants
└── types/
    └── database.ts        ← TypeScript types for all tables
supabase/
└── migrations/
    └── 001_initial_schema.sql  ← full DB schema + seed data
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
| Charts | Chart.js + react-chartjs-2 |
| Hosting | Vercel |
| PWA | Web App Manifest |

---

## 🔧 Adding Features

### Add a new exercise to the library

Run in Supabase SQL Editor:
```sql
INSERT INTO exercises (name, category, calories, difficulty, duration, is_default)
VALUES ('Your Exercise Name', 'Cardio', 150, 'Medium', '20 min', true);
```

### Add a new meal suggestion

Edit `src/lib/utils.ts` → `MEAL_SUGGESTIONS` array.

### Invite friends

1. Create a group in the app
2. Share the 8-character invite code
3. Friends enter the code on the Group page to join

---

## 📱 Install as PWA

**Android (Chrome):** Tap ⋮ → "Add to Home screen"

**iOS (Safari):** Tap Share → "Add to Home Screen"

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT — free to use and modify for personal or commercial projects.
