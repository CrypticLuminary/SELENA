/**
 * SELENA — privacy policy configuration (centralized).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Privacy rules must live in ONE place, not be scattered across components.
 * These values describe the public policy for user-facing explanations. The
 * backend analytics service is authoritative: it creates minimized consented
 * contributions, applies thresholds, and publishes frozen snapshots containing
 * only bands, relative scales, and suppression states.
 *
 * The frontend uses this module for two innocent things:
 *   1. Displaying the policy to users (Methodology / disclaimers).
 *   2. Helper mappings (band → visual scale, band → explanatory copy).
 *
 * The frontend NEVER decides whether raw data is safe to display. It only
 * renders what the backend privacy-safe layer already approved.
 */

import type { CountBand } from "@/types/patterns";

export interface PrivacyPolicy {
  /** General minimum group size before a group may be displayed. */
  minGroupSize: number;
  /** Stronger minimum for sensitive groups (e.g. minors). */
  sensitiveGroupSize: number;
  /** Stronger minimum for every approved two-dimension public cell. */
  crossGroupSize: number;
  /** Maximum number of analytical dimensions a public breakdown may combine. */
  maxDimensions: number;
  /** Whether exact counts are ever exposed publicly. */
  exactCountsPublic: boolean;
  /** Whether geographic breakdowns are offered. */
  geographicBreakdown: boolean;
  /** Whether coarse count bands are used for all public figures. */
  countBandsEnabled: boolean;
}

export const PRIVACY_POLICY: PrivacyPolicy = {
  minGroupSize: 10,
  sensitiveGroupSize: 20,
  crossGroupSize: 20,
  maxDimensions: 2,
  exactCountsPublic: false,
  geographicBreakdown: false,
  countBandsEnabled: true,
};

export const PRIVACY_POLICY_VERSION = "privacy-policy-2026.1";

/** The ordered set of public count bands. */
export const COUNT_BANDS: readonly CountBand[] = [
  "10–19",
  "20–49",
  "50–99",
  "100–199",
  "200–499",
  "500–999",
  "1,000+",
];

/**
 * Map a band to a visual scale (1–7). This drives bar/bubble sizing WITHOUT
 * exposing an exact count. Two different exact counts in the same band share a
 * scale — that is the point.
 */
export function bandToScale(band: CountBand): number {
  const idx = COUNT_BANDS.indexOf(band);
  return idx < 0 ? 1 : idx + 1;
}

/** Short, honest explanation of what a band means, for tooltips/captions. */
export const BAND_EXPLANATION =
  "Figures are shown as ranges, not exact counts, to reduce the chance of identifying any single contributor.";

/** The standard, prominent framing that patterns are not prevalence. */
export const NOT_PREVALENCE_NOTICE =
  "These figures represent anonymous submissions made to this platform. They should not be interpreted as estimates of the prevalence of sexual assault in the general population.";

/** Shown wherever a group is hidden by the thresholds above. */
export const SUPPRESSED_MESSAGE =
  "This breakdown isn't available yet. Some groups are hidden to help protect contributor privacy.";

/**
 * Human-readable summary of the suppression + inference protections, used on
 * the Methodology page. Kept here so the copy and the policy can't drift apart.
 */
export const PRIVACY_SUMMARY_POINTS: string[] = [
  `Groups smaller than ${PRIVACY_POLICY.minGroupSize} are never displayed.`,
  `Sensitive groups, including those involving minors, use a higher threshold of ${PRIVACY_POLICY.sensitiveGroupSize}.`,
  `Every approved two-dimension cell uses a minimum of ${PRIVACY_POLICY.crossGroupSize} eligible contributions.`,
  "Public figures are shown as ranges (count bands), never exact numbers.",
  `Public breakdowns combine at most ${PRIVACY_POLICY.maxDimensions} dimensions, and only predefined combinations are offered.`,
  "Predefined two-dimension views use stronger thresholds and broad count bands to reduce differencing risk.",
  "These controls reduce re-identification risk; they do not create a formal mathematical anonymity guarantee.",
  "There is no geographic drill-down and no exact dates or locations.",
];
