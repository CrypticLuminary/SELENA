# SELENA — Security Baseline

## Principle
Assume public endpoints will receive malicious requests.

## Authentication and authorization
- separate staff authentication from anonymous submission
- least-privilege staff roles
- server-side permission checks on every protected endpoint
- MFA for privileged staff before production
- secure session/cookie settings

## Input/output
- strict server-side validation
- safe output encoding
- request-size limits
- safe file handling if uploads are introduced
- no direct public serialization of raw models

## Web security
Review/test XSS, CSRF, CORS, SQL injection, SSRF where relevant, IDOR, brute force, enumeration, rate-limit bypass, privilege escalation, scraping, and denial-of-service behavior.

## Secrets
Never commit secrets. Maintain `.env.example` with names only. Use environment/secret management and rotate credentials after suspected exposure.

## Logging
Never routinely log raw story text, plaintext removal codes, secrets, authorization headers, or database credentials.

## Dependencies
Keep dependencies minimal and maintained. Use automated dependency scanning and static analysis where practical.

## CI security
GitHub Actions should use minimum permissions, avoid exposing secrets to untrusted PR code, run mandatory checks before merge, and separate production deployment permissions from normal CI.

Expected checks:
- frontend lint/typecheck/tests/build
- backend checks/tests/migration checks
- CodeQL/static analysis
- dependency vulnerability scanning
- secret scanning
- integration/E2E tests when applicable

## Backups/recovery
Before launch: encrypted backups, documented retention, restricted access, tested restore procedure, and a documented restore drill.

## Incident response
Before launch define severity levels, responsible roles, containment, credential rotation, evidence preservation, notification decision path, recovery, and postmortem process.

## Launch gate
Do not launch with unresolved critical/high-risk findings that could expose raw submissions, bypass moderation/privacy policy, compromise privileged accounts, or leak secrets.
