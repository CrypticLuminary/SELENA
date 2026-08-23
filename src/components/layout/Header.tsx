"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-links";
import { QuickExit } from "./QuickExit";
import { MobileNav } from "./MobileNav";

function NavLink({
  href,
  label,
  active,
  quiet,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  quiet?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-2.5 py-2 text-ui transition-colors",
        active
          ? "text-accent"
          : quiet
            ? "text-ink-faint hover:text-ink"
            : "text-ink-soft hover:text-ink",
        !quiet && "font-medium",
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-wide items-center justify-between gap-4 px-5 sm:px-8">
        {/* Wordmark → Home */}
        <Link
          href="/"
          className="inline-flex items-baseline gap-1 font-serif text-2xl font-medium tracking-tight text-ink"
          aria-label="Selena — home"
        >
          Selena
          <span
            className="h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-accent"
            aria-hidden="true"
          />
        </Link>

        {/* Desktop nav: primary group · secondary group */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PRIMARY_NAV.map((l) => (
            <NavLink key={l.href} {...l} active={isActive(l.href)} />
          ))}
          <span className="mx-2 h-4 w-px bg-line-strong" aria-hidden="true" />
          {SECONDARY_NAV.map((l) => (
            <NavLink key={l.href} {...l} active={isActive(l.href)} quiet />
          ))}
        </nav>

        {/* Right: Quick Exit (always visible) + mobile toggle */}
        <div className="flex items-center gap-2">
          <QuickExit className="hidden sm:inline-flex" />
          <QuickExit label="Leave" className="px-2.5 sm:hidden" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-muted md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </header>
  );
}
