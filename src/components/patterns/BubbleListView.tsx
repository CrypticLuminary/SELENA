import { ChevronRight, EyeOff } from "lucide-react";
import type { PatternDistribution } from "@/types/patterns";

/**
 * Accessible, interactive list alternative to the bubble cluster. Shows the
 * band as text (never size-only) and lets keyboard users open the same detail.
 */
export function BubbleListView({
  distribution,
  selected,
  onSelect,
}: {
  distribution: PatternDistribution;
  selected: string | null;
  onSelect: (category: string) => void;
}) {
  return (
    <ul className="divide-y divide-line">
      {distribution.cells.map((cell) => {
        if (!cell.display) {
          return (
            <li
              key={cell.category}
              className="flex items-center gap-2 py-3 text-sm text-ink-faint"
            >
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              {cell.label} — hidden to protect privacy
            </li>
          );
        }
        const isSelected = selected === cell.category;
        return (
          <li key={cell.category}>
            <button
              type="button"
              onClick={() => onSelect(cell.category)}
              aria-pressed={isSelected}
              className={
                "flex w-full items-center gap-4 py-3 text-left transition-colors " +
                (isSelected ? "text-accent" : "text-ink hover:text-accent")
              }
            >
              <span className="w-32 shrink-0 text-sm font-medium">
                {cell.label}
              </span>
              <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-muted sm:block">
                <span
                  className="block h-full rounded-full bg-accent/70"
                  style={{ width: `${(cell.scale / 7) * 100}%` }}
                  aria-hidden="true"
                />
              </span>
              <span className="w-20 shrink-0 text-right text-sm tabular-nums text-ink-soft">
                {cell.countBand}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-faint"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
