"use client";

import { useFormContext } from "react-hook-form";
import {
  ageGroupLabel,
  experienceTypeLabel,
  frequencyLabel,
  involvementLabel,
  personAgeBandLabel,
  personRelationshipCategoryLabel,
  personRelationshipDetailLabel,
  settingLabel,
} from "@/data/categories";
import type { AgeGroup, ExperienceType, Setting } from "@/data/categories";
import type { PersonInvolved } from "@/types/submission";
import type { SubmissionForm } from "@/lib/submission-schema";
import { Callout } from "@/components/ui/callout";

function personLine(p: PersonInvolved): string {
  const rel = p.relationshipDetail
    ? personRelationshipDetailLabel(p.relationshipDetail)
    : p.relationshipCategory
      ? personRelationshipCategoryLabel(p.relationshipCategory)
      : "Someone";
  const parts = [rel];
  if (p.involvement && p.involvement !== "prefer_not") {
    parts.push(involvementLabel(p.involvement));
  }
  if (p.ageBand && p.ageBand !== "prefer_not" && p.ageBand !== "dont_know") {
    parts.push(`age ${personAgeBandLabel(p.ageBand)}`);
  }
  return parts.join(" · ");
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-ui text-ink-faint">{label}</dt>
      <dd className="text-ui font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}

export function Step4Review() {
  const { getValues } = useFormContext<SubmissionForm>();
  const v = getValues();

  const isPublic = v.publicationChoice === "public";
  const paragraphs = v.storyText.split("\n\n").filter((p) => p.trim());

  const people = v.peopleInvolved ?? [];
  const periods = v.periods ?? [];
  const periodText =
    v.frequency === "repeated_period"
      ? periods
          .map((p) => {
            const a = p.startAgeBand ? ageGroupLabel(p.startAgeBand as AgeGroup) : "";
            const b = p.endAgeBand ? ageGroupLabel(p.endAgeBand as AgeGroup) : "";
            if (a && b) return `age ${a}–${b}`;
            if (a) return `from age ${a}`;
            if (b) return `until age ${b}`;
            return "";
          })
          .filter(Boolean)
          .join("; ")
      : "";

  return (
    <div className="space-y-8">
      <p className="text-ui text-ink-soft">
        Please review before submitting. You can go back and change anything.
      </p>

      {/* The survivor's story, shown exactly as written */}
      <section>
        <h3 className="font-serif text-card text-ink">Your story</h3>
        {paragraphs.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-ink-faint">
              Shown exactly as you wrote it — unchanged.
            </p>
            <div className="prose-story mt-3 rounded-2xl border border-line bg-surface p-5">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-1 text-ui text-ink-soft">
            You didn&rsquo;t write a story — that&rsquo;s completely fine. Your
            broad answers can still contribute to the patterns.
          </p>
        )}
      </section>

      {/* Structured context */}
      <section>
        <h3 className="font-serif text-card text-ink">Structured information</h3>
        <p className="mt-1 text-sm text-ink-faint">
          Optional context, kept separate from your story.
        </p>
        <dl className="mt-3 rounded-2xl border border-line bg-surface px-5 py-1">
          <Row
            label="Your age when it happened"
            value={v.ageGroup ? ageGroupLabel(v.ageGroup as AgeGroup) : "—"}
          />
          <Row
            label="Setting"
            value={v.setting ? settingLabel(v.setting as Setting) : "—"}
          />
          <Row
            label="Experience types"
            value={
              v.experienceTypes
                .map((e) => experienceTypeLabel(e as ExperienceType))
                .join(", ") || "—"
            }
          />
          <Row
            label="How often"
            value={
              v.frequency
                ? frequencyLabel(v.frequency) +
                  (periodText ? ` (${periodText})` : "")
                : "—"
            }
          />
          <div className="py-3">
            <dt className="text-ui text-ink-faint">People involved</dt>
            <dd className="mt-1.5">
              {people.length > 0 ? (
                <ul className="space-y-1.5">
                  {people.map((p, i) => (
                    <li key={i} className="text-ui font-medium text-ink">
                      {personLine(p)}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-ui font-medium text-ink">
                  Not provided
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* What will be shared */}
      <Callout tone="privacy" title="What will be shared">
        {isPublic ? (
          <p>
            Your story will be screened for privacy and reviewed before it could
            appear publicly.{" "}
            {v.consentStatistics
              ? "Your broad, structured answers may also inform aggregate patterns."
              : "Your structured answers will not be included in statistics."}
          </p>
        ) : (
          <p>
            No story text will be shown. Only your broad, structured answers may
            inform aggregate patterns.
          </p>
        )}
      </Callout>

      <Callout tone="info">
        When you submit, you&rsquo;ll receive an anonymous removal code. Save it
        if you might want to request removal later — no account is needed. (In
        this demo build, nothing is stored and the code is illustrative.)
      </Callout>
    </div>
  );
}
