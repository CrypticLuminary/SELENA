import type {
  AgeGroup,
  ExperienceType,
  PersonRelationshipCategory,
  Setting,
  Warning,
} from "@/data/categories";

/**
 * Deliberately public, redacted story representation.
 *
 * It mirrors the backend public serializer only. Raw submission identifiers,
 * exact dates, moderation provenance, consent records, and removal credentials
 * do not belong in this type.
 */
export interface Story {
  id: string;
  alias: string;
  ageGroup: AgeGroup;
  relationship: PersonRelationshipCategory;
  setting: Setting;
  experienceTypes: ExperienceType[];
  warnings: Warning[];
  excerpt: string;
  /** Empty on list responses; populated only by the detail endpoint. */
  content: string;
  /** Broad year-only label supplied by the backend. */
  publishedLabel: string;
  featured: boolean;
}

export interface StoryFilters {
  relationship?: PersonRelationshipCategory;
  setting?: Setting;
  experienceType?: ExperienceType;
  ageGroup?: AgeGroup;
  sort?: "recent" | "featured";
}

export interface StoryPage {
  stories: Story[];
  nextCursor: string | null;
}
