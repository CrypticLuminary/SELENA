"use client";

import { Plus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AGE_GROUPS, FREQUENCY_OPTIONS } from "@/data/categories";
import type { SubmissionForm } from "@/lib/submission-schema";
import type { Period } from "@/types/submission";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";

function AgeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-ui text-ink-soft">{label}</span>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select an age range…</option>
        {AGE_GROUPS.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function FrequencySection() {
  const { watch, setValue } = useFormContext<SubmissionForm>();
  const frequency = watch("frequency");
  const periods = watch("periods") ?? [];

  function setFrequency(v: string) {
    setValue("frequency", v as SubmissionForm["frequency"]);
    if (v === "repeated_period" && periods.length === 0) {
      setValue("periods", [{ startAgeBand: "", endAgeBand: "" }]);
    }
  }

  function setPeriods(next: Period[]) {
    setValue("periods", next);
  }

  return (
    <section aria-labelledby="frequency-heading">
      <h3 id="frequency-heading" className="font-serif text-card text-ink">
        Did this happen more than once?{" "}
        <span className="align-middle text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
          Optional
        </span>
      </h3>
      <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
        If it happened repeatedly, you don&rsquo;t need to create a separate
        entry for each time.
      </p>

      <div className="mt-4">
        <RadioGroup
          name="frequency"
          options={FREQUENCY_OPTIONS}
          value={frequency || null}
          onChange={setFrequency}
        />
      </div>

      {frequency === "repeated_period" ? (
        <div className="mt-5 space-y-4">
          <p className="text-ui text-ink-soft">
            When did this period happen? Approximate age ranges are fine — or
            choose &ldquo;Prefer not to say.&rdquo;
          </p>
          {periods.map((period, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
                  Period {i + 1}
                </span>
                {periods.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPeriods(periods.filter((_, idx) => idx !== i))
                    }
                    aria-label={`Remove period ${i + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <AgeSelect
                  label="Started around (your age)"
                  value={period.startAgeBand}
                  onChange={(v) =>
                    setPeriods(
                      periods.map((p, idx) =>
                        idx === i ? { ...p, startAgeBand: v } : p,
                      ),
                    )
                  }
                />
                <AgeSelect
                  label="Ended around (your age)"
                  value={period.endAgeBand}
                  onChange={(v) =>
                    setPeriods(
                      periods.map((p, idx) =>
                        idx === i ? { ...p, endAgeBand: v } : p,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPeriods([...periods, { startAgeBand: "", endAgeBand: "" }])
            }
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-ui font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft/50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another period
          </button>
        </div>
      ) : null}
    </section>
  );
}
