"use client";

import { Callout } from "@/components/ui/callout";
import { PublicationChoice } from "./PublicationChoice";
import { ConsentBlock } from "./ConsentBlock";

export function Step3Sharing() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-soft">
        You&rsquo;re in control of what becomes public. You can contribute to the
        patterns without ever sharing any story text.
      </p>

      <PublicationChoice />

      <div>
        <h3 className="text-base font-semibold text-ink">Your consent</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Nothing is shared without your explicit agreement.
        </p>
        <div className="mt-3">
          <ConsentBlock />
        </div>
      </div>

      <Callout tone="privacy">
        You don&rsquo;t need an account, and you didn&rsquo;t provide your name,
        email, phone number, or exact location. There is nowhere in this form to
        enter them.
      </Callout>
    </div>
  );
}
