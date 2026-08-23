"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "./nav-links";
import { QuickExit } from "./QuickExit";

export function MobileNav({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  if (!open) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const item = (l: NavItem, quiet?: boolean) => (
    <li key={l.href}>
      <Link
        href={l.href}
        onClick={onClose}
        aria-current={isActive(l.href) ? "page" : undefined}
        className={cn(
          "block rounded-lg px-3 py-3 text-base",
          isActive(l.href)
            ? "bg-accent-soft text-accent"
            : quiet
              ? "text-ink-soft hover:bg-surface-muted"
              : "font-medium text-ink hover:bg-surface-muted",
        )}
      >
        {l.label}
      </Link>
    </li>
  );

  return (
    <div id="mobile-menu" className="border-t border-line bg-canvas md:hidden">
      <nav className="mx-auto max-w-wide px-5 py-3" aria-label="Primary">
        <ul className="flex flex-col">{PRIMARY_NAV.map((l) => item(l))}</ul>
        <div className="my-2 h-px bg-line" aria-hidden="true" />
        <ul className="flex flex-col">
          {SECONDARY_NAV.map((l) => item(l, true))}
        </ul>
        <div className="mt-3 border-t border-line pt-3">
          <QuickExit className="w-full justify-center" />
        </div>
      </nav>
    </div>
  );
}
