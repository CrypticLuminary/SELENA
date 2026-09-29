import type {
  AgeGroup,
  ExperienceType,
  PersonRelationshipCategory,
  PublicWithheld,
  Setting,
  Warning,
} from "@/data/categories";

/**
 * Metadata-minimized public representation used by archive/home/related-story
 * lists. Structured survivor context belongs only on the deliberate detail
 * surface.
 */
export interface StorySummary {
  id: string;
  alias: string;
  warnings: Warning[];
  excerpt: string;
  /** Broad year-only label supplied by the backend. */
  publishedLabel: string;
  featured: boolean;
}

/**
 * Deliberately public, redacted individual-story representation.
 *
 * It mirrors the backend detail serializer only. Raw submission identifiers,
 * exact dates, moderation provenance, consent records, and removal credentials
 * do not belong in this type.
 */
export interface Story extends StorySummary {
  ageGroup: AgeGroup | PublicWithheld;
  relationship: PersonRelationshipCategory | PublicWithheld;
  setting: Setting | PublicWithheld;
  experienceTypes: (ExperienceType | PublicWithheld)[];
  content: string;
}

export interface StoryFilters {
  relationship?: PersonRelationshipCategory;
  setting?: Setting;
  experienceType?: ExperienceType;
  ageGroup?: AgeGroup;
  sort?: "recent" | "featured";
}

export interface StoryPage {
  stories: StorySummary[];
  nextCursor: string | null;
}
