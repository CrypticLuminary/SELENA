import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Accessible single-select built on native radio inputs (native keyboard
 * behavior: arrow keys move within the group). Fully controlled.
 */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  columns = 1,
  className,
}: {
  name: string;
  options: readonly RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-3.5 transition-colors hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                checked
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-line-strong bg-surface",
              )}
            >
              {checked ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block text-[0.95rem] font-medium text-ink">
                {opt.label}
              </span>
              {opt.hint ? (
                <span className="mt-0.5 block text-sm text-ink-faint">
                  {opt.hint}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
