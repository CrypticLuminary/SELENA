import { cn } from "@/lib/utils";

/** A selectable pill used for filters and controls. */
export function Chip({
  selected = false,
  className,
  type,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type={type ?? "button"}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
        selected
          ? "border-accent bg-accent text-accent-contrast"
          : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted",
        className,
      )}
      {...props}
    />
  );
}
