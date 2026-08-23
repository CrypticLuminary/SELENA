"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would go to a privacy-conscious error monitor.
    // Never log submission content.
    console.error("Unhandled error:", error?.message);
  }, [error]);

  return (
    <div className="py-16">
      <ErrorState
        title="Something went wrong."
        description="We couldn't display this page right now. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
