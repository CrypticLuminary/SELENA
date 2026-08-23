import { Callout } from "@/components/ui/callout";

/**
 * Honest guidance about identifying information. We ask contributors to avoid
 * it, and we say plainly that the browser alone can't guarantee anonymity — a
 * later server-side step screens for identifying details.
 */
export function PIINotice() {
  return (
    <Callout tone="caution" title="Please avoid identifying information">
      <p>
        Try not to include names, addresses, phone numbers, workplace or school
        names, social media handles, or other details that could identify you or
        another person.
      </p>
      <p className="mt-2">
        After you submit, your text is screened for identifying information
        before anything is ever shown publicly. We designed the platform to
        reduce the risk of identifying contributors — we don&rsquo;t claim it is
        impossible.
      </p>
    </Callout>
  );
}
