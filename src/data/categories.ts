/**
 * SELENA — canonical category definitions.
 *
 * This is the SINGLE SOURCE OF TRUTH for the structured vocabulary used across
 * the whole app: the submission form, story metadata, pattern filters, and the
 * mock aggregate data. Everything derives from the `as const` arrays below.
 *
 * Deliberately BROAD categories only. We never collect or expose exact ages,
 * dates, names, institutions, or locations — see the product principles.
 */

export interface CategoryOption<T extends string = string> {
  value: T;
  label: string;
  /** Longer helper text shown in the submission form where useful. */
  hint?: string;
}

/* ------------------------------------------------------------------ */
/* Age group when the experience occurred                              */
/* ------------------------------------------------------------------ */

export const AGE_GROUPS = [
  { value: "under_10", label: "Under 10" },
  { value: "10_12", label: "10–12" },
  { value: "13_15", label: "13–15" },
  { value: "16_17", label: "16–17" },
  { value: "18_20", label: "18–20" },
  { value: "21_24", label: "21–24" },
  { value: "25_29", label: "25–29" },
  { value: "30_39", label: "30–39" },
  { value: "40_49", label: "40–49" },
  { value: "50_plus", label: "50+" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

export type AgeGroup = (typeof AGE_GROUPS)[number]["value"];

/** Age groups that describe a minor. These receive stronger privacy protection. */
export const MINOR_AGE_GROUPS: readonly AgeGroup[] = [
  "under_10",
  "10_12",
  "13_15",
  "16_17",
];

/* ------------------------------------------------------------------ */
/* Relationship / context of the person involved                       */
/* ------------------------------------------------------------------ */

export const RELATIONSHIPS = [
  { value: "family", label: "Family" },
  { value: "extended_family", label: "Extended family" },
  { value: "partner", label: "Partner" },
  { value: "former_partner", label: "Former partner" },
  { value: "friend", label: "Friend" },
  { value: "acquaintance", label: "Acquaintance" },
  { value: "colleague", label: "Workplace colleague" },
  { value: "employer", label: "Employer / supervisor" },
  { value: "teacher_authority", label: "Teacher / authority figure" },
  { value: "stranger", label: "Stranger" },
  { value: "online_contact", label: "Online contact" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

export type Relationship = (typeof RELATIONSHIPS)[number]["value"];

/* ------------------------------------------------------------------ */
/* Setting where it occurred                                           */
/* ------------------------------------------------------------------ */

export const SETTINGS = [
  { value: "home", label: "Home / private residence" },
  { value: "workplace", label: "Workplace" },
  { value: "school", label: "School / college" },
  { value: "public_transport", label: "Public transport" },
  { value: "public_place", label: "Public place" },
  { value: "online", label: "Online" },
  { value: "social_gathering", label: "Social gathering" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

export type Setting = (typeof SETTINGS)[number]["value"];

/* ------------------------------------------------------------------ */
/* Experience type (a submission may have more than one)               */
/* ------------------------------------------------------------------ */

export const EXPERIENCE_TYPES = [
  { value: "unwanted_contact", label: "Unwanted sexual contact" },
  { value: "sexual_comments", label: "Sexual comments" },
  { value: "pressure_coercion", label: "Sexual pressure / coercion" },
  { value: "threatening", label: "Threatening behavior" },
  { value: "stalking", label: "Stalking" },
  { value: "online_sexual", label: "Online sexual behavior" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]["value"];

/* ------------------------------------------------------------------ */
/* Content warnings (kept to a small, standardized set)                */
/* ------------------------------------------------------------------ */

export const WARNINGS = [
  { value: "sexual_contact", label: "Sexual contact" },
  { value: "harassment", label: "Harassment" },
  { value: "threats", label: "Threats" },
  { value: "stalking", label: "Stalking" },
  { value: "childhood", label: "Childhood experience" },
] as const satisfies readonly CategoryOption[];

export type Warning = (typeof WARNINGS)[number]["value"];

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

function toLabelMap<T extends string>(
  options: readonly CategoryOption<T>[],
): Record<T, string> {
  return options.reduce(
    (acc, o) => {
      acc[o.value] = o.label;
      return acc;
    },
    {} as Record<T, string>,
  );
}

export const AGE_GROUP_LABELS = toLabelMap(AGE_GROUPS);
export const RELATIONSHIP_LABELS = toLabelMap(RELATIONSHIPS);
export const SETTING_LABELS = toLabelMap(SETTINGS);
export const EXPERIENCE_TYPE_LABELS = toLabelMap(EXPERIENCE_TYPES);
export const WARNING_LABELS = toLabelMap(WARNINGS);

export function ageGroupLabel(value: AgeGroup): string {
  return AGE_GROUP_LABELS[value] ?? value;
}
export function relationshipLabel(value: Relationship): string {
  return RELATIONSHIP_LABELS[value] ?? value;
}
export function settingLabel(value: Setting): string {
  return SETTING_LABELS[value] ?? value;
}
export function experienceTypeLabel(value: ExperienceType): string {
  return EXPERIENCE_TYPE_LABELS[value] ?? value;
}
export function warningLabel(value: Warning): string {
  return WARNING_LABELS[value] ?? value;
}

/** The four dimensions available for pattern exploration. */
export const PATTERN_DIMENSIONS = [
  { value: "relationship", label: "Relationship" },
  { value: "age", label: "Age" },
  { value: "setting", label: "Setting" },
  { value: "experience", label: "Experience" },
] as const;

export type PatternDimension = (typeof PATTERN_DIMENSIONS)[number]["value"];
