# FIDA

A demonstration allied-health institution powered by Atticus. Operated by **WorldTeachPathways dba WorldTeachESL LLC**, architected in collaboration with **Cole Middleton Advisors**.

**Live:** pending — Vercel project `fida`
**Repo:** https://github.com/thomassonger-ui/fida-

---

## What it is

A standalone Next.js 15 app with two surfaces:

1. **Public school site** (`/`, `/programs`, `/admissions`, `/about`) — a realistic allied-health school front door for demoing Atticus-powered content and funnels.
2. **Operations dashboard** (`/admin/*`) — an internal view of students, cohorts, attendance, and compliance, backed by Supabase tables prefixed `demo_`.

Completely separate from the `atticus` repo (Cole Middleton Advisors).

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15.2 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4, Cormorant Garamond (display), Inter (body) |
| Database | Supabase (project `zefzgenuenjkasselccy`) |
| Hosting | Vercel (`fida` under team `thomassonger-5425s-projects`) |
| Utils | `clsx`, `tailwind-merge` for `cn()` |

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the Supabase keys
npm run dev                    # http://localhost:3000
```

### Required environment variables

Set these in `.env.local` **and** in the Vercel project (Production + Preview):

```
SUPABASE_URL=https://zefzgenuenjkasselccy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only; never exposed to browser
NEXT_PUBLIC_SUPABASE_URL=https://zefzgenuenjkasselccy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...    # browser-safe anon key
NEXT_PUBLIC_SITE_URL=https://fida.vercel.app
```

Keys live at: https://supabase.com/dashboard/project/zefzgenuenjkasselccy/settings/api

---

## File structure

```
app/
├── page.tsx                 # / — public home
├── layout.tsx               # root layout + fonts
├── globals.css              # Tailwind base + design tokens
├── programs/page.tsx        # /programs
├── admissions/page.tsx      # /admissions (interest form stub)
├── about/page.tsx           # /about
├── admin/
│   ├── layout.tsx           # /admin/* shared layout + sidebar
│   ├── page.tsx             # /admin — overview dashboard
│   ├── students/page.tsx    # /admin/students — reads demo_students
│   ├── cohorts/page.tsx     # /admin/cohorts — reads demo_cohorts
│   ├── attendance/page.tsx  # /admin/attendance — stub
│   └── compliance/page.tsx  # /admin/compliance — stub
└── api/health/route.ts      # env + liveness probe

components/
├── landing/
│   ├── Nav.tsx
│   └── Footer.tsx
└── admin/
    └── Sidebar.tsx

lib/
├── supabase.ts              # server + browser clients + demo helpers
└── utils.ts                 # cn()

supabase/
└── (migration_fida_demo.sql + seed_fida_demo.sql to be added)

public/                      # empty — placeholder
```

---

## Supabase setup (not yet applied)

Supabase project: **`zefzgenuenjkasselccy`**.

Two SQL files need to be run (in order) in the Supabase SQL editor:

1. `migration_fida_demo.sql` — creates all 12 `demo_` tables
2. `seed_fida_demo.sql` — 62 students, 3 cohorts, grades, attendance, transcripts, compliance

Drop them into `supabase/` inside this repo once you have the final versions, then run in the SQL editor.

---

## Admin dashboard behavior

The `/admin/*` pages read from Supabase on the server. If the `demo_` tables don't exist yet (or env vars are missing), each page renders a calm empty state with a clear remediation message — no crashes, no ugly stack traces.

Once migration + seed are applied and env vars are set in Vercel, the dashboard will light up on the next deploy with no code changes.

---

## Design system

Matches the Atticus / Cole Middleton visual language:

- Warm off-white background (`#fafaf8`)
- Near-black ink (`#0a0a0a`) foreground
- Navy accent (`#0f172a`) — used sparingly
- Cormorant Garamond for display type, Inter for body
- Small-caps eyebrows, minimal borders, no gradients, no heavy shadows
- Square-ish corners (`rounded-sm`), subtle `border-rule` dividers

---

## Deployment

Auto-deploys on push to `main` via Vercel.

```bash
git push origin main
```

---

## Roadmap (scaffold → production)

Shipped in this scaffold:

- [x] Next.js 15 App Router + TypeScript + Tailwind
- [x] Public pages: home, programs, admissions (interest form UI), about
- [x] Admin dashboard: overview, students, cohorts (read from Supabase)
- [x] Admin stubs: attendance, compliance
- [x] Supabase server + browser client helpers
- [x] `/api/health` probe
- [x] Atticus design tokens + Cormorant/Inter

Next up:

- [ ] Drop `migration_fida_demo.sql` + `seed_fida_demo.sql` into `supabase/` and run in Supabase SQL editor
- [ ] Wire `/admissions` interest form to `/api/admissions` → `demo_applications`
- [ ] Flesh out `/admin/attendance` and `/admin/compliance` against their demo tables
- [ ] Add auth gate on `/admin/*` (Supabase Auth magic link, scoped to staff emails)
- [ ] Moodle integration via `colemiddleton.moodlecloud.com` API (parked)
- [ ] Atticus advisor embed on `/admissions`

---

## Credits

Architected and maintained for Cole Middleton Advisors by **WorldTeachPathways dba WorldTeachESL LLC**.

© 2026 WorldTeachPathways dba WorldTeachESL LLC.
