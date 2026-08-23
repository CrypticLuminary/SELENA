"use client";

import { useEffect, useState } from "react";
import type { CrossBreakdown } from "@/types/patterns";
import {
  getComparableRelationships,
  getCrossBreakdown,
} from "@/lib/mock-api";
import { PRIVACY_POLICY } from "@/lib/privacy";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { PatternBars } from "./PatternBars";

const SECONDARIES = [
  { value: "age", label: "Age" },
  { value: "setting", label: "Setting" },
  { value: "experience", label: "Experience type" },
] as const;
type Secondary = (typeof SECONDARIES)[number]["value"];

/**
 * Two-dimension explorer. The primary dimension is fixed to Relationship — the
 * one dimension with authored comparisons — and the relationship choices are
 * limited to those that actually have data, so the control never dead-ends.
 * The max-two-dimensions rule is enforced by construction.
 */
export function PatternFilters() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [category, setCategory] = useState<string>("");
  const [secondary, setSecondary] = useState<Secondary>("age");
  const [result, setResult] = useState<CrossBreakdown | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let active = true;
    getComparableRelationships().then((opts) => {
      if (!active) return;
      setOptions(opts);
      setCategory((c) => c || opts[0]?.value || "");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!category) return;
    let active = true;
    setStatus("loading");
    getCrossBreakdown("relationship", secondary, category).then((r) => {
      if (!active) return;
      setResult(r);
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [category, secondary]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h3 className="font-serif text-card text-ink">
        Compare two dimensions
      </h3>
      <p className="mt-2 max-w-xl text-ui text-ink-soft">
        Look within a single relationship to see how it breaks down. Public
        views combine at most {PRIVACY_POLICY.maxDimensions} dimensions — this is
        for understanding broad patterns, not querying the data.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block eyebrow">Explore by relationship</span>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-2 block eyebrow">Compared with</span>
          <Select
            value={secondary}
            onChange={(e) => setSecondary(e.target.value as Secondary)}
          >
            {SECONDARIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="mt-6">
        {status === "loading" || !result ? (
          <ChartSkeleton rows={5} />
        ) : (
          <div>
            {result.groupBand ? (
              <div className="mb-4">
                <Badge tone="accent">
                  {result.primaryLabel}: {result.groupBand} eligible submissions
                </Badge>
              </div>
            ) : null}
            <PatternBars distribution={result.distribution} />
          </div>
        )}
      </div>
    </div>
  );
}
