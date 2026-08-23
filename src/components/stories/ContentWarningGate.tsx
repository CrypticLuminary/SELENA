"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { warningLabel } from "@/data/categories";
import type { Warning } from "@/data/categories";
import { Button } from "@/components/ui/button";
import { listToSentence } from "@/lib/utils";

/**
 * Gates sensitive story text behind an explicit choice. Story content is NEVER
 * shown automatically — the visitor decides to reveal it.
 */
export function ContentWarningGate({
  warnings,
  children,
}: {
  warnings: Warning[];
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  // A story with no warnings still isn't shown until the reader opts in; this
  // keeps the reading experience consistent and unforced.
  const warningText =
    warnings.length > 0
      ? `This story contains descriptions of ${listToSentence(
          warnings.map((w) => warningLabel(w).toLowerCase()),
        )}.`
      : "This is a first-person account of an unwanted experience.";

  if (revealed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-caution/25 bg-caution-soft/50 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-caution/25 bg-caution-soft">
        <TriangleAlert className="h-5 w-5 text-caution" aria-hidden="true" />
      </div>
      <p className="mt-5 font-serif text-card text-ink">Sensitive content</p>
      <p className="mx-auto mt-3 max-w-md text-ui leading-relaxed text-ink-soft">
        {warningText}
      </p>
      <p className="mx-auto mt-1 max-w-md text-ui text-ink-faint">
        You&rsquo;re in control of whether to read it.
      </p>
      <Button className="mt-6" onClick={() => setRevealed(true)}>
        Read story
      </Button>
    </div>
  );
}
