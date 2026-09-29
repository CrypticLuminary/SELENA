import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { getRelatedStories, getStory } from "@/lib/api";
import type { Story } from "@/types/story";
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
  try {
    const story = await getStory(id);
    if (!story) return { title: "Story not found" };
    return {
      title: story.alias,
      description: "An anonymous experience shared voluntarily on Selena.",
    };
  } catch {
    return { title: "Story" };
  }
}

export default async function StoryDetailPage({
  params,
}: {
  params: StoryParams;
}) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  let related: Story[] = [];
  try {
    related = await getRelatedStories(story);
  } catch {
    // Related content is optional; never hide the requested story if it fails.
  }

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
        <p className="eyebrow mb-3">{story.publishedLabel}</p>
        <h1 className="text-story text-ink">{story.alias}</h1>
        <div className="mt-6">
          <StoryMeta story={story} showExperience />
        </div>
      </header>

      <div className="mt-10">
        <ContentWarningGate warnings={story.warnings}>
          <div className="border-t border-line-strong pt-8">
            <div className="prose-story">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
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
          href="/patterns"
          className="inline-flex items-center gap-1.5 text-ui font-medium text-accent hover:text-accent-deep hover:underline"
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Explore broader patterns
        </Link>
        <ReportDialog storyId={story.id} />
      </div>

      <RelatedStories stories={related} />
    </article>
  );
}
