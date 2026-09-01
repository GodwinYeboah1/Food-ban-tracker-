import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  detail,
  href,
  tone = "default",
}: {
  value: number | string;
  label: string;
  detail: string;
  href?: string;
  tone?: "default" | "red" | "amber" | "blue";
}) {
  const toneClass = {
    default: "text-foreground",
    red: "tone-red",
    amber: "tone-amber",
    blue: "tone-blue",
  }[tone];

  const body = (
    <>
      <div
        className={cn("tnum text-4xl font-semibold tracking-tight sm:text-5xl", toneClass)}
        style={tone === "default" ? undefined : { color: "var(--tone)" }}
      >
        {value}
      </div>
      <div className="mt-2 text-sm font-medium">{label}</div>
      {/* Hidden below sm: at a 2-up 390px grid this wraps to five cramped
          lines at ~23ch and reads as noise. The number and label carry it. */}
      <p className="mt-1.5 hidden text-xs leading-relaxed text-muted-foreground sm:block">{detail}</p>
    </>
  );

  const className = cn(
    "rounded-xl border border-border bg-card p-4 sm:p-5",
    href && "transition-colors hover:border-foreground/25 hover:bg-accent/40",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
