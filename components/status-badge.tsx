import { Ban, Check, CircleDashed, CircleOff, Timer, TriangleAlert, type LucideIcon } from "lucide-react";
import { STATUS_META } from "@/lib/regions";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  red: "tone-red",
  amber: "tone-amber",
  blue: "tone-blue",
  green: "tone-green",
  slate: "tone-slate",
};

/** Explicit map so only the six icons actually used reach the bundle. */
const ICONS: Record<string, LucideIcon> = { Ban, Check, CircleDashed, CircleOff, Timer, TriangleAlert };

export function StatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: Status;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = ICONS[meta.icon];

  return (
    <span
      className={cn(
        TONE_CLASS[meta.tone],
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
      style={{
        color: "var(--tone)",
        backgroundColor: "var(--tone-bg)",
        borderColor: "var(--tone-border)",
      }}
      title={meta.description}
    >
      {/* A second channel beyond colour, so the six statuses stay distinct
          when scanned quickly or rendered without reliable colour. */}
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={2.25} aria-hidden />
      {meta.label}
    </span>
  );
}

/** A bare glyph, for dense grids where a full badge would not fit. */
export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  const Icon = ICONS[meta.icon];
  return (
    <span className={cn(TONE_CLASS[meta.tone], "inline-flex", className)} style={{ color: "var(--tone)" }}>
      <Icon className="size-3.5" strokeWidth={2.25} aria-label={meta.label} />
    </span>
  );
}
