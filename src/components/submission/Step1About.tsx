"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AGE_GROUPS, SETTINGS } from "@/data/categories";
import type { SubmissionForm } from "@/lib/submission-schema";
import { RadioGroup } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field-error";

function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-serif text-card text-ink">{label}</legend>
      {help ? <p className="mt-1 text-ui text-ink-soft">{help}</p> : null}
      <div className="mt-3">{children}</div>
      <FieldError message={error} />
    </fieldset>
  );
}

export function Step1About() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  return (
    <div className="space-y-10">
      <p className="text-ui text-ink-soft">
        A little broad context to begin with. There are no exact ages, dates, or
        locations here — only wide categories, and you can say &ldquo;prefer not
        to say&rdquo; to anything. You&rsquo;ll describe who was involved on the
        next step.
      </p>

      <Field
        label="How old were you when it happened?"
        error={errors.ageGroup?.message}
      >
        <Controller
          control={control}
          name="ageGroup"
          render={({ field }) => (
            <RadioGroup
              name="ageGroup"
              options={AGE_GROUPS}
              value={field.value}
              onChange={field.onChange}
              columns={2}
            />
          )}
        />
      </Field>

      <Field label="Where did it happen?" error={errors.setting?.message}>
        <Controller
          control={control}
          name="setting"
          render={({ field }) => (
            <RadioGroup
              name="setting"
              options={SETTINGS}
              value={field.value}
              onChange={field.onChange}
              columns={2}
            />
          )}
        />
      </Field>
    </div>
  );
}
