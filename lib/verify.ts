import { INGREDIENTS } from "./ingredients";
import { TIMELINE } from "./timeline";
import { REGIONS } from "./regions";

/**
 * Continuous verification of every claim the site sources.
 *
 * The site's only real asset is that each status traces to a government
 * document. That guarantee is worth nothing if nobody re-checks it: a link can
 * rot, an agency can restructure its site, or — the case that actually bit us —
 * a document number can silently redirect to an entirely different document
 * while still returning HTTP 200. A citation for the brominated vegetable oil
 * revocation pointed at a notice about raw honey from Brazil for weeks, and a
 * daily job that only looked for *new* rules sailed past it every morning.
 *
 * So this checks two different things:
 *
 *  1. Reachability — does the URL still resolve?
 *  2. Identity — for Federal Register citations, is the document behind that
 *     number still the document we claim? The published citation ("90 FR 4628")
 *     is embedded in every source label, so it can be compared against what the
 *     API returns. This is the check that catches a silent swap.
 */

export type CheckStatus = "ok" | "changed" | "unreachable" | "blocked";

export interface SourceRef {
  url: string;
  label: string;
  /** Where in the dataset this citation appears, for the report. */
  where: string;
}

export interface CheckResult extends SourceRef {
  status: CheckStatus;
  httpStatus?: number;
  /** Populated when the document is not what we claim. */
  detail?: string;
  /** Federal Register citation we assert, parsed from the label. */
  expected?: string;
  /** Federal Register citation the API actually returns. */
  actual?: string;
}

export interface VerifyReport {
  checkedAt: string;
  total: number;
  ok: number;
  changed: number;
  unreachable: number;
  blocked: number;
  results: CheckResult[];
  /** True when nothing needs a human. */
  healthy: boolean;
}

/**
 * Hosts that answer automated requests with 403 while serving browsers
 * normally. Reported as `blocked`, never as broken — calling a live page dead
 * would be its own kind of wrong.
 */
const BOT_BLOCKED = ["efsa.europa.eu", "federalregister.gov"];

/** Every distinct source URL in the dataset, with where it is used. */
export function collectSources(): SourceRef[] {
  const seen = new Map<string, SourceRef>();
  const add = (url: string, label: string, where: string) => {
    const existing = seen.get(url);
    if (existing) {
      // Same URL cited from several places; keep one row, widen the location.
      if (!existing.where.includes(where.split(" — ")[0])) existing.where += `, ${where}`;
      return;
    }
    seen.set(url, { url, label, where });
  };

  for (const ing of INGREDIENTS) {
    for (const s of ing.us.sources) add(s.url, s.label, `${ing.name} — US`);
    for (const st of ing.states) for (const s of st.sources) add(s.url, s.label, `${ing.name} — ${st.code}`);
    for (const [code, r] of Object.entries(ing.regions))
      for (const s of r.sources) add(s.url, s.label, `${ing.name} — ${code}`);
  }
  for (const e of TIMELINE) for (const s of e.sources) add(s.url, s.label, `Timeline — ${e.date}`);
  for (const r of REGIONS) add(r.sourceUrl, `${r.regulator} register`, `Region — ${r.code}`);

  return [...seen.values()];
}

/** "FDA final rule revoking BVO (89 FR 55040)" -> "89 FR 55040" */
export function citationFromLabel(label: string): string | null {
  const m = label.match(/\((\d{2,3})\s*FR\s*(\d{3,6})\)/i);
  return m ? `${m[1]} FR ${m[2]}` : null;
}

/** ".../documents/2024/07/03/2024-14300/slug" -> "2024-14300" */
export function federalRegisterDocNumber(url: string): string | null {
  const m = url.match(/federalregister\.gov\/documents\/\d{4}\/\d{2}\/\d{2}\/([\w-]+)\//);
  return m ? m[1] : null;
}

interface FrDoc {
  document_number: string;
  title: string;
  citation: string | null;
  publication_date: string;
  effective_on: string | null;
  html_url: string;
}

/**
 * Identity check. Asks the Federal Register API what document actually sits at
 * this number and compares it with the citation we publish.
 */
async function checkFederalRegister(ref: SourceRef, docNumber: string, signal: AbortSignal): Promise<CheckResult> {
  const api =
    `https://www.federalregister.gov/api/v1/documents/${encodeURIComponent(docNumber)}.json?` +
    "fields[]=document_number&fields[]=title&fields[]=citation&fields[]=publication_date&fields[]=effective_on&fields[]=html_url";

  const res = await fetch(api, { signal, headers: { "User-Agent": "food-ban-tracker/verify" } });
  if (res.status === 404) {
    return { ...ref, status: "unreachable", httpStatus: 404, detail: `No Federal Register document ${docNumber}` };
  }
  if (!res.ok) return { ...ref, status: "blocked", httpStatus: res.status, detail: "Federal Register API unavailable" };

  const doc = (await res.json()) as FrDoc;
  const expected = citationFromLabel(ref.label);
  const actual = doc.citation ?? undefined;

  // The check that matters: our published citation against the live document.
  if (expected && actual && expected.replace(/\s+/g, " ") !== actual.replace(/\s+/g, " ")) {
    return {
      ...ref,
      status: "changed",
      httpStatus: 200,
      expected,
      actual,
      detail: `Document ${docNumber} is now "${doc.title.slice(0, 80)}" (${actual}), not ${expected}`,
    };
  }

  return { ...ref, status: "ok", httpStatus: 200, expected: expected ?? undefined, actual };
}

/** Reachability check for everything that is not a Federal Register citation. */
async function checkReachable(ref: SourceRef, signal: AbortSignal): Promise<CheckResult> {
  const res = await fetch(ref.url, {
    signal,
    redirect: "follow",
    headers: {
      // Regulator sites reject unfamiliar agents outright.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,*/*",
    },
  });

  if (res.ok) return { ...ref, status: "ok", httpStatus: res.status };

  const body = await res.text().catch(() => "");
  const host = new URL(ref.url).hostname;
  const wall = botWall(res, body);
  if (wall || ((res.status === 403 || res.status === 429) && BOT_BLOCKED.some((h) => host.endsWith(h)))) {
    return {
      ...ref,
      status: "blocked",
      httpStatus: res.status,
      detail: `Serves browsers, refuses automated checks${wall ? ` (${wall})` : ""}`,
    };
  }
  // Name the page that came back, so a report says what the server actually
  // served rather than a bare status code.
  const title = pageTitle(body);
  const served = title
    ? `"${title}"`
    : `untitled ${body.length}-byte body from ${res.headers.get("server") ?? "unknown server"}`;
  return { ...ref, status: "unreachable", httpStatus: res.status, detail: `HTTP ${res.status} — ${served}` };
}

/**
 * Recognises a CDN's bot wall by what it sends rather than by host, so a
 * regulator moving behind Cloudflare or Akamai is not mistaken for a dead link.
 * A genuine not-found page from the site itself carries none of these marks.
 */
function botWall(res: Response, body: string): string | null {
  if (res.headers.get("cf-mitigated") === "challenge" || /<title>Just a moment\.\.\.<\/title>/i.test(body)) {
    return "Cloudflare challenge";
  }
  if (/errors\.edgesuite\.net/i.test(body) || (/<title>Access Denied<\/title>/i.test(body) && /akamai/i.test(res.headers.get("server") ?? ""))) {
    return "Akamai access denied";
  }
  // fda.gov diverts datacenter traffic (GitHub's runners included) to an empty
  // Akamai NetStorage bucket, which answers a bare "Not found". A page FDA has
  // genuinely removed comes from its own origin, titled "Page Not Found | FDA".
  if (res.status === 404 && /AkamaiNetStorage/i.test(res.headers.get("server") ?? "")) {
    return "Akamai NetStorage diversion";
  }
  return null;
}

function pageTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]{1,120})/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

async function checkOne(ref: SourceRef, timeoutMs: number): Promise<CheckResult> {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    const doc = federalRegisterDocNumber(ref.url);
    return doc ? await checkFederalRegister(ref, doc, signal) : await checkReachable(ref, signal);
  } catch (err) {
    const msg = err instanceof Error ? err.name : "unknown";
    // A timeout is not proof of a dead link; report it as blocked so a slow
    // government site never gets announced as broken.
    return {
      ...ref,
      status: msg === "TimeoutError" ? "blocked" : "unreachable",
      detail: msg === "TimeoutError" ? "Timed out" : "Request failed",
    };
  }
}

export async function verifyAllSources(opts: { concurrency?: number; timeoutMs?: number } = {}): Promise<VerifyReport> {
  const refs = collectSources();
  const concurrency = opts.concurrency ?? 8;
  const timeoutMs = opts.timeoutMs ?? 15_000;

  const results: CheckResult[] = [];
  for (let i = 0; i < refs.length; i += concurrency) {
    const batch = refs.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map((r) => checkOne(r, timeoutMs)))));
  }

  const count = (s: CheckStatus) => results.filter((r) => r.status === s).length;
  const changed = count("changed");
  const unreachable = count("unreachable");

  return {
    checkedAt: new Date().toISOString(),
    total: results.length,
    ok: count("ok"),
    changed,
    unreachable,
    blocked: count("blocked"),
    // Blocked hosts are expected and do not make the dataset unhealthy.
    healthy: changed === 0 && unreachable === 0,
    results: results.sort((a, b) => {
      const rank: Record<CheckStatus, number> = { changed: 0, unreachable: 1, blocked: 2, ok: 3 };
      return rank[a.status] - rank[b.status] || a.where.localeCompare(b.where);
    }),
  };
}
