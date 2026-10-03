#!/usr/bin/env node
// kf.mjs — launcher for the Kissflow App Builder engine.
// The engine is a sealed, self-contained executable published with each plugin release. This file
// finds the one for this machine, downloads it the first time (verified against the release's
// checksums), and runs it with the arguments it was given. It holds no logic of its own.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(PLUGIN_ROOT, ".claude-plugin", "plugin.json"), "utf8"));
const VERSION = manifest.version;
const RELEASES = manifest.engine?.releases || "https://github.com/iamadhee/kissflow-app-builder/releases/download";
const target = `${process.platform === "win32" ? "win" : process.platform}-${process.arch}`;
const exe = process.platform === "win32" ? ".exe" : "";
const file = `kf-${target}${exe}`;
const home = process.env.KF_HOME || join(homedir(), ".kissflow", "app-builder");
const bin = process.env.KF_ENGINE_BIN || join(home, VERSION, file);

async function download() {
  const dir = dirname(bin); mkdirSync(dir, { recursive: true });
  const base = `${RELEASES}/v${VERSION}`;
  process.stderr.write(`kf: fetching engine ${VERSION} for ${target} (one-time, ~100 MB)…\n`);
  const sums = await (await fetch(`${base}/checksums.txt`)).text();
  const want = sums.split("\n").find((l) => l.trim().endsWith(`  ${file}`))?.split(/\s+/)[0];
  if (!want) throw new Error(`no engine build for ${target} in release v${VERSION}`);
  const r = await fetch(`${base}/${file}`);
  if (!r.ok) throw new Error(`download failed (${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  const got = createHash("sha256").update(buf).digest("hex");
  if (got !== want) throw new Error("engine download failed its checksum; try again");
  const tmp = `${bin}.part-${process.pid}`; writeFileSync(tmp, buf); chmodSync(tmp, 0o755); renameSync(tmp, bin);
  process.stderr.write(`kf: engine ready\n`);
}

try {
  if (!existsSync(bin)) await download();
} catch (e) {
  process.stderr.write(`kf: ${e.message}\n`);
  process.exit(1);
}
const r = spawnSync(bin, process.argv.slice(2), {
  stdio: "inherit",
  // KF_NODE: the real Node running this launcher. The engine runs JS tools (vite, npm scripts) with
  // it, never with itself — the sealed engine binary is not a general-purpose node.
  env: { ...process.env, KF_ASSET_ROOT: PLUGIN_ROOT, KF_PLUGIN_ROOT: PLUGIN_ROOT, KF_LAUNCHER_VERSION: VERSION, KF_NODE: process.execPath },
});
if (r.error) { process.stderr.write(`kf: cannot run engine: ${r.error.message}\n`); process.exit(1); }
process.exit(r.status ?? 1);
