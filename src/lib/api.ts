import { z } from "zod";
import {
  AGE_GROUPS,
  EXPERIENCE_TYPES,
  PERSON_RELATIONSHIP_CATEGORIES,
  PUBLIC_WITHHELD,
  SETTINGS,
  WARNINGS,
  ageGroupLabel,
  experienceTypeLabel,
  personRelationshipCategoryLabel,
  settingLabel,
  type AgeGroup,
  type ExperienceType,
  type PersonRelationshipCategory,
  type PatternDimension,
  type Setting,
  type Warning,
} from "@/data/categories";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy";
import type {
  Story,
  StoryFilters,
  StoryPage,
  StorySummary,
} from "@/types/story";
import type {
  AggregateSnapshot,
  CountBand,
  CrossBreakdown,
  MaybeCell,
  PatternDistribution,
} from "@/types/patterns";
import type {
  ReportReason,
  StoryReport,
  Submission,
  SubmissionResult,
} from "@/types/submission";

const REQUEST_TIMEOUT_MS = 15_000;

const ageValues: Set<string> = new Set(AGE_GROUPS.map((item) => item.value));
const relationshipValues: Set<string> = new Set(
  PERSON_RELATIONSHIP_CATEGORIES.map((item) => item.value),
);
const settingValues: Set<string> = new Set(SETTINGS.map((item) => item.value));
const experienceValues: Set<string> = new Set(EXPERIENCE_TYPES.map((item) => item.value));
const warningValues: Set<string> = new Set(WARNINGS.map((item) => item.value));

const publicAgeValues = new Set([...ageValues, PUBLIC_WITHHELD]);
const publicRelationshipValues = new Set([...relationshipValues, PUBLIC_WITHHELD]);
const publicSettingValues = new Set([...settingValues, PUBLIC_WITHHELD]);
const publicExperienceValues = new Set([...experienceValues, PUBLIC_WITHHELD]);

function allowedValue(values: Set<string>) {
  return z.string().refine((value) => values.has(value));
}

const publicStorySummarySchema = z
  .object({
    id: z.string().uuid(),
    alias: z.string().min(1).max(64),
    warnings: z.array(allowedValue(warningValues)),
    excerpt: z.string().max(320),
    published_label: z.string().regex(/^Shared in \d{4}$/),
    featured: z.boolean(),
  })
  .strict();

const publicStoryDetailSchema = publicStorySummarySchema
  .extend({
    age_group: allowedValue(publicAgeValues),
    relationship: allowedValue(publicRelationshipValues),
    setting: allowedValue(publicSettingValues),
    experience_types: z.array(allowedValue(publicExperienceValues)),
    content: z.string(),
  })
  .strict();

const publicStoryPageSchema = z
  .object({
    next_cursor: z.string().uuid().nullable(),
    results: z.array(publicStorySummarySchema),
  })
  .strict();

const submissionReceiptSchema = z
  .object({
    received: z.literal(true),
    removal_code: z.string().min(16).max(256),
    publication_choice: z.enum(["public", "statistics_only"]),
  })
  .strict();

const reportReceiptSchema = z.object({ received: z.literal(true) }).strict();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message = "The request could not be completed.",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function serverApiBase(): string {
  const explicit = process.env.SELENA_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const origin =
    process.env.SELENA_BACKEND_ORIGIN?.trim() ?? "http://127.0.0.1:8000";
  return `${origin.replace(/\/+$/, "")}/api`;
}

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") {
    return `${serverApiBase()}${normalized}`;
  }
  return `/api${normalized}`;
}

async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = windowOrGlobalSetTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiError(502, "The server returned an invalid response.");
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(502, "The server returned an unexpected response.");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "The server could not be reached.");
  } finally {
    clearTimeout(timeout);
  }
}

function windowOrGlobalSetTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms);
}

function mapStorySummary(
  value: z.infer<typeof publicStorySummarySchema>,
): StorySummary {
  return {
    id: value.id,
    alias: value.alias,
    warnings: value.warnings as Warning[],
    excerpt: value.excerpt,
    publishedLabel: value.published_label,
    featured: value.featured,
  };
}

function mapStory(value: z.infer<typeof publicStoryDetailSchema>): Story {
  return {
    ...mapStorySummary(value),
    ageGroup: value.age_group as Story["ageGroup"],
    relationship: value.relationship as Story["relationship"],
    setting: value.setting as Story["setting"],
    experienceTypes: value.experience_types as Story["experienceTypes"],
    content: value.content,
  };
}

function storyQuery(
  filters: StoryFilters,
  cursor?: string | null,
  pageSize?: number,
): string {
  const categoryFilterCount = [
    filters.relationship,
    filters.setting,
    filters.ageGroup,
    filters.experienceType,
  ].filter(Boolean).length;
  if (categoryFilterCount > 1) {
    throw new ApiError(400, "Browse stories using one broad category at a time.");
  }

  const params = new URLSearchParams();
  if (filters.relationship) params.set("relationship", filters.relationship);
  if (filters.setting) params.set("setting", filters.setting);
  if (filters.ageGroup) params.set("age_group", filters.ageGroup);
  if (filters.experienceType) {
    params.set("experience_type", filters.experienceType);
  }
  if (filters.sort) params.set("sort", filters.sort);
  if (cursor) params.set("cursor", cursor);
  if (pageSize) params.set("page_size", String(pageSize));

  const query = params.toString();
  return query ? `/stories/?${query}` : "/stories/";
}

export async function getStoriesPage(
  filters: StoryFilters = {},
  cursor?: string | null,
  pageSize?: number,
): Promise<StoryPage> {
  const page = await requestJson(
    storyQuery(filters, cursor, pageSize),
    publicStoryPageSchema,
  );
  return {
    stories: page.results.map((story) => mapStorySummary(story)),
    nextCursor: page.next_cursor,
  };
}

export async function getStories(
  filters: StoryFilters = {},
): Promise<StorySummary[]> {
  return (await getStoriesPage(filters)).stories;
}

export async function getStory(id: string): Promise<Story | null> {
  try {
    const story = await requestJson(
      `/stories/${encodeURIComponent(id)}/`,
      publicStoryDetailSchema,
    );
    return mapStory(story);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedStories(
  story: Story,
  limit = 3,
): Promise<StorySummary[]> {
  const filters: StoryFilters = { sort: "recent" };
  if (story.relationship !== PUBLIC_WITHHELD) {
    filters.relationship = story.relationship;
  }

  const page = await getStoriesPage(
    filters,
    null,
    Math.min(limit + 1, 20),
  );
  return page.stories.filter((item) => item.id !== story.id).slice(0, limit);
}

function submissionPayload(submission: Submission) {
  if (!submission.ageGroup || !submission.setting) {
    throw new ApiError(400, "The submission is incomplete.");
  }

  const publicPath = submission.publicationChoice === "public";
  const statisticsOnlyRelationships = Array.from(
    new Set(
      submission.peopleInvolved
        .map((person) => person.relationshipCategory)
        .filter(Boolean),
    ),
  ).map((relationshipCategory) => ({
    relationship_category: relationshipCategory,
    relationship_detail: "",
    involvement: "",
    age_band: "",
  }));

  return {
    age_group: submission.ageGroup,
    setting: submission.setting,
    experience_types: submission.experienceTypes,
    people_involved: publicPath
      ? submission.peopleInvolved.map((person) => ({
          relationship_category: person.relationshipCategory,
          relationship_detail: person.relationshipDetail,
          involvement: person.involvement,
          age_band: person.ageBand,
        }))
      : statisticsOnlyRelationships,
    frequency: publicPath ? submission.frequency : "",
    periods: publicPath
      ? submission.periods.map((period) => ({
          start_age_band: period.startAgeBand,
          end_age_band: period.endAgeBand,
        }))
      : [],
    story_text: publicPath ? submission.storyText : "",
    publication_choice: submission.publicationChoice,
    publication_consent: publicPath ? submission.consentPublish : false,
    statistics_consent: publicPath
      ? submission.consentStatistics
      : submission.consentPublish,
  };
}

export async function submitStory(
  submission: Submission,
): Promise<SubmissionResult> {
  const receipt = await requestJson(
    "/submissions/",
    submissionReceiptSchema,
    {
      method: "POST",
      body: JSON.stringify(submissionPayload(submission)),
    },
  );

  return {
    received: true,
    removalCode: receipt.removal_code,
    publicationChoice: receipt.publication_choice,
  };
}

export async function reportStory(
  report: StoryReport,
): Promise<{ received: true }> {
  return requestJson(
    `/stories/${encodeURIComponent(report.storyId)}/reports/`,
    reportReceiptSchema,
    {
      method: "POST",
      body: JSON.stringify({ reason: report.reason satisfies ReportReason }),
    },
  );
}

/* ------------------------------------------------------------------ */
/* Privacy-safe aggregate patterns                                     */
/* ------------------------------------------------------------------ */

const countBandSchema = z.enum([
  "10–19",
  "20–49",
  "50–99",
  "100–199",
  "200–499",
  "500–999",
  "1,000+",
]);

const patternDimensionSchema = z.enum([
  "relationship",
  "age",
  "setting",
  "experience",
]);

const crossSecondarySchema = z.enum(["age", "setting", "experience"]);

const displayedPatternCellSchema = z
  .object({
    category: z.string().min(1).max(64),
    display: z.literal(true),
    count_band: countBandSchema,
    scale: z.number().int().min(1).max(7),
  })
  .strict();

const suppressedPatternCellSchema = z
  .object({
    category: z.string().min(1).max(64),
    display: z.literal(false),
  })
  .strict();

const patternCellSchema = z.discriminatedUnion("display", [
  displayedPatternCellSchema,
  suppressedPatternCellSchema,
]);

const patternDistributionSchema = z
  .object({
    dimension: patternDimensionSchema,
    title: z.string().min(1).max(96),
    cells: z.array(patternCellSchema),
    overlapping: z.boolean(),
  })
  .strict();

const patternSnapshotSchema = z
  .object({
    dataset_version: z.string().min(1).max(96),
    privacy_policy_version: z.string().min(1).max(64),
    generated_label: z.string().min(1).max(96),
    total_band: countBandSchema.nullable(),
    distributions: z
      .object({
        relationship: patternDistributionSchema,
        age: patternDistributionSchema,
        setting: patternDistributionSchema,
        experience: patternDistributionSchema,
      })
      .strict(),
  })
  .strict();

const comparableRelationshipsSchema = z
  .object({
    dataset_version: z.string().min(1).max(96),
    privacy_policy_version: z.string().min(1).max(64),
    values: z.array(allowedValue(relationshipValues)),
  })
  .strict();

const crossBreakdownSchema = z
  .object({
    dataset_version: z.string().min(1).max(96),
    privacy_policy_version: z.string().min(1).max(64),
    primary: z.literal("relationship"),
    secondary: crossSecondarySchema,
    primary_category: allowedValue(relationshipValues),
    group_band: countBandSchema.nullable(),
    distribution: patternDistributionSchema,
    unavailable: z.boolean(),
  })
  .strict();

function patternLabel(dimension: PatternDimension, category: string): string {
  switch (dimension) {
    case "relationship":
      if (!relationshipValues.has(category)) {
        throw new ApiError(502, "The server returned an unexpected relationship category.");
      }
      return personRelationshipCategoryLabel(category);
    case "age":
      if (!ageValues.has(category)) {
        throw new ApiError(502, "The server returned an unexpected age category.");
      }
      return ageGroupLabel(category as AgeGroup);
    case "setting":
      if (!settingValues.has(category)) {
        throw new ApiError(502, "The server returned an unexpected setting category.");
      }
      return settingLabel(category as Setting);
    case "experience":
      if (!experienceValues.has(category)) {
        throw new ApiError(502, "The server returned an unexpected experience category.");
      }
      return experienceTypeLabel(category as ExperienceType);
  }
}

function mapPatternDistribution(
  value: z.infer<typeof patternDistributionSchema>,
  expectedDimension?: PatternDimension,
): PatternDistribution {
  if (expectedDimension && value.dimension !== expectedDimension) {
    throw new ApiError(502, "The server returned an unexpected pattern dimension.");
  }

  const dimension = value.dimension as PatternDimension;
  const cells: MaybeCell[] = value.cells.map((item) => {
    const base = {
      category: item.category,
      label: patternLabel(dimension, item.category),
    };

    if (!item.display) {
      return { ...base, display: false };
    }

    return {
      ...base,
      display: true,
      countBand: item.count_band as CountBand,
      scale: item.scale,
    };
  });

  return {
    dimension,
    title: value.title,
    cells,
    suppressedCount: cells.filter((item) => !item.display).length,
    overlapping: value.overlapping,
  };
}

export async function getSnapshot(): Promise<AggregateSnapshot> {
  const snapshot = await requestJson("/patterns/", patternSnapshotSchema);

  if (snapshot.privacy_policy_version !== PRIVACY_POLICY_VERSION) {
    throw new ApiError(
      409,
      "The privacy policy changed while this frontend was deployed. Please refresh later.",
    );
  }

  return {
    datasetVersion: snapshot.dataset_version,
    privacyPolicyVersion: snapshot.privacy_policy_version,
    generatedAt: snapshot.generated_label,
    totalSubmissionsLabel: snapshot.total_band
      ? `${snapshot.total_band} eligible submissions`
      : "a privacy-protected set of eligible submissions",
    distributions: {
      relationship: mapPatternDistribution(
        snapshot.distributions.relationship,
        "relationship",
      ),
      age: mapPatternDistribution(snapshot.distributions.age, "age"),
      setting: mapPatternDistribution(snapshot.distributions.setting, "setting"),
      experience: mapPatternDistribution(
        snapshot.distributions.experience,
        "experience",
      ),
    },
  };
}

export async function getComparableRelationships(
  expectedDatasetVersion: string,
): Promise<{ value: string; label: string }[]> {
  const response = await requestJson(
    "/patterns/relationships/",
    comparableRelationshipsSchema,
  );

  if (
    response.dataset_version !== expectedDatasetVersion ||
    response.privacy_policy_version !== PRIVACY_POLICY_VERSION
  ) {
    throw new ApiError(409, "Patterns changed while this page was open. Please refresh.");
  }

  return response.values.map((value) => ({
    value,
    label: personRelationshipCategoryLabel(value),
  }));
}

export async function getCrossBreakdown(
  primary: PatternDimension,
  secondary: "setting" | "age" | "experience",
  primaryCategory: string,
  expectedDatasetVersion: string,
): Promise<CrossBreakdown> {
  if (primary !== "relationship" || !relationshipValues.has(primaryCategory)) {
    throw new ApiError(400, "This pattern comparison is not available.");
  }

  const params = new URLSearchParams({
    primary,
    secondary,
    category: primaryCategory,
  });
  const response = await requestJson(
    `/patterns/cross/?${params.toString()}`,
    crossBreakdownSchema,
  );

  if (
    response.secondary !== secondary ||
    response.primary_category !== primaryCategory
  ) {
    throw new ApiError(502, "The server returned an unexpected pattern comparison.");
  }

  if (
    response.dataset_version !== expectedDatasetVersion ||
    response.privacy_policy_version !== PRIVACY_POLICY_VERSION
  ) {
    throw new ApiError(409, "Patterns changed while this page was open. Please refresh.");
  }

  return {
    primary: "relationship",
    secondary,
    primaryCategory,
    primaryLabel: personRelationshipCategoryLabel(primaryCategory),
    groupBand: response.group_band as CountBand | null,
    distribution: mapPatternDistribution(response.distribution, secondary),
    unavailable: response.unavailable,
  };
}

