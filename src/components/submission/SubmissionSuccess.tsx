"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  SUBMISSION_RECEIPT_KEY,
  clearEphemeralSensitiveState,
} from "@/lib/ephemeral";
import type { PublicationChoice } from "@/types/submission";

export interface SubmissionSuccessResult {
  code: string;
  choice: PublicationChoice;
}

function parseStoredResult(raw: string): SubmissionSuccessResult | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object") return null;

    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.code !== "string" ||
      (candidate.choice !== "public" &&
        candidate.choice !== "statistics_only")
    ) {
      return null;
    }

    return {
      code: candidate.code,
      choice: candidate.choice,
    };
  } catch {
    return null;
  }
}

export function SubmissionSuccess({
  initialResult,
}: {
  initialResult?: SubmissionSuccessResult;
}) {
  const [result, setResult] = useState<SubmissionSuccessResult | null>(
    initialResult ?? null,
  );
  const [checkedStorage, setCheckedStorage] = useState(Boolean(initialResult));

  useEffect(() => {
    if (initialResult) return;

    try {
      const raw = sessionStorage.getItem(SUBMISSION_RECEIPT_KEY);
      if (raw) {
        setResult(parseStoredResult(raw));
      }
    } finally {
      clearEphemeralSensitiveState();
      setCheckedStorage(true);
    }
  }, [initialResult]);

  if (!checkedStorage) {
    return (
      <div className="mx-auto max-w-reading py-6 text-center">
        <p className="text-ui text-ink-soft">Loading your confirmation…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-reading py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <CheckCircle2 className="h-7 w-7 text-accent" aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-title text-ink">
        {result ? "Thank you for sharing." : "Submission confirmation"}
      </h1>

      {result ? (
        <p className="mt-4 text-lede text-ink-soft">
          Your contribution has been received.
          {result.choice === "public"
            ? " It will be screened for privacy and reviewed before it could appear publicly."
            : " Your broad answers may help shape privacy-protected patterns."}
        </p>
      ) : (
        <p className="mt-4 text-lede text-ink-soft">
          This page does not have a one-time receipt to display.
        </p>
      )}

      {result?.code ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6 text-left">
          <p className="text-sm font-medium text-ink">
            Your anonymous removal code
          </p>
          <p className="mt-2 select-all font-mono text-2xl font-semibold tracking-wide text-accent">
            {result.code}
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Save this somewhere private if you might want to request removal
            later. No account is needed to use it.
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            For privacy, Selena does not keep a recoverable plaintext copy of
            this code and this page will not show it again after you leave or
            refresh.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <Callout tone="caution">
            If you previously submitted and did not save the one-time removal
            code, this page cannot recover it. Avoid putting a removal code into
            support messages or report forms.
          </Callout>
        </div>
      )}

      <div className="mt-8">
        <Callout tone="privacy">
          If you&rsquo;re looking for support, the{" "}
          <Link href="/safety" className="font-medium text-accent underline">
            Safety page
          </Link>{" "}
          explains what this platform is and isn&rsquo;t for.
        </Callout>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/stories" className={buttonVariants({})}>
          Read other stories
        </Link>
        <Link
          href="/patterns"
          className={buttonVariants({ variant: "secondary" })}
        >
          See the patterns
        </Link>
      </div>
    </div>
  );
}
