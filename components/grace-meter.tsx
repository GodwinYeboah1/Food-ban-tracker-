import { cn, formatShortDate } from "@/lib/utils";

/**
 * The site's one recurring visual idea: a ban is not a moment, it is a window.
 *
 * The bar measures the grace period between the day a revocation took effect
 * and the day industry must comply. The filled part is time already spent; the
 * remainder is how long the substance may still legally be sold. Both ends are
 * real dates from the rule, so this is a picture of the mechanism rather than
 * a progress bar borrowed to look busy.
 *
 * Urgency drives the tone, so a deadline days away cannot read the same as one
 * two years out.
 */

export type Urgency = "imminent" | "near" | "distant" | "passed";

export function urgencyOf(daysLeft: number): Urgency {
  if (daysLeft <= 0) return "passed";
  if (daysLeft <= 30) return "imminent";
  if (daysLeft <= 180) return "near";
  return "distant";
}

const TONE: Record<Urgency, string> = {
  imminent: "tone-red",
  near: "tone-amber",
  distant: "tone-blue",
  passed: "tone-green",
};

/** "7 days" / "4 months" / "2 years" — the largest honest unit. */
export function countdownLabel(daysLeft: number): { value: string; unit: string } {
  if (daysLeft <= 0) return { value: "0", unit: "days left" };
  if (daysLeft < 45) return { value: String(daysLeft), unit: daysLeft === 1 ? "day left" : "days left" };
  const months = Math.round(daysLeft / 30.44);
  if (months < 24) return { value: String(months), unit: months === 1 ? "month left" : "months left" };
  return { value: String(Math.round(daysLeft / 365.25)), unit: "years left" };
}

export function GraceMeter({
  elapsed,
  from,
  until,
  urgency,
  className,
}: {
  elapsed: number | null;
  from?: string;
  until: string;
  urgency: Urgency;
  className?: string;
}) {
  const pct = elapsed === null ? null : Math.round(elapsed * 100);

  return (
    <div className={cn(TONE[urgency], className)}>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--tone-border)" }}
        role="img"
        aria-label={
          pct === null
            ? `Compliance deadline ${formatShortDate(until)}`
            : `${pct}% of the grace period elapsed, ending ${formatShortDate(until)}`
        }
      >
        {pct !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
            style={{ width: `${pct}%`, backgroundColor: "var(--tone)" }}
          />
        )}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span className="tnum">{from ? formatShortDate(from) : "Revoked"}</span>
        <span className="tnum font-medium" style={{ color: "var(--tone)" }}>
          {formatShortDate(until)}
        </span>
      </div>
    </div>
  );
}
