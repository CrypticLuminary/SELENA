import { z } from "zod";
import { AGE_GROUPS, EXPERIENCE_TYPES, SETTINGS } from "@/data/categories";

const ageValues = AGE_GROUPS.map((a) => a.value) as string[];
const settingValues = SETTINGS.map((s) => s.value) as string[];
const expValues = EXPERIENCE_TYPES.map((e) => e.value) as string[];

const MAX_STORY = 6000;

/** One person involved. Every field optional — no field forces disclosure. */
const personSchema = z.object({
  relationshipCategory: z.string(),
  relationshipDetail: z.string(),
  involvement: z.string(),
  ageBand: z.string(),
});

/** A distinct period (survivor's broad age range). Both ends optional. */
const periodSchema = z.object({
  startAgeBand: z.string(),
  endAgeBand: z.string(),
});

/**
 * One schema for the whole submission. RHF validates the full schema on every
 * check; each step advances by triggering only its own fields.
 *
 * What we DON'T collect: no name, email, phone, account, exact age, exact date,
 * or location. The structured "people involved" / frequency / period fields are
 * ALL optional and never required — the narrative is the primary account.
 */
export const submissionSchema = z
  .object({
    ageGroup: z
      .string()
      .refine((v) => ageValues.includes(v), "Please choose an age group."),
    setting: z
      .string()
      .refine((v) => settingValues.includes(v), "Please choose a setting."),
    experienceTypes: z
      .array(z.string().refine((v) => expValues.includes(v)))
      .min(1, "Please choose at least one."),

    // Optional structured context — no `.min`, no required refinements.
    peopleInvolved: z.array(personSchema),
    frequency: z.string(),
    periods: z.array(periodSchema),

    storyText: z
      .string()
      .max(MAX_STORY, `Please keep your story under ${MAX_STORY} characters.`),
    publicationChoice: z
      .string()
      // Explicit `: boolean` return so TS 5.5+ does NOT infer a type predicate
      // here — that would narrow this field away from `string` (via Zod's refine
      // overload) and reject the "" default below.
      .refine(
        (v): boolean => v === "public" || v === "statistics_only",
        "Please choose how you'd like to share.",
      ),
    consentPublish: z.boolean(),
    consentStatistics: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.experienceTypes.includes("prefer_not") &&
      data.experienceTypes.length > 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["experienceTypes"],
        message:
          "Prefer not to say can't be combined with specific experience types.",
      });
    }

    if (data.publicationChoice === "public" && data.storyText.trim() === "") {
      // Attach to publicationChoice (Step 3) — NOT storyText (Step 2) — so the
      // message is visible on the step where the choice is made, and Continue
      // doesn't fail silently.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publicationChoice"],
        message:
          "To publish a story you'll need to write one first. Go back to add it, or choose statistics only.",
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
  setting: "",
  experienceTypes: [],
  peopleInvolved: [],
  frequency: "",
  periods: [],
  storyText: "",
  publicationChoice: "",
  consentPublish: false,
  // Privacy-first: statistics inclusion is opt-in, never silently pre-checked.
  consentStatistics: false,
};

/** Fields validated when leaving each step (0-indexed steps 0..3). */
export const STEP_FIELDS: (keyof SubmissionForm)[][] = [
  ["ageGroup", "setting"],
  ["experienceTypes", "storyText"],
  ["publicationChoice", "consentPublish", "storyText"],
  [],
];
