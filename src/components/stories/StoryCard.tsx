import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import {
  ageGroupLabel,
  personRelationshipCategoryLabel,
  settingLabel,
} from "@/data/categories";
import type { Story } from "@/types/story";

/** An editorial entry in the archive — reads like a library card, not a feed post. */
export function StoryCard({ story }: { story: Story }) {
  const hasWarning = story.warnings.length > 0;
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:p-7"
    >
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
        {personRelationshipCategoryLabel(story.relationship)} · {settingLabel(story.setting)} ·{" "}
        {ageGroupLabel(story.ageGroup)}
      </p>

      <h3 className="mt-3 font-serif text-card font-medium text-ink">
        {story.alias}
      </h3>

      <p className="mt-3 flex-1 font-serif text-[1.05rem] italic leading-relaxed text-ink-soft">
        &ldquo;{story.excerpt}&rdquo;
      </p>

      <div className="mt-6 flex items-center justify-between">
        {hasWarning ? (
          <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-caution">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Sensitive content
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-ui font-medium text-accent">
          Read story
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
