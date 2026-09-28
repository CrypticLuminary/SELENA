# Phase 1 — Frontend Production Audit TODO

**Branch:** `phase-1-production-audit`  
**Status:** Complete — ready for human review before merge.

**Goal:** establish a documented, repeatable frontend production baseline before backend work begins.

## P1.1 — Repository and architecture inventory
- [x] Inventory routes, components, data, lib, and type boundaries.
- [x] Verify `src/lib/mock-api.ts` remains the only importer of story/pattern synthetic datasets.
- [x] Verify structured category vocab may be shared directly.
- [x] Search for TODO/FIXME, type-check suppressions, dangerous HTML injection, browser storage, debug logging, and direct network calls.
- [x] Document architectural risks and strengths.
- [x] Self-review architecture/data boundaries after changes.

**Exit:** architecture/data-boundary map documented and unchanged by hardening work.

## P1.2 — Dependency and security baseline
- [x] Review current framework/dependency versions.
- [x] Check current Next.js security advisories.
- [x] Detect the insecure Next.js 14.2.15 baseline through CI rather than suppressing it.
- [x] Upgrade to Next.js 16.3.6 and React/React DOM 19.3.0.
- [x] Migrate route `params`/`searchParams` for Next.js 16.
- [x] Migrate from `next lint`/legacy ESLint config to the ESLint CLI + flat config.
- [x] Regenerate and commit the lockfile only after automated validation succeeded.
- [x] Run production dependency audit after migration — zero high/critical production findings.
- [x] Add Dependabot for npm and GitHub Actions.
- [x] Add repository security reporting guidance.
- [x] Self-review the migration and remove its temporary write-enabled workflow.

**Recommended repository-setting follow-up (not a Phase 1 code blocker):**
- [ ] Enable GitHub Dependency Graph in repository settings, then restore the official Dependency Review PR workflow.

**Exit:** current dependency baseline passes the production high/critical audit.

## P1.3 — Privacy and sensitive-data audit
- [x] Confirm story drafts are not persisted to localStorage.
- [x] Confirm `consentStatistics` defaults to false.
- [x] Confirm raw story/pattern datasets do not bypass the mock API boundary.
- [x] Confirm no `dangerouslySetInnerHTML` use.
- [x] Add an automated privacy-boundary check to CI.
- [x] Review demo removal-code storage and document the production replacement requirement.
- [x] Confirm public privacy constants are centralized.
- [x] Re-run privacy guard after all Phase 1 changes.

**Exit:** current V1 privacy invariants are documented and automatically guarded.

## P1.4 — Accessibility and safety UX audit
- [x] Verify skip link and semantic main region.
- [x] Verify keyboard-operable content-warning gate.
- [x] Verify chart/list alternatives and reduced-motion handling.
- [x] Review Quick Exit behavior.
- [x] Preserve history replacement in Quick Exit instead of following it with a history-adding navigation.
- [x] Register the global Shift+Esc Quick Exit handler exactly once despite multiple visible buttons.
- [x] Review modal/bottom-sheet keyboard behavior.
- [x] Add focus trapping to modal bottom sheet.
- [x] Replace incomplete ARIA tab semantics in story sorting with correct pressed-button group semantics.
- [x] Review mobile navigation keyboard semantics.
- [x] Self-review accessibility/safety changes through lint, typecheck, and production build.

**Deferred to the broader automated-testing milestone:**
- [ ] Add browser-level automated accessibility tests (Playwright + axe or equivalent).

**Exit:** identified Phase 1 keyboard/semantic/safety issues fixed; browser automation explicitly tracked for later testing work.

## P1.5 — Production configuration hardening
- [x] Disable framework `X-Powered-By` header.
- [x] Add baseline response security headers.
- [x] Add no-referrer policy.
- [x] Restrict unnecessary browser capabilities.
- [x] Keep the demo non-indexable.
- [x] Verify the hardened configuration builds successfully under Next.js 16.

**Deployment-dependent follow-up:**
- [ ] Add a deployment-specific Content Security Policy after production API/asset/hosting domains are known.

**Exit:** safe baseline headers are configured without inventing unsafe CSP exceptions.

## P1.6 — Repeatable CI and review gates
- [x] Add frontend CI for clean install, lint, typecheck, privacy guardrail, build, and production dependency audit.
- [x] Add CodeQL `security-extended` analysis.
- [x] Upgrade GitHub Actions runtimes to current supported major lines.
- [x] Run CI on Node 24.
- [x] Use least-privilege workflow permissions.
- [x] Disable dependency caching in the security-sensitive baseline CI.
- [x] Add Dependabot.
- [x] Add PR security/privacy/accessibility checklist.
- [x] Confirm final Frontend CI passes.
- [x] Confirm final CodeQL passes.
- [x] Self-review a failed Dependency Review setup and remove it rather than making it falsely green.

**Recommended repository-setting follow-up:**
- [ ] Enable Dependency Graph and then add the official GitHub Dependency Review action.

**Exit:** every PR receives repeatable quality, privacy, dependency-audit, and static-security checks.

## P1.7 — Final self-review / exit evaluation
- [x] Re-check changes for DRY/KISS/YAGNI.
- [x] Re-check privacy/security boundaries.
- [x] Re-check accessibility and safety behavior.
- [x] Re-check that CI does not hide dependency vulnerabilities.
- [x] Remove one-time write-enabled migration workflow after use.
- [x] Confirm latest production dependency audit passes.
- [x] Confirm latest lint/typecheck/privacy/build pipeline passes.
- [x] Confirm latest CodeQL analysis passes.
- [x] Record remaining non-blocking/deployment-dependent follow-ups.
- [x] Mark Phase 1 ready for human review before merge.

## Phase 1 definition of done

Phase 1 is complete on this branch because:
1. the audit report is current;
2. the known Next.js 14 security blocker was removed;
3. the current lockfile passes the configured high/critical production dependency audit;
4. lint, typecheck, privacy-boundary check, and production build pass;
5. CodeQL passes;
6. identified keyboard/modal/Quick Exit semantics issues were corrected;
7. baseline HTTP security headers are configured;
8. remaining work is explicitly deferred to repository configuration, deployment, or later testing milestones rather than hidden.

Do not merge solely because this checklist is complete; the draft PR remains the human review boundary.
