import Image from "next/image";
import { ArrowUpRight, ImageOff, Store } from "lucide-react";
import type { ProductEvidence } from "@/lib/products";
import { formatShortDate } from "@/lib/utils";

/**
 * Crowd-sourced product listings, presented as weaker evidence than everything
 * else on the site — because that is what they are. The framing is load-bearing
 * and deliberate: a submitted label from some past date is not proof that a
 * named company is selling anything today.
 *
 * The photographs are the point rather than decoration. Each one is the actual
 * front of pack a contributor scanned, which is what makes the listing
 * checkable: a reader can match it against what is in front of them on the
 * shelf. They are CC-BY-SA via Open Food Facts and credited below.
 */
export function ProductEvidencePanel({ evidence, name }: { evidence: ProductEvidence; name: string }) {
  if (evidence.error || evidence.products.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Products whose labels list it
      </h2>

      <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
        Open Food Facts holds{" "}
        <strong className="font-medium text-foreground">
          {evidence.total.toLocaleString("en-GB")} US product records
        </strong>{" "}
        whose submitted label lists {name}. Unlike everything else on this page, this is not a government source — it
        is a public database of label photographs contributed by volunteers.
      </p>
      <p className="measure mt-2.5 text-sm leading-relaxed text-muted-foreground">
        Each card shows when that label was last updated. A listing is{" "}
        <strong className="font-medium text-foreground">not</strong> evidence that the product on sale today still
        contains the additive — recipes change, and an old label proves nothing about a current package. Check the
        ingredients panel on the pack.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {evidence.products.slice(0, 9).map((p) => (
          <li key={p.code}>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/25"
            >
              {/* Fixed aspect box so a missing or odd-shaped photo cannot
                  shift the grid. */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={`Front of pack: ${p.name}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 45vw, 200px"
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageOff className="size-5" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-3">
                <div className="text-xs leading-snug font-medium">{p.name}</div>
                {p.brands && <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.brands}</div>}
                {p.stores && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Store className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="truncate">{p.stores}</span>
                  </div>
                )}
                {p.updated && (
                  <div className="tnum mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground">
                    label {formatShortDate(p.updated)}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <p className="measure mt-4 text-xs leading-relaxed text-muted-foreground">
        {evidence.withStores > 0
          ? `${evidence.withStores} of these records name a retailer; most contributors do not supply one.`
          : "None of these records name a retailer — most contributors do not supply one."}{" "}
        Product data and photographs from{" "}
        <a
          href="https://world.openfoodfacts.org"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border underline-offset-2 hover:text-foreground"
        >
          Open Food Facts
        </a>
        , under the Open Database License; photographs CC-BY-SA.
      </p>
    </section>
  );
}
