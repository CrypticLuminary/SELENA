import { Button } from "./button";

export function ErrorState({
  title = "We couldn't load this right now.",
  description = "Something went wrong on our side. Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-12 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
