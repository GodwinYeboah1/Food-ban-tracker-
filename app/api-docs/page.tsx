import type { Metadata } from "next";
import { INGREDIENTS } from "@/lib/ingredients";
import { CATEGORY_META, REGIONS, STATUS_META } from "@/lib/regions";

export const metadata: Metadata = {
  title: "API",
  description: "A free, keyless REST API over the food ban dataset. JSON, CORS-enabled, cached for an hour.",
};

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
  example: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/ingredients",
    description: "List substances with a summary shape. Filterable by region, status, category and free text.",
    params: [
      { name: "region", type: Object.keys(REGIONS).length ? REGIONS.map((r) => r.code).join(" | ") : "", description: "Which regulator's status to return and filter on. Defaults to US." },
      { name: "status", type: "comma-separated", description: `Any of: ${Object.keys(STATUS_META).join(", ")}.` },
      { name: "category", type: "comma-separated", description: `Any of: ${Object.keys(CATEGORY_META).join(", ")}.` },
      { name: "search", type: "string", description: "Matches name, E number, alternative names, summary and example foods." },
      { name: "hasStateAction", type: "boolean", description: "Set to true to return only substances with at least one US state ruling." },
    ],
    example: "/api/ingredients?region=EU&status=banned",
  },
  {
    method: "GET",
    path: "/api/ingredients/:slug",
    description: "One substance in full — every region's ruling, every state ruling, every source link, plus its change history.",
    example: "/api/ingredients/titanium-dioxide",
  },
  {
    method: "GET",
    path: "/api/latest",
    description: "The most recent verified changes to the legal record, newest first.",
    params: [{ name: "limit", type: "1–100", description: "How many changes to return. Defaults to 20." }],
    example: "/api/latest?limit=5",
  },
  {
    method: "GET",
    path: "/api/compare",
    description: "Named substances across named regions, shaped for a side-by-side table.",
    params: [
      { name: "ids", type: "comma-separated slugs", description: "Required. Returns 404 listing any slug it does not recognise." },
      { name: "regions", type: "comma-separated codes", description: "Defaults to all six regions." },
    ],
    example: "/api/compare?ids=red-3,titanium-dioxide&regions=US,EU,UK",
  },
  {
    method: "GET",
    path: "/api/scan/:barcode",
    description:
      "Look up a product by barcode in Open Food Facts and return the tracked additives its label lists. Returns two separate lists: flagged (the US has acted on it) and stricterAbroad (lawful in the US, restricted or banned elsewhere) — never merged, because they are different claims. Label data is crowd-sourced and weaker evidence than the rulings themselves; found: false means the barcode is not in that database, not that the product is clean.",
    params: [
      { name: "barcode", type: "8–14 digits", description: "Path segment. EAN-8 through GTIN-14. Returns 400 if it is not numeric." },
    ],
    example: "/api/scan/3017620422003",
  },
  {
    method: "GET",
    path: "/api/regions",
    description: "The tracked regulators and the status vocabulary, so a client can render labels without hardcoding them.",
    example: "/api/regions",
  },
];

function Method({ method }: { method: string }) {
  return (
    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-400">
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">API</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          The whole dataset over JSON. No key, no signup, CORS open to any origin, cached for an hour at the edge.
          Every record carries <code className="font-mono text-xs">status</code>,{" "}
          <code className="font-mono text-xs">effective_date</code> and{" "}
          <code className="font-mono text-xs">source_url</code> so a consumer can always trace a claim back to the
          government document behind it.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="tnum text-2xl font-semibold">{INGREDIENTS.length}</div>
          <div className="text-xs text-muted-foreground">substances</div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="tnum text-2xl font-semibold">{REGIONS.length}</div>
          <div className="text-xs text-muted-foreground">regions</div>
        </div>
        <a
          href="/api/openapi"
          className="flex items-center rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent"
        >
          OpenAPI 3.1 schema →
        </a>
      </div>

      <div className="mt-10 space-y-4">
        {ENDPOINTS.map((ep) => (
          <section key={ep.path} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-3">
              <Method method={ep.method} />
              <code className="font-mono text-sm font-medium">{ep.path}</code>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{ep.description}</p>

              {ep.params && (
                <dl className="mt-4 space-y-2.5">
                  {ep.params.map((p) => (
                    <div key={p.name} className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
                      <dt className="font-mono text-xs">
                        {p.name}
                        <span className="ml-1.5 font-sans text-muted-foreground">{p.type}</span>
                      </dt>
                      <dd className="text-xs leading-relaxed text-muted-foreground">{p.description}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <a
                href={ep.example}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block overflow-x-auto rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs transition-colors hover:bg-accent"
              >
                <span className="text-muted-foreground">GET </span>
                {ep.example}
              </a>
            </div>
          </section>
        ))}
      </div>

      <section className="section-gap rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Fair use</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          There is no rate limit and no authentication. If you are building something on this, please cache responses
          rather than polling — the underlying data changes at most once a day. If you republish a status, carry the{" "}
          <code className="font-mono text-xs">source_url</code> through with it so your readers can check the primary
          document too.
        </p>
      </section>
    </div>
  );
}
