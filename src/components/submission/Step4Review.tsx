"use client";

import { useFormContext } from "react-hook-form";
import {
  ageGroupLabel,
  experienceTypeLabel,
  relationshipLabel,
  settingLabel,
} from "@/data/categories";
import type {
  AgeGroup,
  ExperienceType,
  Relationship,
  Setting,
} from "@/data/categories";
import type { SubmissionForm } from "@/lib/submission-schema";
import { Callout } from "@/components/ui/callout";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 sm:flex-row sm:justify-between">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}

export function Step4Review() {
  const { getValues } = useFormContext<SubmissionForm>();
  const v = getValues();

  const isPublic = v.publicationChoice === "public";
  const hasText = v.storyText.trim().length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-soft">
        Please review before submitting. You can go back and change anything.
      </p>

      <dl className="rounded-2xl border border-line bg-surface p-5">
        <Row
          label="Age when it happened"
          value={ageGroupLabel(v.ageGroup as AgeGroup)}
        />
        <Row
          label="Relationship"
          value={relationshipLabel(v.relationship as Relationship)}
        />
        <Row label="Setting" value={settingLabel(v.setting as Setting)} />
        <Row
          label="Experience types"
          value={
            v.experienceTypes
              .map((e) => experienceTypeLabel(e as ExperienceType))
              .join(", ") || "—"
          }
        />
        <Row
          label="Sharing"
          value={
            isPublic
              ? "Story shared publicly (after review)"
              : "Statistics only"
          }
        />
        <Row
          label="Story text"
          value={
            isPublic
              ? hasText
                ? `Provided (${v.storyText.trim().length} characters)`
                : "None"
              : "Not shared"
          }
        />
        <div className="pt-3">
          <dt className="text-sm text-ink-faint">Statistics</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">
            {v.consentStatistics || !isPublic
              ? "Broad answers may inform aggregate patterns"
              : "Not included in statistics"}
          </dd>
        </div>
      </dl>

      <Callout tone="info">
        When you submit, you&rsquo;ll receive an anonymous removal code. Save it
        if you might want to request removal later — no account is needed. (In
        this demo build, nothing is stored and the code is illustrative.)
      </Callout>
    </div>
  );
}
