# SELENA — Incident Response Plan

**Status:** Operational baseline; named owners/contact channels must be filled before production.

## Objectives

During an incident:
1. protect survivors from further exposure;
2. stop ongoing compromise;
3. preserve enough evidence to understand what happened;
4. rotate/revoke compromised access;
5. restore safely;
6. decide notification obligations with appropriate legal/privacy advice;
7. document corrective action.

## Severity

### SEV-1 — Critical
Examples:
- raw survivor data publicly exposed;
- unauthorized bulk/raw access;
- staff/admin compromise with sensitive access;
- unauthorized publication at scale;
- production secrets/database credentials exposed;
- privacy controls bypassed for sensitive/minor groups.

Immediate response.

### SEV-2 — High
Examples:
- single sensitive record exposed to unauthorized party;
- exploitable high-risk vulnerability without confirmed abuse;
- removal workflow compromise;
- significant moderation bypass;
- backup exposure.

Urgent response.

### SEV-3 — Moderate
Examples:
- limited security control failure with no sensitive exposure;
- abuse/rate-limit degradation;
- suspicious staff access requiring investigation.

### SEV-4 — Low
Ordinary security bugs without demonstrated sensitive impact.

## Required roles

Before production, assign named people/on-call channels for:
- Incident Commander
- Security/Engineering Lead
- Privacy/Product Decision Owner
- Communications/Legal escalation
- Infrastructure/Recovery owner

One person may hold multiple roles in a small team, but ownership must be explicit.

## First-response checklist

For SEV-1/2:
- open a private incident record;
- assign incident commander;
- record discovery time and known scope;
- stop public exposure first;
- revoke compromised sessions/tokens;
- rotate exposed credentials;
- disable affected endpoint/function if needed;
- preserve relevant audit/security logs;
- do not copy raw survivor data into chat, issue trackers, or broad incident notes;
- identify affected data classes and approximate records;
- assess whether public story removal/unpublish is needed.

## Evidence handling

Collect only what is needed:
- request IDs
- staff actor IDs
- timestamps
- infrastructure/security logs
- affected opaque record IDs
- code/deployment version

Avoid duplicating raw story bodies into incident evidence unless strictly necessary.

## Containment examples

- emergency unpublish;
- disable submission temporarily;
- block compromised staff account;
- invalidate all privileged sessions;
- rotate DB/API credentials;
- disable a third-party integration;
- deploy a narrow security fix;
- temporarily disable analytics endpoint if suppression is questionable.

Availability is secondary to preventing sensitive-data exposure.

## Notification decision

Do not promise a fixed notification rule in code/docs without jurisdiction-specific review.

For a real incident, designated privacy/legal owner must assess:
- what data was affected;
- whether it was actually accessed;
- affected jurisdictions;
- contractual/legal notification duties;
- survivor-safety implications of contacting users (many submitters are anonymous).

## Recovery

Before returning affected functionality:
- root cause understood enough to prevent immediate recurrence;
- compromised credentials rotated;
- authorization/privacy tests pass;
- restoration does not resurrect deleted content;
- monitoring is in place for recurrence;
- incident commander approves restoration.

## Post-incident

Within a defined period after stabilization:
- timeline;
- root cause;
- affected systems/data;
- detection gaps;
- containment/recovery actions;
- concrete remediation owners/dates;
- threat-model update;
- tests added to prevent regression.

Postmortems should be blameless about individuals but precise about failed systems/processes.

## Production launch blockers

Do not launch until:
- named incident owners exist;
- private incident communication channel exists;
- emergency unpublish procedure exists;
- staff session revocation procedure exists;
- credential rotation procedure exists;
- backup restore + deletion replay procedure has been tested;
- at least one tabletop exercise has been completed.
