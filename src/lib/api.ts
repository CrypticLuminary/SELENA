import { z } from "zod";
import {
  AGE_GROUPS,
  EXPERIENCE_TYPES,
  PERSON_RELATIONSHIP_CATEGORIES,
  SETTINGS,
  WARNINGS,
  type AgeGroup,
  type ExperienceType,
  type PersonRelationshipCategory,
  type Setting,
  type Warning,
} from "@/data/categories";
import type { Story, StoryFilters, StoryPage } from "@/types/story";
import type {
  ReportReason,
  StoryReport,
  Submission,
  SubmissionResult,
} from "@/types/submission";

const REQUEST_TIMEOUT_MS = 15_000;

const ageValues = new Set(AGE_GROUPS.map((item) => item.value));
const relationshipValues = new Set(
  PERSON_RELATIONSHIP_CATEGORIES.map((item) => item.value),
);
const settingValues = new Set(SETTINGS.map((item) => item.value));
const experienceValues = new Set(EXPERIENCE_TYPES.map((item) => item.value));
const warningValues = new Set(WARNINGS.map((item) => item.value));

function allowedValue(values: Set<string>) {
  return z.string().refine((value) => values.has(value));
}

const publicStoryBaseSchema = z
  .object({
    id: z.string().uuid(),
    alias: z.string().min(1).max(64),
    age_group: allowedValue(ageValues),
    relationship: allowedValue(relationshipValues),
    setting: allowedValue(settingValues),
    experience_types: z.array(allowedValue(experienceValues)),
    warnings: z.array(allowedValue(warningValues)),
    excerpt: z.string().max(320),
    published_label: z.string().regex(/^Shared in \d{4}$/),
    featured: z.boolean(),
  })
  .strict();

const publicStoryDetailSchema = publicStoryBaseSchema
  .extend({
    content: z.string(),
  })
  .strict();

const publicStoryPageSchema = z
  .object({
    next_cursor: z.string().uuid().nullable(),
    results: z.array(publicStoryBaseSchema),
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

function mapStory(
  value: z.infer<typeof publicStoryBaseSchema>,
  content = "",
): Story {
  return {
    id: value.id,
    alias: value.alias,
    ageGroup: value.age_group as AgeGroup,
    relationship: value.relationship as PersonRelationshipCategory,
    setting: value.setting as Setting,
    experienceTypes: value.experience_types as ExperienceType[],
    warnings: value.warnings as Warning[],
    excerpt: value.excerpt,
    content,
    publishedLabel: value.published_label,
    featured: value.featured,
  };
}

function storyQuery(
  filters: StoryFilters,
  cursor?: string | null,
  pageSize?: number,
): string {
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
    stories: page.results.map((story) => mapStory(story)),
    nextCursor: page.next_cursor,
  };
}

export async function getStories(
  filters: StoryFilters = {},
): Promise<Story[]> {
  return (await getStoriesPage(filters)).stories;
}

export async function getStory(id: string): Promise<Story | null> {
  try {
    const story = await requestJson(
      `/stories/${encodeURIComponent(id)}/`,
      publicStoryDetailSchema,
    );
    return mapStory(story, story.content);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedStories(
  story: Story,
  limit = 3,
): Promise<Story[]> {
  const page = await getStoriesPage(
    { relationship: story.relationship, sort: "recent" },
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
  return {
    age_group: submission.ageGroup,
    setting: submission.setting,
    experience_types: submission.experienceTypes,
    people_involved: submission.peopleInvolved.map((person) => ({
      relationship_category: person.relationshipCategory,
      relationship_detail: person.relationshipDetail,
      involvement: person.involvement,
      age_band: person.ageBand,
    })),
    frequency: submission.frequency,
    periods: submission.periods.map((period) => ({
      start_age_band: period.startAgeBand,
      end_age_band: period.endAgeBand,
    })),
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
