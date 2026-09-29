# SELENA — Retention and Deletion Policy

**Status:** Provisional engineering policy — owner/legal review required before production launch.

SELENA should retain sensitive data only for a defined purpose and period. “Keep everything forever” is not an acceptable default.

## Proposed baseline retention

| Data | Proposed retention | Rationale |
|---|---|---|
| raw submission while awaiting moderation | up to 90 days | enough time for review; limits raw-data exposure |
| approved raw submission after public version created | 30 days after publication, then delete raw narrative unless an active safety/removal case requires a documented hold | public service should depend on redacted public representation, not indefinite raw storage |
| rejected submission | 30 days after rejection | allows short operational correction window |
| statistics-only submission structured fields | up to 24 months, then reassess/aggregate-delete | supports longitudinal snapshots without indefinite person-level records |
| published redacted story | until submitter removal, moderation removal, or product retirement | publication is consented and removable |
| removal request record | 12 months after completion, excluding plaintext code | defend integrity/abuse and prove request handling |
| report | 12 months after closure | moderation/accountability |
| moderation annotations | aligned to related submission/story, then 12 months after final removal where operationally required | accountability |
| staff security/audit events | 24 months | privileged-access investigation window |
| raw abuse-control network metadata | shortest practical window, target 7 days or less | rate limiting only |
| derived abuse/rate-limit counters | target 30 days or less | abuse defense |
| backups | rolling 35 days | recovery while bounding resurrection window |
| deletion tombstones | 36 months, containing only opaque IDs/minimal deletion metadata | prevent restoration from resurrecting deleted records |

These are conservative engineering defaults, not legal conclusions.

## Immediate deletion/removal behavior

When a valid removal request is accepted:

1. unpublish public story immediately;
2. remove it from public caches/search/indexes;
3. mark source submission as deletion-pending;
4. remove raw narrative and person-level structured data from primary storage unless a documented legal/security hold applies;
5. invalidate the removal verifier;
6. remove or neutralize moderation copies that contain the story;
7. preserve only the minimum deletion tombstone/audit evidence;
8. allow encrypted backups to expire naturally within the backup window;
9. ensure any restore process reapplies deletion tombstones before public service resumes.

## Analytics deletion

If a contribution has already been included in a released privacy-safe aggregate snapshot:

- do not attempt to reverse-engineer or mutate historical public bands unless continued publication creates a concrete privacy/safety problem;
- exclude the contribution from future snapshots after deletion;
- document this limitation clearly in consent/removal language.

If product/legal requirements choose a stronger deletion promise, the aggregation design must support it before making that promise.

## Legal/security holds

A hold must be exceptional, documented, access-restricted, time-bounded, and approved by designated governance authority.

Do not create a vague “keep for safety” mechanism that becomes indefinite retention.

## Account/staff deletion

When staff access ends:
- disable the account promptly;
- revoke sessions/tokens;
- retain minimal audit identity necessary to understand historical privileged actions;
- do not erase audit accountability by anonymizing the actor beyond usefulness.

## Backups

Backups are not a reason to retain primary data indefinitely.

Requirements:
- encrypted;
- access restricted;
- rolling expiry;
- no routine raw-data browsing;
- restoration performed into a restricted environment first;
- deletion tombstones replayed before opening restored services.

## Required approval before launch

Product owner/legal/privacy review must explicitly approve or modify:
- 90-day moderation window;
- 30-day post-publication raw deletion;
- 24-month statistics-only retention;
- 12-month reports/removal records;
- 24-month staff audit retention;
- 35-day backup window;
- 36-month deletion-tombstone retention.

Until approved, backend models should make retention enforceable/configurable rather than hard-code indefinite storage.
