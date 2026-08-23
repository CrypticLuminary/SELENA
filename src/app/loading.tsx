import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-4 h-5 w-full max-w-reading" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
