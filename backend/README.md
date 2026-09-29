# SELENA Backend

This backend currently includes the Phase 2–5 foundations: staff authentication, anonymous private submissions, local privacy screening, and a permission-tested human moderation workflow. Public story publication is still deliberately absent.

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
- raw submissions remain private and write-only from the public side;
- public story publication/API is deliberately absent through Phase 5.

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

## Moderation boundary

Public-path submissions with current publication consent enter a private moderation
case. Routine raw-content access is limited server-side to Moderator and Senior
Moderator roles; Analyst, Operations/Safety, and Superadmin roles do not receive
raw moderation access merely by being staff.

Moderation uses append-only redaction drafts and audit events. Approval requires
a current publication consent, an assigned moderator, a redaction draft, and a
successful local privacy check of that draft. Approval is still an internal
state only: Phase 5 does not create a public story or public API representation.

Escalated cases require a Senior Moderator to reclaim them. The final production
policy for single-review versus dual-control publication remains a governance
decision for the later publication boundary.

