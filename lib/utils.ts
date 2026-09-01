import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "15 January 2025" — unambiguous across locales, unlike 01/15/2025. */
export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * "in 14 months" / "3 months ago", for compliance countdowns.
 *
 * `now` is a parameter rather than a `Date.now()` call so the function stays
 * pure and safe to call during render. Callers on statically prerendered
 * pages must pass a client-side clock — see components/relative-time.tsx.
 */
export function relativeToNow(iso: string, now: number) {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.round((then - now) / 86_400_000);
  const abs = Math.abs(days);
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 31) return fmt.format(days, "day");
  if (abs < 365) return fmt.format(Math.round(days / 30), "month");
  return fmt.format(Math.round(days / 365), "year");
}
