# SELENA — Privacy Engineering Rules

This document defines engineering constraints, not legal advice.

## Data minimization
Do not require or intentionally collect unless explicitly approved:
- legal names
- email addresses
- phone numbers
- precise street addresses
- GPS coordinates
- social-media handles
- exact workplace/school identifiers
- exact sensitive-event timestamps
- persistent device identifiers

If users include identifying information in free text, moderation/privacy tooling should help detect and redact it before publication.

## Public analytics policy
Preserve these V1 policy concepts until explicitly changed:
- minimum group threshold: 10
- sensitive/minor threshold: 20
- maximum dimensions: 2
- count bands rather than exact counts
- geography disabled
- predefined/approved combinations only

These are product-policy values and must not change silently.

## Server-side enforcement
A malicious client must still be unable to request unsafe dimensional combinations, retrieve exact sensitive counts, bypass suppression, access raw submissions, or obtain prohibited geographic detail.

## Re-identification
Review combinations of apparently harmless fields for linkage/re-identification risk.

## Story drafts
Do not persist story text to localStorage/sessionStorage/indexedDB by default.

## Removal codes
Use cryptographically secure randomness, high entropy, no plaintext storage, no plaintext logging, rate-limited verification, and enumeration resistance.

## Retention/deletion
A formal retention schedule must be approved before launch. Deletion workflows must consider raw submissions, moderated copies, public stories, reports, audit records, caches/indexes, exports, and backups under the approved retention policy.

## Third parties
Before adding analytics, AI, moderation, observability, or storage providers, review transmitted data, retention/training terms, residency needs, logging, access controls, and deletion capability.

Do not send raw survivor content to third parties by default.

## Claims
Do not claim “100% anonymous.” Use precise language about minimizing identifying information and explain limitations.

## Governance references

Production implementation must also follow:
- `DATA_INVENTORY.md`
- `RETENTION_AND_DELETION.md`
- `CONSENT_MODEL.md`
- `STAFF_ROLES.md`
- `THREAT_MODEL.md`

Where documents conflict, do not silently choose the less restrictive behavior. Record a new decision in `DECISIONS.md`.
