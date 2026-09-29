import type { AgeGroup, ExperienceType, Setting } from "@/data/categories";

export type PublicationChoice = "public" | "statistics_only";

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

export interface Period {
  startAgeBand: string;
  endAgeBand: string;
}

/**
 * Private submission payload assembled in memory by the wizard.
 * No identity/account/exact date/location field exists by design.
 */
export interface Submission {
  ageGroup: AgeGroup | null;
  setting: Setting | null;
  experienceTypes: ExperienceType[];
  peopleInvolved: PersonInvolved[];
  frequency: Frequency;
  periods: Period[];
  storyText: string;
  publicationChoice: PublicationChoice;
  consentPublish: boolean;
  consentStatistics: boolean;
}

export interface SubmissionResult {
  received: true;
  /** Plaintext is returned exactly once by the backend. */
  removalCode: string;
  publicationChoice: PublicationChoice;
}

export type ReportReason =
  | "privacy_concern"
  | "content_warning"
  | "harmful_content"
  | "other";

export interface StoryReport {
  storyId: string;
  reason: ReportReason;
}
