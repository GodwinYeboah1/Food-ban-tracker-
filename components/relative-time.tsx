"use client";

import { useSyncExternalStore } from "react";
import { relativeToNow } from "@/lib/utils";

/**
 * Relative dates ("in 7 days") read from a clock the server never sees.
 *
 * These pages are statically prerendered, so computing this at build time
 * would bake the phrase into the HTML and let it drift — a compliance
 * deadline still reading "in 7 days" three months later is worse than no
 * label at all.
 *
 * The clock is modelled as an external store rather than effect-driven state:
 * the snapshot is the current minute, so it is stable across renders within
 * a minute, the server snapshot is null (rendering nothing, no hydration
 * mismatch), and the subscription ticks the label forward on its own.
 */
const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

/** Quantised to the minute so repeated renders see an identical snapshot. */
const getSnapshot = () => Math.floor(Date.now() / MINUTE);
const getServerSnapshot = () => null;

export function RelativeTime({ date, className }: { date: string; className?: string }) {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (minute === null) return null;

  const label = relativeToNow(date, minute * MINUTE);
  if (!label) return null;

  return <span className={className}>{label}</span>;
}
