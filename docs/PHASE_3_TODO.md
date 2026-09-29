# Phase 3 — Anonymous Submission TODO

**Branch:** `phase-3-anonymous-submission`  
**Status:** Complete on branch — ready for human review.  
**Goal:** persist anonymous submissions safely without creating any path from raw input to public content.

## P3.1 — Raw/private data model
- [x] Add a dedicated `RawSubmission` model.
- [x] Use opaque UUID identifiers.
- [x] Keep raw submission and any future public story as separate representations.
- [x] Do not add a public/published flag or public raw serializer.
- [x] Record schema/privacy/source-flow versions.
- [x] Add configurable pending-retention deadline.
- [x] Add purge command for expired received submissions.
- [x] Create minimal deletion tombstones before retention purge so backup restoration can replay prior deletions.
- [x] Add configurable 36-month tombstone-retention baseline and cleanup command.
- [x] Keep tombstones free of story text and survivor structured fields.

## P3.2 — Consent
- [x] Separate publication and statistics consent.
- [x] Require explicit publication consent for the public-story path.
- [x] Require explicit statistics consent for the statistics-only path.
- [x] Record immutable/versioned consent events.
- [x] Record declined consent as well as granted consent.
- [x] Prevent mutation through ordinary model `.save()`.
- [x] Prevent bulk mutation through queryset `.update()` / `.bulk_update()`.

## P3.3 — Server-side validation
- [x] Define backend-authoritative broad taxonomy.
- [x] Cross-check backend taxonomy against the existing frontend vocabulary.
- [x] Reject unknown top-level and nested fields.
- [x] Reject exact/unsupported categories.
- [x] Reject relationship details that do not match their parent category.
- [x] Reject contradictory prefer-not-to-say experience selections.
- [x] Bound story length, array lengths, and request body size.
- [x] Require story text only when the public-story path is chosen.
- [x] Accept a statistics-only contribution without narrative text.

## P3.4 — Removal credential issuance
- [x] Generate cryptographically random high-entropy removal code.
- [x] Return plaintext code only once in the create response.
- [x] Mark the credential-bearing response `no-store` / `no-cache`.
- [x] Store only a salted password-style verifier.
- [x] Do not derive the code from submission identifiers or personal data.
- [x] Do not expose an existence/read endpoint keyed by the removal code.

Verification/removal itself is intentionally implemented in the later removal milestone.

## P3.5 — Abuse controls
- [x] Add scoped anonymous submission throttling.
- [x] Derive throttle cache identifiers with HMAC instead of storing raw IP in cache keys.
- [x] Ignore untrusted forwarded-address chains by default (`NUM_PROXIES=0`).
- [x] Require shared Redis cache configuration in production.
- [x] Keep production throttle rate configurable.
- [x] Add rate-limit test.

## P3.6 — Public API boundary
- [x] Expose only `POST /api/submissions/`.
- [x] Explicitly allow anonymous access only for this create endpoint.
- [x] Accept JSON only.
- [x] Return minimal receipt data only.
- [x] GET on collection returns method-not-allowed.
- [x] No raw detail route exists.
- [x] Client-supplied state/publication-state fields are rejected.
- [x] No raw model is registered in Django admin.

## P3.7 — Tests / self-review
- [x] Successful public-path submission.
- [x] Successful statistics-only submission without story text.
- [x] Consent boundary tests.
- [x] Unknown/identity field rejection.
- [x] Taxonomy mismatch/contradiction rejection.
- [x] Non-public/read-boundary tests.
- [x] Removal verifier test proving plaintext is not stored.
- [x] Consent model-save immutability test.
- [x] Consent queryset bulk-mutation immutability test.
- [x] Raw retention/purge tests.
- [x] Deletion-tombstone creation/expiry tests.
- [x] Derived throttle-key privacy test.
- [x] Generated migration passes drift check.
- [x] PostgreSQL migration/test suite passes.
- [x] `pip-audit` passes including Redis client.
- [x] Production deploy checks pass.
- [x] Remove generated Python package metadata from source control and ignore it.
- [x] Remove temporary write-enabled migration workflow after use.
- [x] Final normal Backend CI passes.

## Findings resolved during the self-review loop

1. Generated `backend/*.egg-info/` package metadata had been committed; it was removed and ignored.
2. Consent immutability originally protected only `.save()`; queryset bulk updates could bypass it. The consent manager now rejects `.update()` and `.bulk_update()`.
3. Retention purge originally deleted expired raw submissions without a deletion ledger entry. This conflicted with the Phase 0 backup-restore threat model and could allow a restored backup to resurrect expired content. The purge now transactionally creates a minimal deletion tombstone first.
4. A dedicated tombstone cleanup command enforces the provisional 36-month retention window rather than retaining tombstones forever.
5. The one-time migration workflow initially used `git diff`, which does not detect untracked newly generated migration files; it was corrected to use `git status --porcelain`, then removed after successful use.
6. All normal backend gates were rerun on the final branch state rather than relying only on the temporary migration workflow.

## Phase 3 exit gate

Phase 3 is complete on this branch because anonymous submissions persist with strict validation, explicit/versioned consent, one-time removal credentials, retention/deletion metadata, restoration-safe tombstones, and rate limiting while remaining unreachable from public read/publish paths.

Phase 3 does **not** authorize publication. Moving content beyond the raw submission zone belongs to privacy preprocessing/moderation milestones.

The draft PR remains the human review boundary before merge.
