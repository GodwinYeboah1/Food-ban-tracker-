import { promises as fs } from "node:fs";
import path from "node:path";
import type { QueueItem } from "./types";

/**
 * Storage for candidate documents awaiting human review.
 *
 * Deliberately a file, not a database. The queue is small, append-mostly, and
 * only ever read by a person deciding what to promote into the curated
 * timeline — so a JSON file keeps setup at zero, which was the whole point of
 * choosing keyless sources. Swap `read`/`write` for a Postgres table when the
 * review step gets a UI; nothing else needs to change.
 *
 * Note that Vercel's filesystem is ephemeral: on serverless the queue survives
 * only until the instance recycles. Move to Postgres before relying on it in
 * production. The sync route returns the full payload either way, so nothing
 * is lost in the meantime.
 */
const QUEUE_PATH = path.join(process.cwd(), "data", "review-queue.json");

async function read(): Promise<QueueItem[]> {
  try {
    return JSON.parse(await fs.readFile(QUEUE_PATH, "utf8")) as QueueItem[];
  } catch {
    // Missing file on first run is the normal case, not an error.
    return [];
  }
}

async function write(items: QueueItem[]) {
  await fs.mkdir(path.dirname(QUEUE_PATH), { recursive: true });
  await fs.writeFile(QUEUE_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export interface EnqueueResult {
  added: number;
  duplicates: number;
  total: number;
  /** Empty when persistence failed; the caller still gets the fetched items. */
  persisted: boolean;
}

/** Adds items not already present, keyed on source + externalId. */
export async function enqueue(candidates: QueueItem[]): Promise<EnqueueResult> {
  try {
    const existing = await read();
    const seen = new Set(existing.map((i) => `${i.source}:${i.externalId}`));

    const fresh = candidates.filter((c) => !seen.has(`${c.source}:${c.externalId}`));
    const merged = [...fresh, ...existing].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    await write(merged);
    return {
      added: fresh.length,
      duplicates: candidates.length - fresh.length,
      total: merged.length,
      persisted: true,
    };
  } catch {
    return { added: 0, duplicates: 0, total: 0, persisted: false };
  }
}

export async function listQueue(): Promise<QueueItem[]> {
  return read();
}
