# Phase 8 — Adversarial Privacy & Product Review

**Branch:** `phase-8-privacy-safe-analytics`  
**Review status:** Engineering review complete; production snapshot-release policy remains an explicit governance blocker (Issue #12).

## Review lenses

The Phase 8 implementation was reviewed as:
- an anonymous public API caller attempting to bypass the UI;
- an observer attempting sparse-group, differencing, and repeated-release inference;
- a product user interpreting charts and suppression states;
- a frontend engineer handling partial failures and deployment skew;
- a backend engineer reviewing retention, consent, immutability, and snapshot publication.

## Boundary confirmed

Public analytics are generated only from the minimized `AnalyticsContribution`
projection created after explicit statistics consent. The projection excludes raw
story text, detailed relationship fields, frequency, periods, removal credentials,
and other private narrative/moderation material.

Public APIs do not execute arbitrary live aggregation queries. They expose a
frozen `AnalyticsSnapshot` containing only approved category identifiers,
suppression states, count bands, and relative visual scales.

## Adversarial cases reviewed

### Arbitrary and higher-dimensional queries
**Result:** blocked.

The backend accepts only the predefined relationship × age/setting/experience
cross-breakdowns. Unknown parameters, geography, an unapproved primary
dimension, and a third dimension are rejected.

### Sparse groups
**Result:** protected by server-side thresholds.

- ordinary single dimension: minimum 10;
- minor/sensitive age groups: minimum 20;
- every approved two-dimension cell: minimum 20.

Suppressed cells expose no exact count or visual scale.

### Exact-count leakage
**Result:** no direct exact-count field found in persisted/public snapshot shapes.

Displayed cells expose a broad count band and a 1–7 scale derived from that
band. Snapshot tests recursively reject unexpected exact numeric counts.

### Stale privacy policy
**Finding:** fixed during review.

Previously the newest database snapshot could be served even if it was generated
under a retired privacy-policy version. Public lookup now filters to the current
backend `PRIVACY_POLICY_VERSION`, and a regression test verifies that a newer
old-policy row cannot replace a valid current-policy snapshot.

### Frontend/backend policy drift
**Finding:** fixed during review.

CI now compares frontend and backend threshold values plus privacy-policy
versions. The frontend also rejects runtime analytics responses whose policy
version does not match the policy copy it was built to explain, protecting
rolling/de-synchronized deployments.

### Mixed frozen snapshots in one page
**Finding:** fixed during review.

The main snapshot and cross-breakdowns are separate HTTP requests. Previously a
new snapshot published between those requests could cause one screen to combine
results from two releases. Comparable-relationship responses now include dataset
identity, and all secondary requests are pinned to the dataset version loaded by
the page. A mismatch fails closed and asks the user to refresh.

### Failure-state behavior
**Finding:** fixed during review.

The Patterns dashboard previously checked for a missing snapshot before checking
the error state, which could leave a failed initial request displaying a loading
skeleton indefinitely. Error/retry now takes precedence.

### Overlapping categories
**Finding:** product clarification added.

Relationship and experience categories can overlap because one submission may
contain multiple values. The relationship visualization now explicitly warns
users not to interpret the categories as mutually exclusive counts.

### Anonymity wording
**Finding:** corrected.

The product no longer claims that thresholding/banding guarantees a person
cannot be singled out. Methodology describes these controls as reducing
re-identification, linkage, and differencing risk rather than providing a formal
mathematical anonymity guarantee.

## Residual risks intentionally not hidden

### Repeated-release / temporal composition
This is the main unresolved Phase 8 privacy decision.

Even privacy-processed frozen snapshots can reveal additional information when
many releases are compared over time. Snapshot generation therefore must not be
silently tied to individual submissions or an arbitrarily frequent scheduler.

Issue #12 tracks approval of a production release cadence, minimum dataset-change
rule, emergency withdrawal behavior, and superseded-snapshot retention.

### Public read abuse / availability
Pattern reads are anonymous and currently `no-store`. Broad public-read
rate/abuse controls are intentionally scheduled with Phase 10 unless deployment
load testing requires them earlier. The existing HMAC-derived anonymous throttle
primitive can be reused without putting raw network addresses in cache keys.

### Formal differential privacy
SELENA does not claim differential privacy. The current MVP deliberately favors
a small fixed query surface, stronger thresholds, count bands, and controlled
snapshot publication. If future product requirements need richer/frequent
analytics, a formally budgeted privacy mechanism should be evaluated separately
rather than approximated ad hoc.

## Review conclusion

No remaining implementation defect was found that justifies widening the public
analytics surface or weakening the current server-authoritative policy.

The engineering boundary is ready for final CI and a stacked draft PR once the
branch is cleaned. Phase 8 must remain **not production-approved** until Issue #12
is explicitly resolved.
