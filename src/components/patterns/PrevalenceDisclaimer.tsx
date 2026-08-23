import Link from "next/link";
import { Callout } from "@/components/ui/callout";
import { NOT_PREVALENCE_NOTICE } from "@/lib/privacy";

/**
 * The prominent, repeated framing: these figures are submissions to this
 * platform, NOT population-wide prevalence.
 */
export function PrevalenceDisclaimer({
  withMethodologyLink = true,
}: {
  withMethodologyLink?: boolean;
}) {
  return (
    <Callout tone="privacy" title="What these figures are — and aren't">
      <p>{NOT_PREVALENCE_NOTICE}</p>
      {withMethodologyLink ? (
        <p className="mt-2">
          <Link
            href="/methodology"
            className="font-medium text-accent hover:underline"
          >
            Learn about our methodology →
          </Link>
        </p>
      ) : null}
    </Callout>
  );
}
