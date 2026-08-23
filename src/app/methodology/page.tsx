import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/callout";
import {
  BAND_EXPLANATION,
  COUNT_BANDS,
  NOT_PREVALENCE_NOTICE,
  PRIVACY_POLICY,
  PRIVACY_SUMMARY_POINTS,
} from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How individual contributions become privacy-safe patterns — collection, structuring, review, privacy protection, aggregation, and publication — and the limits of what the figures mean.",
};

const FLOW = [
  {
    title: "Contribute",
    body: "People share broad, structured answers and — only if they want to — story text. There are no identifying fields anywhere in the form.",
  },
  {
    title: "Structure",
    body: "Answers map to fixed, broad categories: age band, relationship, setting, experience type. Nothing free-form ever enters the statistics.",
  },
  {
    title: "Review",
    body: "Story text is screened for information that could identify someone and reviewed by a person for privacy and safety before anything could be published.",
  },
  {
    title: "Privacy protection",
    body: "Minimum group sizes, count bands, suppression, and inference limits are applied so no single contributor can be singled out from what's shown.",
  },
  {
    title: "Aggregate",
    body: "Consenting structured answers are combined into counts, in controlled snapshots rather than in real time — so no view can be tied to one submission.",
  },
  {
    title: "Publish",
    body: "Only privacy-safe, banded results reach the charts you see. Raw counts never leave the protected layer.",
  },
];

const LIMITATIONS = [
  "Submissions are self-reported and are not independently verified.",
  "One person may submit more than once, so figures count submissions, not people.",
  "Contributors are not a random or representative sample of any population.",
  "Identifying information is minimized, but no platform can promise absolute anonymity.",
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-reading">
      <PageHeader
        eyebrow="The credibility engine"
        title="How contributions become privacy-safe patterns"
        description="This page explains, plainly, how the numbers are produced and protected — and what they cannot tell you."
      />

      <div className="mt-10">
        <Callout tone="privacy" title="These figures are not prevalence">
          {NOT_PREVALENCE_NOTICE}
        </Callout>
      </div>

      {/* Flow diagram */}
      <section aria-labelledby="flow-heading" className="mt-14">
        <h2 id="flow-heading" className="text-section text-ink">
          From a contribution to a pattern
        </h2>
        <ol className="mt-8">
          {FLOW.map((stage, i) => {
            const last = i === FLOW.length - 1;
            return (
              <li key={stage.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent-soft font-serif text-sm font-medium text-accent">
                    {i + 1}
                  </span>
                  {!last ? (
                    <span
                      className="my-1 w-px flex-1 bg-line-strong"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className={last ? "pb-0" : "pb-8"}>
                  <h3 className="font-serif text-card text-ink">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
                    {stage.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Guarantees */}
      <section aria-labelledby="protect-heading" className="mt-14">
        <h2 id="protect-heading" className="text-section text-ink">
          How privacy is protected
        </h2>
        <ul className="mt-5 space-y-2.5">
          {PRIVACY_SUMMARY_POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-ui text-ink-soft">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-serif text-card text-ink">
            Ranges, not exact numbers
          </h3>
          <p className="mt-1.5 text-ui text-ink-soft">{BAND_EXPLANATION}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {COUNT_BANDS.map((band) => (
              <span
                key={band}
                className="rounded-full border border-line bg-surface-muted px-3 py-1 font-mono text-xs text-ink-soft"
              >
                {band}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="font-serif text-card text-ink">
            Protecting against inference
          </h3>
          <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
            Meeting a minimum group size ({PRIVACY_POLICY.minGroupSize}, or{" "}
            {PRIVACY_POLICY.sensitiveGroupSize} for sensitive groups) is not
            enough on its own. If two public results could be subtracted to
            reveal a hidden group — a differencing attack — that combination is
            suppressed or generalized. Public breakdowns combine at most{" "}
            {PRIVACY_POLICY.maxDimensions} dimensions, and only predefined
            combinations are offered. There is no geographic drill-down and no
            exact dates.
          </p>
        </div>
      </section>

      <section aria-labelledby="limits-heading" className="mt-14">
        <h2 id="limits-heading" className="text-section text-ink">
          Important limitations
        </h2>
        <ul className="mt-5 space-y-2.5">
          {LIMITATIONS.map((item) => (
            <li key={item} className="flex gap-3 text-ui text-ink-soft">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-caution"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
