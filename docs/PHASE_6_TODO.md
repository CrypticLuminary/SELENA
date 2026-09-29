# Phase 6 — Published Stories TODO

**Branch:** `phase-6-published-stories`  
**Status:** Complete on branch — ready for human review.  
**Goal:** create a deliberately separate, privacy-minimized public story representation that can only be produced from approved moderation evidence and current publication consent.

## P6.1 — Public/private separation
- [x] Add dedicated `public_stories` backend domain.
- [x] PublicStory has no FK to RawSubmission or ModerationCase.
- [x] Public APIs never serialize the private moderation graph.
- [x] Private-source retention deletion does not delete the public story.
- [x] Publication provenance uses opaque IDs, not a private-content FK.
- [x] Publication provenance is append-only.
- [x] Public-story deletion preserves minimal provenance.
- [x] A removed publication cannot be silently recreated.

## P6.2 — Governance-gated publication
- [x] Require approved moderation state/evidence.
- [x] Re-check latest publication consent immediately before publication.
- [x] Re-check redacted body and excerpt with the local privacy detector.
- [x] Fail closed if privacy validation fails/errors.
- [x] Add explicit `PUBLICATION_CONTROL_MODE`.
- [x] Safe default is `disabled`.
- [x] Support deliberately configured `single_moderator`.
- [x] Support `dual_control` requiring a different Senior Moderator.
- [x] Serialize concurrent publication on the moderation-case row.
- [x] Make repeat publication idempotent.
- [x] Reset private raw retention to configured post-publication window.

## P6.3 — Public metadata minimization
- [x] Require an explicit moderator-selected public projection.
- [x] Use top-level relationship categories only.
- [x] Keep relationship details private by default.
- [x] Age group may only match submitted broad value or be suppressed.
- [x] Setting may only match submitted broad value or be suppressed.
- [x] Experience types may only be a submitted subset or be suppressed.
- [x] Relationship must be a submitted top-level category or be suppressed.
- [x] Reject invented/enriched public metadata.
- [x] Allow `prefer_not` suppression.

## P6.4 — Public read API
- [x] Anonymous list endpoint.
- [x] Anonymous detail endpoint.
- [x] Deliberate public serializers only.
- [x] List omits full narrative.
- [x] Broad publication year label only.
- [x] No exact public publication timestamp.
- [x] Fixed 20-story page size; no exact total count.
- [x] Opaque random public-story UUID cursor instead of timestamp-bearing cursor.
- [x] Hide inactive stories.
- [x] Broad filters + recent/featured ordering.
- [x] Responses no-store/noindex during prelaunch.

## P6.5 — Content warnings and reports
- [x] Copy bounded moderator-authored warning vocabulary.
- [x] Preserve warnings in list/detail output.
- [x] Minimal anonymous report endpoint.
- [x] Bounded report reasons only.
- [x] No reporter identity/free-text storage.
- [x] HMAC-derived anonymous throttle cache key.
- [x] Report response no-store.
- [ ] Phase 7 must preserve the frontend content-warning reveal gate.
- [ ] Report triage/unpublish/removal actions remain Phase 10.

## P6.6 — Self-review / validation
- [x] disabled-by-default test
- [x] single-control test
- [x] dual-control actor/role tests
- [x] latest-consent withdrawal test
- [x] public body/excerpt privacy recheck
- [x] non-enrichment tests for age/relationship/setting/experience
- [x] suppression test
- [x] detailed relationship rejection
- [x] serializer/provenance leakage tests
- [x] opaque cursor pagination test
- [x] idempotency test
- [x] provenance immutability + removal-survival test
- [x] private-retention/public-story separation test
- [x] report minimization/throttle tests
- [x] generated public-story migration
- [x] Ruff lint/format in migration gate
- [x] migration drift in migration gate
- [x] PostgreSQL migrations/tests in migration gate
- [x] Python dependency audit in migration gate
- [x] production deploy checks in migration gate
- [x] temporary write-enabled migration workflow removed
- [x] final ordinary read-only Backend CI pass

## Governance rule

Phase 6 does **not** resolve the final production publication-control decision.
Production publication remains disabled unless `PUBLICATION_CONTROL_MODE` is
deliberately set after owner/governance approval.

## Phase 6 exit gate

Phase 6 is complete when the final ordinary Backend CI passes on the branch with
the temporary migration workflow removed. The draft PR remains the human review
boundary.


## Final automated result

- Ruff lint: **pass**
- Ruff format: **pass**
- migration drift: **pass**
- Django system checks: **pass**
- PostgreSQL migrations: **pass**
- PostgreSQL-backed tests: **pass**
- Python dependency audit: **pass**
- production deploy checks: **pass**

The final ordinary Backend CI passed after the temporary migration workflows were removed. The draft PR remains the human review boundary before merge.
