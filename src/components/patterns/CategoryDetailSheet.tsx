"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getCrossBreakdown } from "@/lib/mock-api";
import type { CrossBreakdown } from "@/types/patterns";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Badge } from "@/components/ui/badge";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PatternBars } from "./PatternBars";
import { SuppressedState } from "./SuppressedState";

type Loaded = {
  setting: CrossBreakdown;
  age: CrossBreakdown;
  experience: CrossBreakdown;
};

const SECONDARIES = ["setting", "age", "experience"] as const;

export function CategoryDetailSheet({
  relationshipValue,
  relationshipLabel,
  onClose,
}: {
  relationshipValue: string | null;
  relationshipLabel: string;
  onClose: () => void;
}) {
  const open = relationshipValue !== null;
  const [data, setData] = useState<Loaded | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!relationshipValue) return;
    let active = true;
    setStatus("loading");
    setData(null);
    Promise.all(
      SECONDARIES.map((s) =>
        getCrossBreakdown("relationship", s, relationshipValue),
      ),
    )
      .then(([setting, age, experience]) => {
        if (!active) return;
        setData({ setting, age, experience });
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [relationshipValue, reloadKey]);

  const groupBand = data?.setting.groupBand ?? null;

  return (
    <BottomSheet open={open} onClose={onClose} title={relationshipLabel}>
      {groupBand ? (
        <div className="mb-4">
          <Badge tone="accent">{groupBand} eligible submissions</Badge>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="space-y-6">
          <ChartSkeleton rows={4} />
          <ChartSkeleton rows={5} />
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : data ? (
        <div className="space-y-5">
          {SECONDARIES.map((key) => {
            const cross = data[key];
            if (cross.unavailable) {
              return (
                <div key={key}>
                  <h4 className="mb-2 text-sm font-semibold capitalize text-ink">
                    {key === "experience"
                      ? "Experience types"
                      : key === "age"
                        ? "Age distribution"
                        : "Settings"}
                  </h4>
                  <SuppressedState />
                </div>
              );
            }
            return <PatternBars key={key} distribution={cross.distribution} />;
          })}

          <Link
            href={`/stories?relationship=${relationshipValue}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            onClick={onClose}
          >
            Explore {relationshipLabel.toLowerCase()} stories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </BottomSheet>
  );
}
