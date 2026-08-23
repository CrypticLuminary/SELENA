import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Selena exists, what it collects and deliberately doesn't, how anonymous sharing and moderation work, and what the statistics do and don't mean.",
};

const COLLECT = [
  "Broad age group when the experience occurred",
  "Broad relationship or context",
  "Broad setting",
  "Experience type(s), from a fixed list",
  "Optional story text, only if you choose to share it",
  "Your publication and statistics choices",
];

const NEVER_COLLECT = [
  "Your name, email, phone, or account",
  "Exact age, birth date, or incident date",
  "Home, workplace, or school names",
  "Exact addresses or locations",
  "Names of any alleged person",
  "Social media handles or usernames",
];

function Movement({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-10">
      <h2 className="text-section text-ink">{title}</h2>
      <div className="prose-selena mt-4">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-reading">
      <p className="eyebrow mb-4">About Selena</p>
      <p className="font-serif text-story text-ink">
        Selena exists because individual experiences are often isolated, while
        the patterns they form can stay invisible.
      </p>
      <p className="prose-selena mt-6 text-lede">
        It is a space to read experiences shared anonymously, to understand the
        broader patterns across submissions, and to choose — carefully, on your
        own terms — whether to contribute your own.
      </p>

      <div className="mt-14 space-y-10">
        <Movement title="Why this exists">
          <p>
            Many people carry experiences they were never able to name out loud
            — from childhood, from work, from public spaces, from relationships
            and families. When people do speak, others often recognize their own
            story in it, sometimes for the first time.
          </p>
          <p>
            Selena holds those experiences with care, and shows, gently and
            honestly, that no one is alone in them. It pairs individual stories
            with privacy-safe patterns so both the human perspective and the
            bigger picture can be seen — without turning anyone&rsquo;s
            experience into a statistic or a spectacle.
          </p>
        </Movement>

        <Movement title="What we collect — and what we don't">
          <p>
            We collect as little as possible. Everything is broad by design;
            there is nowhere in the form to enter identifying details.
          </p>
          <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3 text-ink-faint">What we collect</p>
              <ul className="space-y-2.5">
                {COLLECT.map((item) => (
                  <li key={item} className="flex gap-2.5 text-ui text-ink-soft">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3 text-ink-faint">What we never collect</p>
              <ul className="space-y-2.5">
                {NEVER_COLLECT.map((item) => (
                  <li key={item} className="flex gap-2.5 text-ui text-ink-soft">
                    <X
                      className="mt-0.5 h-4 w-4 shrink-0 text-caution"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Movement>

        <Movement title="How anonymous sharing works">
          <p>
            You don&rsquo;t create an account. When a story is published,
            it&rsquo;s shown under a generated alias like &ldquo;Anonymous
            Willow&rdquo; that encodes nothing about you — not your location,
            age, gender, background, or occupation. You can also contribute to
            the statistics without sharing any story text at all.
          </p>
          <p>
            We designed the platform to reduce the risk of identifying
            contributors. We don&rsquo;t claim anonymity is absolute — no online
            platform can honestly promise that.
          </p>
        </Movement>

        <Movement title="How stories are moderated">
          <p>
            Before any story could appear, it&rsquo;s screened for information
            that might identify someone and reviewed by a person for privacy and
            safety. Automated tools can assist with detecting identifying
            details, categorization, and spam — but people, not algorithms
            alone, make the decisions about sensitive publication.
          </p>
          <p>
            Software is never used to decide whether an account is
            &ldquo;true,&rdquo; whether someone is credible, or whether an
            experience &ldquo;counts.&rdquo; Stories are self-reported and are
            not independently verified.
          </p>
        </Movement>

        <Movement title="What the statistics do — and don't — mean">
          <p>
            Broad, structured answers from consenting submissions are combined
            into aggregate patterns, shown as ranges rather than exact counts,
            with small groups hidden. These figures describe{" "}
            <strong>submissions to this platform</strong>. They are{" "}
            <strong>not</strong> estimates of how common sexual assault is in the
            general population, and a person may submit more than once.
          </p>
          <p>
            The{" "}
            <Link
              href="/methodology"
              className="font-medium text-accent hover:text-accent-deep hover:underline"
            >
              Methodology
            </Link>{" "}
            explains, step by step, how the numbers are produced and protected.
          </p>
        </Movement>
      </div>
    </div>
  );
}
