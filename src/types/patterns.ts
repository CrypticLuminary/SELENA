import type { PatternDimension } from "@/data/categories";

/**
 * Privacy-safe aggregate types.
 *
 * IMPORTANT: the frontend only ever receives ALREADY privacy-processed data.
 * There are NO exact counts in these shapes. A cell carries a coarse count
 * BAND and a relative visual SCALE, or it is suppressed entirely.
 *
 * These shapes are populated only from the server's frozen analytics snapshot
 * endpoints. Suppression and banding decisions are never made by components.
 */

/** Coarse public count bands. Never an exact number. */
export type CountBand =
  | "10–19"
  | "20–49"
  | "50–99"
  | "100–199"
  | "200–499"
  | "500–999"
  | "1,000+";

/** A single displayable aggregate cell. */
export interface PatternCell {
  /** Machine value of the category (e.g. a Relationship / Setting value). */
  category: string;
  /** Human label. */
  label: string;
  /** Coarse published band. Present only when `display` is true. */
  countBand: CountBand;
  /**
   * Relative visual scale 1–7 used to size bars/bubbles. Derived from the band
   * on the server; it does NOT encode an exact count.
   */
  scale: number;
  /** True when this cell passed all privacy thresholds and may be shown. */
  display: true;
}

/** A cell that did not pass privacy thresholds. Carries no size information. */
export interface SuppressedCell {
  category: string;
  label: string;
  display: false;
}

export type MaybeCell = PatternCell | SuppressedCell;

/** A single-dimension distribution (relationship, age, setting, experience). */
export interface PatternDistribution {
  dimension: PatternDimension;
  title: string;
  /** Cells in display order. Suppressed cells are included so the UI can show a privacy state. */
  cells: MaybeCell[];
  /** How many cells were hidden by suppression (for an honest footnote). */
  suppressedCount: number;
  /** True when categories may overlap (e.g. experience types). */
  overlapping?: boolean;
}

/** A predefined two-dimension cross-breakdown (max 2 dimensions, ever). */
export interface CrossBreakdown {
  primary: PatternDimension;
  secondary: PatternDimension;
  primaryCategory: string;
  primaryLabel: string;
  /** The band for the selected primary group as a whole (context for the breakdown). */
  groupBand: CountBand | null;
  /** Secondary distribution within the selected primary group. */
  distribution: PatternDistribution;
  /** True if the whole breakdown is unavailable (group too small / would leak). */
  unavailable: boolean;
}

/**
 * A published aggregate snapshot. Mirrors the production concept: statistics
 * are generated in controlled batches, not in real time.
 */
export interface AggregateSnapshot {
  datasetVersion: string;
  privacyPolicyVersion: string;
  generatedAt: string; // human label, e.g. "Snapshot generated in early 2026"
  /** Coarse total, phrased as submissions (never "N women"). */
  totalSubmissionsLabel: string;
  distributions: {
    relationship: PatternDistribution;
    age: PatternDistribution;
    setting: PatternDistribution;
    experience: PatternDistribution;
  };
}
