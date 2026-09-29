# SELENA — Threat Model

**Status:** Production baseline for design and review  
**Method:** asset + trust-boundary review with STRIDE-style threat categories.

## Security objectives

In priority order:
1. prevent exposure of raw survivor submissions;
2. prevent unauthorized publication;
3. prevent re-identification through public analytics;
4. protect privileged staff accounts;
5. preserve survivor control over consent/removal;
6. preserve integrity of moderation/audit decisions;
7. keep the service available without weakening privacy controls.

## High-value assets

- raw survivor submissions
- consent records
- removal/recovery verifiers
- moderation/redaction records
- staff identities/permissions
- audit trail
- reports
- aggregate source data
- secrets/database credentials
- backups

## Trust boundaries

```text
Untrusted browser
   |
   | HTTPS
   v
Public API boundary
   |
   +--> raw submission zone (P3)
   |
   +--> moderation boundary <--- authenticated staff
   |
   +--> privacy aggregation boundary
   |
   +--> public story / aggregate representations
   |
   v
Public read APIs

Infrastructure/backup/observability systems are separate privileged boundaries.
```

## Threat actors

- opportunistic internet attacker
- abusive or malicious submitter
- scraper/data broker
- person attempting to identify a survivor or accused party
- compromised staff account
- malicious insider
- compromised dependency/build pipeline
- accidental developer/operator error

## Critical abuse cases

### T1 — Raw-submission exposure
**Threat:** IDOR, serializer mistake, debug endpoint, log leak, backup exposure, or admin misconfiguration reveals raw text.

**Controls:**
- separate raw/public models or representations;
- no public raw serializer;
- deny-by-default permissions;
- opaque public IDs;
- tests proving public APIs cannot access raw objects;
- no raw story logging;
- restricted backup access.

**Severity:** Critical.

### T2 — Unauthorized publication
**Threat:** crafted API request or state manipulation moves a submission directly to public.

**Controls:**
- server-owned state machine;
- no client-controlled moderation state;
- explicit human approval;
- transactionally enforce allowed transitions;
- audit every publication/unpublication action;
- tests for forbidden transitions.

**Severity:** Critical.

### T3 — Analytics re-identification
**Threat:** differencing, repeated queries, sparse combinations, minor groups, or exact counts identify contributors.

**Controls:**
- predefined queries only;
- server-side minimum thresholds;
- stronger minor/sensitive threshold;
- max two dimensions;
- count bands;
- no geography;
- snapshot/batch publication rather than live arbitrary querying;
- complementary suppression/generalization where subtraction can leak.

**Severity:** Critical.

### T4 — Removal-code brute force/enumeration
**Threat:** attacker guesses recovery/removal codes and removes or learns about submissions.

**Controls:**
- high-entropy cryptographic codes;
- store only secure verifier;
- constant-shape error responses;
- per-key/network/global rate limits;
- no submission existence disclosure;
- monitor abuse without logging plaintext codes.

**Severity:** High.

### T5 — Free-text identification
**Threat:** survivor unintentionally names themselves, another survivor, alleged perpetrator, school, workplace, address, or precise event.

**Controls:**
- pre-submission warning;
- privacy preprocessing;
- human moderation;
- redaction tooling;
- no automatic publication;
- reports and emergency unpublish path.

**Severity:** High.

### T6 — Staff account compromise
**Threat:** phishing, password reuse, stolen session, or excessive role permits raw-data access/publication.

**Controls:**
- MFA for privileged staff;
- least privilege;
- secure sessions;
- short inactivity timeout for raw-data views;
- reauthentication for highly sensitive actions where practical;
- audit trail;
- rapid session revocation.

**Severity:** Critical.

### T7 — Malicious insider
**Threat:** authorized staff browses, exports, or republishes sensitive content outside assigned duties.

**Controls:**
- role separation;
- least-privilege queues;
- no bulk raw export in MVP;
- immutable/append-only audit trail design;
- periodic access review;
- alerts for unusual access patterns when operationally feasible.

**Severity:** Critical.

### T8 — Stored/reflected XSS
**Threat:** attacker places scripts/markup in story/report fields that execute in staff or public UI.

**Controls:**
- never trust HTML from submitters;
- render text with framework escaping;
- prohibit `dangerouslySetInnerHTML` absent explicit review;
- CSP at deployment;
- sanitize any future rich-text feature;
- security tests using hostile payloads.

**Severity:** High.

### T9 — CSRF/CORS/session misuse
**Threat:** third-party site triggers privileged staff actions.

**Controls:**
- Django CSRF protection for cookie-authenticated state changes;
- SameSite/secure cookies;
- narrow CORS allowlist;
- do not expose privileged actions to anonymous bearer tokens in the browser.

**Severity:** High.

### T10 — Resource exhaustion
**Threat:** oversized submissions, repeated reports, expensive analytics, image/attachment abuse, or Server Action/API DoS.

**Controls:**
- strict request/body limits;
- story character limit enforced server-side;
- rate limits;
- no arbitrary analytics;
- queue expensive tasks;
- infrastructure-level request limits.

**Severity:** High.

### T11 — Supply-chain compromise
**Threat:** vulnerable/malicious dependency or GitHub Action compromises build/runtime.

**Controls:**
- minimal dependencies;
- lockfile;
- Dependabot;
- production dependency audit;
- CodeQL;
- minimum GitHub Actions permissions;
- avoid secrets on untrusted PR execution;
- pin/upgrade actions through controlled review.

**Severity:** High.

### T12 — Secret exposure
**Threat:** secrets committed, logged, exposed to client bundle, or leaked through CI.

**Controls:**
- no secrets in repository;
- server-only environment variables;
- separate staging/production credentials;
- secret scanning when repository capability is enabled;
- immediate rotation after suspected exposure.

**Severity:** Critical.

### T13 — Backup/restoration resurrects deleted/publicly removed material
**Threat:** restore brings back content a survivor removed.

**Controls:**
- deletion tombstone ledger retained longer than ordinary data;
- restore runbook replays deletions before service reopening;
- backup expiry schedule;
- post-restore verification.

**Severity:** High.

### T14 — Over-collection through observability
**Threat:** APM/error tooling receives request bodies, query strings, raw text, IPs, or auth data.

**Controls:**
- privacy-aware logging wrapper;
- redact headers/body by default;
- do not attach raw request payloads to errors;
- provider review before integration.

**Severity:** High.

## Security test requirements derived from this model

Before launch, tests must cover:
- anonymous caller cannot read raw submission;
- public story ID cannot derive/access raw submission;
- direct state transition to published is rejected;
- unauthorized staff roles cannot view raw data or publish;
- removed/unpublished story disappears from all public endpoints;
- analytics reject third dimension/arbitrary category combinations;
- suppressed groups cannot be reconstructed through supported queries;
- removal verification is rate-limited and non-enumerating;
- hostile HTML/JS is rendered inert;
- logs never contain raw story text/removal codes in test fixtures;
- oversized requests are rejected;
- backup restore procedure respects deletion ledger.

## Review triggers

Revisit this threat model when adding:
- file/image/audio uploads;
- AI/LLM processing;
- external analytics;
- search over story bodies;
- researcher access/export;
- public accounts;
- geographic features;
- mobile apps;
- third-party authentication;
- new staff roles.
