/**
 * MOCK API — the single boundary between the UI and the data layer.
 *
 * Components import ONLY from here (never from `data/*` directly). Every
 * function is async and returns a Promise, exactly as a real fetch to a
 * Django/DRF endpoint would. To move to a real backend later, reimplement these
 * functions with `fetch(...)` calls — no component needs to change.
 *
 * Privacy note: pattern functions (added below) return ALREADY privacy-safe,
 * banded aggregates. This module never performs privacy decisions on raw data;
 * in production that happens server-side.
 */

import { STORIES, publishedStories } from "@/data/stories";
import {
  SNAPSHOT,
  RELATIONSHIP_CROSS,
  CROSS_RELATIONSHIPS,
  relationshipGroupBand,
} from "@/data/patterns";
import type { Story, StoryFilters } from "@/types/story";
import type {
  Submission,
  SubmissionResult,
  StoryReport,
} from "@/types/submission";
import type { PatternDimension } from "@/data/categories";
import type {
  AggregateSnapshot,
  CrossBreakdown,
  PatternCell,
  PatternDistribution,
} from "@/types/patterns";
import { delay, generateDemoDeletionCode } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export async function getStories(
  filters: StoryFilters = {},
): Promise<Story[]> {
  await delay(350);

  let result = publishedStories();

  if (filters.relationship) {
    result = result.filter((s) => s.relationship === filters.relationship);
  }
  if (filters.setting) {
    result = result.filter((s) => s.setting === filters.setting);
  }
  if (filters.ageGroup) {
    result = result.filter((s) => s.ageGroup === filters.ageGroup);
  }
  if (filters.experienceType) {
    result = result.filter((s) =>
      s.experienceTypes.includes(filters.experienceType!),
    );
  }

  if (filters.sort === "featured") {
    result = [...result].sort((a, b) => {
      const fa = a.featured ? 1 : 0;
      const fb = b.featured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return b.sortKey - a.sortKey;
    });
  }
  // default order is already "recent" (by sortKey desc)

  return result;
}

export async function getStory(id: string): Promise<Story | null> {
  await delay(250);
  const story = STORIES.find((s) => s.id === id && s.storyPublished);
  return story ?? null;
}

/**
 * Related stories based on BROAD structured overlap only. This is intentionally
 * simple — it is not a recommendation engine, and it never implies "people
 * exactly like you."
 */
export async function getRelatedStories(
  story: Story,
  limit = 3,
): Promise<Story[]> {
  await delay(250);

  const scored = publishedStories()
    .filter((s) => s.id !== story.id)
    .map((s) => {
      let score = 0;
      if (s.relationship === story.relationship) score += 3;
      if (s.setting === story.setting) score += 2;
      if (s.ageGroup === story.ageGroup) score += 1;
      const sharedExp = s.experienceTypes.filter((e) =>
        story.experienceTypes.includes(e),
      ).length;
      score += sharedExp;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.s.sortKey - a.s.sortKey);

  return scored.slice(0, limit).map((x) => x.s);
}

/* ------------------------------------------------------------------ */
/* Submission + reporting (mock)                                       */
/* ------------------------------------------------------------------ */

export async function submitStory(
  submission: Submission,
): Promise<SubmissionResult> {
  await delay(900);

  // In V1 nothing is persisted. A real backend would validate server-side,
  // run PII + moderation pipelines, and issue a single-use removal token.
  return {
    received: true,
    deletionCode: generateDemoDeletionCode(),
    publicationChoice: submission.publicationChoice,
  };
}

export async function reportStory(
  _report: StoryReport,
): Promise<{ received: true }> {
  await delay(600);
  // A real backend would queue this for human moderation review.
  return { received: true };
}

/* ------------------------------------------------------------------ */
/* Patterns (already privacy-safe aggregates)                          */
/* ------------------------------------------------------------------ */

/** The full published aggregate snapshot (banded, suppressed as needed). */
export async function getSnapshot(): Promise<AggregateSnapshot> {
  await delay(400);
  return SNAPSHOT;
}

/** One single-dimension distribution. Mirrors a dedicated analytics endpoint. */
export async function getDistribution(
  dimension: PatternDimension,
): Promise<PatternDistribution> {
  await delay(300);
  return SNAPSHOT.distributions[dimension];
}

/**
 * Relationships for which a two-dimension comparison is available. The explorer
 * only offers these, so a user never lands on a dead "not available" state.
 */
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

/**
 * A predefined two-dimension breakdown. In V1 only relationship-primary
 * combinations are authored; any other combination (or a group that would leak)
 * returns `unavailable`, which the UI renders as an honest privacy message.
 *
 * The privacy engine — not the frontend — is what decides availability. Here
 * that decision is baked into the mock data.
 */
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
    primaryLabel: SNAPSHOT.distributions[primary].cells.find(
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
