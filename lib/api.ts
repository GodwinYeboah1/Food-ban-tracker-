import { NextResponse } from "next/server";

/**
 * Every response carries CORS headers and a cache hint. The dataset is
 * curated and changes at most daily, so a long shared cache with
 * stale-while-revalidate costs nothing and keeps third-party use cheap.
 */
export function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export function apiError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

/** Parses `?status=banned,restricted` into a validated list. */
export function parseList<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): { values: T[]; invalid: string[] } {
  if (!raw) return { values: [], invalid: [] };
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const values = parts.filter((p): p is T => (allowed as readonly string[]).includes(p));
  const invalid = parts.filter((p) => !(allowed as readonly string[]).includes(p));
  return { values, invalid };
}
