import type {
  AgeGroup,
  ExperienceType,
  Relationship,
  Setting,
  Warning,
} from "@/data/categories";

/**
 * A publicly readable, anonymized story.
 *
 * All content here is synthetic demo data in V1. Structured fields use the
 * broad categories from `data/categories.ts`. No identifying fields exist by
 * design — there is nowhere to store a name, date, location, or institution.
 */
export interface Story {
  /** Stable opaque id (not derived from any submission secret). */
  id: string;
  /** Generated presentation alias, e.g. "Anonymous Willow". */
  alias: string;

  // Broad structured context (also feeds aggregate patterns when consented)
  ageGroup: AgeGroup;
  relationship: Relationship;
  setting: Setting;
  experienceTypes: ExperienceType[];

  // Presentation
  warnings: Warning[];
  /** Short, gentle teaser shown on cards (never graphic). */
  excerpt: string;
  /** Full story text, revealed only after the content-warning gate. */
  content: string;

  /** Broad publication month label, e.g. "Shared in 2025". Never an exact date. */
  publishedLabel: string;
  /** ISO-ish sortable key for ordering only; not shown as an exact date. */
  sortKey: number;

  /** Editorially surfaced on "Featured". */
  featured?: boolean;

  // Consent flags (mirrors the submission model)
  storyPublished: boolean; // true for everything in the public archive
  statisticsIncluded: boolean;
}

/** Filters accepted by the story archive. Intentionally coarse. */
export interface StoryFilters {
  relationship?: Relationship;
  setting?: Setting;
  experienceType?: ExperienceType;
  ageGroup?: AgeGroup;
  sort?: "recent" | "featured";
}
