"use client";

import { BarChart2, List } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps any visualization with an accessible alternative. Every chart in Selena
 * MUST offer a list/table view — information is never conveyed by size or color
 * alone.
 */
export function ChartTableToggle({
  title,
  note,
  footnote,
  chart,
  table,
  defaultView = "chart",
}: {
  title: string;
  note?: string;
  footnote?: string;
  chart: React.ReactNode;
  table: React.ReactNode;
  defaultView?: "chart" | "list";
}) {
  const [view, setView] = useState<"chart" | "list">(defaultView);
  const panelId = useId();

  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-line bg-surface p-5 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {note ? (
            <p className="mt-1 text-sm text-ink-soft">{note}</p>
          ) : null}
        </div>
        <div
          role="group"
          aria-label={`Change view for ${title}`}
          className="inline-flex shrink-0 rounded-lg bg-surface-muted p-0.5"
        >
          <button
            type="button"
            aria-pressed={view === "chart"}
            onClick={() => setView("chart")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "chart"
                ? "bg-surface text-ink shadow-soft"
                : "text-ink-soft hover:text-ink",
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
            Chart
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "list"
                ? "bg-surface text-ink shadow-soft"
                : "text-ink-soft hover:text-ink",
            )}
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            List
          </button>
        </div>
      </div>

      <div id={panelId} className="mt-5">
        {view === "chart" ? chart : table}
      </div>

      {footnote ? (
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
