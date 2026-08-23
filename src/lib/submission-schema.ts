import { z } from "zod";
import {
  AGE_GROUPS,
  EXPERIENCE_TYPES,
  RELATIONSHIPS,
  SETTINGS,
} from "@/data/categories";

const ageValues = AGE_GROUPS.map((a) => a.value) as string[];
const relValues = RELATIONSHIPS.map((r) => r.value) as string[];
const settingValues = SETTINGS.map((s) => s.value) as string[];
const expValues = EXPERIENCE_TYPES.map((e) => e.value) as string[];

const MAX_STORY = 6000;

/**
 * One schema for the whole submission. RHF validates the full schema on every
 * check; each step advances by triggering only its own fields.
 *
 * Note the shape of what we DON'T collect: no name, email, phone, account,
 * exact age, exact date, or location. There is nowhere to put those.
 */
export const submissionSchema = z
  .object({
    ageGroup: z
      .string()
      .refine((v) => ageValues.includes(v), "Please choose an age group."),
    relationship: z
      .string()
      .refine((v) => relValues.includes(v), "Please choose a relationship."),
    setting: z
      .string()
      .refine((v) => settingValues.includes(v), "Please choose a setting."),
    experienceTypes: z
      .array(z.string().refine((v) => expValues.includes(v)))
      .min(1, "Please choose at least one."),
    storyText: z
      .string()
      .max(MAX_STORY, `Please keep your story under ${MAX_STORY} characters.`),
    publicationChoice: z
      .string()
      // Explicit `: boolean` return so TS 5.5+ does NOT infer a type predicate
      // here — that would narrow this field's type away from `string` (via Zod's
      // refine overload) and reject the "" default below.
      .refine(
        (v): boolean => v === "public" || v === "statistics_only",
        "Please choose how you'd like to share.",
      ),
    consentPublish: z.boolean(),
    consentStatistics: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.publicationChoice === "public" && data.storyText.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["storyText"],
        message:
          "Please write your story, or choose to contribute statistics only.",
      });
    }
    if (!data.consentPublish) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consentPublish"],
        message: "Please confirm this to continue.",
      });
    }
  });

export type SubmissionForm = z.infer<typeof submissionSchema>;

export const DEFAULT_SUBMISSION: SubmissionForm = {
  ageGroup: "",
  relationship: "",
  setting: "",
  experienceTypes: [],
  storyText: "",
  publicationChoice: "",
  consentPublish: false,
  // Privacy-first: statistics inclusion is opt-in, never silently pre-checked.
  consentStatistics: false,
};

/** Fields validated when leaving each step (0-indexed steps 0..3). */
export const STEP_FIELDS: (keyof SubmissionForm)[][] = [
  ["ageGroup", "relationship", "setting"],
  ["experienceTypes", "storyText"],
  ["publicationChoice", "consentPublish", "storyText"],
  [],
];
