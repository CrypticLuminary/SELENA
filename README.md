# Selena — V1

A survivor-centered platform for sharing experiences **anonymously**, and for
understanding the **privacy-safe patterns** among submissions. Built calm,
non-sensational, and mobile-first.

> **This is V1: frontend-only with synthetic demo data.** Every story and figure
> is fictional. No backend, no database, no real submissions. The architecture
> is deliberately shaped so a Django/DRF backend can replace the mock layer with
> almost no component changes.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts: `npm run build` (production build), `npm run start` (serve the
build), `npm run lint`.

Requires Node 18.18+ (Node 20+ recommended).

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion (subtle) ·
Lucide React · Recharts (bar charts) · custom SVG (relationship bubbles) ·
React Hook Form + Zod. Type: **Fraunces** (editorial serif display, via
`next/font/google`) + **Geist Sans** (UI/body) + **Geist Mono** (data). A
tokenized type scale, editorial width system, and WCAG-AA palette live in
`tailwind.config.ts` + `src/app/globals.css`.

## How it's organized

```
src/
  app/           Routes: / stories /stories/[id] patterns share share/success about methodology safety
  components/    layout · stories · patterns · submission · home · ui
  data/          categories.ts (canonical vocab) · stories.ts (synthetic) · patterns.ts (privacy-safe aggregates)
  lib/           mock-api.ts (THE data boundary) · privacy.ts (policy config) · utils.ts · submission-schema.ts
  types/         story.ts · patterns.ts · submission.ts
```

## The three load-bearing ideas

1. **One data boundary.** Components import only from `lib/mock-api.ts` (async,
   Promise-returning). To go live, reimplement those functions with `fetch()` to
   your DRF endpoints — components don't change. Nothing imports `data/*`
   directly except the mock API (and `data/categories.ts`, the shared vocab).

2. **Privacy lives in the backend, never in components.** The mock aggregates in
   `data/patterns.ts` are authored as if they already passed a server-side
   privacy engine: coarse **count bands** (never exact counts), relative scales,
   and **suppressed** groups. Policy is centralized in `lib/privacy.ts`
   (min group 10, sensitive/minor 20, max 2 dimensions, bands on, geo off). The
   frontend only renders what it's handed.

3. **Accessible + careful by construction.** Every chart has a list/table
   alternative; story text is gated behind content warnings; figures are always
   ranges; language stays honest ("submissions to this platform, not
   prevalence"; "we minimize identifying information", never "100% anonymous").

## Notable behaviors

- **Quick Exit** — a "Leave this site" control (and Shift+Esc) in the header and
  footer that redirects to a neutral page. The Safety page explains its limits
  honestly (it can't erase browser history).
- **Submission wizard** — 4 steps, in-memory only (no localStorage of story
  text). The success page shows a clearly-labeled *demo* removal code.
- **Patterns** — relationship bubbles (custom SVG) + age/setting/experience bar
  charts, a two-dimension explorer (max 2 dims, predefined combos only), and
  honest "not available yet" states where a breakdown is suppressed.

## What is intentionally NOT in V1

No comments, likes, reactions, followers, DMs, engagement rankings, researcher
portal, arbitrary analytics API, geographic drill-down, exact dates/locations,
real-time stats, ML moderation, or AI conclusions about people or society. The
moderation pipeline is represented conceptually in copy/architecture only.

## Replacing the mock data with a real backend (later)

- Implement the functions in `src/lib/mock-api.ts` as `fetch()` calls to
  predefined, privacy-enforcing endpoints (e.g. `/api/patterns/relationships`).
- Keep the `types/` contracts identical — especially `PatternCell` (bands +
  scale, never exact counts).
- Enforce every rule in `lib/privacy.ts` **server-side**. The frontend must
  never receive raw counts or decide what is safe to show.

All content in this build is fictional demonstration material.
