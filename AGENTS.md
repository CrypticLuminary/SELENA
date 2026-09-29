# SELENA — Repository Instructions

SELENA is a privacy-first, survivor-centered platform for anonymous story sharing and privacy-safe aggregate analysis.

Treat survivor safety, privacy, security, correctness, data integrity, accessibility, and maintainability as non-negotiable.

## Source of truth
Before substantial work, read:
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/PRODUCTION_ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/PRIVACY.md`
- `docs/SECURITY.md`
- `docs/DECISIONS.md`
- `docs/MILESTONES.md`
- `docs/DATA_INVENTORY.md`
- `docs/THREAT_MODEL.md`
- `docs/RETENTION_AND_DELETION.md`
- `docs/CONSENT_MODEL.md`
- `docs/STAFF_ROLES.md`
- `docs/INCIDENT_RESPONSE.md`

If documentation conflicts with implementation, identify the conflict instead of silently changing product or security policy.

## Priority
1. Survivor safety
2. Privacy
3. Security
4. Correctness
5. Data integrity
6. Accessibility
7. Maintainability
8. Simplicity
9. Performance
10. Code size

Never sacrifice items 1–7 merely to reduce code.

## Engineering style
Use DRY, KISS, YAGNI, separation of concerns, and single responsibility.

Before creating code:
1. Inspect the repository for existing equivalents.
2. Reuse or extend existing components, schemas, validators, types, utilities, services, and styles when appropriate.
3. Prefer the smallest coherent implementation.
4. Avoid speculative abstractions and unnecessary dependencies.

Do not force DRY when it harms clarity. Minimal code must never mean weaker validation, authorization, privacy, testing, accessibility, or error handling.

## Privacy boundary
Treat SELENA as:

`RAW SUBMISSION -> MODERATED/REDACTED STORY -> PUBLIC STORY / PRIVACY-SAFE AGGREGATES`

Public APIs must never expose raw submissions. Privacy-sensitive enforcement belongs on the backend. Frontend restrictions are UX only and are never authoritative.

## Security baseline
For every change consider authentication, authorization, IDOR, input validation, output encoding, XSS, CSRF, CORS, SQL injection, SSRF where relevant, brute force, enumeration, rate limiting, secret leakage, unsafe logging, privilege escalation, dependency risk, scraping/abuse, and denial-of-service implications.

Use framework-native security features where possible. Never implement custom cryptography. Never commit secrets.

## Moderation
A public submission must never become public without the approved moderation workflow. Automated tooling may assist moderation but must not silently publish sensitive content.

## Analytics
Public analytics must use predefined privacy-safe queries. Enforce server-side thresholds, suppression, dimension limits, approved combinations, count banding, and sensitive-group protections.

## Authorization
Use least privilege. Do not trust client-supplied roles or hidden UI controls. Protected backend endpoints must enforce permissions server-side.

## Testing
Meaningful features should test success paths, invalid input, unauthorized/forbidden access, important boundaries, privacy rules, and failure conditions. Security-sensitive features require adversarial/negative tests.

## Required validation
Before completing a change, run all relevant checks.

Frontend: lint, typecheck, tests, production build.
Backend: lint/format checks, Django system checks, migration checks, tests, security-sensitive tests.
Cross-boundary changes: integration/E2E tests where appropriate.

If a check cannot be run, state which one and why.

## Self-review
Before marking a task complete, review:
- correctness and edge cases
- reuse and unnecessary duplication
- simplicity
- authorization and abuse paths
- privacy leakage or re-identification risk
- test coverage for important behavior
- accessibility for UI changes
- performance issues such as N+1 queries, excessive API calls, and unnecessary rerenders

Fix issues found before completion.

## CI/CD
CI is part of the product. Do not bypass failing checks. GitHub Actions should use minimum required permissions and must never expose secrets to untrusted code.

Expected checks include frontend lint/typecheck/tests/build, backend checks/tests/migrations, CodeQL/static analysis, dependency scanning, secret scanning, and E2E/smoke tests where appropriate.

## Scope discipline
Do not silently change privacy thresholds, moderation rules, consent behavior, retention periods, staff permissions, anonymity model, collected sensitive fields, or public data exposure.

If implementation requires one of these changes, report the required decision first.

## Task workflow
1. Read relevant docs and code.
2. Reuse existing code where appropriate.
3. Make the smallest coherent change.
4. Add/update tests.
5. Run relevant checks.
6. Perform security/privacy self-review.
7. Remove dead or unnecessary code.
8. Summarize changes, checks run, security/privacy considerations, and remaining risks.

Do not make unrelated refactors during a focused task.

## Backend foundation

Backend code lives under `backend/`.

Current backend rules:
- PostgreSQL is the configured database; do not silently introduce a second production database path.
- Public submitters remain accountless.
- The default DRF permission requires an active staff account; public endpoints must opt into anonymous access explicitly.
- A staff role label is not sufficient authorization for sensitive actions; enforce action/object permissions server-side.
- Do not introduce raw survivor submission storage outside the dedicated submission milestone and its tests.
- Run the backend CI-equivalent checks documented in `backend/README.md`.
