import Link from "next/link";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-links";
import { QuickExit } from "./QuickExit";

export function Footer() {
  return (
    <footer className="mt-section border-t border-line bg-surface">
      <div className="mx-auto max-w-wide px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="inline-flex items-baseline gap-1 font-serif text-xl font-medium tracking-tight text-ink">
              Selena
              <span
                className="h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-accent"
                aria-hidden="true"
              />
            </div>
            <p className="mt-4 text-ui leading-relaxed text-ink-soft">
              A space for anonymous experiences and the broader patterns they
              reveal. Stories are shared voluntarily; figures reflect
              submissions to this platform, not the general population.
            </p>
            <div className="mt-6">
              <QuickExit />
            </div>
          </div>

          <nav aria-label="Footer" className="flex gap-16">
            <ul className="flex flex-col gap-2.5 text-ui">
              {PRIMARY_NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-2.5 text-ui">
              {SECONDARY_NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
          <p>
            This platform is not an emergency service. If you are in immediate
            danger, contact local emergency services. All stories and figures
            shown here are fictional demonstration content in this version.
          </p>
        </div>
      </div>
    </footer>
  );
}
