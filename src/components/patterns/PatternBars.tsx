"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PatternDistribution, PatternCell } from "@/types/patterns";
import { ChartTableToggle } from "./ChartTableToggle";
import { DistributionTable } from "./DistributionTable";
import { SuppressedState } from "./SuppressedState";

const BAR_FILL = "#2d5e55"; // --accent
const LABEL_FILL = "#5f625d"; // --ink-soft (band labels — readable)
const AXIS_FILL = "#5f625d"; // --ink-soft (category labels — readable)

function BandTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PatternCell }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const cell = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{cell.label}</p>
      <p className="mt-0.5 text-ink-soft">
        Reported in <span className="font-medium">{cell.countBand}</span>{" "}
        submissions
      </p>
    </div>
  );
}

/**
 * Horizontal ranked bar chart for a distribution (age / setting / experience).
 * Bar length encodes a coarse SCALE (from the count band), never an exact
 * count. The count band is shown as a text label so nothing depends on size.
 * A list/table alternative is always available via the toggle.
 */
export function PatternBars({
  distribution,
  note,
}: {
  distribution: PatternDistribution;
  note?: string;
}) {
  const shown = distribution.cells.filter(
    (c): c is PatternCell => c.display,
  );

  const footnoteParts: string[] = [];
  if (distribution.overlapping) {
    footnoteParts.push(
      "A submission may include more than one experience type, so categories may overlap.",
    );
  }
  if (distribution.suppressedCount > 0) {
    footnoteParts.push(
      `${distribution.suppressedCount} ${
        distribution.suppressedCount === 1 ? "group is" : "groups are"
      } hidden to protect privacy.`,
    );
  }
  footnoteParts.push("Bar length shows relative scale; ranges are labeled.");

  const chartHeight = Math.max(shown.length * 46, 120);

  const chart =
    shown.length === 0 ? (
      <SuppressedState />
    ) : (
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={shown}
            margin={{ top: 4, right: 64, bottom: 4, left: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" domain={[0, 7.6]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={132}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: AXIS_FILL }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
              content={<BandTooltip />}
            />
            <Bar
              dataKey="scale"
              fill={BAR_FILL}
              radius={[4, 4, 4, 4]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="countBand"
                position="right"
                style={{ fontSize: 11, fill: LABEL_FILL, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );

  return (
    <ChartTableToggle
      title={distribution.title}
      note={note}
      footnote={footnoteParts.join(" ")}
      chart={chart}
      table={<DistributionTable distribution={distribution} />}
    />
  );
}
