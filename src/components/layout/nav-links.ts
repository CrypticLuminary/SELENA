/**
 * Navigation, grouped by weight. The logo always returns to "/".
 * Primary = the three core modes. Secondary = context/trust pages (kept easy
 * to find — Methodology and Safety are NOT footer-only).
 */
export const PRIMARY_NAV = [
  { href: "/stories", label: "Stories" },
  { href: "/patterns", label: "Patterns" },
  { href: "/share", label: "Share" },
] as const;

export const SECONDARY_NAV = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/safety", label: "Safety" },
] as const;

export type NavItem = { href: string; label: string };

export const NAV_LINKS: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
