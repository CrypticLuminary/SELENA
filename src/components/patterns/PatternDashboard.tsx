"use client";

import { useEffect, useState } from "react";
import { getSnapshot } from "@/lib/api";
import type { AggregateSnapshot } from "@/types/patterns";
import { PrevalenceDisclaimer } from "./PrevalenceDisclaimer";
import { RelationshipBubbles } from "./RelationshipBubbles";
import { PatternBars } from "./PatternBars";
import { PatternFilters } from "./PatternFilters";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export function PatternDashboard({
  initialRelationship,
}: {
  initialRelationship?: string;
}) {
  const [snapshot, setSnapshot] = useState<AggregateSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getSnapshot()
      .then((s) => {
        if (!active) return;
        setSnapshot(s);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [reloadKey]);


  if (status === "error") {
    return (
      <div className="mt-8">
        <ErrorState
          title="We couldn't load these patterns right now."
          onRetry={() => {
            setStatus("loading");
            setReloadKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  if (status === "loading" || !snapshot) {
    return (
      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <ChartSkeleton rows={6} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <ChartSkeleton rows={5} />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <ChartSkeleton rows={5} />
          </div>
        </div>
      </div>
    );
  }

  const { relationship, age, setting, experience } = snapshot.distributions;

  return (
    <div className="mt-8 space-y-8">
      <PrevalenceDisclaimer />

      <p className="text-sm text-ink-soft">
        Based on{" "}
        <span className="font-semibold text-ink">
          {snapshot.totalSubmissionsLabel}
        </span>
        . A person may submit more than once, so this is a count of submissions,
        not of people.
      </p>

      <RelationshipBubbles
        distribution={relationship}
        datasetVersion={snapshot.datasetVersion}
        initialSelected={initialRelationship}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PatternBars distribution={age} />
        <PatternBars distribution={setting} />
      </div>

      <PatternBars distribution={experience} />

      <PatternFilters datasetVersion={snapshot.datasetVersion} />

      <footer className="border-t border-line pt-5 text-xs text-ink-faint">
        <p>
          {snapshot.generatedAt}. Dataset {snapshot.datasetVersion}, privacy
          policy {snapshot.privacyPolicyVersion}. Statistics are generated in
          controlled snapshots, not in real time.
        </p>
      </footer>
    </div>
  );
}
