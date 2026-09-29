# Phase 5 — Moderation TODO

**Branch:** `phase-5-moderation`  
**Status:** Complete on branch — ready for human review.  
**Goal:** create a permission-tested human moderation workflow that can review/redact/approve or reject private submissions without creating any public content.

## P5.1 — Moderation state machine
- [x] Add dedicated moderation domain.
- [x] Create cases only for public-path submissions with recorded publication consent.
- [x] Define pending / in-review / escalated / approved / rejected states.
- [x] Serialize state changes with database row locks.
- [x] Prevent approved/rejected cases from remaining in the active queue.
- [x] Do not create a public story when moderation approves.

## P5.2 — Authorization
- [x] Add server-side Moderator/Senior Moderator permission.
- [x] Deny analyst, operations, and superadmin routine raw access.
- [x] Require Senior Moderator to claim escalated cases.
- [x] Keep sensitive moderation models out of generic Django admin.

## P5.3 — Redaction workflow
- [x] Use append-only versioned redaction drafts.
- [x] Keep draft text private.
- [x] Use bounded content-warning vocabulary.
- [x] Require a draft before approval.
- [x] Re-run local identifying-detail detector on the latest draft before approval.
- [x] Block approval if automated privacy flags remain.
- [x] Preserve prior drafts through supersession linkage.

## P5.4 — Audit trail
- [x] Add append-only moderation events.
- [x] Record actor, action, from/to state, reason code, timestamp.
- [x] Do not store raw narrative/free-form notes in audit events.
- [x] Block normal save/queryset mutation of drafts and events.
- [x] Use bounded rejection/escalation reason codes.

## P5.5 — Staff API
- [x] Add active queue endpoint.
- [x] Add case detail endpoint with raw narrative and current privacy findings.
- [x] Add claim endpoint.
- [x] Add append-only redaction-draft endpoint.
- [x] Add approve/reject/escalate endpoint.
- [x] Mark all sensitive moderation responses no-store/no-cache/noindex.
- [x] Never expose removal credential data.

## P5.6 — Tests / exit review
- [x] Public consent path automatically creates moderation case.
- [x] Statistics-only path creates no moderation case.
- [x] Anonymous/non-moderator access denied.
- [x] Superadmin without moderation role denied routine raw access.
- [x] Moderator can read queue/detail.
- [x] Assignment conflict tests.
- [x] Escalated-case Senior Moderator requirement test.
- [x] Append-only draft/audit mutation tests.
- [x] Approval without draft denied.
- [x] Approval with remaining PII flags denied.
- [x] Clean redacted draft can be moderation-approved without becoming public.
- [x] Rejection/escalation reason-code tests.
- [x] Sensitive response caching tests.
- [x] Generate migration + migration drift pass.
- [x] PostgreSQL test suite passes.
- [x] Ruff lint/format pass.
- [x] pip-audit passes.
- [x] production deploy checks pass.
- [x] remove temporary migration workflow.
- [x] final normal Backend CI passes.

## Governance compatibility

Phase 5 deliberately records moderation approval as an internal state only. It does not decide the open Phase 0 question of whether production publication requires:
1. Moderator + Senior Moderator dual control; or
2. an authorized Moderator single-step publication.

Phase 6 can enforce whichever policy is approved without rewriting the Phase 5 audit history.

## Phase 5 exit gate

Phase 5 is complete when only authorized moderation roles can access raw review data, redaction and decisions are auditable/append-only, automated privacy findings cannot be silently ignored during approval, and moderation approval still cannot create public content.


## Self-review findings resolved

1. Routine raw-content access is restricted to Moderator and Senior Moderator roles; ordinary Analyst, Operations/Safety, and Superadmin sessions are denied.
2. Moderation approval checks the latest publication-consent record, so a later withdrawal cannot be ignored just because an older granted record exists.
3. Approval fails closed if the local privacy detector errors.
4. Direct edits and direct deletes of redaction/audit evidence are blocked; legitimate parent-submission deletion still cascades through the private graph.
5. Consent, privacy-screening, and redaction supersession links use RESTRICT rather than PROTECT so individual evidence records remain protected without preventing whole-submission retention/removal deletion.
6. The final normal Backend CI passed after the temporary write-enabled migration workflow was removed.

## Final automated result

- Ruff lint: **pass**
- Ruff format: **pass**
- migration drift: **pass**
- Django system checks: **pass**
- PostgreSQL migrations: **pass**
- PostgreSQL-backed tests: **pass**
- Python dependency audit: **pass**
- production deploy checks: **pass**

The draft PR remains the human review boundary before merge.
