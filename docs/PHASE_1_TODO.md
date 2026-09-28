# Phase 1 — Frontend Production Audit TODO

**Branch:** `phase-1-production-audit`

**Goal:** establish a documented, repeatable frontend production baseline before backend work begins.

## P1.1 — Repository and architecture inventory
- [x] Inventory routes, components, data, lib, and type boundaries.
- [x] Verify `src/lib/mock-api.ts` remains the only importer of story/pattern synthetic datasets.
- [x] Verify structured category vocab may be shared directly.
- [x] Search for TODO/FIXME, type-check suppressions, dangerous HTML injection, browser storage, debug logging, and direct network calls.
- [x] Document architectural risks and strengths.

**Exit:** architecture/data-boundary map documented.

## P1.2 — Dependency and security baseline
- [x] Review current framework/dependency versions.
- [x] Check current Next.js security advisories.
- [x] Add production dependency audit to CI.
- [x] Add CodeQL.
- [x] Add dependency-review workflow.
- [x] Add Dependabot for npm and GitHub Actions.
- [x] Add repository security reporting guidance.
- [ ] Upgrade Next.js/React stack to a currently patched supported line and regenerate lockfile.
- [ ] Re-run all CI after dependency upgrade.

**Exit:** all high/critical production dependency findings resolved.  
**Current blocker:** framework upgrade required; do not waive this gate.

## P1.3 — Privacy and sensitive-data audit
- [x] Confirm story drafts are not persisted to localStorage.
- [x] Confirm `consentStatistics` defaults to false.
- [x] Confirm raw story/pattern datasets do not bypass the mock API boundary.
- [x] Confirm no `dangerouslySetInnerHTML` use.
- [x] Add an automated privacy-boundary check to CI.
- [x] Review demo removal-code storage and document production replacement requirement.
- [x] Confirm public privacy constants are centralized.

**Exit:** current V1 privacy invariants are documented and automatically guarded.

## P1.4 — Accessibility and safety UX audit
- [x] Verify skip link, semantic main region, keyboard-operable warning gate, chart/list alternatives, and reduced-motion handling.
- [x] Review Quick Exit behavior.
- [x] Review modal/bottom-sheet keyboard behavior.
- [x] Add focus trapping to modal bottom sheet.
- [x] Review mobile navigation keyboard semantics.
- [ ] Add automated browser-level accessibility tests once Playwright/axe test dependencies are introduced.

**Exit:** known critical keyboard/modal issue fixed; remaining automated a11y work tracked.

## P1.5 — Production configuration hardening
- [x] Disable framework `X-Powered-By` header.
- [x] Add baseline response security headers.
- [x] Add no-referrer policy.
- [x] Restrict unnecessary browser capabilities.
- [x] Keep the demo non-indexable.
- [ ] Add a deployment-specific CSP after the final hosting/API topology is known.

**Exit:** safe baseline headers are configured without speculative deployment assumptions.

## P1.6 — Repeatable CI and review gates
- [x] Add frontend CI for clean install, lint, typecheck, privacy guardrail, build, and production dependency audit.
- [x] Add CodeQL security analysis.
- [x] Add dependency review.
- [x] Add Dependabot.
- [x] Add PR security/privacy/accessibility checklist.
- [x] Use least-privilege workflow permissions.

**Exit:** every PR gets repeatable quality/security checks.

## P1.7 — Self-review / exit evaluation
- [x] Re-check changes for DRY/KISS/YAGNI.
- [x] Re-check privacy/security boundaries.
- [x] Re-check accessibility changes.
- [x] Re-check that CI does not hide dependency vulnerabilities.
- [ ] Confirm CI results on GitHub.
- [ ] Resolve dependency-upgrade blocker.
- [ ] Mark Phase 1 complete only after the blocker is resolved and checks pass.

## Phase 1 definition of done
Phase 1 is complete when:
1. the audit report is current;
2. no known critical/high dependency issue remains intentionally unresolved;
3. lint/typecheck/build/privacy checks pass;
4. CodeQL/dependency review are configured;
5. modal keyboard behavior is safe;
6. security headers are present;
7. remaining risks are explicitly tracked rather than silently accepted.
