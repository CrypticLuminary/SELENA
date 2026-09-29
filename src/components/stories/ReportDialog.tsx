"use client";

import { CheckCircle2, Flag } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { reportStory } from "@/lib/api";
import type { ReportReason } from "@/types/submission";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "privacy_concern", label: "Contains identifying or private information" },
  { value: "content_warning", label: "Needs a different content warning" },
  { value: "harmful_content", label: "Contains harmful content" },
  { value: "other", label: "Other" },
];

type Status = "idle" | "sending" | "done" | "error";

export function ReportDialog({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  function close() {
    setOpen(false);
    window.setTimeout(() => {
      setReason(null);
      setStatus("idle");
    }, 250);
  }

  async function submit() {
    if (!reason) return;
    setStatus("sending");
    try {
      await reportStory({ storyId, reason });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report this story
      </button>

      <BottomSheet open={open} onClose={close} title="Report this story">
        {status === "done" ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <p className="mt-4 font-semibold text-ink">Thank you.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Your report has been received for human review.
            </p>
            <Button variant="secondary" className="mt-5" onClick={close}>
              Close
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-soft">
              Reports go to human moderators. To minimize sensitive data, this
              form collects only a broad reason and no free-text note.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">
                What&rsquo;s the issue?
              </p>
              <RadioGroup
                name="report-reason"
                options={REASONS}
                value={reason}
                onChange={(value) => {
                  setReason(value as ReportReason);
                  if (status === "error") setStatus("idle");
                }}
              />
            </div>

            {status === "error" ? (
              <p className="mt-4 text-sm text-caution" role="alert">
                We couldn&rsquo;t confirm the report was received. Please try
                again later.
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={!reason || status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Submit report"}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
