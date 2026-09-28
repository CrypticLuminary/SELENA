"use client";

import { useEffect, useState } from "react";
import { getStories } from "@/lib/mock-api";
import type { Story, StoryFilters } from "@/types/story";
import { StoryControls } from "./StoryControls";
import { StoryGrid } from "./StoryGrid";
import { StoryCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

type Status = "loading" | "ready" | "error";

export function StoriesArchive({
  initialFilters = {},
}: {
  initialFilters?: StoryFilters;
}) {
  const [filters, setFilters] = useState<StoryFilters>(initialFilters);
  const [stories, setStories] = useState<Story[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getStories(filters)
      .then((result) => {
        if (!active) return;
        setStories(result);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [filters, reloadKey]);

  return (
    <div className="mt-8">
      <StoryControls
        filters={filters}
        onChange={(next) => {
          setStatus("loading");
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
              setReloadKey((k) => k + 1);
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
              Showing {stories.length}{" "}
              {stories.length === 1 ? "story" : "stories"}.
            </p>
            <StoryGrid stories={stories} />
          </>
        )}
      </div>
    </div>
  );
}
