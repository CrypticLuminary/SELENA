import { EyeOff } from "lucide-react";
import { SUPPRESSED_MESSAGE } from "@/lib/privacy";

/** Shown wherever a group or breakdown is hidden by the privacy thresholds. */
export function SuppressedState({
  message = SUPPRESSED_MESSAGE,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "flex items-start gap-3 rounded-xl border border-dashed border-line-strong bg-surface-muted/60 p-4 " +
        (className ?? "")
      }
    >
      <EyeOff
        className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint"
        aria-hidden="true"
      />
      <p className="text-sm text-ink-soft">{message}</p>
    </div>
  );
}
