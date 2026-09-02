import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { LAST_REVIEWED } from "@/lib/timeline";
import { formatDate } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in the deployment; localhost is the dev fallback.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Food Ban Tracker — US food additive rules, compared globally",
    template: "%s · Food Ban Tracker",
  },
  description:
    "Every food additive banned or restricted in the United States at federal and state level, with the same substance's status in the EU, UK, Canada, Australia/NZ and Japan. Every record links to its primary source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">{children}</main>

          <footer className="border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-md">
                  <div className="text-sm font-semibold">Food Ban Tracker</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    An independent reference. Not affiliated with the FDA or any regulator. Every status links to the
                    government document it comes from — check the source before relying on anything here.
                  </p>
                </div>
                <div className="flex gap-10 text-xs sm:gap-14">
                  <div className="space-y-0.5">
                    <div className="mb-1.5 font-medium">Explore</div>
                    <Link href="/database" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Database
                    </Link>
                    <Link href="/scan" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Scan a barcode
                    </Link>
                    <Link href="/foods" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Browse by food
                    </Link>
                    <Link href="/compare" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Compare regions
                    </Link>
                    <Link href="/still-selling" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Still on shelves
                    </Link>
                    <Link href="/recalls" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Recalls
                    </Link>
                    <Link href="/changes" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      What&apos;s new
                    </Link>
                  </div>
                  <div className="space-y-0.5">
                    <div className="mb-1.5 font-medium">Build</div>
                    <Link href="/api-docs" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      API docs
                    </Link>
                    <Link href="/about" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Sources &amp; method
                    </Link>
                    <Link href="/status" className="flex min-h-11 items-center text-muted-foreground hover:text-foreground sm:min-h-8">
                      Source status
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-5 text-xs text-muted-foreground">
                <span>Dataset last reviewed against primary sources on {formatDate(LAST_REVIEWED)}.</span>
                <Link href="/status" className="underline decoration-border underline-offset-2 hover:text-foreground">
                  Every citation is re-checked daily.
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
