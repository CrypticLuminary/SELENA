# Phase 0 — Governance & Threat Model TODO

**Branch:** `phase-0-governance-threat-model`  
**Goal:** remove ambiguity about what SELENA stores, who may access it, how consent works, how content is removed, and how incidents are handled before production backend implementation.

## P0.1 — Data inventory
- [x] Classify public/internal/sensitive/highly-sensitive data.
- [x] Inventory submission fields.
- [x] Inventory moderation, reports, staff, audit, analytics, backups, and recovery data.
- [x] Document data that must not be collected by default.
- [x] Define third-party transmission boundary.

## P0.2 — Threat model
- [x] Define critical assets and trust boundaries.
- [x] Identify external, insider, scraper, staff-compromise, and supply-chain actors.
- [x] Model raw-data exposure, unauthorized publication, re-identification, removal-code abuse, XSS, CSRF, DoS, backup resurrection, and observability leakage.
- [x] Derive concrete security tests from threats.
- [x] Define threat-model review triggers.

## P0.3 — Retention/deletion
- [x] Draft specific retention periods.
- [x] Define primary-storage deletion workflow.
- [x] Define cache/index cleanup.
- [x] Define backup expiry + deletion-tombstone replay.
- [x] Define aggregate-snapshot deletion limitations honestly.
- [ ] Product owner/legal/privacy review of proposed periods.

## P0.4 — Consent/versioning
- [x] Separate publication and statistics consent.
- [x] Keep statistics consent opt-in.
- [x] Define immutable consent records and semantic versions.
- [x] Define re-consent triggers.
- [x] Define anonymous withdrawal/removal behavior.
- [ ] Approve final user-facing consent text before production.

## P0.5 — Staff access
- [x] Define Moderator, Senior Moderator, Analyst, Ops/Safety, and Superadmin boundaries.
- [x] Ensure Superadmin does not automatically mean routine raw-story access.
- [x] Forbid raw bulk export in MVP.
- [x] Define break-glass requirements.
- [ ] Choose final publication-control model: two-step vs authorized single-moderator publication.

## P0.6 — Incident response
- [x] Define severity levels.
- [x] Define containment and recovery process.
- [x] Define evidence-minimization rules.
- [x] Define emergency unpublish/session revocation/credential-rotation expectations.
- [ ] Assign named incident owners and private communication channel.
- [ ] Complete tabletop exercise before launch.

## P0.7 — Exit review
- [x] Cross-check new policies against PRODUCT_SPEC, PRIVACY, SECURITY, and ARCHITECTURE.
- [x] Keep legal/jurisdiction-specific claims out of engineering policy.
- [x] Record unresolved owner decisions explicitly.
- [ ] Owner approves retention periods, publication control model, and incident ownership.
- [ ] Mark Phase 0 fully approved after those decisions are recorded.

## Phase 0 exit gate

Engineering/specification work is complete when these documents exist and are internally consistent. Governance approval is complete only after the product owner explicitly approves the unresolved policy choices.

Backend implementation may begin using the proposed conservative model, but production launch must not occur until the open governance decisions are closed.
