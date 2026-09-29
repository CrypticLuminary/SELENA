import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoriesArchive } from "@/components/stories/StoriesArchive";
import type { StoryFilters } from "@/types/story";
import type {
  ExperienceType,
  Relationship,
  Setting,
} from "@/data/categories";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "A calm archive of anonymous experiences shared by people who chose to make their stories public.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

  // Support deep links from the Patterns dashboard, e.g. /stories?relationship=workplace
  const initialFilters: StoryFilters = {
    relationship: first(query.relationship) as Relationship | undefined,
    setting: first(query.setting) as Setting | undefined,
    experienceType: first(query.experience) as ExperienceType | undefined,
  };

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
