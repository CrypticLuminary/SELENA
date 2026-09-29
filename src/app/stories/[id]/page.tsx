import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { getStory, getRelatedStories } from "@/lib/mock-api";
import { relationshipLabel } from "@/data/categories";
import { StoryMeta } from "@/components/stories/StoryMeta";
import { ContentWarningGate } from "@/components/stories/ContentWarningGate";
import { ReportDialog } from "@/components/stories/ReportDialog";
import { RelatedStories } from "@/components/stories/RelatedStories";

type StoryParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: StoryParams;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) return { title: "Story not found" };
  return {
    title: story.alias,
    description: "An anonymous experience shared voluntarily on Selena.",
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: StoryParams;
}) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  const related = await getRelatedStories(story);
  const paragraphs = story.content.split("\n\n").filter(Boolean);

  return (
    <article className="mx-auto max-w-reading">
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-ui font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to stories
      </Link>

      <header className="mt-8">
        {story.publishedLabel ? (
          <p className="eyebrow mb-3">{story.publishedLabel}</p>
        ) : null}
        <h1 className="text-story text-ink">{story.alias}</h1>
        <div className="mt-6">
          <StoryMeta story={story} showExperience />
        </div>
      </header>

      <div className="mt-10">
        <ContentWarningGate warnings={story.warnings}>
          <div className="border-t border-line-strong pt-8">
            <div className="prose-story">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </ContentWarningGate>
      </div>

      <p className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-ink-faint">
        This story was voluntarily submitted and reviewed for privacy and
        publication safety before being shared. It is a self-reported,
        first-person account and has not been independently verified.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/patterns?relationship=${story.relationship}`}
          className="inline-flex items-center gap-1.5 text-ui font-medium text-accent hover:text-accent-deep hover:underline"
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Explore {relationshipLabel(story.relationship).toLowerCase()} patterns
        </Link>
        <ReportDialog storyId={story.id} />
      </div>

      <RelatedStories stories={related} />
    </article>
  );
}
