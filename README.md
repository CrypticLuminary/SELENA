# SELENA

SELENA is a privacy-first, survivor-centered platform for anonymous experience
sharing, human-reviewed public stories, and privacy-safe aggregate patterns.

The production path is deliberately split into separate data zones:

```text
anonymous submission
        |
        v
private raw submission
        |
        v
privacy screening + human moderation
        |
        v
separate redacted public story
```

Raw submissions are never serialized directly by a public read endpoint.

## Current implementation

Through Phase 7 the repository includes:

- Next.js + TypeScript survivor-facing frontend;
- Django + Django REST Framework backend;
- PostgreSQL-backed private submission storage;
- anonymous, write-only submission API;
- one-time anonymous removal credential with verifier-only storage;
- local identifying-detail screening;
- permission-tested human moderation;
- separate public-story representation;
- public story list/detail APIs;
- bounded anonymous story reporting;
- real frontend/backend integration for stories, submissions, and reports;
- GitHub Actions frontend and backend quality/security gates.

The **Patterns** area is still intentionally backed by synthetic privacy-safe
fixtures. Server-enforced analytics belongs to Phase 8.

Publication itself remains **disabled by default** until the production
publication-control governance decision is approved.

## Privacy invariants

- No public account is required to submit.
- The submission form has no name, email, phone, exact address, exact event date,
  or exact age field.
- Statistics consent is opt-in.
- On the statistics-only path, story text is **not sent to the backend**; the
  backend also rejects narrative text on that path.
- Public stories use only broad relationship categories. Detailed relationship
  context remains private by default.
- Public APIs do not expose raw submission IDs, moderation provenance, exact
  publication timestamps, or removal credentials.
- Public archive pagination uses an opaque public-story UUID cursor.
- Report intake accepts bounded reason codes only; no reporter identity or
  free-text report narrative is collected.
- The plaintext removal code is returned once. The frontend holds it only for
  the confirmation handoff and clears that ephemeral value after reading it or
  on Quick Exit.
- Quick Exit cannot erase browser/network/device history; the Safety page states
  those limits explicitly.

See `docs/PRIVACY.md`, `docs/SECURITY.md`, `docs/THREAT_MODEL.md`, and
`docs/DATA_INVENTORY.md` before changing a sensitive boundary.

## Local development

### Backend

Requirements: Python 3.12+ and PostgreSQL.

```bash
cd backend
python -m venv .venv
# activate the virtual environment
pip install -e ".[dev]"
docker compose up -d postgres
python manage.py migrate
python manage.py runserver
```

Django defaults locally to `http://127.0.0.1:8000`.

### Frontend

Copy the frontend environment example if you need non-default routing:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Next.js defaults locally to `http://localhost:3000`.

Browser API requests stay same-origin under `/api/*` and are proxied by
Next.js to Django. Server-rendered frontend requests use server-only backend
environment variables; backend routing is never configured with a
`NEXT_PUBLIC_*` variable.

## Repository layout

```text
backend/
  staff_accounts/
  submissions/
  privacy_review/
  moderation/
  public_stories/
  selena_api/
  tests/

src/
  app/
  components/
  data/
    categories.ts
    patterns.ts        # temporary Phase 8 synthetic aggregates only
  lib/
    api.ts             # real stories/submissions/reports client
    mock-api.ts        # temporary pattern-only boundary
    ephemeral.ts       # one-time receipt cleanup
    privacy.ts
    submission-schema.ts
  types/

docs/
  architecture, privacy, security, threat model, decisions, milestones, ...
```

The old synthetic public story dataset has been removed. Components must not
reintroduce a second public-story source of truth.

## Validation

Frontend:

```bash
npm run lint
npm run typecheck
npm run check:privacy
npm run build
npm run audit:prod
```

Backend:

```bash
cd backend
ruff check .
ruff format --check .
python manage.py makemigrations --check --dry-run
python manage.py check
pytest
pip-audit
```

GitHub Actions runs these foundations on phase branches. Backend CI uses
PostgreSQL and also runs production deployment checks.

## Product boundaries

SELENA intentionally does not add public comments, likes, reactions, follower
graphs, DMs, engagement rankings, arbitrary public analytics queries, exact
geographic drill-down, or exact public counts.

The implementation roadmap and current phase status live in
`docs/MILESTONES.md`.
