# SELENA — Milestone Tracker

## M0 — Production specification and threat model
**Status:** Engineering/specification complete; governance approvals pending
- [x] Define production mission and MVP boundaries
- [x] Add baseline architecture/privacy/security documentation
- [x] Complete data inventory
- [x] Complete threat model
- [ ] Approve retention/deletion policy (specific proposal documented)
- [x] Define consent/versioning model
- [x] Define staff role matrix
- [ ] Approve final publication-control model
- [ ] Assign incident-response owners/contact channel
- [ ] Complete pre-launch incident tabletop exercise

## M1 — Existing frontend production audit
**Status:** Complete on `phase-1-production-audit`; awaiting human PR review
- [x] Audit routes/components/data boundaries
- [x] Review and remediate dependency versions
- [x] Identify and fix Phase 1 accessibility gaps
- [x] Identify and harden security/privacy gaps
- [x] Identify duplication/dead/redundant behavior during self-review
- [x] Establish repeatable lint/typecheck/privacy/build/dependency-audit/CodeQL baseline

## M2 — Backend foundation
**Status:** Complete on `phase-2-backend-foundation`; awaiting human PR review
- [x] Django/DRF project
- [x] PostgreSQL
- [x] environment configuration
- [x] privacy-aware baseline logging
- [x] staff auth foundation
- [x] backend test infrastructure
- [x] health/readiness endpoints
- [x] backend CI + dependency audit

## M3 — Anonymous submission
**Status:** Complete on `phase-3-anonymous-submission`; awaiting human PR review
- [x] write-only anonymous submission model/API
- [x] strict server-side validation and backend taxonomy
- [x] opaque private identifiers; no public raw identifier/detail API
- [x] secure one-time removal-code generation/verifier storage
- [x] separate immutable/versioned publication + statistics consent
- [x] HMAC-derived anonymous rate limiting with production Redis
- [x] retention purge with restoration-safe deletion tombstones
- [x] PostgreSQL-backed tests, migration checks, deploy checks, and dependency audit

## M4 — Privacy/PII preprocessing
**Status:** Complete on `phase-4-privacy-preprocessing`; awaiting human PR review
- [x] local privacy preprocessing boundary with no third-party raw-text transfer
- [x] versioned identifying-detail detection workflow
- [x] metadata-only findings (category/rule/offsets; no duplicated snippets)
- [x] safe failure logging with adversarial raw-text leakage test
- [x] explicit flags/no-flags/error screening states that cannot approve publication
- [x] versioned re-screening/supersession history
- [x] PostgreSQL migrations, tests, audit, and production checks

## M5 — Moderation
**Status:** Complete on `phase-5-moderation`; awaiting human PR review
- [x] transactional moderation state machine
- [x] moderator/senior-moderator raw access boundary
- [x] append-only versioned redaction workflow
- [x] approve/reject/escalate flow with latest-consent + privacy checks
- [x] append-only bounded audit trail
- [x] PostgreSQL-backed authorization, workflow, retention, and failure-mode tests

## M6 — Published stories
**Status:** Complete on `phase-6-published-stories`; awaiting human PR review
- [x] separate public story representation with no raw/private foreign key
- [x] append-only publication provenance using opaque identifiers
- [x] explicit non-enriching public metadata projection
- [x] public list/detail APIs with no private provenance or exact publication time
- [x] opaque UUID archive pagination cursor
- [x] standardized content-warning publication
- [x] minimal anonymous report flow with derived rate limiting
- [x] configurable disabled/single/dual publication control boundary
- [x] privacy, consent, role, idempotency, removal-survival, and API tests
- [x] final normal read-only Backend CI after temporary migration workflow removal

## M7 — Frontend/backend integration
**Status:** Complete on `phase-7-frontend-backend-integration`; awaiting human PR review
- [x] replace synthetic story/submission/report mocks with validated Django API client
- [x] remove synthetic public story dataset
- [x] same-origin browser API proxy + server-only SSR backend routing
- [x] submission integration with no automatic POST retry
- [x] statistics-only path omits narrative client-side and rejects it server-side
- [x] one-time removal-code confirmation handoff + Quick Exit cleanup
- [x] public story list/detail integration
- [x] broad public relationship vocabulary only
- [x] opaque cursor pagination + load-more state
- [x] content-warning gate preserved
- [x] report UI aligned to bounded backend reasons with no free-text note
- [x] loading/error/empty/degraded states
- [x] runtime validation of public API responses
- [x] frontend privacy guard updated for real API boundary
- [x] backend regression test for statistics-only narrative minimization
- [x] final CI on documented state
- [ ] browser E2E suite (scheduled for M11 hardening rather than blocking this API-boundary milestone)

## M8 — Privacy-safe analytics
**Status:** Engineering complete on `phase-8-privacy-safe-analytics`; draft PR #13 open; production approval pending Issue #12
- [x] minimized statistics-consented analytics contribution boundary
- [x] server-side general/sensitive/cross thresholds
- [x] suppression states and count bands with no exact public counts
- [x] max-2 public dimensions
- [x] predefined relationship × age/setting/experience combinations only
- [x] frozen snapshot APIs instead of live arbitrary aggregation
- [x] stale privacy-policy snapshot fail-closed behavior
- [x] frontend/backend privacy-policy synchronization guard
- [x] real Patterns UI integration; synthetic analytics fixtures removed
- [x] privacy bypass, retention, immutability, and API tests
- [ ] approve/enforce production snapshot release cadence and composition guard (Issue #12)
- [x] final adversarial composition review
- [x] final branch cleanup + stacked draft PR #13

## M8.5 — Product/domain validation gate
**Status:** Engineering complete on `phase-8.5-product-domain-validation`; draft PR #15 open; governance/domain decisions remain pending
- [x] purpose-limit statistics-only collection/persistence
- [x] preserve minimal publication-consent provenance beyond raw retention
- [x] distinguish survivor `prefer_not` from moderator privacy withholding
- [x] minimize public story list metadata and limit archive to one category filter
- [x] separate append-only analytics eligibility from publication/credibility decisions
- [x] define explicit staff capability permissions and role templates
- [x] enforce moderation/publication capabilities at API and service boundaries
- [x] document separate domain state-machine ownership for Phase 9
- [x] mark current taxonomy as product/descriptive vocabulary, not a prevalence instrument
- [ ] approve meaning-preserving redaction/editorial policy
- [ ] domain/survivor-support review of field purposes and terminology
- [ ] decide current-minor/safeguarding scope
- [ ] choose initial closed-beta jurisdiction and verify support resources
- [ ] decide editorial featuring policy
- [x] final self-review + stacked draft PR #15
- [x] exact final CI after single-commit branch cleanup

## M9 — Staff moderation/admin
**Status:** Not started
- [ ] moderator dashboard
- [ ] analyst boundaries
- [ ] superadmin boundaries
- [ ] MFA
- [ ] permission tests

## M10 — Removal, reporting, abuse controls
**Status:** Not started
- [ ] removal requests
- [ ] reports
- [ ] brute-force/enumeration defenses
- [ ] scraping/rate-limit controls
- [ ] operational procedures

## M11 — CI, testing, security hardening
**Status:** Not started (frontend foundations established early in M1)
- [x] GitHub Actions frontend CI foundation
- [x] frontend lint/typecheck/privacy/build gates
- [x] backend PostgreSQL tests/migration/deploy-check foundation
- [x] CodeQL/static analysis foundation
- [ ] complete dependency + secret-scanning posture (npm audit/Dependabot already active; GitHub Dependency Review awaits Dependency Graph)
- [ ] browser accessibility tests
- [ ] full security test suite

## M12 — Deployment, closed beta, production launch
**Status:** Not started
- [ ] staging environment
- [ ] production environment
- [ ] encrypted backups
- [ ] restore drill
- [ ] monitoring/alerting
- [ ] incident-response runbook
- [ ] closed beta
- [ ] resolve launch-blocking findings
- [ ] production launch

## Global definition of done
A milestone is complete only when functionality works, tests pass, relevant CI passes, privacy/security review is complete, accessibility is preserved where applicable, documentation matches implementation, and no launch-blocking risk is hidden.
