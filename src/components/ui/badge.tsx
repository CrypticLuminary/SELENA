import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "caution";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-soft border-line",
  accent: "bg-accent-soft text-accent border-accent/20",
  caution: "bg-caution-soft text-caution border-caution/25",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
