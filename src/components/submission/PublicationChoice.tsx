"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { SubmissionForm } from "@/lib/submission-schema";
import { RadioGroup } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field-error";

const OPTIONS = [
  {
    value: "public",
    label: "Share my story publicly",
    hint: "Your story text becomes eligible for privacy screening and moderation. If approved, it may appear anonymously in the archive.",
  },
  {
    value: "statistics_only",
    label: "Contribute to anonymous statistics only",
    hint: "No story text is ever shown. Only your broad answers may inform aggregate patterns.",
  },
];

export function PublicationChoice() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  return (
    <fieldset>
      <legend className="text-base font-semibold text-ink">
        How would you like to share?
      </legend>
      <div className="mt-3">
        <Controller
          control={control}
          name="publicationChoice"
          render={({ field }) => (
            <RadioGroup
              name="publicationChoice"
              options={OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <FieldError message={errors.publicationChoice?.message} />
    </fieldset>
  );
}
