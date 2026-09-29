# SELENA — Domain State Ownership

**Status:** Phase 8.5 engineering baseline for Phase 9 design

SELENA must not model the entire product as one giant “story status.” Different
domains have different purposes, retention rules, permissions, and evidence.

## 1. Submission / private-source lifecycle

**Owner:** `submissions`

Purpose:
- represent whether the private source still exists;
- control intake and private retention;
- preserve consent/removal authority while required.

It must not become the authoritative source for moderator assignment,
publication state, report handling, or analytics eligibility.

Existing `RawSubmission.state` currently mirrors some moderation outcomes for
legacy workflow convenience. Phase 9 must not add new cross-domain states to it.
Future cleanup should reduce or derive mirrored state rather than expanding it.

## 2. Moderation lifecycle

**Owner:** `moderation.ModerationCase`

Current states:
`PENDING -> IN_REVIEW -> APPROVED / REJECTED / ESCALATED`

Purpose:
- queue ownership;
- assignment;
- privacy redaction;
- publication-safety decision;
- bounded audit evidence.

Approval means **approved for possible publication**. It is not itself public
publication.

## 3. Publication lifecycle

**Owner:** `public_stories`

The public representation is separate from the moderation/private graph.

Current MVP representation uses existence + `is_active`; Phase 10 may add
explicit removal/unpublish workflow state, but must not push public lifecycle
back into `RawSubmission.state`.

Publication requires:
- current publication consent;
- approved moderation evidence;
- configured publication control mode;
- explicit publication capability;
- public projection validation.

## 4. Analytics lifecycle

**Owner:** `analytics`

Two separate concepts:
1. immutable, minimized, statistics-consented `AnalyticsContribution`;
2. append-only `AnalyticsEligibilityEvent` evidence controlling future snapshot inclusion.

Eligibility is not survivor credibility and is not inherited wholesale from
publication moderation. Only bounded technical/purpose reasons may exclude
future aggregate use.

Frozen `AnalyticsSnapshot` is a separate release artifact and follows the
approved snapshot-release policy.

## 5. Reports / removal lifecycle

**Owner:** Phase 10 operational domains

Reports and removal requests require their own bounded states, actors, rate
limits, and audit evidence.

A removal workflow may cause effects in several domains (unpublish public story,
exclude future analytics, delete private source) but the request itself has one
operational owner. Cross-domain effects should be orchestrated transactionally
or through an explicitly idempotent workflow rather than by inventing a shared
status field.

## UI composition rule

Phase 9 staff UI may present these states together, but presentation does not
make them one state machine.

Example:

- Submission: retained until 2026-xx-xx
- Moderation: approved
- Publication: active
- Analytics: eligible
- Removal: no active request

Each label must come from its owning domain.

## Engineering rule

Before adding a new status value, answer:
1. which domain owns it?
2. what transition creates it?
3. who is authorized to transition it?
4. what audit evidence records it?
5. what retention/deletion rules apply?
6. does another domain already own the same fact?

If two models independently store the same business fact, prefer deriving one
view from the authoritative owner rather than creating another mirrored state.
