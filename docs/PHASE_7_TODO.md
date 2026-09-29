# Phase 7 — Frontend / Backend Integration TODO

**Branch:** `phase-7-frontend-backend-integration`  
**Status:** Complete on branch — ready for human review.

## P7.1 — Data boundary
- [x] Add `src/lib/api.ts` for real stories/submissions/reports.
- [x] Runtime-validate public API responses before rendering.
- [x] Keep temporary analytics fixtures isolated in `src/lib/mock-api.ts`.
- [x] Remove the synthetic public-story dataset.
- [x] Forbid reintroduction of `@/data/stories` in the privacy guard.
- [x] Keep backend routing server-only; forbid `NEXT_PUBLIC_*` API routing.

## P7.2 — Transport
- [x] Browser calls use same-origin `/api/*`.
- [x] Next.js proxies browser API traffic to the configured Django origin.
- [x] SSR calls use server-only backend configuration.
- [x] Validate configured backend origin shape in Next config.
- [x] Use `no-store` fetch behavior.
- [x] Bound API requests with a timeout.
- [x] Do not automatically retry sensitive POSTs.

## P7.3 — Anonymous submission
- [x] Map frontend camelCase fields to strict DRF snake_case contract.
- [x] Map public-path consent separately from statistics consent.
- [x] Statistics-only story text is omitted client-side.
- [x] Backend rejects story text on statistics-only path.
- [x] Preserve explicit opt-in statistics consent.
- [x] Mirror prefer-not experience validation client/server.
- [x] Handle server validation, throttle, and ambiguous failure states.
- [x] Never navigate away if browser storage cannot hold the one-time receipt.

## P7.4 — Removal-code handoff
- [x] Show the real backend removal code, not a demo generator.
- [x] Use per-tab session storage only for the success-page handoff.
- [x] Clear the receipt immediately after success-page read.
- [x] Clear the receipt on Quick Exit.
- [x] Reset completed form state.
- [x] Replace history on successful navigation.
- [x] Explain that the plaintext removal code cannot be recovered.

## P7.5 — Public stories
- [x] Load story archive from Django.
- [x] Load detail from Django.
- [x] Preserve content-warning gate.
- [x] Use only broad top-level public relationship categories.
- [x] Validate deep-link filters against allowed frontend vocabulary.
- [x] Support recent/featured sorting.
- [x] Support UUID-cursor pagination and load-more.
- [x] Keep related-story failure non-fatal.
- [x] Remove detailed relationship deep-link from story detail to mock analytics.

## P7.6 — Reports
- [x] Match backend bounded report reason vocabulary.
- [x] Remove legacy demo-only report reasons.
- [x] Remove report free-text input.
- [x] Send only story ID path + bounded reason.
- [x] Preserve human-review messaging.

## P7.7 — Validation
- [x] Frontend lint
- [x] Frontend typecheck
- [x] Frontend privacy-boundary check
- [x] Frontend production build
- [x] Production npm dependency audit
- [x] Backend Ruff lint/format
- [x] Backend migration drift
- [x] Backend PostgreSQL tests
- [x] Backend dependency audit/deploy checks
- [x] Statistics-only backend minimization regression test
- [x] Final CI after source-of-truth documentation update

## Deferred intentionally

- Server-backed privacy-safe patterns are Phase 8.
- Browser E2E/accessibility automation is part of the M11 hardening suite.
- Verified removal execution/report triage/unpublish belongs to Phase 10.
- Staff UI/admin integration belongs to Phase 9.

## Exit gate

Phase 7 is complete when stories, anonymous submissions, and bounded reports use
the real backend without widening public/private data boundaries; statistics-only
narrative is not transmitted or accepted; the one-time removal-code handoff
cannot silently lose the only plaintext credential; and final CI passes on the
documented branch state.


## Final automated result

Frontend:
- ESLint: **pass**
- TypeScript: **pass**
- privacy-boundary guard: **pass**
- production build: **pass**
- production dependency audit: **pass**

Backend integration regression:
- Ruff lint/format: **pass**
- migration drift: **pass**
- Django checks: **pass**
- PostgreSQL migrations/tests: **pass**
- Python dependency audit: **pass**
- production deploy checks: **pass**

The draft PR remains the human review boundary before merge.
