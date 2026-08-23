"use client";

import { Controller, useFormContext } from "react-hook-form";
import { EXPERIENCE_TYPES } from "@/data/categories";
import type { SubmissionForm } from "@/lib/submission-schema";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { FieldError } from "@/components/ui/field-error";
import { PIINotice } from "./PIINotice";

export function Step2WhatHappened() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  const storyText = watch("storyText");

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-base font-semibold text-ink">
          What kind of experience was it?
        </legend>
        <p className="mt-1 text-sm text-ink-soft">
          Choose all that apply. It&rsquo;s common for more than one to fit.
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

      <div>
        <label htmlFor="storyText" className="text-base font-semibold text-ink">
          Your story{" "}
          <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-ink-soft">
          Only shared publicly if you choose to on the next step. You can write
          as much or as little as you like — or nothing at all.
        </p>
        <div className="mt-3">
          <PIINotice />
        </div>
        <textarea
          id="storyText"
          {...register("storyText")}
          rows={8}
          className="mt-3 w-full rounded-xl border border-line-strong bg-surface p-4 text-[0.95rem] leading-relaxed text-ink focus-visible:border-accent"
          placeholder="In your own words, and at your own pace…"
        />
        <div className="mt-1 flex items-center justify-between">
          <FieldError message={errors.storyText?.message} />
          <span className="ml-auto text-xs text-ink-faint">
            {storyText?.length ?? 0} characters
          </span>
        </div>
      </div>
    </div>
  );
}
