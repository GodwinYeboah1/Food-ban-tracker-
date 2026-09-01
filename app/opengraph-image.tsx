import { ImageResponse } from "next/og";
import { summaryStats } from "@/lib/ingredients";

export const alt = "Food Ban Tracker — US food additive rules, compared globally";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time rather than shipped as a static asset, so the
 * headline figures in the share card cannot drift away from the dataset.
 * System fonts only — fetching a webfont here would make the build
 * network-dependent for no visual gain at this size.
 */
export default function OpengraphImage() {
  const stats = summaryStats();

  const tile = (value: number | string, label: string, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color, letterSpacing: -2 }}>{value}</div>
      <div style={{ display: "flex", fontSize: 20, color: "#78716c" }}>{label}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: "#1c1917",
              color: "#fafaf9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 700,
            }}
          >
            FB
          </div>
          <div style={{ display: "flex", fontSize: 25, fontWeight: 600, color: "#1c1917" }}>Food Ban Tracker</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#1c1917",
            letterSpacing: -2.5,
            lineHeight: 1.08,
            maxWidth: 940,
          }}
        >
          What the US bans, and what everyone else does instead.
        </div>

        <div style={{ display: "flex", gap: 68, alignItems: "flex-end" }}>
          {tile(stats.tracked, "substances tracked", "#1c1917")}
          {tile(stats.bannedFederally, "banned federally", "#b91c1c")}
          {tile(stats.activeStates, "states acting", "#1d4ed8")}
          {tile(stats.stricterAbroad, "stricter abroad", "#1c1917")}
        </div>
      </div>
    ),
    size,
  );
}
