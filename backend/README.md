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

## Retention maintenance

Phase 3 adds two explicit maintenance commands:

```bash
python manage.py purge_expired_submissions
python manage.py purge_expired_tombstones
```

The first removes expired raw submissions only after creating minimal deletion
tombstones, so a later backup restore can replay prior deletions before service
is reopened. Tombstones contain only opaque submission IDs and deletion
metadata; they do not contain survivor narratives or structured submission
fields.

The second removes tombstones after the configured tombstone retention period.
Production scheduling for these commands belongs to the deployment/operations
milestone.

## Local privacy screening

Every new anonymous submission now receives a versioned local privacy-screening
run. The screening layer is deliberately assistive:

- raw narratives stay inside the SELENA backend;
- no external AI/moderation service receives survivor text;
- only finding category, rule ID, and character offsets are stored;
- matched text/snippets are not duplicated into screening records;
- `no_automated_flags` is **not** publication approval;
- detector failures produce an error screening state and still require human review.

Current deterministic rules can flag common emails, phone-like values, URLs,
social handles, precise numeric dates, street-address-like text, and explicit
self-name phrases. These rules can miss identifiers and can produce false
positives. Human privacy/moderation review remains mandatory before publication.

