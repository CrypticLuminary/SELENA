const STEPS = [
  {
    n: "01",
    title: "Share",
    body: "Share what happened, or only broad answers. No account, name, email, or exact location.",
  },
  {
    n: "02",
    title: "Choose",
    body: "Decide whether your story is published or only contributes to the patterns. You stay in control.",
  },
  {
    n: "03",
    title: "Protect",
    body: "Identifying details are minimized, small groups are hidden, and figures are shown as ranges.",
  },
  {
    n: "04",
    title: "Understand",
    body: "Stories give the human perspective; the patterns reveal the bigger picture.",
  },
];

/** Editorial process — large numerals, four moments. Vertical on mobile. */
export function HowItWorks() {
  return (
    <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step) => (
        <li key={step.n} className="border-t border-line-strong pt-5">
          <span
            className="font-serif text-4xl font-medium text-accent"
            aria-hidden="true"
          >
            {step.n}
          </span>
          <h3 className="mt-3 font-serif text-card text-ink">{step.title}</h3>
          <p className="mt-2 text-ui leading-relaxed text-ink-soft">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
