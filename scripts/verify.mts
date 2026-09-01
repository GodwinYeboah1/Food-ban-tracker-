import { verifyAllSources } from "../lib/verify";

const RESET = "\x1b[0m";
const c = (code: string, s: string) => `${code}${s}${RESET}`;

const report = await verifyAllSources({ concurrency: 8, timeoutMs: 20_000 });

console.log(`\nChecked ${report.total} source citations\n`);
console.log(`  ${c("\x1b[32m", "ok")}          ${report.ok}`);
console.log(`  ${c("\x1b[31m", "changed")}     ${report.changed}   (document is not what we cite)`);
console.log(`  ${c("\x1b[31m", "unreachable")} ${report.unreachable}`);
console.log(`  ${c("\x1b[90m", "blocked")}     ${report.blocked}   (bot-blocked or slow; not a failure)\n`);

for (const r of report.results) {
  if (r.status === "ok" || r.status === "blocked") continue;
  console.log(`  ${c("\x1b[31m", r.status.toUpperCase())}  ${r.where}`);
  console.log(`     ${r.label}`);
  console.log(`     ${r.url}`);
  if (r.detail) console.log(`     → ${r.detail}`);
  console.log();
}

if (!report.healthy) {
  console.log(c("\x1b[31m", "FAIL — some citations no longer match their source.\n"));
  process.exit(1);
}
console.log(c("\x1b[32m", "PASS — every citation resolves and matches.\n"));
