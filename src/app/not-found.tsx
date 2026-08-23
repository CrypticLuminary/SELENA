import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-reading flex-col items-center py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        Page not found
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">
        We couldn&rsquo;t find that page.
      </h1>
      <p className="mt-3 text-ink-soft">
        The page may have moved, or the link may be incomplete.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        Return home
      </Link>
    </div>
  );
}
