# SELENA — Production Roadmap

## Goal
Move SELENA from its current frontend-only synthetic-data prototype to a production-ready, privacy-first platform without weakening its survivor-centered design.

## Phase 0 — Product, privacy, governance, threat model
**Current status:** engineering/specification drafted; owner approvals remain.

Deliver production scope, data inventory, threat model, consent model, retention/deletion policy, role/permission model, and incident-response ownership.

**Exit gate:** no unresolved ambiguity about what data is collected, who can access it, how long it is retained, and how it becomes public. Current open gates are the proposed retention periods, publication-control model, and named incident-response ownership.

## Phase 1 — Frontend production audit
Audit the current Next.js code, dependencies, accessibility, performance, error handling, privacy assumptions, and test coverage.

**Exit gate:** documented gap list and stable frontend baseline.

## Phase 2 — Backend foundation
Build the smallest Django/DRF + PostgreSQL foundation required for later milestones.

**Exit gate:** production-style configuration, tests, health checks, and staff-auth foundation.

## Phase 3 — Anonymous submission
Implement accountless submission with strict validation, safe identifiers, secure removal/recovery mechanism, rate limits, and tests.

**Exit gate:** submissions persist safely but cannot become public automatically.

## Phase 4 — Privacy/PII preprocessing
Add the processing boundary for identifying information and privacy review.

**Exit gate:** suspected identifying information can be flagged/redacted without exposure through public APIs.

## Phase 5 — Moderation
Implement states, permissions, redaction, approval/rejection, audit trail, and moderation tests.

**Exit gate:** only authorized human-reviewed content can progress to publication.

## Phase 6 — Published stories
Create a separate public story representation and public list/detail APIs.

**Exit gate:** public APIs cannot expose raw submissions.

## Phase 7 — Frontend integration
Replace `src/lib/mock-api.ts` incrementally with production API calls while preserving component boundaries.

**Exit gate:** public product flows work end-to-end against the real backend.

## Phase 8 — Privacy-safe analytics
Move privacy policy fully server-side: thresholds, suppression, bands, approved combinations, and dimension limits.

**Exit gate:** direct malicious API calls cannot bypass privacy policy.

## Phase 9 — Staff dashboard and access control
Build moderation/admin capabilities with least privilege and MFA for privileged staff.

**Exit gate:** role boundaries are tested and operationally usable.

## Phase 10 — Removal, reporting, and abuse controls
Implement removal workflow, reports, rate limits, enumeration defenses, and anti-scraping/abuse protections.

**Exit gate:** user-safety workflows are operational.

## Phase 11 — CI, testing, and hardening
Add GitHub Actions, static analysis, dependency/secret scanning, integration/E2E testing, accessibility checks, security tests, and production build gates.

**Exit gate:** mandatory checks protect merges and releases.

## Phase 12 — Deployment and launch
Create staging/production, backups, restore drills, monitoring, incident response, closed beta, and launch review.

**Exit gate:** all launch blockers resolved and operational recovery tested.

## Build principles
- milestone-by-milestone delivery
- DRY + KISS + YAGNI
- smallest safe coherent change
- security/privacy override code-size optimization
- no silent product-policy changes
- tests for security/privacy boundaries
- docs updated alongside implementation
