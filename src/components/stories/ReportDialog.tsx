"use client";

import { Flag, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { reportStory } from "@/lib/mock-api";
import type { ReportReason } from "@/types/submission";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "identifying_info", label: "Contains identifying information" },
  { value: "harmful_graphic", label: "Contains harmful or graphic content" },
  { value: "targets_person", label: "Appears to target a specific person" },
  { value: "hate_abusive", label: "Hate or abusive content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

export function ReportDialog({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  function close() {
    setOpen(false);
    // Reset shortly after close so the closing animation stays clean.
    window.setTimeout(() => {
      setReason(null);
      setNote("");
      setStatus("idle");
    }, 250);
  }

  async function submit() {
    if (!reason) return;
    setStatus("sending");
    try {
      await reportStory({
        storyId,
        reason: reason as ReportReason,
        note: note.trim() || undefined,
      });
      setStatus("done");
    } catch {
      setStatus("idle");
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
              Your report has been received and will be reviewed. (In this demo
              build, nothing is stored.)
            </p>
            <Button variant="secondary" className="mt-5" onClick={close}>
              Close
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-soft">
              Reports go to human moderators. There are no public comments or
              discussion threads here.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">
                What&rsquo;s the issue?
              </p>
              <RadioGroup
                name="report-reason"
                options={REASONS}
                value={reason}
                onChange={setReason}
              />
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Anything else? (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line-strong bg-surface p-3 text-sm text-ink focus-visible:border-accent"
                placeholder="Please avoid including identifying information."
              />
            </label>

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
