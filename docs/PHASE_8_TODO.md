# Phase 8 — Privacy-Safe Analytics TODO

**Branch:** `phase-8-privacy-safe-analytics`  
**Status:** Engineering complete on branch; draft PR #13 open. Production approval remains blocked on Issue #12.

## P8.1 — Minimized contribution boundary
- [x] Add a dedicated `analytics` backend domain.
- [x] Create a structured analytics projection only after explicit statistics consent.
- [x] Exclude story text, relationship detail, frequency, periods, and removal credentials.
- [x] Keep analytics retention separate from raw-story retention.
- [x] Keep contributions immutable except for explicit expiry deletion.
- [x] Preserve only the opaque source ID needed for future consent/removal handling.
- [x] Exclude expired contributions from new snapshots even before physical purge.

## P8.2 — Server-authoritative privacy policy
- [x] General public group threshold: 10.
- [x] Stronger minor/sensitive age threshold: 20.
- [x] Every approved two-dimension cell threshold: 20.
- [x] Cap public analytics at two dimensions.
- [x] Allow only predefined relationship × age/setting/experience comparisons.
- [x] Reject geography, arbitrary dimensions, third dimensions, and unknown query parameters.
- [x] Publish count bands/relative scales rather than exact counts.
- [x] Keep exact source counts out of persisted public snapshots.
- [x] Fail closed when no current-policy snapshot exists.
- [x] Do not serve a newer snapshot created under a retired privacy-policy version.
- [x] CI verifies frontend/backend privacy thresholds and privacy-policy version remain synchronized.

## P8.3 — Frozen snapshot publication
- [x] Generate append-only frozen analytics snapshots.
- [x] Public APIs read snapshots rather than running live aggregation queries.
- [x] Expose only broad generated-at text and opaque dataset versions.
- [x] Keep historical snapshot browsing out of the public API.
- [ ] Approve a production snapshot release cadence / minimum dataset-change rule (Issue #12).
- [ ] Decide and document emergency withdrawal and internal retention of superseded snapshots.
- [ ] Add explicit scheduler/operations configuration only after the release policy is approved.

## P8.4 — Public analytics API
- [x] Anonymous snapshot endpoint.
- [x] Server-approved comparable-relationship endpoint.
- [x] Server-approved two-dimension cross-breakdown endpoint.
- [x] Runtime-validate all analytics responses in the frontend.
- [x] Return suppression states instead of unsafe values.
- [x] Keep responses non-indexed during prelaunch.
- [ ] Add public-read abuse/rate controls with Phase 10, or earlier if deployment load testing requires them.
- [ ] Revisit short-lived shared caching/ETag strategy during deployment hardening; do not trade emergency revocation for performance silently.

## P8.5 — Product truthfulness and failure states
- [x] Remove synthetic analytics fixtures and the retired mock API.
- [x] Explain that patterns describe SELENA submissions, not population prevalence.
- [x] Explain that relationship/experience categories can overlap.
- [x] Show loading, error/retry, empty, and suppression states.
- [x] Fix initial analytics failure so the page cannot remain on a loading skeleton forever.
- [x] Avoid absolute anonymity claims; describe threshold/banding controls as risk reduction, not a formal guarantee.

## P8.6 — Validation / adversarial review
- [x] Statistics-consent minimization tests.
- [x] General, minor, and cross-cell threshold tests.
- [x] Exact-count absence tests.
- [x] Frozen-snapshot tests.
- [x] Unapproved/third-dimension rejection tests.
- [x] Expired-contribution exclusion tests.
- [x] Immutable contribution/snapshot tests.
- [x] Stale privacy-policy snapshot regression test.
- [x] Normal Backend CI green after stale-policy hardening.
- [x] Frontend lint/typecheck/privacy guard/build/dependency audit green after integration hardening.
- [x] Perform a final adversarial composition review across all supported public analytics responses; findings and fixes are recorded in `PHASE_8_ADVERSARIAL_REVIEW.md`.
- [x] Final branch-history cleanup and stacked draft PR #13.

## Deferred intentionally

- Staff analytics/moderation interfaces and analyst role enforcement are Phase 9.
- Removal execution/report triage and broad abuse controls are Phase 10.
- Browser E2E/accessibility, branch protection, action SHA pinning, and full security hardening are Phase 11.
- Deployment scheduler, monitoring, backup/restore, and production operations are Phase 12.
- Formal differential privacy is not claimed or silently added. Re-evaluate it if SELENA later needs richer/frequent analytics; any use requires an explicit privacy budget and specialist review.

## Exit gate

Phase 8 is complete when public analytics are generated only from explicitly
statistics-consented minimized data; the backend alone enforces allowed queries,
thresholds, bands, and dimension limits; no stale-policy snapshot can remain
public; the frontend accurately communicates the guarantees and limitations;
the production snapshot release policy is approved; adversarial composition
review is complete; and the final documented branch state passes the required
CI gates.


## Final automated result

Final checks passed on the single squashed Phase 8 commit before the draft PR was opened.

Frontend:
- ESLint: **pass**
- TypeScript: **pass**
- privacy-boundary guard: **pass**
- production build: **pass**
- production dependency audit: **pass**

Backend:
- Ruff lint/format: **pass**
- migration drift: **pass**
- Django checks: **pass**
- PostgreSQL migrations/tests: **pass**
- Python dependency audit: **pass**
- production deploy checks: **pass**

Draft PR #13 remains the human review boundary. Issue #12 remains the explicit
production analytics release-policy blocker.
