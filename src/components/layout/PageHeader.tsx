import { cn } from "@/lib/utils";

/** Consistent, calm page title block used across sections. */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("max-w-reading", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h1 className="text-title text-ink">{title}</h1>
      {description ? (
        <p className="mt-4 text-lede text-ink-soft">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
