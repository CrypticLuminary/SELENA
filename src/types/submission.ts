import type {
  AgeGroup,
  ExperienceType,
  Relationship,
  Setting,
} from "@/data/categories";

export type PublicationChoice = "public" | "statistics_only";

/**
 * The complete submission payload assembled by the wizard.
 *
 * Note what is ABSENT by design: no name, email, phone, account, exact date,
 * exact age, or location. There is nowhere to put those.
 */
export interface Submission {
  ageGroup: AgeGroup | null;
  relationship: Relationship | null;
  setting: Setting | null;
  experienceTypes: ExperienceType[];

  /** Free text; only becomes eligible for public display if publish === "public". */
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
