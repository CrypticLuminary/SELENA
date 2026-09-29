# SELENA — Production Architecture

## Target stack
- Frontend: Next.js + TypeScript
- Backend: Django + Django REST Framework
- Database: PostgreSQL
- Background jobs: Celery + Redis when needed
- CI/CD: GitHub Actions
- Containerization: Docker where operationally useful
- Monitoring/error reporting: privacy-aware tooling

Do not add infrastructure before it is needed.

## High-level flow
```text
Browser
  |
  v
Next.js
  |
 HTTPS
  v
Django REST API
  |
  +--> PostgreSQL
  +--> Moderation services
  +--> Privacy aggregation
  +--> Background jobs (when required)
```

## Security zones
1. **Raw submissions** — most restricted data.
2. **Moderated/redacted content** — reviewed/transformed for publication.
3. **Public content** — published stories and privacy-safe aggregates.

Primary flow: `RAW -> MODERATED -> PUBLIC`

Public endpoints must never query or serialize raw submissions directly.

## Expected backend domains
submissions, stories, moderation, taxonomy, privacy, analytics, reports, staff, audit.

Create separate Django apps only when domain boundaries justify them.

## API principles
APIs should be narrow, explicit, versionable, validated, permission-checked, and privacy-preserving.

Candidate endpoints:
- `POST /api/submissions/`
- `GET /api/stories/`
- `GET /api/stories/{public_id}/`
- `POST /api/removal-requests/`
- `POST /api/reports/`
- predefined `/api/patterns/*`
- protected staff/moderation endpoints

Never expose arbitrary database querying.

## Current frontend boundary

Phase 7 splits the frontend data boundary deliberately:

- `src/lib/api.ts` — real Django integration for public stories, anonymous
  submissions, and bounded story reports. Public responses are runtime-validated
  before components receive them.
- `src/lib/mock-api.ts` — temporary Phase 8 boundary for synthetic,
  already-privacy-safe aggregate pattern fixtures only.

The synthetic public-story dataset has been removed.

Browser calls use same-origin `/api/*` paths through the Next.js backend proxy.
Server-rendered calls use server-only `SELENA_API_BASE_URL` /
`SELENA_BACKEND_ORIGIN`; backend routing must not use a `NEXT_PUBLIC_*`
variable.

The anonymous submission client does not automatically retry POST failures
because a lost response can be ambiguous after a server commit.

## Logging
Avoid raw story bodies, removal codes, secrets, authorization headers, and unnecessary identifying metadata.

## Deployment
Staging and production must use separate secrets/databases. Production deployment happens only after mandatory CI/security gates pass.

## Implemented backend through Phase 6

Backend code lives under `backend/`.

Implemented domains:
- `staff_accounts` — UUID staff identities and role boundaries;
- `submissions` — write-only anonymous private submissions, versioned consent,
  secure removal verifier, retention deadlines, and deletion tombstones;
- `privacy_review` — local metadata-only identifying-detail screening;
- `moderation` — private human review, append-only redaction drafts and audit
  evidence;
- `public_stories` — separate redacted public representation and minimal report
  intake.

The enforced data flow is:

```text
anonymous POST
    |
    v
RAW SUBMISSION (private)
    |
    +--> local privacy screening
    |
    v
MODERATION CASE + REDACTION DRAFTS (private)
    |
    +--> explicit approval
    +--> publication control policy
    +--> public metadata minimization
    |
    v
PUBLIC STORY (separate representation)
```

A public endpoint never serializes `RawSubmission` or `ModerationCase`
directly.

### Current public endpoints
- `POST /api/submissions/`
- `GET /api/stories/`
- `GET /api/stories/{public_story_id}/`
- `POST /api/stories/{public_story_id}/reports/`
- `GET /api/health/live/`
- `GET /api/health/ready/`

### Current protected boundaries
- staff identity under `/api/staff/`;
- moderation actions under `/api/moderation/`;
- publication action under `/api/publication/`.

Publication is configured `disabled` by default. Enabling single-moderator or
dual-control publication is an explicit governance/deployment decision.

Public-story metadata follows a non-enrichment rule: publication may preserve a
submitted broad value, reduce an allowed multi-value set, or suppress a value,
but may not invent more specific context. Detailed relationship fields from the
private submission are not public by default.

Private retention and public retention are intentionally decoupled. A public
story can survive deletion of its raw source after the approved raw-retention
window. Minimal append-only publication provenance uses opaque IDs rather than a
foreign key into the private graph.

### Validation baseline
Backend CI uses PostgreSQL and runs Ruff lint/format, migration-drift checks,
Django system checks, migrations, pytest, Python dependency audit, and production
deployment checks. CI is read-only outside short-lived migration/formatting
workflows that are removed immediately after validated use.


## Implemented frontend/backend integration through Phase 7

### Submission path

```text
in-memory wizard
   |
   +-- public path ----------> story text + explicit publication consent
   |
   +-- statistics-only -----> broad structured values only
                               (story text omitted client-side and rejected server-side)
   |
   v
POST /api/submissions/
   |
   v
one-time removal code response
   |
   v
per-tab confirmation handoff -> immediately cleared after read / Quick Exit
```

The frontend maps the statistics-only confirmation to
`statistics_consent=true`; it never treats that choice as publication consent.

### Public story path

The public archive uses the backend's broad top-level relationship vocabulary,
not private relationship details. Responses are validated with Zod before they
reach presentation components. Pagination uses the backend UUID cursor and the
archive loads additional pages explicitly.

The content-warning gate remains in front of full story text.

### Report path

The report UI mirrors the backend's bounded reason vocabulary and collects no
free-text note. It sends only `{ reason }` to the story report endpoint.

### Failure handling

- public reads have loading/error/empty states;
- optional related-story failure never hides the requested story;
- submission POSTs are not automatically retried after ambiguous transport/5xx
  failures;
- if session storage is unavailable after a successful submission, the frontend
  keeps the one-time removal code on the current in-memory confirmation instead
  of navigating away and losing it.
