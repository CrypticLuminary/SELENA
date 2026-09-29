# Phase 2 — Backend Foundation TODO

**Branch:** `phase-2-backend-foundation`  
**Status:** Complete on branch — ready for human review.

## P2.1 — Project foundation
- [x] Add Django/DRF project under `backend/`.
- [x] Use PostgreSQL as the only configured database backend.
- [x] Separate base/development/test/production settings.
- [x] Keep public submitters accountless.
- [x] Do not add survivor submission storage in Phase 2.
- [x] Add local PostgreSQL Compose service and environment template.

## P2.2 — Secure defaults
- [x] Protected DRF endpoints default to an active authenticated staff account.
- [x] Public health endpoints explicitly opt into anonymous access.
- [x] Production secure-cookie, HTTPS redirect, HSTS, frame, referrer, and MIME protections are explicit.
- [x] Request body size is bounded.
- [x] Unknown API exceptions return a generic 500 response.
- [x] Baseline logging filter redacts high-risk key/value material.
- [x] No raw request-body logging was introduced.

## P2.3 — Staff-auth foundation
- [x] Custom staff user exists before later domain migrations.
- [x] UUID primary key.
- [x] Unique staff email.
- [x] Governance roles represented.
- [x] Minimal authenticated `/api/staff/me/` endpoint.
- [x] Authenticated non-staff accounts are denied.
- [x] No public-user account model.
- [x] Role labels are documented as insufficient on their own for future sensitive authorization.

Object/action-level permissions and MFA arrive with the moderation/admin milestones.

## P2.4 — Operational health
- [x] Liveness endpoint without DB dependency.
- [x] Readiness endpoint verifies PostgreSQL.
- [x] PostgreSQL 17 used in local Compose and CI.
- [x] Environment template contains names/placeholders only.
- [x] Production settings fail closed when required secret/host configuration is absent.

## P2.5 — Tests and CI
- [x] Health tests.
- [x] Staff-auth positive and negative boundary tests.
- [x] Logging-redaction tests.
- [x] Ruff lint.
- [x] Ruff format check.
- [x] Migration drift check.
- [x] Django system checks.
- [x] PostgreSQL migrations.
- [x] PostgreSQL-backed pytest.
- [x] Python dependency audit.
- [x] Django production deployment checks.
- [x] Backend Dependabot coverage.
- [x] Confirm Backend CI is green.
- [x] Self-review failures and repeat until stable.

## Findings resolved during the self-review loop

1. Ruff caught formatting drift; code was formatted with the configured formatter.
2. Django caught hand-written migration drift; the initial custom-user migration was aligned with the model.
3. Authorization review found that generic `IsAuthenticated` was too broad for a staff-only API foundation; it was replaced with `IsActiveStaff` and a non-staff denial test.
4. `pip-audit` found 2026 advisories in DRF 3.16.1 and pytest 8.4.2; dependency floors were moved to patched lines (DRF 3.17.2+, pytest 9.0.3+).
5. The temporary write-enabled formatter workflow was deleted immediately after use.

## Phase 2 exit gate

Phase 2 is complete on this branch because:
- PostgreSQL-backed migrations/tests pass;
- lint/format/migration-drift/system/deploy checks pass;
- dependency audit passes;
- protected APIs fail closed to active staff by default;
- health checks are operational;
- no survivor submission persistence model/API has been introduced.

The draft PR remains the human review boundary before merge.
