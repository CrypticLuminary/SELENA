import {
  ageGroupLabel,
  experienceTypeLabel,
  relationshipLabel,
  settingLabel,
} from "@/data/categories";
import type { PatternDimension } from "@/data/categories";
import { bandToScale } from "@/lib/privacy";
import type {
  AggregateSnapshot,
  CountBand,
  MaybeCell,
  PatternDistribution,
} from "@/types/patterns";

/**
 * SYNTHETIC, PRIVACY-SAFE MOCK AGGREGATES.
 *
 * These are authored as if they had ALREADY passed through the server-side
 * aggregation + privacy engine: coarse count bands only (never exact counts),
 * relative scales derived from the band, and some groups SUPPRESSED to
 * demonstrate the "not enough data" state. There are no raw numbers anywhere.
 *
 * `null` in an entry means the group did not pass the privacy threshold and is
 * suppressed (shown to the user as a privacy message, never as a zero).
 */

type Entry = [value: string, band: CountBand | null];

function labelFor(dimension: PatternDimension, value: string): string {
  switch (dimension) {
    case "relationship":
      return relationshipLabel(value as never);
    case "age":
      return ageGroupLabel(value as never);
    case "setting":
      return settingLabel(value as never);
    case "experience":
      return experienceTypeLabel(value as never);
  }
}

function mk(
  dimension: PatternDimension,
  title: string,
  entries: Entry[],
  opts: { overlapping?: boolean } = {},
): PatternDistribution {
  const cells: MaybeCell[] = entries.map(([value, band]) =>
    band
      ? {
          category: value,
          label: labelFor(dimension, value),
          countBand: band,
          scale: bandToScale(band),
          display: true,
        }
      : {
          category: value,
          label: labelFor(dimension, value),
          display: false,
        },
  );
  return {
    dimension,
    title,
    cells,
    suppressedCount: entries.filter(([, b]) => b === null).length,
    overlapping: opts.overlapping,
  };
}

/* ------------------------------------------------------------------ */
/* Single-dimension distributions (the dashboard overview)             */
/* ------------------------------------------------------------------ */

const relationshipDistribution = mk("relationship", "By relationship", [
  ["partner", "500–999"],
  ["acquaintance", "500–999"],
  ["stranger", "500–999"],
  ["family", "200–499"],
  ["former_partner", "200–499"],
  ["friend", "200–499"],
  ["colleague", "200–499"],
  ["extended_family", "100–199"],
  ["employer", "100–199"],
  ["online_contact", "100–199"],
  ["teacher_authority", "50–99"],
  ["other", "50–99"],
]);

const ageDistribution = mk("age", "By age when it happened", [
  ["under_10", null], // sensitive minor group below threshold → suppressed
  ["10_12", "20–49"],
  ["13_15", "50–99"],
  ["16_17", "100–199"],
  ["18_20", "200–499"],
  ["21_24", "500–999"],
  ["25_29", "500–999"],
  ["30_39", "200–499"],
  ["40_49", "100–199"],
  ["50_plus", "50–99"],
  ["prefer_not", "20–49"],
]);

const settingDistribution = mk("setting", "By setting", [
  ["home", "500–999"],
  ["public_place", "200–499"],
  ["workplace", "200–499"],
  ["public_transport", "200–499"],
  ["online", "100–199"],
  ["school", "100–199"],
  ["social_gathering", "100–199"],
  ["other", "50–99"],
  ["prefer_not", "20–49"],
]);

const experienceDistribution = mk(
  "experience",
  "By experience type",
  [
    ["unwanted_contact", "500–999"],
    ["sexual_comments", "500–999"],
    ["pressure_coercion", "200–499"],
    ["online_sexual", "100–199"],
    ["threatening", "100–199"],
    ["stalking", "50–99"],
    ["other", "50–99"],
  ],
  { overlapping: true },
);

export const SNAPSHOT: AggregateSnapshot = {
  datasetVersion: "demo-2026.1",
  privacyPolicyVersion: "policy-2026.1",
  generatedAt: "Snapshot generated in early 2026 (demonstration data)",
  totalSubmissionsLabel: "8,000+ anonymous submissions",
  distributions: {
    relationship: relationshipDistribution,
    age: ageDistribution,
    setting: settingDistribution,
    experience: experienceDistribution,
  },
};

/* ------------------------------------------------------------------ */
/* Two-dimension cross-breakdowns (max 2 dimensions, predefined only)  */
/*                                                                     */
/* Keyed by relationship → secondary dimension. Only these predefined  */
/* combinations exist; anything else returns "unavailable", which the  */
/* UI shows as an honest privacy/limits message.                       */
/* ------------------------------------------------------------------ */

type SecondaryMap = Partial<
  Record<"setting" | "age" | "experience", PatternDistribution>
>;

export const RELATIONSHIP_CROSS: Record<string, SecondaryMap> = {
  partner: {
    setting: mk("setting", "Commonly reported settings", [
      ["home", "500–999"],
      ["public_place", "50–99"],
      ["online", "50–99"],
      ["other", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["under_10", null],
      ["16_17", "50–99"],
      ["18_20", "100–199"],
      ["21_24", "200–499"],
      ["25_29", "100–199"],
      ["30_39", "100–199"],
      ["40_49", "50–99"],
      ["50_plus", "20–49"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["pressure_coercion", "200–499"],
        ["unwanted_contact", "200–499"],
        ["threatening", "100–199"],
        ["sexual_comments", "50–99"],
      ],
      { overlapping: true },
    ),
  },
  family: {
    setting: mk("setting", "Commonly reported settings", [
      ["home", "200–499"],
      ["other", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["under_10", null], // suppressed sensitive minor group
      ["10_12", "20–49"],
      ["13_15", "50–99"],
      ["16_17", "50–99"],
      ["18_20", "50–99"],
      ["21_24", "20–49"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["unwanted_contact", "100–199"],
        ["sexual_comments", "50–99"],
        ["pressure_coercion", "50–99"],
      ],
      { overlapping: true },
    ),
  },
  acquaintance: {
    setting: mk("setting", "Commonly reported settings", [
      ["social_gathering", "200–499"],
      ["public_place", "100–199"],
      ["home", "100–199"],
      ["workplace", "50–99"],
    ]),
    age: mk("age", "Age distribution", [
      ["16_17", "50–99"],
      ["18_20", "200–499"],
      ["21_24", "200–499"],
      ["25_29", "100–199"],
      ["30_39", "50–99"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["unwanted_contact", "200–499"],
        ["sexual_comments", "200–499"],
        ["pressure_coercion", "100–199"],
      ],
      { overlapping: true },
    ),
  },
  colleague: {
    setting: mk("setting", "Commonly reported settings", [
      ["workplace", "200–499"],
      ["social_gathering", "50–99"],
      ["online", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["18_20", "50–99"],
      ["21_24", "100–199"],
      ["25_29", "100–199"],
      ["30_39", "100–199"],
      ["40_49", "50–99"],
      ["50_plus", "20–49"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["sexual_comments", "200–499"],
        ["unwanted_contact", "100–199"],
        ["pressure_coercion", "50–99"],
        ["stalking", "20–49"],
      ],
      { overlapping: true },
    ),
  },
  employer: {
    setting: mk("setting", "Commonly reported settings", [
      ["workplace", "100–199"],
      ["online", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["18_20", "20–49"],
      ["21_24", "50–99"],
      ["25_29", "50–99"],
      ["30_39", "50–99"],
      ["40_49", "20–49"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["pressure_coercion", "100–199"],
        ["sexual_comments", "100–199"],
        ["threatening", "50–99"],
      ],
      { overlapping: true },
    ),
  },
  stranger: {
    setting: mk("setting", "Commonly reported settings", [
      ["public_place", "200–499"],
      ["public_transport", "200–499"],
      ["online", "50–99"],
      ["social_gathering", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["13_15", "50–99"],
      ["16_17", "100–199"],
      ["18_20", "200–499"],
      ["21_24", "200–499"],
      ["25_29", "100–199"],
      ["30_39", "50–99"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["unwanted_contact", "200–499"],
        ["sexual_comments", "200–499"],
        ["threatening", "100–199"],
        ["stalking", "50–99"],
      ],
      { overlapping: true },
    ),
  },
  online_contact: {
    setting: mk("setting", "Commonly reported settings", [
      ["online", "100–199"],
      ["home", "20–49"],
    ]),
    age: mk("age", "Age distribution", [
      ["13_15", "20–49"],
      ["16_17", "50–99"],
      ["18_20", "50–99"],
      ["21_24", "50–99"],
      ["25_29", "20–49"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["online_sexual", "100–199"],
        ["threatening", "50–99"],
        ["sexual_comments", "50–99"],
      ],
      { overlapping: true },
    ),
  },
  former_partner: {
    setting: mk("setting", "Commonly reported settings", [
      ["home", "100–199"],
      ["online", "50–99"],
      ["public_place", "50–99"],
    ]),
    age: mk("age", "Age distribution", [
      ["18_20", "50–99"],
      ["21_24", "100–199"],
      ["25_29", "100–199"],
      ["30_39", "50–99"],
    ]),
    experience: mk(
      "experience",
      "Experience types",
      [
        ["threatening", "100–199"],
        ["stalking", "100–199"],
        ["pressure_coercion", "50–99"],
      ],
      { overlapping: true },
    ),
  },
};

/** Relationships that have authored two-dimension breakdowns (all secondaries). */
export const CROSS_RELATIONSHIPS = Object.keys(RELATIONSHIP_CROSS);

/** The band for a relationship overall (context for a breakdown). */
export function relationshipGroupBand(value: string): CountBand | null {
  const cell = relationshipDistribution.cells.find(
    (c) => c.category === value,
  );
  return cell && cell.display ? cell.countBand : null;
}
