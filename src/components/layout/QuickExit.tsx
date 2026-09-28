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
  } catch {
    // Fallback only if replace is unavailable/fails.
    window.location.assign(SAFE_URL);
  }
}

/**
 * Mount exactly once near the application root. Visible QuickExit buttons are
 * intentionally listener-free so multiple buttons do not register duplicate
 * global keyboard handlers.
 */
export function QuickExitHotkey() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        leaveNow();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
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
