"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import { StatusBadge, StatusDot } from "@/components/status-badge";
import { FoodIcon } from "@/components/food-icon";
import { GraceMeter, countdownLabel, urgencyOf } from "@/components/grace-meter";
import { sellingButBannedAbroad, stillSelling } from "@/lib/shelf";
import { categoriesForIngredient } from "@/lib/food-categories";
import { REGIONS, REGION_BY_CODE } from "@/lib/regions";
import type { RegionCode } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

// The whole page is a function of today's date, so it renders from a client
// clock rather than being frozen into the static build.
const HOUR = 3_600_000;
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, HOUR);
  return () => clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / HOUR);
const getServerSnapshot = () => null;

const TONE: Record<string, string> = {
  imminent: "tone-red",
  near: "tone-amber",
  distant: "tone-blue",
  passed: "tone-green",
};

function Skeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}

export default function StillSellingPage() {
  const hour = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = (hour ?? 0) * HOUR;

  const inGracePeriod = hour === null ? [] : stillSelling(now);
  const legalHereNotThere = hour === null ? [] : sellingButBannedAbroad(now);
  const soonest = inGracePeriod[0];

  return (
    <div className="page-top pb-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Banned, and still on the shelf.
        </h1>
        <p className="measure mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
          A ban rarely empties shelves the day it is signed. Regulators set a compliance date, and until it passes the
          substance is entirely lawful to make and sell.
        </p>
        {soonest && (
          <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
            The next window closes in{" "}
            <strong className="font-medium text-foreground">
              {countdownLabel(soonest.shelf.daysLeft ?? 0).value}{" "}
              {countdownLabel(soonest.shelf.daysLeft ?? 0).unit.replace(" left", "")}
            </strong>
            , for {soonest.ing.name}.
          </p>
        )}
      </header>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Inside the grace period</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          The revocation is law. The deadline has not arrived, so stock made before it may still be sold. The bar shows
          how much of each window has already gone.
        </p>

        {hour === null ? (
          <Skeleton />
        ) : inGracePeriod.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nothing is currently inside a federal grace period — every revoked substance has passed its compliance
            date.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {inGracePeriod.map(({ ing, shelf }) => {
              const left = shelf.daysLeft ?? 0;
              const urgency = urgencyOf(left);
              const { value, unit } = countdownLabel(left);
              const aisles = categoriesForIngredient(ing.slug).slice(0, 3);

              return (
                <Link
                  key={ing.slug}
                  href={`/ingredients/${ing.slug}`}
                  className={cn(
                    TONE[urgency],
                    "group flex flex-col rounded-xl border p-5 transition-colors",
                  )}
                  style={{ backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {aisles.map((c) => (
                        <span
                          key={c.slug}
                          className="grid size-7 place-items-center rounded-md"
                          style={{ backgroundColor: "var(--tone-border)", color: "var(--tone)" }}
                          title={c.name}
                        >
                          <FoodIcon name={c.icon} className="size-3.5" />
                        </span>
                      ))}
                    </div>
                    <ArrowRight
                      className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--tone)" }}
                    />
                  </div>

                  {/* The countdown is the point of the card, so it carries the
                      display weight the headings elsewhere on the site do. */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className="tnum text-5xl leading-none font-semibold tracking-tight"
                      style={{ color: "var(--tone)" }}
                    >
                      {value}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--tone)" }}>
                      {unit}
                    </span>
                  </div>

                  <h3 className="mt-3 font-medium">{ing.name}</h3>
                  <p className="measure-ui mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {ing.summary}
                  </p>

                  <GraceMeter
                    elapsed={shelf.elapsed}
                    from={shelf.from}
                    until={shelf.until!}
                    urgency={urgency}
                    className="mt-5"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">On sale here, banned there</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          Lawful to sell in the United States with no restriction, and prohibited outright by at least one peer
          regulator. Each row shows where it stands in all six.
        </p>

        {hour === null ? (
          <Skeleton rows={2} />
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {legalHereNotThere.map(({ ing }) => (
              <li key={ing.slug}>
                <Link
                  href={`/ingredients/${ing.slug}`}
                  className="group flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
                >
                  <div className="min-w-0 lg:flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-medium">{ing.name}</span>
                      <StatusBadge status={ing.us.status} />
                    </div>
                    <p className="measure mt-1.5 text-sm leading-relaxed text-muted-foreground">{ing.summary}</p>
                  </div>

                  {/* Six regulators as a fixed strip: position is constant, so
                      the shape of a row is comparable down the column. */}
                  <div className="flex shrink-0 gap-1.5">
                    {REGIONS.map((r) => {
                      const ruling = r.code === "US" ? ing.us : ing.regions[r.code as Exclude<RegionCode, "US">];
                      const banned = ruling.status === "banned";
                      return (
                        <div
                          key={r.code}
                          className={cn(
                            "flex w-14 flex-col items-center gap-1.5 rounded-lg border px-1 py-2",
                            banned ? "border-transparent" : "border-border",
                          )}
                          style={banned ? { backgroundColor: "var(--status-red-bg)" } : undefined}
                          title={`${r.name}: ${ruling.status}`}
                        >
                          <span className="text-xs font-medium text-muted-foreground">{r.shortName}</span>
                          <StatusDot status={ruling.status} />
                        </div>
                      );
                    })}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {legalHereNotThere.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            {legalHereNotThere.length} substances · banned in{" "}
            {[...new Set(legalHereNotThere.flatMap((r) => r.bannedIn))]
              .map((c) => REGION_BY_CODE[c as RegionCode].shortName)
              .join(", ")}
          </p>
        )}
      </section>

      <section className="section-gap rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">How to read this</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          Everything here derives from compliance dates in the published rules, each linked on the substance&apos;s own
          page. It describes what is <em>lawful</em> to sell, not what any particular shop or brand is stocking. For
          that, check the ingredients panel on the pack — the only current, product-specific source.
        </p>
        <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
          Dates last verified {formatDate("2026-08-31")}.
        </p>
      </section>
    </div>
  );
}
