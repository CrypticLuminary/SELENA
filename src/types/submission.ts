import type { AgeGroup, ExperienceType, Setting } from "@/data/categories";

export type PublicationChoice = "public" | "statistics_only";

/**
 * One person involved in the experience. Every field is OPTIONAL — the survivor
 * can add as many or as few as they want, and skip any detail. This structured
 * layer NEVER replaces the written narrative; it only adds broad context for
 * privacy-safe aggregation.
 *
 * Values are stored as broad category strings (see `data/categories.ts`):
 *   relationshipCategory — top-level (family, partner, authority, …)
 *   relationshipDetail   — optional second level (uncle, spouse, teacher, …)
 *   involvement          — primary / sometimes / prefer_not
 *   ageBand              — the person's approximate age band (may be unknown)
 */
export interface PersonInvolved {
  relationshipCategory: string;
  relationshipDetail: string;
  involvement: string;
  ageBand: string;
}

export type Frequency =
  | ""
  | "once"
  | "more_than_once"
  | "repeated_period"
  | "unsure"
  | "prefer_not";

/** A distinct period, described by the survivor's own broad age range. */
export interface Period {
  startAgeBand: string;
  endAgeBand: string;
}

/**
 * The complete submission payload assembled by the wizard.
 *
 * Note what is ABSENT by design: no name, email, phone, account, exact date,
 * exact age, or location. There is nowhere to put those. The written story
 * (`storyText`) is the survivor's own voice and is stored verbatim — it is
 * never summarized, paraphrased, or reconstructed from the structured fields.
 */
export interface Submission {
  // Broad context about the survivor / experience
  ageGroup: AgeGroup | null;
  setting: Setting | null;
  experienceTypes: ExperienceType[];

  // Optional structured context (secondary to the narrative)
  peopleInvolved: PersonInvolved[];
  frequency: Frequency;
  periods: Period[];

  /** The survivor's own words — stored verbatim, only shown if publish === "public". */
  storyText: string;

  publicationChoice: PublicationChoice;

  /** Explicit consent for the chosen publication path. */
  consentPublish: boolean;
  /** Explicit consent to include structured fields in aggregate statistics. */
  consentStatistics: boolean;
}

/** Result returned by the mock submit endpoint. */
export interface SubmissionResult {
  received: true;
  /** Demo-only removal code (clearly labeled as such in the UI). */
  deletionCode: string;
  publicationChoice: PublicationChoice;
}

export type ReportReason =
  | "identifying_info"
  | "harmful_graphic"
  | "targets_person"
  | "hate_abusive"
  | "spam"
  | "other";

export interface StoryReport {
  storyId: string;
  reason: ReportReason;
  note?: string;
}
