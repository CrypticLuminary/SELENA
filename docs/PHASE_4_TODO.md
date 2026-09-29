# Phase 4 — Privacy / PII Preprocessing TODO

**Branch:** `phase-4-privacy-preprocessing`  
**Status:** Complete on branch — ready for human review.  
**Goal:** add a local, privacy-preserving screening boundary that helps human moderators notice likely identifying details without ever treating automation as publication approval.

## P4.1 — Processing boundary
- [x] Add a dedicated `privacy_review` backend domain.
- [x] Keep raw narrative processing inside SELENA.
- [x] Do not transmit raw survivor content to external AI/moderation providers.
- [x] Run screening after anonymous submission persistence.
- [x] Keep screening separate from public story representation.

## P4.2 — Local identifying-detail detector
- [x] Detect common email patterns.
- [x] Detect likely phone numbers.
- [x] Detect URLs.
- [x] Detect social handles.
- [x] Detect precise numeric dates.
- [x] Detect street-address-like patterns.
- [x] Detect explicit self-name phrases as a best-effort heuristic.
- [x] Version the detector rules.
- [x] Clearly document that absence of flags is not proof of safety.

## P4.3 — Privacy-safe findings
- [x] Store finding category, detector rule, and offsets only.
- [x] Do not duplicate matched text/snippets into finding records.
- [x] Allow versioned re-screening with supersession links.
- [x] Keep screening models out of generic Django admin.
- [x] Cascade screening metadata when the underlying raw submission is deleted.

## P4.4 — Review states
- [x] Distinguish `flags_found`, `no_automated_flags`, and `error`.
- [x] Ensure none of these states represents publication approval.
- [x] Preserve human moderation as the publication boundary.
- [x] Fail toward human review if the detector errors.

## P4.5 — Logging / failure behavior
- [x] Never log raw story text during screening.
- [x] Never log detector exception messages that might echo processed text.
- [x] Limit error logs to opaque submission ID + exception type.
- [x] Add an adversarial logging test proving raw text is absent.

## P4.6 — Tests / exit review
- [x] Detector tests for supported identifying-detail categories.
- [x] False-assurance test for broad non-identifying context.
- [x] Test that finding records contain no matched-text/snippet field.
- [x] Test that no-flags status is not a publication state.
- [x] Test versioned re-screening.
- [x] Test submission flow automatically creates a screening run.
- [x] Generate migration and pass migration-drift check.
- [x] PostgreSQL-backed pytest passes.
- [x] Ruff lint/format pass.
- [x] Python dependency audit passes.
- [x] Production deploy checks pass.
- [x] Remove temporary migration workflow after use.
- [x] Final normal Backend CI passes.

## Explicit limitations

This detector is intentionally small and deterministic. It will miss identifiers and may produce false positives. In particular, general person names, institutions, contextual locations, indirect descriptions, and unusual formatting cannot be reliably identified with regex rules.

Therefore:
- **no automated flag does not mean safe**;
- **a flag does not prove identifying information is present**;
- human privacy/moderation review remains mandatory before publication.

Any future ML/LLM or third-party detector is a new threat-model/governance decision and must not be introduced silently.

## Phase 4 exit gate

Phase 4 is complete when every newly received submission gets a versioned local privacy screening record, likely identifiers can be surfaced without duplicating raw text, detector failure cannot authorize publication, and all backend CI/security gates pass.


## Self-review findings resolved

1. Screening is performed entirely in-process; no raw narrative is sent to an external AI or moderation provider.
2. Findings persist only rule/category/offset metadata. The matched identifier itself is not copied into a second sensitive table.
3. Detector exceptions deliberately log only the opaque submission UUID and exception class; an adversarial test uses an exception message containing the raw narrative and verifies that text never reaches logs.
4. Detector failures create an explicit `error` screening result rather than allowing an unreviewed submission to look clean.
5. Screening history is versionable through `detector_version` and `supersedes`; re-running rules does not silently rewrite previous evidence.
6. Regex rules are bounded/simple and run only over the already-capped narrative size; Phase 4 did not introduce a new unbounded processing surface.
7. A formatter mismatch discovered by CI was resolved by the same one-time validated migration workflow, which was removed immediately after use.
8. Final validation was repeated through the ordinary read-only Backend CI, not accepted solely on the temporary write-enabled workflow.

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
