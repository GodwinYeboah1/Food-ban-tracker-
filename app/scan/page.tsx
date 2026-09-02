import type { Metadata } from "next";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { OFF_TAG } from "@/lib/products";

export const metadata: Metadata = {
  title: "Scan a barcode",
  description:
    "Scan a food package with your camera to see which additives on its label are banned, phasing out, restricted or pending in the United States.",
};

export default function ScanPage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Scan a barcode</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          Point your camera at a food package. If Open Food Facts has its label on file, any additive on that label
          the FDA has acted on is listed here with its current federal status and a link to the rule behind it.
        </p>
      </header>

      <div className="mt-8">
        <BarcodeScanner />
      </div>

      <section className="section-gap max-w-2xl">
        <h2 className="text-xl font-semibold tracking-tight">What this can and cannot tell you</h2>
        <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
          Two different kinds of claim meet on this page, and they are not equally strong. That a label{" "}
          <em>lists</em> a substance comes from Open Food Facts — a public database of labels photographed and typed
          up by volunteers. Coverage is patchy, and a label filed in 2023 proves nothing about a 2026 packet, because
          manufacturers reformulate constantly. Read a match as a prompt to check the ingredients panel in front of
          you, not as a finding about the product.
        </p>
        <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
          What each substance&rsquo;s legal status <em>is</em> comes from this site&rsquo;s dataset, where every status
          traces to a Federal Register rule or an agency list. That half is verified twice a day. A flagged product is
          never described as banned: most flagged substances are entirely lawful to sell today, either because a
          compliance date has not yet passed or because the action against them is a state law or a proposal.
        </p>
        <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
          Only {Object.keys(OFF_TAG).length} of the tracked substances have a machine-readable additive code that can
          be matched against a label at all. Animal drugs, processing treatments and flour agents generally leave no
          trace in a barcode lookup, so a clean result means nothing was matched — not that nothing is there.
        </p>
      </section>
    </div>
  );
}
