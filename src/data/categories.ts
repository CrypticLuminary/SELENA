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
  { value: "family_gathering", label: "Family gathering" },
  { value: "workplace", label: "Workplace" },
  { value: "school", label: "School / college" },
  { value: "public_transport", label: "Public transport" },
  { value: "public_place", label: "Public place" },
  { value: "online", label: "Online" },
  { value: "social_gathering", label: "Social gathering" },
  { value: "religious_community", label: "Religious / community setting" },
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

/* ================================================================== */
/* PEOPLE INVOLVED — optional, hierarchical structured context.        */
/*                                                                    */
/* This vocabulary is SEPARATE from the flat RELATIONSHIPS above,      */
/* which stays the source of truth for stories & pattern aggregation. */
/* Everything here is optional; every field offers "prefer not to say".*/
/* ================================================================== */

/** Top-level relationship categories. Selecting one may reveal a detail list. */
export const PERSON_RELATIONSHIP_CATEGORIES = [
  { value: "family", label: "Family" },
  { value: "partner", label: "Partner / romantic relationship" },
  { value: "friend_acquaintance", label: "Friend / acquaintance" },
  { value: "authority", label: "Authority / professional" },
  { value: "stranger", label: "Stranger" },
  { value: "online", label: "Online / digital contact" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

export type PersonRelationshipCategory =
  (typeof PERSON_RELATIONSHIP_CATEGORIES)[number]["value"];

/**
 * Second-level detail, revealed contextually per top-level category. Categories
 * not listed here (stranger, online, friend/acquaintance, other, prefer_not)
 * have no second level — the top level is enough.
 */
export const PERSON_RELATIONSHIP_DETAILS: Record<
  string,
  readonly CategoryOption[]
> = {
  family: [
    { value: "parent", label: "Parent" },
    { value: "stepparent", label: "Stepparent" },
    { value: "sibling", label: "Sibling" },
    { value: "half_sibling", label: "Half-sibling" },
    { value: "grandparent", label: "Grandparent" },
    { value: "uncle", label: "Uncle" },
    { value: "aunt", label: "Aunt" },
    { value: "cousin", label: "Cousin" },
    { value: "nephew_niece", label: "Nephew / niece" },
    { value: "child", label: "Child" },
    { value: "other_relative", label: "Other relative" },
    { value: "extended_family", label: "Extended family" },
    { value: "prefer_not", label: "Prefer not to say" },
  ],
  partner: [
    { value: "spouse", label: "Spouse" },
    { value: "current_partner", label: "Current partner" },
    { value: "former_partner", label: "Former partner" },
    { value: "dating_partner", label: "Dating partner" },
    { value: "former_dating_partner", label: "Former dating partner" },
    { value: "other", label: "Other" },
    { value: "prefer_not", label: "Prefer not to say" },
  ],
  authority: [
    { value: "teacher", label: "Teacher" },
    { value: "professor", label: "Professor / lecturer" },
    { value: "employer_supervisor", label: "Employer / supervisor" },
    { value: "coworker", label: "Coworker" },
    { value: "healthcare_worker", label: "Healthcare worker" },
    { value: "religious_leader", label: "Religious / community leader" },
    { value: "police_security", label: "Police / security" },
    { value: "other_authority", label: "Other authority figure" },
    { value: "prefer_not", label: "Prefer not to say" },
  ],
};

/** How the person was involved. */
export const INVOLVEMENT_OPTIONS = [
  { value: "primary", label: "Primarily involved" },
  { value: "sometimes", label: "Sometimes involved" },
  { value: "prefer_not", label: "I don't want to say" },
] as const satisfies readonly CategoryOption[];

/** Approximate age of the person involved (may be unknown). */
export const PERSON_AGE_BANDS = [
  { value: "under_13", label: "Under 13" },
  { value: "13_17", label: "13–17" },
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_plus", label: "55+" },
  { value: "dont_know", label: "I don't know" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

/** How often the experience happened. */
export const FREQUENCY_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "more_than_once", label: "More than once" },
  { value: "repeated_period", label: "Repeatedly over a period of time" },
  { value: "unsure", label: "I'm not sure" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const satisfies readonly CategoryOption[];

/* Lookup helpers for the person vocabulary (used by the review step).
   Built directly as Record<string, string> so string-keyed lookups are safe. */
function flatLabels(
  options: readonly CategoryOption[],
): Record<string, string> {
  return options.reduce<Record<string, string>>((acc, o) => {
    acc[o.value] = o.label;
    return acc;
  }, {});
}

const PERSON_CATEGORY_LABELS = flatLabels(PERSON_RELATIONSHIP_CATEGORIES);
const INVOLVEMENT_LABELS = flatLabels(INVOLVEMENT_OPTIONS);
const PERSON_AGE_LABELS = flatLabels(PERSON_AGE_BANDS);
const FREQUENCY_LABELS = flatLabels(FREQUENCY_OPTIONS);
const PERSON_DETAIL_LABELS: Record<string, string> = Object.values(
  PERSON_RELATIONSHIP_DETAILS,
).reduce<Record<string, string>>((acc, list) => {
  for (const o of list) acc[o.value] = o.label;
  return acc;
}, {});

export function personRelationshipCategoryLabel(value: string): string {
  return PERSON_CATEGORY_LABELS[value] ?? value;
}
export function personRelationshipDetailLabel(value: string): string {
  return PERSON_DETAIL_LABELS[value] ?? value;
}
export function involvementLabel(value: string): string {
  return INVOLVEMENT_LABELS[value] ?? value;
}
export function personAgeBandLabel(value: string): string {
  return PERSON_AGE_LABELS[value] ?? value;
}
export function frequencyLabel(value: string): string {
  return FREQUENCY_LABELS[value] ?? value;
}
