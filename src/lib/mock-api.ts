/**
 * Phase 8 analytics mock boundary.
 *
 * Stories, submissions, and reports use the real Django API in `lib/api.ts`.
 * Aggregate pattern data remains synthetic until the server-enforced analytics
 * milestone is implemented. Components must not import pattern fixtures
 * directly.
 */

import {
  SNAPSHOT,
  RELATIONSHIP_CROSS,
  CROSS_RELATIONSHIPS,
  relationshipGroupBand,
} from "@/data/patterns";
import type { PatternDimension } from "@/data/categories";
import type {
  AggregateSnapshot,
  CrossBreakdown,
  PatternCell,
  PatternDistribution,
} from "@/types/patterns";
import { delay } from "@/lib/utils";

export async function getSnapshot(): Promise<AggregateSnapshot> {
  await delay(400);
  return SNAPSHOT;
}

export async function getDistribution(
  dimension: PatternDimension,
): Promise<PatternDistribution> {
  await delay(300);
  return SNAPSHOT.distributions[dimension];
}

export async function getComparableRelationships(): Promise<
  { value: string; label: string }[]
> {
  await delay(150);
  return SNAPSHOT.distributions.relationship.cells
    .filter(
      (c): c is PatternCell =>
        c.display && CROSS_RELATIONSHIPS.includes(c.category),
    )
    .map((c) => ({ value: c.category, label: c.label }));
}

export async function getCrossBreakdown(
  primary: PatternDimension,
  secondary: "setting" | "age" | "experience",
  primaryCategory: string,
): Promise<CrossBreakdown> {
  await delay(350);

  const base = {
    primary,
    secondary: secondary as PatternDimension,
    primaryCategory,
    primaryLabel:
      SNAPSHOT.distributions[primary].cells.find(
        (c) => c.category === primaryCategory,
      )?.label ?? primaryCategory,
  };

  if (primary !== "relationship") {
    return {
      ...base,
      groupBand: null,
      distribution: SNAPSHOT.distributions[secondary],
      unavailable: true,
    };
  }

  const secondaryDist = RELATIONSHIP_CROSS[primaryCategory]?.[secondary];
  if (!secondaryDist) {
    return {
      ...base,
      groupBand: relationshipGroupBand(primaryCategory),
      distribution: SNAPSHOT.distributions[secondary],
      unavailable: true,
    };
  }

  return {
    ...base,
    groupBand: relationshipGroupBand(primaryCategory),
    distribution: secondaryDist,
    unavailable: false,
  };
}
