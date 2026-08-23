"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  DEFAULT_SUBMISSION,
  STEP_FIELDS,
  submissionSchema,
  type SubmissionForm,
} from "@/lib/submission-schema";
import type {
  AgeGroup,
  ExperienceType,
  Relationship,
  Setting,
} from "@/data/categories";
import type { PublicationChoice, Submission } from "@/types/submission";
import { submitStory } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { WizardProgress } from "./WizardProgress";
import { Step1About } from "./Step1About";
import { Step2WhatHappened } from "./Step2WhatHappened";
import { Step3Sharing } from "./Step3Sharing";
import { Step4Review } from "./Step4Review";

const RESULT_KEY = "selena_demo_result";

const STEP_TITLES = [
  "Start with what you're comfortable telling us.",
  "Tell us what happened, if you want to.",
  "Choose how your contribution is used.",
  "Review before you submit.",
];

function toSubmission(v: SubmissionForm): Submission {
  return {
    ageGroup: v.ageGroup as AgeGroup,
    relationship: v.relationship as Relationship,
    setting: v.setting as Setting,
    experienceTypes: v.experienceTypes as ExperienceType[],
    storyText: v.storyText,
    publicationChoice: v.publicationChoice as PublicationChoice,
    consentPublish: v.consentPublish,
    consentStatistics: v.consentStatistics,
  };
}

export function SubmissionWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
    defaultValues: DEFAULT_SUBMISSION,
    mode: "onTouched",
  });

  async function goNext() {
    const ok = await methods.trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: SubmissionForm) {
    setSubmitting(true);
    try {
      const result = await submitStory(toSubmission(data));
      try {
        // Ephemeral, per-tab only. Not sensitive story content — just the demo
        // removal code and the chosen path, so the success page can show them.
        sessionStorage.setItem(
          RESULT_KEY,
          JSON.stringify({
            code: result.deletionCode,
            choice: result.publicationChoice,
          }),
        );
      } catch {
        /* sessionStorage may be unavailable; success page handles absence */
      }
      router.push("/share/success");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <Callout tone="privacy" title="You don't need an account">
        You don&rsquo;t need to provide your name, email, phone number, or exact
        location. Please also avoid identifying information about yourself or
        anyone else.
      </Callout>

      <div className="mt-6">
        <WizardProgress current={step} />
      </div>

      <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-10" noValidate>
        <h2 className="mb-7 max-w-xl text-section text-ink">
          {STEP_TITLES[step]}
        </h2>
        <div aria-live="polite">
          {step === 0 ? <Step1About /> : null}
          {step === 1 ? <Step2WhatHappened /> : null}
          {step === 2 ? <Step3Sharing /> : null}
          {step === 3 ? <Step4Review /> : null}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Submitting…" : "Submit anonymously"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
