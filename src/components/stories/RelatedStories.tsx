import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ageGroupLabel,
  relationshipLabel,
  settingLabel,
} from "@/data/categories";
import type { Story } from "@/types/story";

/**
 * "You may also want to explore" — related by BROAD categories only.
 * Never framed as "people exactly like you."
 */
export function RelatedStories({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-14">
      <h2 id="related-heading" className="text-xl font-semibold text-ink">
        You may also want to explore
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Other anonymous experiences that share a broad category with this one.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {stories.map((story) => (
          <li key={story.id}>
            <Link
              href={`/stories/${story.id}`}
              className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="text-sm font-semibold text-ink">
                {story.alias}
              </span>
              <span className="mt-1 text-xs text-ink-faint">
                {ageGroupLabel(story.ageGroup)} · {relationshipLabel(story.relationship)}{" "}
                · {settingLabel(story.setting)}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Read
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
