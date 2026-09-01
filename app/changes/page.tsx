import type { Metadata } from "next";
import { TimelineFeed } from "@/components/timeline-feed";
import { TIMELINE } from "@/lib/timeline";

export const metadata: Metadata = {
  title: "What's new",
  description: "Every dated change to the food additive legal record, newest first, with links to primary sources.",
};

export default function ChangesPage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What&apos;s new</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          Changes to the legal record, newest first. A daily job pulls candidate documents from the Federal Register and
          openFDA into a review queue; entries appear here only once a human has confirmed what the document actually
          did.
        </p>
      </header>

      <div className="mt-10 max-w-3xl">
        <TimelineFeed events={TIMELINE} />
      </div>
    </div>
  );
}
