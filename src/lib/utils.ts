import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Nature-word pool for generated aliases.
 *
 * Aliases must NOT encode location, age, gender, ethnicity, nationality,
 * occupation, or relationship status. Neutral nature words satisfy this.
 */
export const ALIAS_WORDS = [
  "Willow",
  "Cedar",
  "River",
  "Dawn",
  "Maple",
  "Aspen",
  "Wren",
  "Meadow",
  "Fern",
  "Birch",
  "Sky",
  "Rowan",
  "Sage",
  "Laurel",
  "Iris",
  "Heather",
  "Juniper",
  "Marsh",
  "Coral",
  "Ivy",
  "Hazel",
  "Reed",
  "Linden",
  "Cove",
  "Vale",
  "Brook",
  "Ash",
  "Fjord",
  "Dune",
  "Ember",
] as const;

/** Deterministic pick used only for demo alias display. */
export function aliasFromWord(word: string): string {
  return `Anonymous ${word}`;
}

/** Pick a random alias word (used by the mock submit flow). */
export function randomAliasWord(): string {
  return ALIAS_WORDS[Math.floor(Math.random() * ALIAS_WORDS.length)];
}

/**
 * Generate a demo-only removal code, e.g. "WILLOW-4827".
 *
 * This is NOT secure deletion infrastructure — it exists to demonstrate the
 * intended anonymous-removal UX. The real system would issue a server-side,
 * single-use token. The UI must label this clearly as a demo.
 */
export function generateDemoDeletionCode(aliasWord?: string): string {
  const word = (aliasWord ?? randomAliasWord()).toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${digits}`;
}

/** Small helper: simulate network latency for the mock API. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Join category labels into a readable, comma-and-"and" list. */
export function listToSentence(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
