# SELENA — Consent and Policy Versioning

**Status:** Proposed production baseline

## Principles

Consent must be:
- explicit;
- specific to the use;
- unbundled where practical;
- recorded with the exact policy/version shown;
- changeable prospectively;
- never inferred from use of the site.

## Consent purposes

### C1 — Public story publication
Required only when the submitter chooses the public-story path.

Means:
- story may be privacy-screened, moderated, redacted, and published anonymously;
- publication is not automatic;
- moderator may reject or request internal redaction;
- submitter may later use the removal mechanism.

### C2 — Aggregate statistics
Separate opt-in.

Means:
- approved structured fields may contribute to privacy-safe aggregate snapshots;
- no exact public counts;
- thresholds/suppression apply;
- contribution is excluded from future snapshots after valid removal;
- already released aggregate snapshots may not be mathematically reversible.

Default: **false**.

## Production consent record

Store an immutable record containing:
- opaque submission ID;
- consent purpose;
- granted/declined;
- consent text version;
- privacy-policy version;
- schema version;
- timestamp;
- source flow/version;
- replacement/revocation linkage when applicable.

Do not rely only on mutable booleans on the submission row for historical proof.

## Versioning

Recommended identifiers:
- `consent-publication-2026.1`
- `consent-statistics-2026.1`
- `privacy-policy-2026.1`
- `submission-schema-1`

Text changes that alter meaning require a new version.

Pure typo/accessibility changes that do not alter meaning may keep the same semantic version if documented.

## Re-consent

Do not silently expand historical consent.

Examples requiring new consent for existing data:
- using story content to train an AI model;
- sharing raw content with researchers;
- adding precise geography;
- changing from private moderation to third-party processing where terms materially change;
- publishing a previously statistics-only narrative.

If re-consent is impossible because submitters are anonymous/uncontactable, do not apply the new purpose to old data.

## Withdrawal/removal

Removal-code verification can act as the anonymous authority to request withdrawal/removal for that submission.

A valid request should:
- revoke future publication/analytics eligibility;
- trigger the deletion workflow;
- create a minimal audit/tombstone record.

## UI requirements

Before submit:
- publication and statistics choices must be understandable separately;
- statistics consent must remain unchecked by default;
- the user must see the relevant consent version or a stable linked summary;
- avoid dark patterns or language implying help depends on consent.

## Staff/admin requirements

Staff cannot override a declined statistics consent merely because a story was approved for publication.

Changing consent state requires a documented supported workflow, never direct database editing in normal operations.
