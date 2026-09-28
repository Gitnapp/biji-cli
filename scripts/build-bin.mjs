#!/usr/bin/env node
// Compile the bundled CLI (apps/cli/dist/biji.js) into standalone executables
// with `bun build --compile`.
//
//   node scripts/build-bin.mjs              # current platform only
//   node scripts/build-bin.mjs --all        # every target in TARGETS
//   node scripts/build-bin.mjs linux-x64 darwin-arm64
//
// Expects `pnpm -r build` to have run.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "apps/cli/dist/biji.js");
const outDir = path.join(root, "release");
const bun = path.join(root, "node_modules/.bin", process.platform === "win32" ? "bun.cmd" : "bun");

const TARGETS = ["linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64", "windows-x64"];

const args = process.argv.slice(2);
const host = `${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`;
const targets = args.includes("--all") ? TARGETS : args.length ? args : [host];

if (!existsSync(entry)) {
  console.error(`missing ${path.relative(root, entry)} — run \`pnpm -r build\` first`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

for (const t of targets) {
  if (!TARGETS.includes(t)) {
    console.error(`unknown target '${t}'. Known: ${TARGETS.join(", ")}`);
    process.exit(1);
  }
  const outfile = path.join(outDir, `biji-${t}${t.startsWith("windows") ? ".exe" : ""}`);
  console.log(`→ ${path.relative(root, outfile)}`);
  const r = spawnSync(
    bun,
    ["build", entry, "--compile", "--minify", `--target=bun-${t}`, `--outfile=${outfile}`],
    { stdio: "inherit", cwd: root },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}
