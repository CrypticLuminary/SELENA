import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoriesArchive } from "@/components/stories/StoriesArchive";
import type { StoryFilters } from "@/types/story";
import {
  EXPERIENCE_TYPES,
  PERSON_RELATIONSHIP_CATEGORIES,
  SETTINGS,
  type ExperienceType,
  type PersonRelationshipCategory,
  type Setting,
} from "@/data/categories";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "A calm archive of anonymous experiences shared by people who chose to make their stories public.",
};

const relationshipValues = new Set<string>(
  PERSON_RELATIONSHIP_CATEGORIES.map((item) => item.value),
);
const settingValues = new Set<string>(SETTINGS.map((item) => item.value));
const experienceValues = new Set<string>(EXPERIENCE_TYPES.map((item) => item.value));

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validRelationship(
  value: string | undefined,
): PersonRelationshipCategory | undefined {
  return value && relationshipValues.has(value)
    ? (value as PersonRelationshipCategory)
    : undefined;
}

function validSetting(value: string | undefined): Setting | undefined {
  return value && settingValues.has(value) ? (value as Setting) : undefined;
}

function validExperience(
  value: string | undefined,
): ExperienceType | undefined {
  return value && experienceValues.has(value)
    ? (value as ExperienceType)
    : undefined;
}

type StorySearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: StorySearchParams;
}) {
  const query = await searchParams;

  const relationship = validRelationship(first(query.relationship));
  const setting = validSetting(first(query.setting));
  const experienceType = validExperience(first(query.experience));

  const initialFilters: StoryFilters = relationship
    ? { relationship }
    : setting
      ? { setting }
      : experienceType
        ? { experienceType }
        : {};

  return (
    <div className="mx-auto max-w-editorial">
      <PageHeader
        eyebrow="A reading room"
        title="Stories"
        description="Experiences shared by contributors who chose to make their stories public. Each one is voluntary, and each is shown behind a content warning."
      />
      <StoriesArchive initialFilters={initialFilters} />
    </div>
  );
}
