import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["About", "What happened", "Sharing", "Review"];

export function WizardProgress({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Submission progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-accent text-accent-contrast",
                  active && "bg-accent/15 text-accent ring-2 ring-accent",
                  !done && !active && "bg-surface-muted text-ink-faint",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-ink" : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  done ? "bg-accent" : "bg-line",
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
