"use client";

import { X } from "lucide-react";
import {
  EXPERIENCE_TYPES,
  RELATIONSHIPS,
  SETTINGS,
} from "@/data/categories";
import type {
  ExperienceType,
  Relationship,
  Setting,
} from "@/data/categories";
import type { StoryFilters } from "@/types/story";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SORT_TABS: { value: "recent" | "featured"; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "featured", label: "Featured" },
];

export function StoryControls({
  filters,
  onChange,
}: {
  filters: StoryFilters;
  onChange: (next: StoryFilters) => void;
}) {
  const sort = filters.sort ?? "recent";
  const hasCategoryFilter = Boolean(
    filters.relationship || filters.setting || filters.experienceType,
  );

  function set<K extends keyof StoryFilters>(key: K, value: StoryFilters[K]) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sort tabs */}
        <div
          role="tablist"
          aria-label="Sort stories"
          className="inline-flex rounded-xl bg-surface-muted p-1"
        >
          {SORT_TABS.map((tab) => {
            const active = sort === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => set("sort", tab.value)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-ink shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasCategoryFilter ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                sort: filters.sort,
              })
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Category filters */}
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="sr-only">Filter by category</legend>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Relationship
          </span>
          <Select
            value={filters.relationship ?? ""}
            onChange={(e) =>
              set("relationship", (e.target.value || undefined) as Relationship)
            }
          >
            <option value="">All relationships</option>
            {RELATIONSHIPS.filter((r) => r.value !== "prefer_not").map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Setting
          </span>
          <Select
            value={filters.setting ?? ""}
            onChange={(e) =>
              set("setting", (e.target.value || undefined) as Setting)
            }
          >
            <option value="">All settings</option>
            {SETTINGS.filter((s) => s.value !== "prefer_not").map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Experience
          </span>
          <Select
            value={filters.experienceType ?? ""}
            onChange={(e) =>
              set(
                "experienceType",
                (e.target.value || undefined) as ExperienceType,
              )
            }
          >
            <option value="">All experiences</option>
            {EXPERIENCE_TYPES.filter((x) => x.value !== "prefer_not").map(
              (x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ),
            )}
          </Select>
        </label>
      </fieldset>
    </div>
  );
}
