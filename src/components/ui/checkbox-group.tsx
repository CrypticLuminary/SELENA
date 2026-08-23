import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Accessible multi-select built on native checkbox inputs. Fully controlled.
 * Note: some option sets (e.g. experience types) may overlap; that's expected.
 */
export function CheckboxGroup({
  options,
  values,
  onChange,
  columns = 1,
  className,
}: {
  options: readonly CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2;
  className?: string;
}) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <label
            key={opt.value}
            className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-3.5 transition-colors hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas"
          >
            <input
              type="checkbox"
              value={opt.value}
              checked={checked}
              onChange={() => toggle(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                checked
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-line-strong bg-surface",
              )}
            >
              {checked ? <Check className="h-3.5 w-3.5" /> : null}
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
