"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Biohazard,
  ChevronDown,
  CircleDashed,
  FlaskConical,
  Nut,
  Search,
  SearchX,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CLASS_META, HAZARD_ICON, hazardCategory, type Recall, type RecallClass } from "@/lib/recalls";
import { cn, formatShortDate } from "@/lib/utils";
import { RelativeTime } from "./relative-time";

const TONE_CLASS: Record<string, string> = {
  red: "tone-red",
  amber: "tone-amber",
  slate: "tone-slate",
  blue: "tone-blue",
};
const HAZARD_ICONS: Record<string, LucideIcon> = { Biohazard, Nut, Wrench, FlaskConical, Tag, CircleDashed };

function HazardIcon({ hazard, className }: { hazard: string; className?: string }) {
  const Icon = HAZARD_ICONS[HAZARD_ICON[hazard] ?? "CircleDashed"] ?? CircleDashed;
  return <Icon className={className ?? "size-3.5"} strokeWidth={1.75} aria-hidden />;
}

const CLASSES: RecallClass[] = ["Class I", "Class II", "Class III"];
// "Not Yet Classified" is deliberately absent from the filter chips: it is a
// handful of records in the whole dataset and would be noise as a control.

function ClassBadge({ classification }: { classification: RecallClass }) {
  const meta = CLASS_META[classification];
  return (
    <span
      className={cn(
        TONE_CLASS[meta.tone],
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
      )}
      style={{ color: "var(--tone)", backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
      title={meta.description}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--tone)" }} aria-hidden />
      {meta.label}
    </span>
  );
}

function RecallCard({ recall }: { recall: Recall }) {
  const [open, setOpen] = useState(false);
  const hazard = hazardCategory(recall.reason);
  // Product descriptions run to several hundred characters of packaging detail.
  const long = recall.product.length > 190;

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ClassBadge classification={recall.classification} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          <HazardIcon hazard={hazard} />
          {hazard}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            recall.status === "Ongoing"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground",
          )}
        >
          {recall.status}
        </span>
        <span className="tnum ml-auto text-xs text-muted-foreground">
          {recall.reportDate ? formatShortDate(recall.reportDate) : "—"}
        </span>
      </div>

      <h3 className="measure mt-3 font-medium">
        <Link href={`/recalls/${encodeURIComponent(recall.slug)}`} className="hover:underline">
          {recall.reason}
        </Link>
      </h3>

      <p className={cn("measure mt-2 text-sm leading-relaxed text-muted-foreground", !open && long && "line-clamp-2")}>
        {recall.product}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:mt-1.5 sm:min-h-8"
        >
          {open ? "Show less" : "Show full product list"}
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
      )}

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Recalling firm</dt>
          <dd className="mt-0.5 font-medium">{recall.firm || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Distribution</dt>
          <dd className="mt-0.5">{recall.distribution || "—"}</dd>
        </div>
        {recall.quantity && (
          <div>
            <dt className="text-muted-foreground">Quantity</dt>
            <dd className="tnum mt-0.5">{recall.quantity}</dd>
          </div>
        )}
        {recall.initiationDate && (
          <div>
            <dt className="text-muted-foreground">Recall initiated</dt>
            <dd className="tnum mt-0.5">
              {formatShortDate(recall.initiationDate)}
              <RelativeTime date={recall.initiationDate} className="ml-1.5 text-muted-foreground" />
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="font-mono text-xs text-muted-foreground">{recall.id || "No recall number"}</span>
        <Link
          href={`/recalls/${encodeURIComponent(recall.slug)}`}
          className="inline-flex min-h-8 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Full record
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

export function RecallList({ recalls }: { recalls: Recall[] }) {
  const [search, setSearch] = useState("");
  const [classes, setClasses] = useState<RecallClass[]>([]);
  const [hazards, setHazards] = useState<string[]>([]);
  const [ongoingOnly, setOngoingOnly] = useState(false);
  const [visible, setVisible] = useState(24);

  const hazardOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of recalls) {
      const h = hazardCategory(r.reason);
      counts.set(h, (counts.get(h) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [recalls]);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return recalls.filter((r) => {
      if (needle) {
        const hay = [r.product, r.reason, r.firm, r.distribution, r.id].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (classes.length && !classes.includes(r.classification)) return false;
      if (hazards.length && !hazards.includes(hazardCategory(r.reason))) return false;
      if (ongoingOnly && r.status !== "Ongoing") return false;
      return true;
    });
  }, [recalls, search, classes, hazards, ongoingOnly]);

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(24);
            }}
            placeholder="Search product, brand, hazard or state…"
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Severity</span>
          {CLASSES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(classes, setClasses, c)}
              aria-pressed={classes.includes(c)}
              className={cn(
                "min-h-11 rounded-full border px-3 text-xs transition-colors sm:min-h-8",
                classes.includes(c)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              title={CLASS_META[c].description}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Hazard</span>
          {hazardOptions.map(([h, n]) => (
            <button
              key={h}
              type="button"
              onClick={() => toggle(hazards, setHazards, h)}
              aria-pressed={hazards.includes(h)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-3 text-xs transition-colors sm:min-h-8",
                hazards.includes(h)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <HazardIcon hazard={h} className="mr-1.5 size-3.5" />
              {h} <span className="tnum ml-1 opacity-60">{n}</span>
            </button>
          ))}
        </div>

        <label className="mt-3 flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground select-none sm:mt-4 sm:min-h-0">
          <input
            type="checkbox"
            checked={ongoingOnly}
            onChange={(e) => setOngoingOnly(e.target.checked)}
            className="size-4.5 rounded border-border accent-foreground"
          />
          Ongoing recalls only
        </label>
      </div>

      <p className="mt-4 text-xs text-muted-foreground" role="status" aria-live="polite">
        {rows.length} of {recalls.length} recalls
      </p>

      <div className="mt-3 space-y-3">
        {rows.slice(0, visible).map((r) => (
          <RecallCard key={r.slug} recall={r} />
        ))}
      </div>

      {rows.length > visible && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + 24)}
          className="mt-4 h-11 w-full rounded-xl border border-border text-sm transition-colors hover:bg-accent"
        >
          Show {Math.min(24, rows.length - visible)} more
        </button>
      )}

      {rows.length === 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-medium">No recalls match those filters</p>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing a filter or searching a different term.</p>
        </div>
      )}
    </div>
  );
}
