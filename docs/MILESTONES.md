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
**Status:** Not started
- [ ] moderation state machine
- [ ] moderator permissions
- [ ] redaction workflow
- [ ] approve/reject
- [ ] audit trail
- [ ] tests

## M6 — Published stories
**Status:** Not started
- [ ] separate public story representation
- [ ] public list/detail APIs
- [ ] content-warning behavior
- [ ] report flow
- [ ] tests

## M7 — Frontend/backend integration
**Status:** Not started
- [ ] replace mock API incrementally
- [ ] submission integration
- [ ] stories integration
- [ ] error/loading states
- [ ] E2E tests

## M8 — Privacy-safe analytics
**Status:** Not started
- [ ] server-side thresholds
- [ ] suppression
- [ ] count bands
- [ ] max-2 dimensions
- [ ] approved combinations
- [ ] privacy bypass tests

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
- [ ] backend tests/migration checks
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
