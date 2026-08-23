"use client";

import { useFormContext, type UseFormRegisterReturn } from "react-hook-form";
import type { SubmissionForm } from "@/lib/submission-schema";
import { FieldError } from "@/components/ui/field-error";

function CheckRow({
  id,
  register,
  children,
}: {
  id: string;
  register: UseFormRegisterReturn;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-3.5 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#2d5e55]"
        {...register}
      />
      <span className="text-sm text-ink">{children}</span>
    </label>
  );
}

export function ConsentBlock() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SubmissionForm>();

  const choice = watch("publicationChoice");

  if (choice !== "public" && choice !== "statistics_only") {
    return (
      <p className="text-sm text-ink-faint">
        Choose an option above, then confirm your consent here.
      </p>
    );
  }

  const publishLabel =
    choice === "public"
      ? "I understand my story may be shown publicly after privacy screening and review, and I consent to sharing it anonymously."
      : "I understand that no story text will be shown, and I consent to my broad answers contributing to anonymous statistics.";

  return (
    <div className="space-y-3">
      {choice === "public" ? (
        <CheckRow id="consentStatistics" register={register("consentStatistics")}>
          Also include my anonymous, structured answers (age group,
          relationship, setting, experience type) in aggregate statistics.
        </CheckRow>
      ) : null}

      <div>
        <CheckRow id="consentPublish" register={register("consentPublish")}>
          {publishLabel}
        </CheckRow>
        <FieldError message={errors.consentPublish?.message} />
      </div>
    </div>
  );
}
