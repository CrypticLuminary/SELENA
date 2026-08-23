import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { QuickExit } from "@/components/layout/QuickExit";

export const metadata: Metadata = {
  title: "Safety & support",
  description:
    "What this platform is and isn't for, how Quick Exit works and its limits, and placeholder support resources. Not an emergency service.",
};

const DOES_NOT = [
  "dispatch help or emergency services",
  "contact the police or authorities on your behalf",
  "provide therapy, counseling, or crisis intervention",
  "monitor anyone, or anyone's situation, in real time",
];

const RESOURCES = [
  {
    title: "Emergency services",
    body: "If you are in immediate danger, contact your local emergency number. Verified local details will be added before launch.",
  },
  {
    title: "Support organizations",
    body: "Organizations offering confidential support for survivors. Verified, region-appropriate resources will be listed here.",
  },
  {
    title: "Someone you trust",
    body: "A friend, family member, or someone you trust can help you decide what feels right. There is no single correct next step.",
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-reading">
      <PageHeader
        eyebrow="Safety & support"
        title="Your safety comes first"
        description="Please read this before sharing or reading — especially if you might be using a shared device."
      />

      <div className="mt-10">
        <Callout
          tone="caution"
          title="If you need immediate help — this is not an emergency service"
        >
          If you are in immediate danger, please contact your local emergency
          services. Selena cannot provide emergency help, crisis intervention, or
          a way to report to authorities.
        </Callout>
      </div>

      <section aria-labelledby="not-heading" className="mt-14">
        <h2 id="not-heading" className="text-section text-ink">
          What Selena does not do
        </h2>
        <p className="prose-selena mt-3">Selena does not:</p>
        <ul className="mt-4 space-y-2.5">
          {DOES_NOT.map((item) => (
            <li key={item} className="flex gap-3 text-ui text-ink-soft">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-caution"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="prose-selena mt-5">
          What it <em>is</em> for: reading experiences shared anonymously,
          understanding broad privacy-safe patterns, and — if you choose —
          contributing your own, at your own pace.
        </p>
      </section>

      <section aria-labelledby="exit-heading" className="mt-14">
        <h2 id="exit-heading" className="text-section text-ink">
          Leaving quickly
        </h2>
        <div className="prose-selena mt-3">
          <p>
            Every page has a <strong>Leave this site</strong> control that takes
            you to a neutral page right away. You can also press{" "}
            <strong>Shift + Esc</strong> at any time.
          </p>
          <p>
            Please know its limits: it cannot erase your browsing history, cached
            pages, or any record kept on a shared or monitored device or network.
            If you&rsquo;re worried about someone seeing this, consider a private
            browsing window or a device only you use.
          </p>
        </div>
        <div className="mt-5">
          <QuickExit />
        </div>
      </section>

      <section aria-labelledby="resources-heading" className="mt-14">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="resources-heading" className="text-section text-ink">
            Where to find support
          </h2>
          <Badge tone="caution">Placeholder — not for real-world use</Badge>
        </div>
        <p className="prose-selena mt-3">
          These are placeholders. Verified, region-appropriate resources will be
          researched and confirmed before this platform is published.
        </p>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {RESOURCES.map((r) => (
            <div key={r.title} className="py-5">
              <h3 className="font-serif text-card text-ink">{r.title}</h3>
              <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
