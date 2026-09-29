# SELENA — Production Product Specification

## Mission
SELENA is a survivor-centered platform where people can anonymously share experiences, read moderated stories, and explore privacy-safe aggregate patterns without exposing individuals or turning the platform into a social network.

Core pillars: **SHARE → READ → UNDERSTAND**

## Production MVP
### Public
- Homepage
- Browse/read published stories with content warnings
- Anonymous story submission
- Submission success/removal-code flow
- Privacy-safe Patterns page
- Safety, Methodology, and About pages
- Report published content

### Staff
- Staff authentication
- Moderation queue
- Story review and redaction
- Approve/reject/publish/unpublish
- Removal-request handling
- Report handling
- Audit logging

## Non-goals for MVP
No public user accounts, followers, likes, reactions, comments, DMs, engagement ranking, precise geo drill-down, unrestricted analytics, raw-data export, researcher API, AI-generated societal conclusions, or mobile app.

## User types
- **Submitter:** no account required; submits anonymously and uses secure removal/recovery mechanism.
- **Reader:** sees only published/redacted stories and approved aggregates.
- **Moderator:** reviews/redacts/approves/rejects and handles reports within assigned permissions. Final publication/removal authority follows the approved staff-role model.
- **Senior Moderator (if enabled):** performs final publication/unpublication and verified removal actions under the two-step model.
- **Analyst:** accesses approved privacy-safe aggregates, not unrestricted raw submissions.
- **Operations/Safety:** handles abuse, incident, and verified removal workflows using minimum necessary access.
- **Superadmin:** manages staff/system administration under least privilege; system administration does not imply routine raw-story access.

## Story lifecycle
`RECEIVED -> PROCESSING -> NEEDS_REVIEW -> REDACTION_REQUIRED/APPROVED/REJECTED -> PUBLISHED -> REMOVED`

A submission must never become public automatically.

## Core rules
- Raw submissions and published stories are separate representations.
- Public APIs expose only deliberate public serializers.
- Backend validation/authorization is authoritative.
- Privacy-safe analytics are server-enforced.
- Exact identifying details are not required for normal submission.
- Story drafts are not persisted in browser storage by default.
- Public metrics describe submissions to SELENA, not population prevalence.

## MVP definition of done
Anonymous submission, moderation/redaction, public-story separation, secure removal requests, reporting, server-enforced privacy-safe analytics, staff permissions, CI/security gates, backup/restore procedures, incident procedures, accessibility, and production smoke tests all work.


## Governance dependencies
Before production launch, implementation must conform to the approved versions of:
- `DATA_INVENTORY.md`
- `THREAT_MODEL.md`
- `RETENTION_AND_DELETION.md`
- `CONSENT_MODEL.md`
- `STAFF_ROLES.md`
- `INCIDENT_RESPONSE.md`

Open governance decisions must be recorded in `DECISIONS.md`; engineering code must not silently settle them.
