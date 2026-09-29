# SELENA — Meaning-Preserving Redaction Policy

**Status:** Proposed Phase 8.5 baseline — requires survivor-support/domain review before production

## Purpose

Moderation exists to make a voluntarily submitted story safe enough for the
chosen public use. It is not an editorial license to rewrite a survivor's
experience into SELENA's preferred voice.

## Core rule

A redaction may **remove, mask, or generalize information needed for privacy or
publication safety while preserving the submitter's meaning, chronology, and
voice as closely as practical.**

Moderators must not:
- add facts;
- infer motives or diagnoses;
- change who did what;
- make uncertain language sound certain;
- make certain language sound uncertain merely for tone;
- rewrite a first-person account into institutional/legal terminology;
- “improve” grammar or style in a way that materially changes voice;
- remove material merely because it is uncomfortable or reputationally awkward.

## Permitted transformation classes

Examples:
- direct identifier -> `[name removed]`;
- named institution -> a broader truthful phrase such as `[a workplace]`;
- exact place -> broader setting already supported by the public taxonomy;
- exact date/time -> broad non-identifying wording or removal;
- identifying third-party detail -> remove/generalize;
- contact/social identifier -> remove;
- unnecessary sequence detail that creates identification risk -> remove only
  when the remaining account still communicates the same substantive meaning.

Do not invent a generalization that is not supported by the source.

## Substantive-change escalation

A proposed edit is substantive when a reasonable reader could interpret the
event, actor, severity, chronology, certainty, or survivor meaning differently
after the edit.

Substantive changes should not be silently published. Phase 9 must provide an
escalation/second-review path. If safe publication would require changing the
story so substantially that its meaning cannot be preserved, rejection for
publication/privacy reasons is preferable to rewriting the account.

## Phase 9 editor requirements

The staff editor should be designed as a redaction workspace, not an empty
freeform replacement textbox.

Minimum intended behavior:
- show original and candidate redaction side by side or as a diff;
- visually identify removed/generalized regions;
- preserve prior immutable draft versions;
- show automated privacy findings as assistive flags only;
- require standardized reason/annotation for substantive generalization where
  operationally useful without copying sensitive text into audit logs;
- keep content warnings separate from story wording;
- require an explicit review step before approval.

## Automation

Automated privacy detection may flag possible identifiers. It must not:
- silently rewrite the public narrative;
- decide credibility;
- approve publication;
- send raw story text to an unapproved external AI/provider.

Any future generative redaction assistance is a new threat-model/data-processing
decision and requires explicit review before raw P3 text is transmitted or
processed by a new provider.

## Consent / transparency dependency

Final publication-consent wording must truthfully explain that SELENA staff may
remove or generalize identifying/safety-sensitive details before publication and
that publication is not automatic.

Because anonymous submitters currently cannot review the final edited version,
the platform must keep the allowed editorial scope deliberately narrow.

## Review required

Before closed beta, this policy and the corresponding staff workflow should be
reviewed with qualified survivor-support/GBV expertise and adjusted for the
chosen launch jurisdiction.
