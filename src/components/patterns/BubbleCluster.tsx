"use client";

import { useMemo, useState } from "react";

export interface BubbleDatum {
  category: string;
  label: string;
  shortLabel: string;
  countBand: string;
  scale: number;
}

interface Packed extends BubbleDatum {
  x: number;
  y: number;
  r: number;
}

/** Radius from the coarse scale (1–7). Not a count. */
function radiusFor(scale: number): number {
  return 22 + scale * 7;
}

/**
 * Deterministic circle packing: place the largest bubble at the center, then
 * each subsequent bubble at the closest non-overlapping spot on an expanding
 * spiral. Same input → same layout every render (no randomness).
 */
function pack(data: BubbleDatum[]): { circles: Packed[]; view: string } {
  const items = [...data].sort((a, b) => b.scale - a.scale);
  const placed: Packed[] = [];
  const gap = 13; // room for the focus/selection halo ring

  for (const it of items) {
    const r = radiusFor(it.scale);
    if (placed.length === 0) {
      placed.push({ ...it, r, x: 0, y: 0 });
      continue;
    }
    let best: { x: number; y: number } | null = null;
    outer: for (let d = 0; d <= 900; d += 4) {
      const steps = Math.max(8, Math.round((2 * Math.PI * Math.max(d, 1)) / 6));
      for (let s = 0; s < steps; s++) {
        const theta = (s / steps) * Math.PI * 2;
        const x = Math.cos(theta) * d;
        const y = Math.sin(theta) * d;
        let ok = true;
        for (const p of placed) {
          const dist = Math.hypot(x - p.x, y - p.y);
          if (dist < p.r + r + gap) {
            ok = false;
            break;
          }
        }
        if (ok) {
          best = { x, y };
          break outer;
        }
      }
    }
    const pos = best ?? { x: 0, y: 0 };
    placed.push({ ...it, r, x: pos.x, y: pos.y });
  }

  const pad = 8;
  const minX = Math.min(...placed.map((p) => p.x - p.r)) - pad;
  const minY = Math.min(...placed.map((p) => p.y - p.r)) - pad;
  const maxX = Math.max(...placed.map((p) => p.x + p.r)) + pad;
  const maxY = Math.max(...placed.map((p) => p.y + p.r)) + pad;
  const view = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  return { circles: placed, view };
}

const FILL = "#2d5e55"; // --accent
const FILL_SOFT = "#e7efec"; // --accent-soft (text on bubble)
const RING = "#214941"; // --accent-deep — contrasting halo, never equal to FILL

/**
 * Signature relationship visualization. Bubble size shows relative scale;
 * every bubble is keyboard-focusable with a full accessible label, and the
 * exact figure is always a band (never a raw count). The list view (toggled by
 * the parent) is the guaranteed-legible alternative.
 */
export function BubbleCluster({
  data,
  selected,
  onSelect,
}: {
  data: BubbleDatum[];
  selected: string | null;
  onSelect: (category: string) => void;
}) {
  const { circles, view } = useMemo(() => pack(data), [data]);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="w-full">
      <svg
        viewBox={view}
        role="group"
        aria-label="Relationship distribution. Select a bubble to see its breakdown."
        className="h-auto w-full"
        style={{ maxHeight: 460 }}
      >
        {circles.map((c) => {
          const isSelected = selected === c.category;
          const isActive = active === c.category || isSelected;
          const showLabel = c.r >= 30;
          const showBand = c.r >= 40;
          return (
            <g
              key={c.category}
              role="button"
              tabIndex={0}
              aria-label={`${c.label}: ${c.countBand} submissions. Select for details.`}
              aria-pressed={isSelected}
              className="cursor-pointer outline-none"
              onClick={() => onSelect(c.category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(c.category);
                }
              }}
              onMouseEnter={() => setActive(c.category)}
              onMouseLeave={() => setActive((a) => (a === c.category ? null : a))}
              onFocus={() => setActive(c.category)}
              onBlur={() => setActive((a) => (a === c.category ? null : a))}
            >
              {/* Contrasting halo — the visible focus / selection indicator */}
              {isActive || isSelected ? (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={c.r + 6}
                  fill="none"
                  stroke={RING}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeOpacity={isSelected ? 1 : 0.9}
                />
              ) : null}
              <circle
                cx={c.x}
                cy={c.y}
                r={c.r}
                fill={FILL}
                fillOpacity={isActive || isSelected ? 0.96 : 0.82}
                stroke={isSelected ? RING : "none"}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              {showLabel ? (
                <text
                  x={c.x}
                  y={showBand ? c.y - 2 : c.y + 4}
                  textAnchor="middle"
                  fill={FILL_SOFT}
                  style={{ fontSize: Math.min(14, c.r / 3.4), fontWeight: 600 }}
                >
                  {c.shortLabel}
                </text>
              ) : null}
              {showBand ? (
                <text
                  x={c.x}
                  y={c.y + 14}
                  textAnchor="middle"
                  fill={FILL_SOFT}
                  fillOpacity={0.85}
                  style={{ fontSize: Math.min(11, c.r / 4.4) }}
                >
                  {c.countBand}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
