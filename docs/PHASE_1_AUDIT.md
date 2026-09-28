# Phase 1 — Frontend Production Audit

**Audit date:** 2026-09-28  
**Scope:** current Next.js frontend, synthetic-data boundary, privacy UX, dependency posture, accessibility, and CI/security readiness.

## Executive result

The V1 frontend has a strong privacy-oriented structure for a prototype: raw synthetic story/pattern datasets are isolated behind `src/lib/mock-api.ts`, statistics consent defaults to opt-in, sensitive story text is not placed in browser persistence, public pattern values are banded/suppressed by design, and there is no `dangerouslySetInnerHTML`.

The main production blocker is the framework dependency baseline. The repository currently pins Next.js `14.2.15`, which is in ranges affected by later Next.js security advisories. A production launch must use a currently patched supported release and pass CI after the upgrade.

## Inventory

### Routes
- `/`
- `/stories`
- `/stories/[id]`
- `/patterns`
- `/share`
- `/share/success`
- `/about`
- `/methodology`
- `/safety`

### Data boundary
- Synthetic stories: `src/data/stories.ts`
- Synthetic patterns: `src/data/patterns.ts`
- Shared vocab: `src/data/categories.ts`
- UI-facing async boundary: `src/lib/mock-api.ts`

Search confirmed that story/pattern datasets are imported only by `mock-api.ts`. Components import the shared category vocabulary directly, which is intentional.

## Security findings

### S1 — BLOCKER — Next.js dependency is not current-security-safe
Current: `next@14.2.15`.

Vendor/GitHub advisories published after that version include affected ranges covering Next.js 14.x. Examples include RSC denial-of-service advisories affecting versions below patched 15.x/16.x lines, plus later critical framework advisories.

**Decision:** do not suppress or ignore this in CI. Upgrade to a currently patched supported line, regenerate `package-lock.json`, then run the full CI/build test set.

### S2 — Medium — baseline HTTP security headers were absent
The original `next.config.mjs` enabled strict React mode only.

**Remediation in this branch:** add no-referrer, frame denial, MIME sniffing protection, restrictive permissions policy, and disable the powered-by header.

A deployment-specific Content Security Policy is intentionally deferred until final hosting/API domains are known; a guessed CSP can break the app or train the team to weaken it with broad exceptions.

### S3 — Low now / High in production — demo deletion code is transferred through sessionStorage
The wizard stores only the demo deletion code and publication choice, not the story text, and the success page immediately removes the item after reading it.

This is acceptable for the explicitly synthetic V1 demo, but a real recovery/removal credential is security-sensitive. Production must return/display it through a deliberate backend flow and avoid retaining it in browser storage or logs.

### S4 — Positive — no dangerous HTML injection found
No `dangerouslySetInnerHTML` use found.

### S5 — Positive — no direct production network layer exists yet
No real `fetch()` calls exist outside documentation; the current app remains fully synthetic.

## Privacy findings

### P1 — Positive — story drafts stay in memory
No story-text localStorage persistence exists.

### P2 — Positive — analytics consent is opt-in
`consentStatistics` defaults to `false`.

### P3 — Positive — public pattern policy is centralized
`src/lib/privacy.ts` centralizes:
- general threshold 10
- sensitive/minor threshold 20
- max two dimensions
- no exact public counts
- no geography
- count bands

These remain display/mock policy in V1; production enforcement must move server-side.

### P4 — Positive — mock data boundary is intact
`stories.ts` and `patterns.ts` are imported only by `mock-api.ts`.

**Remediation in this branch:** add a CI privacy-boundary script so future changes fail if components bypass that boundary or introduce dangerous HTML injection.

## Accessibility findings

### A1 — Fixed in branch — modal lacked a focus trap
`BottomSheet` moved focus into the dialog and restored it on close, but Tab could escape into page content behind an `aria-modal` dialog.

**Remediation:** trap Tab/Shift+Tab within the open dialog.

### A2 — Positive — reduced motion
Shared motion helpers and modal animation use `prefers-reduced-motion`.

### A3 — Positive — charts provide non-visual alternatives
Chart/list toggles and table/list alternatives are present.

### A4 — Positive — keyboard content gate
Sensitive story disclosure is an ordinary button and is keyboard operable.

### A5 — Follow-up
Automated browser accessibility testing (for example Playwright + axe) is still needed once test dependencies are deliberately introduced and lockfile changes can be validated.

## Code quality findings

### Q1 — Positive — strict TypeScript
`strict: true`; no `@ts-ignore` found.

### Q2 — Positive — no outstanding TODO/FIXME markers
Search found none.

### Q3 — Small intentional lint exception
`PersonEntry.tsx` contains one mount-only exhaustive-deps suppression for focus behavior. It is narrowly documented.

### Q4 — Testing gap
There is no automated unit/integration/E2E test suite yet.

For Phase 1, lint + typecheck + build + security/privacy checks establish a repeatable baseline. Behavioral test frameworks should be added before real backend integration becomes substantial.

## CI/security baseline added

- frontend quality/security workflow
- CodeQL workflow
- dependency-review workflow
- npm + GitHub Actions Dependabot
- privacy-boundary invariant check
- pull-request review checklist
- security reporting guidance

## Exit assessment

Phase 1 is **not allowed to be declared complete while the Next.js dependency blocker remains**.

Everything else in the current Phase 1 scope can be completed and checked independently. After the framework upgrade PR is generated/applied, rerun all workflows and perform one final self-review.
