/**
 * MedConnect — Shared Utility Helpers
 */

/** Combine class names conditionally (falsy values are dropped). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO date string into a short human-readable date, e.g. "18 Aug". */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

/** Format an ISO date string into a full readable date, e.g. "18 August 2026". */
export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

/** Generate a mock Universal Health ID — used only for the frontend demo. */
export function generateHealthId(seed: string): string {
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return `MC-${new Date().getFullYear()}-${String(hash).padStart(6, "0")}`;
}

/** Clamp a number between a min and max value. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
