"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

const RESULT_KEY = "selena_demo_result";

interface Result {
  code: string;
  choice: "public" | "statistics_only";
}

export function SubmissionSuccess() {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (raw) {
        // This one-time effect intentionally synchronizes React with ephemeral
        // browser storage used only by the synthetic demo confirmation flow.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(JSON.parse(raw) as Result);
        sessionStorage.removeItem(RESULT_KEY);
      }
    } catch {
      /* storage unavailable — show the generic confirmation */
    }
  }, []);

  return (
    <div className="mx-auto max-w-reading py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <CheckCircle2 className="h-7 w-7 text-accent" aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-title text-ink">Thank you for sharing.</h1>
      <p className="mt-4 text-lede text-ink-soft">
        Your contribution has been received.
        {result?.choice === "public"
          ? " If you chose to share your story, it will be screened for privacy and reviewed before it could appear."
          : result?.choice === "statistics_only"
            ? " Your broad answers may help shape the patterns others can explore."
            : ""}
      </p>

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
            Demo note: this is an illustrative code. This version does not store
            submissions or operate real deletion infrastructure.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <Callout tone="info">
            In this demo build, nothing is stored. In a full version you would
            receive an anonymous removal code here so you could request removal
            later without an account.
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
