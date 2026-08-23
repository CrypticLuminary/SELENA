"use client";

import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/** Where a quick exit sends the visitor — a neutral, unremarkable page. */
const SAFE_URL = "https://www.google.com/search?q=weather";

function leaveNow() {
  try {
    // Replace the current history entry so this page is harder to reach via Back.
    window.location.replace(SAFE_URL);
    // Best-effort: also blank the referrer-visible URL if replace is slow.
    window.location.href = SAFE_URL;
  } catch {
    window.location.href = SAFE_URL;
  }
}

/**
 * Quick Exit — a persistent "Leave this site" control.
 *
 * Note: this reduces the chance a page lingers in Back history, but it cannot
 * remove browsing history, cached pages, or a shared device's records. The
 * Safety page explains this honestly.
 */
export function QuickExit({
  className,
  label = "Leave this site",
}: {
  className?: string;
  label?: string;
}) {
  useEffect(() => {
    // Optional hotkey: Shift+Escape. Chosen over plain Escape so it doesn't
    // collide with closing dialogs/menus, and to avoid accidental exits.
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        leaveNow();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      type="button"
      onClick={leaveNow}
      className={cn(
        "inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-caution/40 bg-caution-soft px-3 py-1.5 text-ui font-semibold text-caution transition-colors hover:bg-caution/15",
        className,
      )}
      title="Quickly leave this site (Shift + Esc)"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
