import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getStories } from "@/lib/mock-api";
import { StoryCard } from "@/components/stories/StoryCard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FadeIn } from "@/components/ui/motion";
import { buttonVariants } from "@/components/ui/button";
import { NOT_PREVALENCE_NOTICE } from "@/lib/privacy";

const PRIVACY_POINTS = [
  {
    title: "What we ask",
    body: "Broad answers only — an age band, a relationship, a setting, and (if you want) your words.",
  },
  {
    title: "What we don't ask",
    body: "No name, email, phone, account, exact age or date, address, or the name of any other person.",
  },
  {
    title: "How patterns are protected",
    body: "Figures are shown as ranges, small groups are hidden, and no exact public counts are ever shown.",
  },
  {
    title: "What you control",
    body: "Whether your story is published, whether it counts toward statistics, and whether to remove it later.",
  },
];

const FLOW = ["Contribute", "Structure", "Review", "Protect", "Aggregate", "Publish"];

export default async function HomePage() {
  const featured = (await getStories({ sort: "featured" })).slice(0, 3);

  return (
    <div className="mx-auto max-w-editorial">
      {/* 01 Hero */}
      <section className="pt-4 sm:pt-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5">A private space for shared experiences</p>
          <h1 className="text-display text-ink">You are not the only one.</h1>
          <p className="mt-7 max-w-xl text-lede text-ink-soft">
            Selena is a place to read experiences shared anonymously, understand
            patterns across submissions, and choose whether you want to
            contribute your own.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/stories" className={buttonVariants({ size: "lg" })}>
              Explore experiences
            </Link>
            <Link
              href="/share"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Share your experience
            </Link>
          </div>
          <p className="mt-6 text-ui text-ink-faint">
            No account needed. Reading comes first — you choose if and when to
            share.
          </p>
        </div>
      </section>

      <div className="mt-section space-y-section">
        {/* 02 What people share */}
        <FadeIn>
          <section aria-labelledby="share-heading">
            <p className="eyebrow mb-3">What people share</p>
            <h2 id="share-heading" className="max-w-2xl text-section text-ink">
              Every experience is different.
            </h2>
            <p className="mt-4 max-w-2xl text-lede text-ink-soft">
              People share what happened, the broad context, and only what they
              are comfortable putting into words — sometimes a full account,
              sometimes a single line.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} />
                </li>
              ))}
            </ul>
            <Link
              href="/stories"
              className="mt-8 inline-flex items-center gap-1 text-ui font-medium text-accent hover:text-accent-deep hover:underline"
            >
              Read more stories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </FadeIn>

        {/* 03 The bigger picture */}
        <FadeIn>
          <section
            aria-labelledby="bigger-heading"
            className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]"
          >
            <div>
              <p className="eyebrow mb-3">From stories to patterns</p>
              <h2 id="bigger-heading" className="text-section text-ink">
                One experience is personal. Many experiences can reveal patterns.
              </h2>
              <p className="mt-4 max-w-xl text-ui leading-relaxed text-ink-soft">
                {NOT_PREVALENCE_NOTICE}
              </p>
              <Link
                href="/patterns"
                className={buttonVariants({ className: "mt-7" })}
              >
                Explore patterns
              </Link>
            </div>
            <div className="flex justify-center" aria-hidden="true">
              <svg viewBox="0 0 260 210" className="h-auto w-full max-w-xs">
                {[
                  { x: 96, y: 100, r: 60 },
                  { x: 190, y: 74, r: 40 },
                  { x: 196, y: 150, r: 30 },
                  { x: 58, y: 172, r: 22 },
                  { x: 44, y: 44, r: 17 },
                ].map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={c.r}
                    fill="#2d5e55"
                    fillOpacity={0.82 - i * 0.12}
                  />
                ))}
              </svg>
            </div>
          </section>
        </FadeIn>

        {/* 04 How it works */}
        <FadeIn>
          <section aria-labelledby="how-heading">
            <p className="eyebrow mb-3">How it works</p>
            <h2 id="how-heading" className="max-w-2xl text-section text-ink">
              You choose what you share, and privacy comes first.
            </h2>
            <div className="mt-10">
              <HowItWorks />
            </div>
          </section>
        </FadeIn>

        {/* 05 Privacy */}
        <FadeIn>
          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className="max-w-2xl text-section text-ink">
              Privacy is part of the design.
            </h2>
            <div className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {PRIVACY_POINTS.map((item) => (
                <div key={item.title} className="border-t border-line-strong pt-5">
                  <h3 className="font-serif text-card text-ink">{item.title}</h3>
                  <p className="mt-2 text-ui leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* 06 Methodology teaser */}
        <FadeIn>
          <section aria-labelledby="method-heading">
            <p className="eyebrow mb-3">Methodology</p>
            <h2 id="method-heading" className="max-w-2xl text-section text-ink">
              How the numbers are produced and protected.
            </h2>
            <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-ui text-ink-soft">
              {FLOW.map((stage, i) => (
                <li key={stage} className="flex items-center gap-2">
                  <span className="rounded-full bg-surface-muted px-3 py-1 font-medium">
                    {stage}
                  </span>
                  {i < FLOW.length - 1 ? (
                    <span className="text-ink-faint" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <Link
              href="/methodology"
              className="mt-6 inline-flex items-center gap-1 text-ui font-medium text-accent hover:text-accent-deep hover:underline"
            >
              Read the methodology
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </FadeIn>

        {/* 07 Safety */}
        <FadeIn>
          <section className="border-t border-line pt-10">
            <p className="max-w-2xl text-ui leading-relaxed text-ink-soft">
              Selena is not an emergency service. If you need immediate help,
              please use local emergency or support resources. Every page has a{" "}
              <span className="font-medium text-caution">Leave this site</span>{" "}
              control, and the{" "}
              <Link
                href="/safety"
                className="font-medium text-accent hover:text-accent-deep hover:underline"
              >
                Safety page
              </Link>{" "}
              explains what this platform can and cannot do.
            </p>
          </section>
        </FadeIn>

        {/* 08 Closing */}
        <FadeIn>
          <section className="border-t border-line pt-section">
            <h2 className="max-w-2xl text-title text-ink">
              However you choose to participate, you are in control.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/stories" className={buttonVariants({ size: "lg" })}>
                Explore experiences
              </Link>
              <Link
                href="/share"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Share an experience
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
