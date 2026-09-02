"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Aperture,
  Camera,
  CircleCheck,
  Flashlight,
  ImageOff,
  Keyboard,
  Loader2,
  RotateCcw,
  ScanLine,
  Search,
  TriangleAlert,
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";
import type { Source, Status } from "@/lib/types";

/**
 * Camera barcode scanning, answering "what's in this?" for one real product.
 *
 * The result is two claims of different strength stacked on top of each other,
 * and the copy has to keep them apart: that a *label* lists an additive comes
 * from Open Food Facts, a crowd-sourced database of contributor-submitted
 * labels. What that additive's legal *status* is comes from the dataset, which
 * traces to government documents. The first can be out of date the moment a
 * manufacturer reformulates; the second cannot. So this never says a product is
 * banned — only that a submitted label listed a substance the FDA has acted on.
 */

interface FlaggedRow {
  slug: string;
  name: string;
  eNumber: string | null;
  category: string;
  status: Status;
  detail: string;
  whyRestricted: string;
  effectiveDate: string | null;
  sources: Source[];
}

interface StricterAbroadRow {
  slug: string;
  name: string;
  eNumber: string | null;
  usStatus: Status;
  regions: { code: string; status: Status; detail: string }[];
}

interface ScanResponse {
  data: {
    barcode: string;
    found: boolean;
    product: { name: string; brands: string; image?: string } | null;
    flagged: FlaggedRow[];
    stricterAbroad: StricterAbroadRow[];
  };
}

type Phase =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "manual" }
  /** Working through the variants of a deliberately captured still. */
  | { kind: "reading" }
  /** The captured still, kept on screen because nothing decoded from it. */
  | { kind: "captured"; image: string; dark: boolean }
  | { kind: "looking-up"; barcode: string }
  | { kind: "result"; result: ScanResponse["data"] }
  | { kind: "error"; message: string; hint?: string };

interface StillReader {
  decodeFromCanvas: (canvas: HTMLCanvasElement) => { getText: () => string };
}

function canvasOf(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

/** Mean luminance, 0–255. Used to tell someone their photo is simply too dark. */
function brightnessOf(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 255;
  // Sampled on a small thumbnail — reading a megapixel of data to compute one
  // average would stall the main thread for no extra accuracy.
  const small = canvasOf(64, 64);
  small.getContext("2d")?.drawImage(canvas, 0, 0, 64, 64);
  const data = small.getContext("2d")?.getImageData(0, 0, 64, 64).data;
  if (!data) return 255;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return sum / (data.length / 4);
}

/**
 * Alternate renderings of one still, tried in order until something decodes.
 *
 * A single frame gets far more effort than the live loop can afford: a
 * centre-crop recovers a barcode that is small in frame, inversion handles
 * light-on-dark packaging, and the rotation catches a barcode held vertically.
 */
function decodeVariants(reader: StillReader, source: HTMLCanvasElement): string | null {
  const { width: w, height: h } = source;

  const attempt = (canvas: HTMLCanvasElement): string | null => {
    try {
      return reader.decodeFromCanvas(canvas).getText() || null;
    } catch {
      return null; // Not found in this rendering; try the next.
    }
  };

  // 1. The frame as captured.
  let text = attempt(source);
  if (text) return text;

  // 2. The middle band, doubled — where the guide box sits.
  const crop = canvasOf(w, Math.round(h * 0.5));
  crop
    .getContext("2d")
    ?.drawImage(source, 0, Math.round(h * 0.25), w, Math.round(h * 0.5), 0, 0, w, Math.round(h * 0.5));
  text = attempt(crop);
  if (text) return text;

  // 3. Inverted, for pale bars on dark packaging.
  const inverted = canvasOf(w, h);
  const ictx = inverted.getContext("2d", { willReadFrequently: true });
  if (ictx) {
    ictx.drawImage(source, 0, 0);
    const img = ictx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = 255 - img.data[i];
      img.data[i + 1] = 255 - img.data[i + 1];
      img.data[i + 2] = 255 - img.data[i + 2];
    }
    ictx.putImageData(img, 0, 0);
    text = attempt(inverted);
    if (text) return text;
  }

  // 4. Rotated a quarter turn, for a barcode running down the packet.
  const rotated = canvasOf(h, w);
  const rctx = rotated.getContext("2d");
  if (rctx) {
    rctx.translate(h / 2, w / 2);
    rctx.rotate(Math.PI / 2);
    rctx.drawImage(source, -w / 2, -h / 2);
    text = attempt(rotated);
    if (text) return text;
  }

  return null;
}

/**
 * Resolves once the video is actually producing pixels, or after `timeoutMs`.
 *
 * `canplay` is not enough: the element can be playable while still reporting
 * 0×0, and a zero-sized frame is what kills the decode loop.
 */
function waitForVideoReady(video: HTMLVideoElement, timeoutMs: number): Promise<void> {
  if (video.videoWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      clearInterval(poll);
      clearTimeout(timer);
      video.removeEventListener("loadedmetadata", check);
      resolve();
    };
    const check = () => {
      if (video.videoWidth > 0) done();
    };
    // Polled as well as event-driven: `resize`/`loadedmetadata` coverage for
    // camera streams varies between browsers.
    const poll = setInterval(check, 100);
    const timer = setTimeout(done, timeoutMs);
    video.addEventListener("loadedmetadata", check);
  });
}

/** Advice that gets more specific the longer nothing has resolved. */
function guidanceFor(elapsed: number) {
  if (elapsed < 4) return "Line the barcode up inside the frame";
  if (elapsed < 12) return "Hold steady — move closer, or further back";
  return "Try more light, or angle away from glare";
}

/**
 * What the scanner is actually doing, surfaced to the user.
 *
 * Without this the failure mode is silent: the preview looks alive, frames are
 * being decoded and missed, and nothing on screen distinguishes "still trying"
 * from "wedged". `frames` is the honest signal — it only advances when the
 * decoder has genuinely examined a frame.
 */
interface Diagnostics {
  /** Decode attempts completed. Zero after a second or two means trouble. */
  frames: number;
  /** Camera resolution, once the stream reports it. */
  size: string | null;
  /** Seconds since the camera started. */
  elapsed: number;
  /** Seconds since the frame counter last moved. */
  stalledFor: number;
  /** Set when the browser exposes a torch on this camera. */
  torch: boolean;
  torchOn: boolean;
}

const IDLE_DIAGNOSTICS: Diagnostics = {
  frames: 0,
  size: null,
  elapsed: 0,
  stalledFor: 0,
  torch: false,
  torchOn: false,
};

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Held outside state: stopping the camera must not wait on a re-render.
  const controlsRef = useRef<{
    stop: () => void;
    switchTorch?: (on: boolean) => Promise<void>;
  } | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [diag, setDiag] = useState<Diagnostics>(IDLE_DIAGNOSTICS);
  // Counted in a ref and sampled on a timer: a setState per decoded frame
  // would re-render several times a second for no benefit.
  const framesRef = useRef(0);

  // We own the MediaStream rather than letting ZXing manage it, so releasing
  // the camera never depends on the decoder's internal state.
  const streamRef = useRef<MediaStream | null>(null);
  // Kept so a captured still can be decoded with the same tuned hints.
  const readerRef = useRef<StillReader | null>(null);
  // Distinguishes "we asked it to stop" from "ZXing gave up", which reach the
  // same finalize callback but need opposite responses.
  const stoppingRef = useRef(false);

  const stopCamera = useCallback(() => {
    stoppingRef.current = true;
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  // A live camera outliving the page would be a genuine privacy failure, so
  // release it on unmount as well as on every path that leaves the scan state.
  useEffect(() => stopCamera, [stopCamera]);

  const lookUp = useCallback(async (barcode: string) => {
    setPhase({ kind: "looking-up", barcode });
    try {
      const res = await fetch(`/api/scan/${barcode}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setPhase({ kind: "error", message: body?.error ?? `Lookup failed (${res.status})` });
        return;
      }
      const body = (await res.json()) as ScanResponse;
      setPhase({ kind: "result", result: body.data });
    } catch {
      setPhase({ kind: "error", message: "Could not reach the lookup service. Check your connection." });
    }
  }, []);

  /**
   * Entering the scan phase only asks for the camera; the decoder is wired up
   * by the effect below.
   *
   * The distinction is load-bearing. ZXing attaches the stream to the <video>
   * and then waits for `canplay`, and a `display:none` video never fires it —
   * so starting the decoder in this handler, before React had committed the
   * render that reveals the preview, left the stream permanently unattached:
   * granted camera, black box, no frames. An effect runs after the commit, so
   * the element is on screen by the time the decoder touches it.
   */
  const startCamera = useCallback(() => {
    framesRef.current = 0;
    setDiag(IDLE_DIAGNOSTICS);
    setPhase({ kind: "scanning" });
  }, []);

  useEffect(() => {
    if (phase.kind !== "scanning") return;
    let cancelled = false;

    (async () => {
      try {
        // Imported here rather than at module scope so the decoder bundle is
        // fetched only when someone actually scans, not on every page load.
        const { BrowserMultiFormatOneDReader, BarcodeFormat } = await import("@zxing/browser");
        const { DecodeHintType } = await import("@zxing/library");

        // Both hints matter. Without TRY_HARDER the decoder samples only a few
        // rows per frame and misses hand-held barcodes constantly; narrowing
        // the formats to those on retail packaging buys back the cost.
        const hints = new Map<number, unknown>([
          [DecodeHintType.TRY_HARDER, true],
          [
            DecodeHintType.POSSIBLE_FORMATS,
            [
              BarcodeFormat.EAN_13,
              BarcodeFormat.EAN_8,
              BarcodeFormat.UPC_A,
              BarcodeFormat.UPC_E,
              BarcodeFormat.CODE_128,
              BarcodeFormat.ITF,
            ],
          ],
        ]);

        const reader = new BrowserMultiFormatOneDReader(hints as never, {
          // Default is 500ms, which wastes most of the time the user is holding
          // the packet steady. 150ms roughly triples the attempts per second.
          delayBetweenScanAttempts: 150,
        });

        const video = videoRef.current;
        if (!video || cancelled) return;

        // `environment` asks for the rear camera on a phone, which is the one
        // pointed at the packet. Desktops ignore it and use the only camera.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            // A barcode is small in frame; VGA rarely resolves the bars.
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Cancelled while the camera was opening — release it immediately
        // rather than leaving the light on behind a screen nobody is watching.
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play().catch(() => {
          // Autoplay rejection still leaves a usable stream on most browsers;
          // the readiness check below is what decides whether we can decode.
        });

        // The decoder must not see a frame before the video reports a size.
        // ZXing draws the element straight onto a canvas, and drawing a 0×0
        // video throws a DOM error — which its scan loop treats as fatal and
        // shuts down on permanently. This wait is what keeps the loop alive.
        await waitForVideoReady(video, 8000);
        if (cancelled) return;
        if (!video.videoWidth) throw new Error("The camera stream never produced a frame");

        stoppingRef.current = false;
        readerRef.current = reader as unknown as StillReader;

        const handle = (result?: { getText: () => string }) => {
          // Fires per attempt, hit or miss. A miss is normal — but the count
          // is what proves to the user that frames are reaching the decoder.
          framesRef.current += 1;
          if (!result) return;
          stopCamera();
          void lookUp(result.getText());
        };

        // ZXing abandons its loop on any error that is not a decode miss — a
        // dropped frame while the tab is backgrounded is enough. Restart it
        // rather than leaving a live preview that has quietly stopped reading.
        const begin = () => {
          if (cancelled || stoppingRef.current) return;
          controlsRef.current = reader.scan(video, (result) => handle(result), () => {
            if (cancelled || stoppingRef.current) return;
            setTimeout(begin, 250);
          });
        };
        begin();
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        const detail = err instanceof Error ? err.message : String(err);
        if (name === "NotAllowedError") {
          setPhase({
            kind: "error",
            message: "Camera access was denied.",
            hint: "Allow camera access for this site in your browser settings, then try again.",
          });
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setPhase({
            kind: "error",
            message: "No usable camera was found on this device.",
            hint: "You can enter the digits printed under the barcode instead.",
          });
        } else {
          // Anything else is unexpected, so show what actually failed rather
          // than a guess — a generic message here cost real debugging time.
          setPhase({
            kind: "error",
            message: "The camera could not be started.",
            hint: `${detail || "Unknown error"}. Camera access also needs a secure connection (https, or localhost).`,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // Keyed on the phase kind only: re-running whenever the phase object
    // changes identity would tear the camera down mid-scan.
  }, [phase.kind, lookUp, stopCamera]);

  const reset = useCallback(() => {
    stopCamera();
    setPhase({ kind: "idle" });
    setDiag(IDLE_DIAGNOSTICS);
  }, [stopCamera]);

  /**
   * Freeze one frame and work on it properly.
   *
   * The live loop has to stay cheap enough to run continuously, so it gets one
   * pass at whatever happens to be in front of the lens. A still costs nothing
   * to labour over: four renderings, full resolution, and — when it still will
   * not read — the photo stays on screen so the focus and glare are visible
   * rather than guessed at.
   */
  const capture = useCallback(async () => {
    const video = videoRef.current;
    const reader = readerRef.current;
    if (!video || !reader || !video.videoWidth) return;

    const shot = canvasOf(video.videoWidth, video.videoHeight);
    shot.getContext("2d", { willReadFrequently: true })?.drawImage(video, 0, 0);
    stopCamera();
    setPhase({ kind: "reading" });

    // Yields a frame so the "Reading" state paints before the decode blocks.
    await new Promise((r) => setTimeout(r, 0));

    const text = decodeVariants(reader, shot);
    if (text) {
      void lookUp(text);
      return;
    }
    setPhase({
      kind: "captured",
      image: shot.toDataURL("image/jpeg", 0.75),
      dark: brightnessOf(shot) < 60,
    });
  }, [lookUp, stopCamera]);

  const toggleTorch = useCallback(async () => {
    const next = !diag.torchOn;
    try {
      await controlsRef.current?.switchTorch?.(next);
      setDiag((d) => ({ ...d, torchOn: next }));
    } catch {
      // Torch support is patchy and experimental; a failure just means no light.
      setDiag((d) => ({ ...d, torch: false }));
    }
  }, [diag.torchOn]);

  // Samples the decoder once a second while scanning, so the UI can say what is
  // happening instead of showing a silent preview that may or may not be alive.
  useEffect(() => {
    if (phase.kind !== "scanning") return;
    const startedAt = Date.now();
    // Progress is what matters, not the total: a decoder that captured two
    // frames and then froze is just as broken as one that never started.
    let lastFrames = -1;
    let lastAdvancedAt = Date.now();

    const id = setInterval(() => {
      const video = videoRef.current;
      const w = video?.videoWidth ?? 0;
      const h = video?.videoHeight ?? 0;
      const now = Date.now();

      if (framesRef.current !== lastFrames) {
        lastFrames = framesRef.current;
        lastAdvancedAt = now;
      }

      setDiag((d) => ({
        ...d,
        frames: framesRef.current,
        size: w && h ? `${w}×${h}` : null,
        elapsed: Math.round((now - startedAt) / 1000),
        stalledFor: Math.round((now - lastAdvancedAt) / 1000),
        torch: d.torch || typeof controlsRef.current?.switchTorch === "function",
      }));
    }, 1000);

    return () => clearInterval(id);
  }, [phase.kind]);

  // The camera is open but the decoder has stopped receiving frames — a real,
  // silent failure (an occupied camera, a suspended tab, a driver problem).
  // Say so rather than letting someone hold a packet up to a dead preview.
  const stalled = phase.kind === "scanning" && diag.elapsed >= 5 && diag.stalledFor >= 4;

  return (
    <div>
      {/* The video element must stay mounted across phases: remounting it
          mid-scan would drop the stream ZXing is decoding from. */}
      <div className={phase.kind === "scanning" ? "block" : "hidden"}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black sm:aspect-video">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-24 w-[70%] max-w-sm rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4 text-center text-xs text-white">
            <ScanLine className="size-3.5 shrink-0" aria-hidden />
            {stalled ? "The camera is not delivering frames" : guidanceFor(diag.elapsed)}
          </div>
        </div>

        {/* The live readout. `frames` is the load-bearing number: if it climbs,
            the decoder is working and the barcode simply hasn't resolved yet. */}
        <div
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs"
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className={cn("size-2 rounded-full", stalled ? "bg-[var(--status-red)]" : "animate-pulse bg-[var(--status-green)]")}
            />
            {stalled ? "No frames" : "Scanning"}
          </span>
          <span className="tnum text-muted-foreground">
            {diag.frames.toLocaleString("en-GB")} {diag.frames === 1 ? "attempt" : "attempts"}
          </span>
          {diag.size && <span className="tnum text-muted-foreground">{diag.size}</span>}
          <span className="tnum text-muted-foreground">{diag.elapsed}s</span>

          {diag.torch && (
            <button
              type="button"
              onClick={toggleTorch}
              className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border px-2.5 hover:bg-accent"
            >
              <Flashlight className="size-3.5" aria-hidden />
              {diag.torchOn ? "Light off" : "Light on"}
            </button>
          )}
        </div>

        {stalled && (
          <p className="measure mt-2 text-xs leading-relaxed text-muted-foreground">
            The camera is open but frames have stopped reaching the decoder{" "}
            <span className="tnum">({diag.stalledFor}s ago)</span>. Another app or tab may have taken the camera. Try
            again, or enter the digits printed under the barcode.
          </p>
        )}

        {diag.elapsed >= 12 && !stalled && (
          <p className="measure mt-2 text-xs leading-relaxed text-muted-foreground">
            Still no read after {diag.elapsed} seconds. Barcodes need to be flat, filling most of the frame width, and
            evenly lit — glare from packaging film is the usual culprit. If it will not read, enter the digits printed
            under the barcode instead.
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={capture}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Aperture className="size-4" aria-hidden />
            Take a picture
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setPhase({ kind: "manual" });
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <Keyboard className="size-4" aria-hidden />
            Type it instead
          </button>
        </div>
        <p className="measure mt-2 text-xs leading-relaxed text-muted-foreground">
          Scanning continuously in the background. If it will not catch it, frame the barcode and take a picture — a
          still is examined far more thoroughly than a live frame.
        </p>
      </div>

      {phase.kind === "idle" && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
            <Camera className="size-5" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="measure mx-auto mt-4 text-sm leading-relaxed text-muted-foreground">
            Point your camera at the barcode on a food package. The product is looked up in Open Food Facts, and any
            additive on its label that the FDA has acted on is listed here with its current legal status.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Camera className="size-4" aria-hidden />
              Start camera
            </button>
            <button
              type="button"
              onClick={() => setPhase({ kind: "manual" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              <Keyboard className="size-4" aria-hidden />
              Type a barcode
            </button>
          </div>
        </div>
      )}

      {phase.kind === "manual" && <ManualEntry onSubmit={lookUp} onBack={startCamera} />}

      {phase.kind === "reading" && (
        <div className="grid place-items-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span className="mt-3">Reading the picture…</span>
        </div>
      )}

      {phase.kind === "captured" && (
        <div className="rounded-xl border border-border bg-card p-4">
          {/* The photo stays on screen: whether it was blurred, dark or simply
              missed the barcode is obvious at a glance and impossible to guess. */}
          {/* Height-capped so the photo and the reason it failed stay on
              screen together — the comparison is the whole point of showing it. */}
          <div className="relative max-h-[38vh] w-full overflow-hidden rounded-lg bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL from the camera, not a remote asset */}
            <img src={phase.image} alt="The frame just captured" className="max-h-[38vh] w-full object-contain" />
          </div>

          <div className="mt-4 flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--status-amber)]" aria-hidden />
            <div>
              <div className="text-sm font-medium">No barcode found in this picture</div>
              <p className="measure mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {phase.dark
                  ? "This frame is very dark. Barcode reading needs even light on the bars — move somewhere brighter, or put a lamp on the packet rather than behind it."
                  : "Fill most of the frame width with the barcode, hold the packet flat and parallel to the camera, and keep it still enough to focus. Glare across the bars will stop it reading."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <RotateCcw className="size-4" aria-hidden />
              Retake
            </button>
            <button
              type="button"
              onClick={() => setPhase({ kind: "manual" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              <Keyboard className="size-4" aria-hidden />
              Type the barcode
            </button>
          </div>
        </div>
      )}

      {phase.kind === "looking-up" && (
        <div className="grid place-items-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span className="tnum mt-3">Looking up {phase.barcode}…</span>
        </div>
      )}

      {phase.kind === "error" && (
        <div className="tone-amber rounded-xl border bg-card p-6" style={{ borderColor: "var(--tone-border)" }}>
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" style={{ color: "var(--tone)" }} aria-hidden />
            <div>
              <div className="text-sm font-medium">{phase.message}</div>
              {phase.hint && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{phase.hint}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => setPhase({ kind: "manual" })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"
                >
                  <Keyboard className="size-4" aria-hidden />
                  Type the barcode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase.kind === "result" && <ScanResultView result={phase.result} onRescan={startCamera} />}
    </div>
  );
}

/**
 * The escape hatch. Camera scanning fails for ordinary reasons — glare on
 * packaging film, a creased label, no rear camera, a denied permission — and
 * the digits are printed under every barcode precisely so they can be read by
 * a human when the machine cannot.
 */
function ManualEntry({ onSubmit, onBack }: { onSubmit: (barcode: string) => void; onBack: () => void }) {
  const [value, setValue] = useState("");
  const digits = value.replace(/\D/g, "");
  const valid = digits.length >= 8 && digits.length <= 14;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(digits);
      }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <label htmlFor="barcode-input" className="text-sm font-medium">
        Enter the barcode
      </label>
      <p className="measure mt-1.5 text-sm leading-relaxed text-muted-foreground">
        The digits printed underneath the bars — 8 to 14 of them, spaces and dashes ignored.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          id="barcode-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0 12000 00129 1"
          aria-describedby="barcode-help"
          className="tnum min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Search className="size-4" aria-hidden />
          Look up
        </button>
      </div>

      <div id="barcode-help" className="mt-2 min-h-5 text-xs text-muted-foreground">
        {digits.length > 0 && !valid && (
          <span className="tnum">
            {digits.length} {digits.length === 1 ? "digit" : "digits"} — needs 8 to 14
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
      >
        <Camera className="size-4" aria-hidden />
        Use the camera instead
      </button>
    </form>
  );
}

function ScanResultView({ result, onRescan }: { result: ScanResponse["data"]; onRescan: () => void }) {
  const rescan = (
    <button
      type="button"
      onClick={onRescan}
      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"
    >
      <Camera className="size-4" aria-hidden />
      Scan another
    </button>
  );

  if (!result.found || !result.product) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="text-sm font-medium">No record for this barcode</div>
        <p className="measure mx-auto mt-2 text-sm leading-relaxed text-muted-foreground">
          Open Food Facts has nothing filed under{" "}
          <span className="tnum font-medium text-foreground">{result.barcode}</span>. Its coverage is contributor-built
          and far from complete, so this says nothing about the product itself.
        </p>
        {rescan}
      </div>
    );
  }

  const { product, flagged, stricterAbroad } = result;
  const nothingFound = flagged.length === 0 && stricterAbroad.length === 0;

  return (
    <div>
      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={`Front of pack: ${product.name}`}
              fill
              unoptimized
              sizes="80px"
              className="object-contain p-1"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageOff className="size-5" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-snug font-medium">{product.name}</div>
          {product.brands && <div className="mt-0.5 truncate text-sm text-muted-foreground">{product.brands}</div>}
          <div className="tnum mt-1.5 text-xs text-muted-foreground">{result.barcode}</div>
        </div>
      </div>

      {nothingFound && (
        <div className="tone-green mt-4 rounded-xl border bg-card p-6" style={{ borderColor: "var(--tone-border)" }}>
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 size-4 shrink-0" style={{ color: "var(--tone)" }} aria-hidden />
            <div>
              <div className="text-sm font-medium">No tracked additives on this label</div>
              <p className="measure mt-1.5 text-sm leading-relaxed text-muted-foreground">
                None of the additives this site tracks appear in the label data for this product. That is not a
                verdict on the product — this site covers only substances a regulator has acted on, which is a small
                fraction of what may be in any food.
              </p>
            </div>
          </div>
        </div>
      )}

      {flagged.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {flagged.length} tracked {flagged.length === 1 ? "additive" : "additives"} on this label
          </h2>
          <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
            Substances the FDA or a US state has acted on. Most remain lawful to sell — check each status.
          </p>
          <ul className="mt-4 space-y-3">
            {flagged.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/ingredients/${f.slug}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    {f.eNumber && <span className="tnum text-xs text-muted-foreground">{f.eNumber}</span>}
                    <StatusBadge status={f.status} className="ml-auto" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Kept visually and verbally distinct from the list above. These are
          permitted in the US; the divergence is the point, not a US warning. */}
      {stricterAbroad.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Permitted here, restricted abroad
          </h2>
          <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
            {stricterAbroad.length === 1 ? "One substance" : `${stricterAbroad.length} substances`} on this label{" "}
            {stricterAbroad.length === 1 ? "is" : "are"} lawful in the United States with no federal action against{" "}
            {stricterAbroad.length === 1 ? "it" : "them"}, but restricted or banned by another regulator.
          </p>
          <ul className="mt-4 space-y-3">
            {stricterAbroad.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/ingredients/${s.slug}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    {s.eNumber && <span className="tnum text-xs text-muted-foreground">{s.eNumber}</span>}
                    <span className="ml-auto text-xs text-muted-foreground">US: permitted</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {s.regions.map((r) => (
                      <li key={r.code} className="flex flex-wrap items-center gap-2">
                        <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">{r.code}</span>
                        <StatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="measure mt-6 text-xs leading-relaxed text-muted-foreground">
        Label data from{" "}
        <a
          href={`https://world.openfoodfacts.org/product/${result.barcode}`}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border underline-offset-2 hover:text-foreground"
        >
          Open Food Facts
        </a>
        , contributed by volunteers and licensed under the Open Database License. A listing reflects a label as
        submitted, not necessarily the packet in your hand — recipes change. The legal statuses shown against each
        substance are separate, and each links to the government document it comes from.
      </p>

      {rescan}
    </div>
  );
}
