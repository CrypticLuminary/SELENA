# SELENA — Milestone Tracker

## M0 — Production specification and threat model
**Status:** In progress
- [x] Define production mission and MVP boundaries
- [x] Add baseline architecture/privacy/security documentation
- [ ] Complete data inventory
- [ ] Complete threat model
- [ ] Approve retention/deletion policy
- [ ] Define consent/versioning model
- [ ] Define final staff role matrix
- [ ] Define incident-response ownership

## M1 — Existing frontend production audit
**Status:** Not started
- [ ] Audit routes/components/data boundaries
- [ ] Review dependency versions
- [ ] Identify accessibility gaps
- [ ] Identify security/privacy gaps
- [ ] Identify duplication/dead code
- [ ] Establish test baseline

## M2 — Backend foundation
**Status:** Not started
- [ ] Django/DRF project
- [ ] PostgreSQL
- [ ] environment configuration
- [ ] baseline logging
- [ ] staff auth foundation
- [ ] backend test infrastructure

## M3 — Anonymous submission
**Status:** Not started
- [ ] submission model/API
- [ ] server-side validation
- [ ] secure public identifiers
- [ ] secure removal-code generation/storage
- [ ] rate limiting
- [ ] tests

## M4 — Privacy/PII preprocessing
**Status:** Not started
- [ ] privacy preprocessing boundary
- [ ] identifying-detail detection workflow
- [ ] safe logging
- [ ] review states
- [ ] adversarial tests

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
**Status:** Not started
- [ ] GitHub Actions CI
- [ ] lint/typecheck/build gates
- [ ] backend tests/migration checks
- [ ] CodeQL/static analysis
- [ ] dependency/secret scanning
- [ ] accessibility tests
- [ ] security test suite

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
