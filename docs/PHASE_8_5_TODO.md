# Phase 8.5 — Product & Domain Validation Gate

**Branch:** `phase-8.5-product-domain-validation`  
**Status:** Engineering corrections complete; draft PR #15 open; final single-commit CI verified. Governance/domain decisions remain open.

**Purpose:** validate SELENA's product/data/workflow assumptions before Phase 9 turns them into staff UI and operating procedures.

This phase is intentionally different from a normal feature milestone. Phases 1–8
proved that the implementation can enforce strong privacy/security boundaries.
Phase 8.5 asks whether the **boundaries themselves are the right product/domain
model**.

## Accepted engineering corrections

### P8.5.1 — Purpose-limited statistics-only data
- [x] statistics-only requests omit narrative text;
- [x] statistics-only requests retain only age group, setting, experience types, and broad relationship categories needed by the approved aggregate design;
- [x] relationship detail, involvement, person age band, frequency, and periods are rejected on the statistics-only path;
- [x] frontend minimizes before transmission and backend independently rejects over-collection;
- [x] regression tests cover the minimized contract.

### P8.5.2 — Durable publication consent provenance
- [x] public stories may outlive raw submissions without losing the minimum evidence of the consent that authorized publication;
- [x] publication provenance stores consent record ID/version, privacy-policy version, schema/source-flow version, and recorded-at timestamp;
- [x] no raw narrative is copied into durable provenance;
- [x] migration backfills the consent that existed at publication time and fails closed if evidence is missing;
- [x] tests prove consent provenance survives raw/ConsentRecord deletion.

### P8.5.3 — Survivor choice vs privacy withholding
- [x] `prefer_not` remains the submitter's answer;
- [x] public-only `withheld` means SELENA suppressed metadata for privacy;
- [x] publication cannot rewrite a submitted concrete answer to `prefer_not`;
- [x] UI renders `withheld` as “Not shown for privacy”;
- [x] `withheld` is not exposed as a public archive filter value.

### P8.5.4 — Cross-surface disclosure control
- [x] public archive accepts at most one broad category filter at a time;
- [x] unknown archive query parameters are rejected;
- [x] archive/home/related-story list responses use metadata-minimized `StorySummary` records;
- [x] age/relationship/setting/experience metadata is returned only by the deliberate individual story-detail endpoint;
- [x] frontend types encode the summary/detail disclosure boundary;
- [x] archive UI explains that combined comparisons belong on privacy-safe Patterns;
- [x] list UI no longer publishes exact loaded-result counts.

### P8.5.5 — Analytics eligibility is not survivor credibility
- [x] statistics consent creates an immutable minimized contribution;
- [x] aggregate eligibility is represented by separate append-only evidence;
- [x] only narrow technical/purpose reasons currently exclude future snapshots: spam and out-of-scope;
- [x] privacy-redaction difficulty, graphic content, and other publication decisions do not imply aggregate invalidity;
- [x] latest eligibility event controls future snapshots and an explicit correction event can restore eligibility;
- [x] no public/staff endpoint for arbitrary eligibility manipulation is introduced in this phase;
- [ ] Phase 9/10 must define the operational review path for statistics-only abuse/duplicate handling without judging survivor credibility.

### P8.5.6 — Capability-based staff authorization foundation
- [x] sensitive operations have explicit Django permission codenames;
- [x] role labels are provisioning templates, not authorization fallbacks;
- [x] raw view, claim, redaction, decision, publication, dual-control publication, analytics review, report handling, removal, staff administration, and break-glass access are separate capabilities;
- [x] moderation/publication API views enforce action-specific capabilities;
- [x] moderation/publication domain services repeat sensitive capability checks;
- [x] staff identity endpoint exposes effective capabilities for UI rendering only;
- [x] a staff account labelled “moderator” but lacking permissions is denied;
- [ ] Phase 9 staff provisioning UI must call the approved role-template/capability workflow and audit permission changes;
- [ ] break-glass capability requires time-bound issuance, reauthentication, reason capture, and audit workflow before production.

## Product/domain decisions still open

These are **not** silently decided by engineering.

### P8.5.G1 — Product identity / taxonomy
- [x] MVP remains a survivor-storytelling and awareness platform; public Patterns describe SELENA submissions, not prevalence.
- [ ] review every structured field with qualified GBV/survivor-support domain expertise;
- [ ] conduct safe terminology/usability/cognitive testing before freezing a research-like taxonomy;
- [ ] if research-quality measurement is ever required, treat it as a separate methodology/ethics project rather than claiming the current vocabulary is a validated instrument.

### P8.5.G2 — Meaning-preserving redaction
- [ ] approve a redaction policy: remove/generalize identifiers, preserve survivor meaning/voice, add no facts;
- [ ] define when a change is substantive enough to require escalation/second review;
- [ ] Phase 9 editor should show original vs candidate redaction/diff rather than encourage freeform rewriting;
- [ ] ensure publication-consent wording accurately describes moderation/redaction.

### P8.5.G3 — Current minors / safeguarding
- [ ] decide whether current minors may submit;
- [ ] do not infer current age from “age when the experience happened”;
- [ ] if minors are in scope, approve safeguarding/assent/support/escalation requirements before staff workflow is finalized;
- [ ] if minors are out of scope, design a privacy-minimal eligibility gate rather than collecting date of birth.

### P8.5.G4 — Initial launch jurisdiction
- [ ] choose the first closed-beta jurisdiction/scope;
- [ ] verify local support resources;
- [ ] complete appropriate legal/privacy/safeguarding review;
- [ ] resolve hosting/data-residency requirements for that scope.

### P8.5.G5 — Editorial featuring
- [ ] decide whether manual `featured` amplification belongs in MVP;
- [ ] if retained, align editorial policy and consent wording with that use;
- [ ] otherwise prefer neutral/random rotation or remove manual featuring.

### P8.5.G6 — Existing governance blockers
- [ ] approve/modify retention schedule (DEC-010);
- [ ] choose publication control model (DEC-011);
- [ ] resolve Phase 8 public snapshot release policy (Issue #12);
- [ ] name incident-response owners/channels.

## State-model rule for Phase 9

Phase 9 must not build a single “story status” mega-workflow. Treat these as
separate state machines with one owner each:

1. **submission/intake + retention** — private source existence and retention;
2. **moderation** — queue/claim/redact/approve/reject/escalate;
3. **publication** — public representation and active/unpublished/removal state;
4. **analytics eligibility** — consented contribution plus append-only eligibility decisions;
5. **reports/removal** — operational request state, added in Phase 10.

Where legacy fields mirror another domain, Phase 9 should read the domain-owned
state rather than adding more duplicated transitions.

## Exit gate

Phase 8.5 engineering corrections are complete only when frontend/backend CI pass
on the final branch state and the branch is reviewed as a coherent stack on Phase
8.

Phase 9 implementation may begin once the staff capability/state/redaction
contracts it depends on are recorded. **Production/closed beta remains blocked**
until the explicitly open governance decisions above are approved by the
appropriate owner/domain/privacy/legal reviewers.
