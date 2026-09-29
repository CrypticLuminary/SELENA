# SELENA — Production Data Inventory

**Status:** Proposed production baseline  
**Purpose:** define what SELENA may collect, derive, publish, log, retain, and delete before backend implementation.

## Classification levels

| Class | Meaning | Examples |
|---|---|---|
| P0 Public | Deliberately public | published redacted story, public alias, privacy-safe count band |
| P1 Internal | Operational, not normally sensitive | dataset version, moderation state, non-sensitive feature flags |
| P2 Sensitive | Could cause harm if exposed | report notes, moderation annotations, broad survivor categories |
| P3 Highly sensitive | Raw survivor or security material | raw story text, raw submission, removal credential material, staff auth secrets |

P3 data receives the strongest access, logging, retention, export, and incident controls.

## Anonymous submission data

| Data | Class | Required? | Public? | Analytics eligible? | Notes |
|---|---:|---:|---:|---:|---|
| broad age group at time of experience | P2 | yes in current UI | only after privacy processing | yes, with consent | minors use stronger threshold |
| broad setting | P2 | yes in current UI | only after privacy processing | yes, with consent | no precise location |
| experience types | P2 | yes | only after privacy processing | yes, with consent | multi-select |
| people involved — broad relationship category | P2 | optional | never directly unless separately approved/redacted | possible future | do not expose unrestricted combinations |
| relationship detail | P2 | optional | no by default | no by default | can become identifying in combination |
| involvement role | P2 | optional | no by default | no by default | |
| approximate age band of person involved | P2 | optional | no by default | no by default | |
| frequency | P2 | optional | no by default | possible future | requires approved aggregate use |
| broad periods | P2 | optional | no by default | no by default | never exact dates |
| raw story text | P3 | conditionally required for public-story path | never raw | no | must pass human privacy/moderation review |
| publication choice | P1/P2 | yes | no | operational | public story vs statistics-only |
| publication consent | P2 | yes | no | no | versioned consent record required |
| statistics consent | P2 | explicit opt-in | no | controls eligibility | default false |

## Data SELENA intentionally does not request

Do not add these without an explicit approved decision:
- legal name
- email
- phone number
- username/account for public submitters
- exact date of birth or exact age
- exact event date/time
- street address
- GPS coordinates
- precise workplace/school/institution identifiers
- government identifiers
- social handles
- persistent advertising/device identifiers

Free text may still contain identifying information. Treat raw story text as P3 regardless of whether the UI requests identifiers.

## Submission metadata

### Allowed by default
- opaque submission ID
- created/updated timestamps
- moderation state
- consent-version identifiers
- schema version
- privacy-policy version relevant to analytics
- abuse-control metadata where strictly necessary

### Minimize or avoid
- full IP addresses
- precise user-agent strings
- referrer URLs
- device fingerprints

If network metadata is required for rate limiting or abuse defense, prefer short-lived derived/rate-limit keys rather than durable raw metadata.

## Removal/recovery mechanism

Production must store:
- opaque submission reference
- salted/slow hash or otherwise securely derived verifier of the removal code
- issuance/version metadata
- attempt/rate-limit state

Production must **not** routinely store or log the plaintext removal code after issuance.

Classification: P3.

## Moderation data

May include:
- moderator decision
- redaction annotations
- content warnings
- privacy flags
- rejection reason
- publication decision
- internal safety notes where necessary
- audit event identifying which staff account performed an action

Raw story bodies remain P3 even while being viewed in moderation.

## Published story representation

Public story data must be generated as a separate representation from the raw submission.

Allowed public fields:
- opaque public story ID unrelated to removal credential
- generated neutral alias
- approved broad categories
- standardized warnings
- moderator-approved excerpt
- moderator-approved/redacted story body
- broad publication label
- editorial featured flag if used

Never expose the raw submission object through a public serializer.

## Reports

Public report payload:
- public story ID
- standardized report reason
- optional free-text note

The note is P2 and may contain P3 information if the reporter types identifying material. Do not log it routinely.

## Staff accounts

Expected fields:
- staff identifier
- authentication data handled by the auth system
- role assignments
- MFA state
- account status
- security/audit timestamps

Password hashes, recovery secrets, MFA secrets/tokens: P3.

## Audit records

Audit records may include:
- actor staff ID
- action type
- target opaque ID
- timestamp
- before/after state names where useful
- request/correlation ID

Audit logs must not contain raw story bodies, plaintext removal codes, passwords, auth tokens, or unnecessary identifying details.

## Aggregate analytics

Internal aggregation may process consented P2 structured fields.

Public output must contain only P0 privacy-processed values:
- count bands
- display/suppression state
- relative scale
- approved category labels
- dataset/privacy-policy version
- broad generated-at label

No exact public counts, geography, arbitrary querying, or more than two public dimensions.

## Backups and caches

Backups inherit the highest classification of the source system.

Rules:
- encrypted at rest
- restricted restore access
- documented retention
- deletion handled through expiry rather than unsafe in-place backup surgery unless technically supported
- restoration must reapply deletion tombstones/records before public service resumes

Caches/search indexes derived from raw/moderated data must be included in deletion procedures.

## Third-party transmission

Raw P3 data must not be transmitted to analytics, AI, observability, support, or moderation providers by default.

Any exception requires:
1. documented purpose;
2. data-minimization review;
3. vendor retention/training review;
4. access-control review;
5. deletion capability;
6. approval recorded in `DECISIONS.md`.

## Engineering rule

If a new field cannot be placed in this inventory with a purpose, classification, access rule, retention rule, and deletion rule, do not add it to production storage.
