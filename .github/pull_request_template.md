## What changed

<!-- Keep the change focused. Explain behavior, not just files. -->

## Validation

- [ ] Lint passed
- [ ] Typecheck passed
- [ ] Privacy-boundary check passed
- [ ] Production build passed
- [ ] Relevant tests passed, or missing tests are explicitly explained

## SELENA safety review

- [ ] I did not add unnecessary personal/sensitive data collection.
- [ ] Raw submissions cannot become reachable from a public API/UI path.
- [ ] Authorization/privacy decisions are not delegated to the client.
- [ ] I checked for enumeration, IDOR, injection, logging, and secret-exposure risk where relevant.
- [ ] I did not weaken thresholds, consent, moderation, anonymity, retention, or staff permissions without an explicit decision.
- [ ] UI changes remain keyboard accessible and respect reduced motion where relevant.
- [ ] I reused existing code where appropriate without forcing an abstraction that reduces clarity.

## Remaining risks / follow-up

<!-- State known limitations plainly. Do not hide a failing security or privacy gate. -->
