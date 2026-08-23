import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-muted",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Skeleton shaped like a story card. */
export function StoryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 flex gap-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="mt-5 h-6 w-28 rounded-full" />
    </div>
  );
}

/** Skeleton shaped like a bar chart. */
export function ChartSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-28 shrink-0" />
          <Skeleton
            className="h-6"
            style={{ width: `${90 - i * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}
