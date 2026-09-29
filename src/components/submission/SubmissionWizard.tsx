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
import type { AgeGroup, ExperienceType, Setting } from "@/data/categories";
import type {
  Frequency,
  PublicationChoice,
  Submission,
} from "@/types/submission";
import { ApiError, submitStory } from "@/lib/api";
import { SUBMISSION_RECEIPT_KEY } from "@/lib/ephemeral";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  SubmissionSuccess,
  type SubmissionSuccessResult,
} from "./SubmissionSuccess";
import { WizardProgress } from "./WizardProgress";
import { Step1About } from "./Step1About";
import { Step2WhatHappened } from "./Step2WhatHappened";
import { Step3Sharing } from "./Step3Sharing";
import { Step4Review } from "./Step4Review";

const STEP_TITLES = [
  "Start with what you're comfortable telling us.",
  "Tell us what happened, if you want to.",
  "Choose how your contribution is used.",
  "Review before you submit.",
];

type SubmitError = "validation" | "rate_limit" | "uncertain" | null;

function toSubmission(v: SubmissionForm): Submission {
  return {
    ageGroup: v.ageGroup as AgeGroup,
    setting: v.setting as Setting,
    experienceTypes: v.experienceTypes as ExperienceType[],
    peopleInvolved: v.peopleInvolved,
    frequency: v.frequency as Frequency,
    periods: v.periods,
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
  const [submitError, setSubmitError] = useState<SubmitError>(null);
  const [fallbackReceipt, setFallbackReceipt] =
    useState<SubmissionSuccessResult | null>(null);

  const methods = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
    defaultValues: DEFAULT_SUBMISSION,
    mode: "onTouched",
  });

  async function goNext() {
    const ok = await methods.trigger(STEP_FIELDS[step]);
    if (ok) setStep((current) => Math.min(current + 1, 3));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(data: SubmissionForm) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitStory(toSubmission(data));
      const receipt: SubmissionSuccessResult = {
        code: result.removalCode,
        choice: result.publicationChoice,
      };

      try {
        sessionStorage.setItem(
          SUBMISSION_RECEIPT_KEY,
          JSON.stringify(receipt),
        );
        methods.reset(DEFAULT_SUBMISSION);
        router.replace("/share/success");
      } catch {
        // Never navigate away and lose the only plaintext removal credential.
        methods.reset(DEFAULT_SUBMISSION);
        setFallbackReceipt(receipt);
        setSubmitting(false);
      }
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.status === 400) {
        setSubmitError("validation");
      } else if (error instanceof ApiError && error.status === 429) {
        setSubmitError("rate_limit");
      } else {
        // A transport/5xx failure can be ambiguous: the server may have
        // committed before the response was lost. Do not auto-retry a POST.
        setSubmitError("uncertain");
      }
    }
  }

  if (fallbackReceipt) {
    return <SubmissionSuccess initialResult={fallbackReceipt} />;
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

      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mt-10"
        noValidate
      >
        <h2 className="mb-7 max-w-xl text-section text-ink">
          {STEP_TITLES[step]}
        </h2>
        <div aria-live="polite">
          {step === 0 ? <Step1About /> : null}
          {step === 1 ? <Step2WhatHappened /> : null}
          {step === 2 ? <Step3Sharing /> : null}
          {step === 3 ? <Step4Review /> : null}
        </div>

        {submitError === "validation" ? (
          <div className="mt-8" role="alert">
            <Callout tone="caution" title="Please review your answers">
              The server rejected this submission before storing it. Review the
              choices above and try again.
            </Callout>
          </div>
        ) : null}

        {submitError === "rate_limit" ? (
          <div className="mt-8" role="alert">
            <Callout tone="caution" title="Please wait before trying again">
              Too many submissions were received from this connection in a
              short period. Nothing from this attempt was accepted.
            </Callout>
          </div>
        ) : null}

        {submitError === "uncertain" ? (
          <div className="mt-8" role="alert">
            <Callout tone="caution" title="We couldn't confirm what happened">
              We did not retry automatically. The server may have received the
              submission even though the confirmation was lost. Submitting
              again could create a second anonymous contribution.
            </Callout>
          </div>
        ) : null}

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
