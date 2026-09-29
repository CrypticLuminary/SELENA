# SELENA Backend

Phase 2 foundation only. This backend deliberately does **not** store survivor submissions yet.

## Local setup

Requirements:
- Python 3.12+
- PostgreSQL 17 (or Docker)

```bash
cd backend
python -m venv .venv
# activate the virtualenv
pip install -e ".[dev]"
docker compose up -d postgres
python manage.py migrate
python manage.py runserver
```

Health:
- `GET /api/health/live/` — process liveness, no DB dependency
- `GET /api/health/ready/` — verifies DB connectivity

Staff:
- `GET /api/staff/me/` — authenticated session only, minimal identity/role response
- Django admin is available for foundation development; production access must remain restricted.

## Validation

```bash
ruff check .
ruff format --check .
python manage.py makemigrations --check --dry-run
python manage.py check
pytest
pip-audit
```

## Privacy rules

- do not log request bodies containing survivor narratives;
- do not log plaintext removal/recovery codes;
- public submitters do not receive accounts;
- DRF defaults to authenticated access; future public endpoints must explicitly opt into `AllowAny`;
- no raw submission model/API is introduced in Phase 2.

See the root `docs/` governance and threat-model documents before adding production data.

## CI

`.github/workflows/backend-ci.yml` runs the same foundation checks against a PostgreSQL service on every backend change. CI is intentionally read-only with respect to repository contents.
