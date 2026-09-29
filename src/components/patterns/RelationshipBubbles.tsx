"use client";

import { useState } from "react";
import type { PatternDistribution, PatternCell } from "@/types/patterns";
import { ChartTableToggle } from "./ChartTableToggle";
import { BubbleCluster, type BubbleDatum } from "./BubbleCluster";
import { BubbleListView } from "./BubbleListView";
import { CategoryDetailSheet } from "./CategoryDetailSheet";

/** Compact labels that fit inside bubbles. */
const REL_SHORT: Record<string, string> = {
  family: "Family",
  partner: "Partner",
  friend_acquaintance: "Friend / acq.",
  authority: "Authority",
  stranger: "Stranger",
  online: "Online",
  other: "Other",
  prefer_not: "Prefer not",
};

export function RelationshipBubbles({
  distribution,
  datasetVersion,
  initialSelected,
}: {
  distribution: PatternDistribution;
  datasetVersion: string;
  initialSelected?: string;
}) {
  // Preselect a relationship when deep-linked from a story (?relationship=…),
  // but only if it's a real, displayed category.
  const validInitial =
    initialSelected &&
    distribution.cells.some(
      (c) => c.category === initialSelected && c.display,
    )
      ? initialSelected
      : null;
  const [selected, setSelected] = useState<string | null>(validInitial);

  const data: BubbleDatum[] = distribution.cells
    .filter((c): c is PatternCell => c.display)
    .map((c) => ({
      category: c.category,
      label: c.label,
      shortLabel: REL_SHORT[c.category] ?? c.label,
      countBand: c.countBand,
      scale: c.scale,
    }));

  const selectedLabel =
    distribution.cells.find((c) => c.category === selected)?.label ?? "";

  const footnoteParts = [
    "A submission may include more than one relationship category, so categories may overlap.",
    "Bubble size shows relative scale; figures are ranges, not exact counts.",
  ];
  if (distribution.suppressedCount > 0) {
    footnoteParts.push(
      `${distribution.suppressedCount} group(s) hidden to protect privacy.`,
    );
  }

  return (
    <>
      <ChartTableToggle
        title="By relationship or context"
        note="Select any relationship to see the settings, ages, and experience types reported within it."
        footnote={footnoteParts.join(" ")}
        chart={
          <BubbleCluster
            data={data}
            selected={selected}
            onSelect={setSelected}
          />
        }
        table={
          <BubbleListView
            distribution={distribution}
            selected={selected}
            onSelect={setSelected}
          />
        }
      />
      <CategoryDetailSheet
        key={selected ?? "closed"}
        relationshipValue={selected}
        relationshipLabel={selectedLabel}
        datasetVersion={datasetVersion}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
