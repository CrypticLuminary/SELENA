# SELENA — Architecture & Product Decision Log

Record durable decisions here. Do not rewrite history; supersede old decisions with a new entry.

## DEC-001 — Anonymous public submissions
**Status:** Accepted

Public submitters do not require normal user accounts for the production MVP.

**Reason:** Minimize identifying information and unnecessary account data.

**Consequence:** Removal/recovery uses a secure independent mechanism.

## DEC-002 — Raw and published stories are separate
**Status:** Accepted

Raw submissions and public stories are separate logical/data representations.

**Reason:** Reduce accidental exposure and create a clear moderation/redaction boundary.

## DEC-003 — Backend owns privacy enforcement
**Status:** Accepted

Frontend privacy restrictions are not authoritative. Backend services enforce thresholds, suppression, dimension limits, and public serialization.

## DEC-004 — Human moderation remains publication boundary
**Status:** Accepted

Automated systems may assist but do not silently publish survivor content.

## DEC-005 — No raw story content in routine application logs
**Status:** Accepted

Routine logs must not contain raw survivor story bodies.

## DEC-006 — DRY/KISS/YAGNI with security override
**Status:** Accepted

Prefer reuse and minimal code, but never reduce validation, authorization, privacy, testing, accessibility, or auditability merely to shorten code.

## Pending decisions
- exact retention periods
- hosting/data residency
- third-party moderation/AI providers, if any
- final staff role matrix
- incident-response owners
- backup retention
- consent text/versioning
