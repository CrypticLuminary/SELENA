"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AGE_GROUPS, RELATIONSHIPS, SETTINGS } from "@/data/categories";
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
      <legend className="text-base font-semibold text-ink">{label}</legend>
      {help ? <p className="mt-1 text-sm text-ink-soft">{help}</p> : null}
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
    <div className="space-y-8">
      <p className="text-sm text-ink-soft">
        A few broad questions. There are no exact ages, dates, or locations —
        only wide categories.
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

      <Field
        label="What was the relationship or context?"
        error={errors.relationship?.message}
      >
        <Controller
          control={control}
          name="relationship"
          render={({ field }) => (
            <RadioGroup
              name="relationship"
              options={RELATIONSHIPS}
              value={field.value}
              onChange={field.onChange}
              columns={2}
            />
          )}
        />
      </Field>

      <Field
        label="Where did it happen?"
        error={errors.setting?.message}
      >
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
