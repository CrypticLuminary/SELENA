"use client";

import { useEffect, useRef, useState } from "react";
import { getStoriesPage } from "@/lib/api";
import type { StoryFilters, StorySummary } from "@/types/story";
import { StoryControls } from "./StoryControls";
import { StoryGrid } from "./StoryGrid";
import { StoryCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "error";

export function StoriesArchive({
  initialFilters = {},
}: {
  initialFilters?: StoryFilters;
}) {
  const [filters, setFilters] = useState<StoryFilters>(initialFilters);
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const requestGeneration = ++generation.current;

    getStoriesPage(filters)
      .then((page) => {
        if (generation.current !== requestGeneration) return;
        setStories(page.stories);
        setNextCursor(page.nextCursor);
        setStatus("ready");
      })
      .catch(() => {
        if (generation.current === requestGeneration) setStatus("error");
      });
  }, [filters, reloadKey]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;

    const requestGeneration = generation.current;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await getStoriesPage(filters, nextCursor);
      if (generation.current !== requestGeneration) return;
      setStories((current) => [...current, ...page.stories]);
      setNextCursor(page.nextCursor);
    } catch {
      if (generation.current === requestGeneration) setLoadMoreError(true);
    } finally {
      if (generation.current === requestGeneration) setLoadingMore(false);
    }
  }

  return (
    <div className="mt-8">
      <StoryControls
        filters={filters}
        onChange={(next) => {
          setStatus("loading");
          setLoadMoreError(false);
          setFilters(next);
        }}
      />

      <div className="mt-6" aria-live="polite">
        {status === "loading" ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <StoryCardSkeleton />
              </li>
            ))}
          </ul>
        ) : status === "error" ? (
          <ErrorState
            title="We couldn't load these experiences right now."
            onRetry={() => {
              setStatus("loading");
              setLoadMoreError(false);
              setReloadKey((key) => key + 1);
            }}
          />
        ) : stories.length === 0 ? (
          <EmptyState
            title="No stories match these filters yet."
            description="Try broadening your selection. As more people choose to share publicly, more experiences will appear here."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-faint">
              Browse the available privacy-reviewed stories below.
            </p>
            <StoryGrid stories={stories} />

            {nextCursor ? (
              <div className="mt-8 text-center">
                <Button
                  variant="secondary"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more stories"}
                </Button>
                {loadMoreError ? (
                  <p className="mt-3 text-sm text-caution" role="alert">
                    We couldn&rsquo;t load the next page. Your current stories
                    are still here; you can try again.
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
