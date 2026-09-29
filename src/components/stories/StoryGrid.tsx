import type { StorySummary } from "@/types/story";
import { StoryCard } from "./StoryCard";

export function StoryGrid({ stories }: { stories: StorySummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <li key={story.id} className="h-full">
          <StoryCard story={story} />
        </li>
      ))}
    </ul>
  );
}
