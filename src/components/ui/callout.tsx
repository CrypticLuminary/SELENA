import { Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "caution" | "privacy";

const config: Record<
  Tone,
  { wrap: string; icon: typeof Info; iconClass: string }
> = {
  info: {
    wrap: "bg-surface-muted border-line text-ink-soft",
    icon: Info,
    iconClass: "text-ink-faint",
  },
  caution: {
    wrap: "bg-caution-soft border-caution/25 text-ink-soft",
    icon: TriangleAlert,
    iconClass: "text-caution",
  },
  privacy: {
    wrap: "bg-accent-soft border-accent/20 text-ink-soft",
    icon: ShieldCheck,
    iconClass: "text-accent",
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { wrap, icon: Icon, iconClass } = config[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", wrap, className)}>
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)}
        aria-hidden="true"
      />
      <div className="text-sm leading-relaxed">
        {title ? (
          <p className="mb-1 font-semibold text-ink">{title}</p>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
