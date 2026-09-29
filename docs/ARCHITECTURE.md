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
`src/lib/mock-api.ts` is the intended replacement boundary. Replace mocks progressively with API calls while minimizing changes to UI components.

## Logging
Avoid raw story bodies, removal codes, secrets, authorization headers, and unnecessary identifying metadata.

## Deployment
Staging and production must use separate secrets/databases. Production deployment happens only after mandatory CI/security gates pass.


## Implemented backend foundation

Backend code lives under `backend/`.

Current Phase 2 implementation:
- Django 5.2 line + Django REST Framework;
- PostgreSQL as the configured application database;
- split development/test/production settings;
- custom UUID-based staff user;
- active-staff default API permission;
- public liveness/readiness endpoints as explicit exceptions;
- privacy-aware logging redaction defense;
- bounded request-body size;
- PostgreSQL-backed tests and CI.

The backend deliberately has **no survivor submission model or persistence API yet**. Those are Phase 3 responsibilities and must follow the data inventory, consent model, retention policy, and threat-model tests.

### Current health endpoints
- `GET /api/health/live/`
- `GET /api/health/ready/`

### Current protected staff endpoint
- `GET /api/staff/me/`

Future public APIs must explicitly opt into anonymous access; future staff-sensitive actions must add role/action/object authorization rather than relying only on authentication or a role label.
