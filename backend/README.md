# SELENA Backend

The backend currently includes the Phase 2–6 foundations: staff authentication,
anonymous private submissions, local privacy screening, human moderation, and a
deliberately separate public-story representation. Publication is disabled by
default until the production control model is explicitly approved/configured.

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
- DRF defaults to authenticated access; public endpoints explicitly opt into `AllowAny`;
- raw submissions remain private and write-only from the public side;
- raw/moderated/public representations are separate;
- public metadata may be preserved, reduced, or suppressed but never enriched;
- detailed relationship fields remain private by default;
- publication is disabled by default and requires explicit governance configuration.

See the root `docs/` governance and threat-model documents before changing
production data use.

## CI

`.github/workflows/backend-ci.yml` runs the backend quality/security baseline
against PostgreSQL. Normal CI is read-only with respect to repository contents.
Short-lived migration/formatter workflows are removed immediately after use.

## Retention maintenance

```bash
python manage.py purge_expired_submissions
python manage.py purge_expired_tombstones
```

The first removes expired private submissions only after creating minimal
deletion tombstones so a later backup restore can replay prior deletions before
service is reopened. Tombstones contain only opaque submission IDs and deletion
metadata.

The second removes tombstones after their configured retention period.
Production scheduling belongs to the deployment/operations milestone.

## Local privacy screening

Every new anonymous submission receives a versioned local privacy-screening run.

- raw narratives stay inside SELENA;
- no external AI/moderation provider receives survivor text;
- findings store only category, rule ID, and character offsets;
- matched snippets are not duplicated into screening records;
- `no_automated_flags` is not publication approval;
- detector failure fails toward human review.

The deterministic rules are assistive and can miss identifiers or create false
positives. Human privacy/moderation review remains mandatory.

## Moderation boundary

Public-path submissions with current publication consent enter a private
moderation case. Routine raw-content access is limited server-side to Moderator
and Senior Moderator roles.

Moderation uses append-only redaction drafts and audit events. Approval requires
current publication consent, an assigned moderator, a redaction draft, and a
successful local privacy check. Moderation approval alone does not publish.

## Public story boundary

Phase 6 adds the separate `public_stories` zone.

- PublicStory has no foreign key to RawSubmission or ModerationCase.
- Only approved redacted text is copied.
- Public age/setting values may only match the submitted broad value or be
  suppressed to `prefer_not`.
- Public experience values may only be a subset of submitted broad values or be
  suppressed.
- Public relationship is limited to an already-submitted top-level category or
  `prefer_not`; private relationship detail is never promoted automatically.
- Minimal publication provenance is append-only, stores opaque IDs, and survives
  future public-story deletion.
- The original removal code itself is never copied; only its slow salted verifier
  is carried to the public-story zone so removal authority survives raw retention.
- A removed publication cannot be silently recreated from its old moderation
  case.
- Public APIs expose a broad publication-year label, not the exact timestamp.
- Archive pagination uses the random public-story UUID as the cursor rather than
  embedding the timestamp.
- Anonymous story reports accept bounded reason codes only and store no reporter
  identity or free-text narrative.

`PUBLICATION_CONTROL_MODE`:
- `disabled` — safe default;
- `single_moderator` — authorized moderation role may publish an approved case;
- `dual_control` — a different Senior Moderator performs final publication.

Production must remain `disabled` until the owner/governance decision is
approved.

Public endpoints:
- `GET /api/stories/`
- `GET /api/stories/{public_story_id}/`
- `POST /api/stories/{public_story_id}/reports/`

Protected publication endpoint:
- `POST /api/publication/cases/{moderation_case_id}/publish/`
