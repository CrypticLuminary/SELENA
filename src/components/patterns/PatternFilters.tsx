"use client";

import { useEffect, useState } from "react";
import type { CrossBreakdown } from "@/types/patterns";
import {
  getComparableRelationships,
  getCrossBreakdown,
} from "@/lib/api";
import { PRIVACY_POLICY } from "@/lib/privacy";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PatternBars } from "./PatternBars";
import { SuppressedState } from "./SuppressedState";

const SECONDARIES = [
  { value: "age", label: "Age" },
  { value: "setting", label: "Setting" },
  { value: "experience", label: "Experience type" },
] as const;
type Secondary = (typeof SECONDARIES)[number]["value"];
type Status = "loading" | "ready" | "error" | "empty";

/**
 * Two-dimension explorer. The backend accepts only Relationship as the primary
 * and one approved secondary dimension. The frontend never constructs arbitrary
 * analytics queries or decides whether a group is safe to display.
 */
export function PatternFilters({ datasetVersion }: { datasetVersion: string }) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [category, setCategory] = useState("");
  const [secondary, setSecondary] = useState<Secondary>("age");
  const [result, setResult] = useState<CrossBreakdown | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getComparableRelationships(datasetVersion)
      .then((values) => {
        if (!active) return;
        setOptions(values);
        if (values.length === 0) {
          setCategory("");
          setResult(null);
          setStatus("empty");
          return;
        }
        setCategory((current) => current || values[0].value);
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [datasetVersion, reloadKey]);

  useEffect(() => {
    if (!category) return;
    let active = true;

    getCrossBreakdown("relationship", secondary, category, datasetVersion)
      .then((value) => {
        if (!active) return;
        setResult(value);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [category, datasetVersion, secondary, reloadKey]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h3 className="font-serif text-card text-ink">
        Compare two dimensions
      </h3>
      <p className="mt-2 max-w-xl text-ui text-ink-soft">
        Look within one broad relationship category to see a privacy-safe
        breakdown. Public views combine at most{" "}
        {PRIVACY_POLICY.maxDimensions} dimensions, and the backend decides which
        comparisons are safe to display.
      </p>

      {status === "error" ? (
        <div className="mt-6">
          <ErrorState
            title="We couldn't load this comparison right now."
            onRetry={() => {
              setStatus("loading");
              setResult(null);
              setReloadKey((key) => key + 1);
            }}
          />
        </div>
      ) : status === "empty" ? (
        <div className="mt-6">
          <SuppressedState />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block eyebrow">Explore by relationship</span>
              <Select
                value={category}
                disabled={options.length === 0}
                onChange={(event) => {
                  setStatus("loading");
                  setResult(null);
                  setCategory(event.target.value);
                }}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="mb-2 block eyebrow">Compared with</span>
              <Select
                value={secondary}
                onChange={(event) => {
                  setStatus("loading");
                  setResult(null);
                  setSecondary(event.target.value as Secondary);
                }}
              >
                {SECONDARIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="mt-6">
            {status === "loading" || !result ? (
              <ChartSkeleton rows={5} />
            ) : result.unavailable ? (
              <SuppressedState />
            ) : (
              <div>
                {result.groupBand ? (
                  <div className="mb-4">
                    <Badge tone="accent">
                      {result.primaryLabel}: {result.groupBand} eligible
                      submissions
                    </Badge>
                  </div>
                ) : null}
                <PatternBars distribution={result.distribution} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
