# 🍽 Meal Planner

A mobile-first weekly meal planner for two people with separate calorie targets and dietary rules.

## Features

- 7-day weekly grid with swipeable mobile view
- Per-person calorie tracking (Kanuj 1900 kcal / Anshia 1500 kcal)
- Automatic leftover-lunch logic (dinner → next day's lunch)
- Anshia always gets veg / paneer swap on chicken dishes
- Kanuj's chicken add-on toggle (+165 kcal)
- One-tap shuffle (single meal or whole week)
- Extras panel (nuts, skyr, protein dessert, air-fried snack)
- Eating-out mode per meal
- Calorie progress bars + weekly averages
- Supabase Realtime sync across both phones
- Light + dark mode
- Optional passcode gate

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo>
cd mealprep
npm install
```

### 2. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `APP_PASSCODE` | Optional passcode. Leave unset to disable the gate. |

### 3. Create the database

In the [Supabase SQL editor](https://app.supabase.com), run the full contents of:

```
supabase/schema.sql
```

This creates all tables, indexes, RLS policies, and enables Realtime.

### 4. Seed the database

```bash
npx tsx scripts/seed.ts
```

This inserts:
- Members: Kanuj (1900 kcal) and Anshia (1500 kcal)
- Full dish library (breakfast, snack, dinner pool)
- One sample week starting from the current Monday

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Tables

### `members`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | "Kanuj" or "Anshia" |
| calorie_target | INT | 1900 / 1500 |

### `dishes`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | |
| category | TEXT | breakfast/lunch/dinner/snack |
| is_veg | BOOLEAN | |
| is_easy | BOOLEAN | Can repeat every week |
| allows_chicken_addon | BOOLEAN | Kanuj can add 100g chicken |
| paneer_swap | BOOLEAN | Anshia gets paneer version |
| serve_with | TEXT | wrap/roti/none |
| base_calories_kanuj | INT | |
| base_calories_anshia | INT | |

### `meals`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| date | DATE | |
| meal_type | TEXT | breakfast/lunch/snack/dinner |
| dish_id | UUID FK dishes | nullable |
| is_leftover_of | UUID FK meals | references previous dinner |
| eating_out | BOOLEAN | |
| eating_out_label | TEXT | free text label |

### `meal_members`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| meal_id | UUID FK meals | |
| member_id | UUID FK members | |
| calories | INT | nullable = use dish default |
| includes_chicken | BOOLEAN | Kanuj's chicken toggle |
| is_paneer_swap | BOOLEAN | Anshia's paneer swap |

### `extras`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| date | DATE | |
| member_id | UUID FK members | |
| name | TEXT | "Nuts", "Skyr", etc. |
| calories | INT | |

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import in Vercel

Go to vercel.com/new, import the repository.

### 3. Set environment variables in Vercel Dashboard

Under Settings > Environment Variables, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `APP_PASSCODE` | Your passcode (optional) |

### 4. Build settings

Default Next.js settings work. No changes needed.
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`

### 5. Deploy

Click Deploy. After it goes live, run the seed script locally to populate your Supabase database.

---

## Architecture Notes

- No auth system — passcode gate is handled at app level via a cookie
- Realtime — Supabase Realtime subscriptions on meals, meal_members, extras keep both phones in sync
- Generation — /api/generate creates a full week; /api/shuffle-meal swaps one meal
- Constraints — Anshia always veg, non-easy dishes max once/week, salad dinner breaks leftover rule, breakfast templates for weekday/weekend
