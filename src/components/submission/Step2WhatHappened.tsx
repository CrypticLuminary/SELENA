"use client";

import { Controller, useFormContext } from "react-hook-form";
import { EXPERIENCE_TYPES } from "@/data/categories";
import type { SubmissionForm } from "@/lib/submission-schema";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { FieldError } from "@/components/ui/field-error";
import { PIINotice } from "./PIINotice";
import { PeopleInvolved } from "./PeopleInvolved";
import { FrequencySection } from "./FrequencySection";

export function Step2WhatHappened() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  const storyText = watch("storyText");

  return (
    <div className="space-y-12">
      {/* The narrative comes first — it is the survivor's own account. */}
      <div>
        <label htmlFor="storyText" className="font-serif text-card text-ink">
          Your story{" "}
          <span className="align-middle text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
            Optional
          </span>
        </label>
        <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
          In your own words, at your own pace. You can write as much or as
          little as you like — including nothing. Your words are kept exactly as
          you write them; nothing here rewrites or summarizes your story.
        </p>
        <div className="mt-4">
          <PIINotice />
        </div>
        <textarea
          id="storyText"
          {...register("storyText")}
          rows={10}
          className="mt-4 w-full rounded-xl border border-line-strong bg-surface p-4 text-read leading-relaxed text-ink focus-visible:border-accent"
          placeholder="Write here, if and when you're ready…"
        />
        <div className="mt-1 flex items-center justify-between">
          <FieldError message={errors.storyText?.message} />
          <span className="ml-auto text-xs text-ink-faint">
            {storyText?.length ?? 0} characters
          </span>
        </div>
      </div>

      <hr className="border-line" />

      {/* Optional structured context — clearly secondary to the story. */}
      <div>
        <p className="max-w-xl text-ui leading-relaxed text-ink-soft">
          You&rsquo;ve already shared what matters. The questions below are
          optional — they help us understand broader patterns, and you can skip
          any of them.
        </p>
      </div>

      <fieldset>
        <legend className="font-serif text-card text-ink">
          What kind of experience was it?
        </legend>
        <p className="mt-1.5 text-ui text-ink-soft">
          Choose all that apply. It&rsquo;s common for more than one to fit, and
          &ldquo;prefer not to say&rdquo; is always an option.
        </p>
        <div className="mt-3">
          <Controller
            control={control}
            name="experienceTypes"
            render={({ field }) => (
              <CheckboxGroup
                options={EXPERIENCE_TYPES}
                values={field.value}
                onChange={field.onChange}
                columns={2}
              />
            )}
          />
        </div>
        <FieldError message={errors.experienceTypes?.message} />
      </fieldset>

      <PeopleInvolved />

      <FrequencySection />
    </div>
  );
}
