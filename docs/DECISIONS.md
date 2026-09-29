# SELENA — Architecture & Product Decision Log

Record durable decisions here. Do not rewrite history; supersede old decisions with a new entry.

## DEC-001 — Anonymous public submissions
**Status:** Accepted

Public submitters do not require normal user accounts for the production MVP.

**Reason:** Minimize identifying information and unnecessary account data.

**Consequence:** Removal/recovery uses a secure independent mechanism.

## DEC-002 — Raw and published stories are separate
**Status:** Accepted

Raw submissions and public stories are separate logical/data representations.

**Reason:** Reduce accidental exposure and create a clear moderation/redaction boundary.

## DEC-003 — Backend owns privacy enforcement
**Status:** Accepted

Frontend privacy restrictions are not authoritative. Backend services enforce thresholds, suppression, dimension limits, and public serialization.

## DEC-004 — Human moderation remains publication boundary
**Status:** Accepted

Automated systems may assist but do not silently publish survivor content.

## DEC-005 — No raw story content in routine application logs
**Status:** Accepted

Routine logs must not contain raw survivor story bodies.

## DEC-006 — DRY/KISS/YAGNI with security override
**Status:** Accepted

Prefer reuse and minimal code, but never reduce validation, authorization, privacy, testing, accessibility, or auditability merely to shorten code.

## DEC-007 — Separate publication and statistics consent
**Status:** Accepted as engineering baseline

Publication consent and aggregate-statistics consent are separate purposes. Statistics consent defaults to false and cannot be inferred from publication consent.

## DEC-008 — No automatic raw-data privilege for Superadmin
**Status:** Accepted as engineering baseline

System administration does not automatically grant routine raw-story access. Exceptional access uses a documented break-glass process.

## DEC-009 — No raw bulk export in MVP
**Status:** Accepted as engineering baseline

SELENA MVP does not provide a general-purpose raw-submission export feature.

## DEC-010 — Proposed retention schedule
**Status:** Proposed — owner/legal/privacy approval required

Engineering baseline:
- raw pending moderation: up to 90 days
- approved raw narrative: delete 30 days after publication when no hold applies
- rejected raw submission: 30 days
- statistics-only person-level structured data: up to 24 months
- reports/removal workflow records: 12 months
- staff security/audit events: 24 months
- backups: rolling 35 days
- minimal deletion tombstones: 36 months

See `RETENTION_AND_DELETION.md`.

## DEC-011 — Publication control model
**Status:** Proposed

Preferred model for a sensitive product: Moderator reviews/redacts, Senior Moderator performs final publication/unpublication. A single-moderator publication model may be chosen if staffing makes dual control impractical, but it must be explicit.

## DEC-012 — Consent records are immutable/versioned
**Status:** Accepted as engineering baseline

Production keeps append-only/versioned consent records containing purpose, granted/declined state, text version, policy version, schema version, and timestamp. Historical consent is never silently broadened.

## DEC-013 — Publication is disabled until governance mode is approved
**Status:** Accepted as engineering safety baseline

The backend defaults `PUBLICATION_CONTROL_MODE` to `disabled`. Code may support
the proposed single-moderator and dual-control models, but neither becomes active
merely because the implementation exists.

**Reason:** Implementing both policy options should not silently resolve DEC-011
or make public release possible before governance approval.

## Pending decisions
- approve/modify DEC-010 retention periods
- approve DEC-011 publication-control model
- hosting/data residency
- third-party moderation/AI providers, if any
- named incident-response owners/contact channel
- final user-facing consent wording
