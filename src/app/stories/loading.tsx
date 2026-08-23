import { Skeleton, StoryCardSkeleton } from "@/components/ui/skeleton";

export default function StoriesLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-4 h-5 w-full max-w-reading" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
