# SELENA — Staff Roles and Permission Matrix

**Status:** Proposed MVP role model

## Principles

- least privilege;
- deny by default;
- no shared staff accounts;
- MFA for privileged staff before production;
- raw-data access only for roles that need it;
- publication/removal actions are audited;
- no unrestricted raw export in MVP.

## Roles

### Moderator
Purpose: review submissions and protect publication safety.

May:
- view assigned/queued raw submissions;
- add privacy/redaction annotations;
- set content warnings;
- approve/reject within moderation workflow;
- create/update the public redacted representation;
- handle story reports;
- request escalation.

May not:
- manage staff accounts;
- change privacy thresholds;
- export raw dataset;
- view secrets/removal-code plaintext;
- alter audit logs.

### Senior Moderator
Includes Moderator permissions plus:
- final publication/unpublication decision;
- emergency unpublish;
- approve sensitive moderation escalations;
- process verified removal requests.

Use only if dual-control/final-review is desired operationally. If team size is too small, Moderator may hold final publication permission, but the decision should be explicit.

### Analyst
Purpose: review privacy-safe data quality and aggregate outputs.

May:
- view approved structured fields needed for aggregate validation where strictly necessary;
- run approved internal aggregation jobs;
- review suppression/banding outputs;
- prepare snapshot metadata.

May not:
- browse raw narratives by default;
- publish stories;
- disable suppression;
- execute arbitrary public queries;
- export raw submission datasets.

### Operations/Safety
Purpose: abuse, incident, and removal workflow support.

May:
- handle rate-limit/abuse events;
- process verified removal workflow according to procedure;
- view minimum data required for incident response.

May not:
- routinely browse raw submissions;
- publish stories;
- change privacy rules.

### Superadmin
Purpose: system administration, not routine content access.

May:
- manage staff accounts/roles;
- revoke sessions;
- configure security-sensitive operational settings;
- perform emergency access under documented procedure.

Superadmin should **not automatically mean unrestricted raw-content browsing**. Content access should require the relevant moderation role or audited break-glass process.

## Permission matrix

| Capability | Moderator | Senior Moderator | Analyst | Ops/Safety | Superadmin |
|---|---:|---:|---:|---:|---:|
| view moderation queue | ✓ | ✓ | — | — | — |
| view raw narrative | ✓ | ✓ | — by default | incident-only | break-glass only |
| redact/annotate | ✓ | ✓ | — | — | — |
| approve moderation | ✓ | ✓ | — | — | — |
| publish/unpublish | configurable | ✓ | — | emergency unpublish only | break-glass |
| handle reports | ✓ | ✓ | — | ✓ | — |
| process verified removal | — | ✓ | — | ✓ | break-glass |
| run approved aggregate job | — | — | ✓ | — | — |
| change privacy thresholds | — | — | proposal only | — | controlled config deployment |
| manage staff roles | — | — | — | — | ✓ |
| bulk raw export | — | — | — | — | — in MVP |
| edit audit history | — | — | — | — | — |

## Break-glass access

If exceptional raw-content access is required outside normal role permissions:
- require strong reauthentication;
- record reason;
- time-limit elevated access;
- log actor/target/action;
- review after the incident.

Do not create a permanent hidden “god mode.”

## Account lifecycle

- invite staff individually;
- require MFA before privileged access;
- disable dormant/unneeded accounts;
- revoke immediately on departure;
- periodic role review;
- no role grants through client-side state alone.

## Open owner decision

Before production, choose one:
1. **two-step publication:** Moderator reviews, Senior Moderator publishes; or
2. **single-step small-team publication:** authorized Moderator can publish after review.

Recommended for a sensitive product: two-step publication when staffing allows.
