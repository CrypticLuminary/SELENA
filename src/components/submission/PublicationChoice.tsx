"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { SubmissionForm } from "@/lib/submission-schema";
import { RadioGroup } from "@/components/ui/radio-group";
import { FieldError } from "@/components/ui/field-error";
import { Callout } from "@/components/ui/callout";

const OPTIONS = [
  {
    value: "public",
    label: "Share my story publicly",
    hint: "Your story text becomes eligible for privacy screening and moderation. If approved, it may appear anonymously in the archive.",
  },
  {
    value: "statistics_only",
    label: "Contribute to anonymous statistics only",
    hint: "Your story text is not sent on this path. Only your broad answers may inform aggregate patterns.",
  },
];

export function PublicationChoice() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  const choice = watch("publicationChoice");
  const storyText = watch("storyText");
  const publicWithoutStory =
    choice === "public" && (storyText ?? "").trim() === "";

  return (
    <fieldset>
      <legend className="font-serif text-card text-ink">
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

      {/* Don't duplicate the message — the callout below covers the no-story case. */}
      <FieldError
        message={publicWithoutStory ? undefined : errors.publicationChoice?.message}
      />

      {publicWithoutStory ? (
        <div className="mt-4">
          <Callout tone="caution" title="You haven't written a story yet">
            To share a story publicly, there needs to be a story to show. Go back
            to the previous step to add one — or choose{" "}
            <strong>Contribute to anonymous statistics only</strong> above, and
            your broad answers can still help.
          </Callout>
        </div>
      ) : null}
    </fieldset>
  );
}
