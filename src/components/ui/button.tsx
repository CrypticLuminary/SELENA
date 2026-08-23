import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent/90 shadow-soft",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-muted",
  ghost: "text-ink hover:bg-surface-muted",
  subtle: "bg-surface-muted text-ink hover:bg-line",
  danger:
    "bg-surface text-caution border border-caution/40 hover:bg-caution-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

/** Shared class builder so <Link> can look like a button too. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
