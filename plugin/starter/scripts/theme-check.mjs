#!/usr/bin/env node
// theme-check.mjs — verify that one live catalog theme is selected and no per-app CSS overlay remains.
//
// Canonical copy. the build engine installs this into generated apps; the starter copy
// must remain byte-identical.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : ".";
const warnOnly = process.argv.includes("--warn-only");
const read = (path) => { try { return readFileSync(join(dir, path), "utf8"); } catch { return ""; } };
const readJson = (path) => { try { return JSON.parse(read(path)); } catch { return null; } };

const html = read("index.html");
const main = read("src/main.jsx");
const uiSpec = readJson("lib/ui-spec.json") || readJson("src/ui-spec.json");
const configured = String(uiSpec?.app?.theme || "").toLowerCase() || null;
const stamped = (/<html\b[^>]*\bdata-theme\s*=\s*"([^"]+)"/i.exec(html) || [])[1]?.toLowerCase() || null;
const themeCss = ["src/theme-variants.css", "src/themes.css", "src/tokens.css"].map(read).join("\n");
const available = new Set(
  [...themeCss.matchAll(/:root\[data-theme=(["'])([a-z][a-z0-9-]*)\1\]/g)].map((match) => match[2]),
);
const retiredFiles = ["src/app-identity.css", "src/app-theme.css"].filter((path) => existsSync(join(dir, path)));
const retiredImports = [...main.matchAll(/import\s+["']\.\/(app-(?:identity|theme)\.css)["']/g)].map((match) => match[1]);
const findings = [];

if (retiredFiles.length) findings.push(`retired per-app stylesheet still exists: ${retiredFiles.join(", ")}`);
if (retiredImports.length) findings.push(`retired per-app stylesheet is still imported: ${retiredImports.join(", ")}`);
if (!stamped) findings.push("index.html has no data-theme selection");
if (stamped && available.size && !available.has(stamped)) {
  findings.push(`data-theme="${stamped}" has no matching live catalog block (available: ${[...available].join(", ")})`);
}
if (configured && stamped && configured !== stamped) {
  findings.push(`ui-spec selects "${configured}" but index.html stamps "${stamped}"`);
}
if (configured && available.size && !available.has(configured)) {
  findings.push(`ui-spec theme "${configured}" is not present in the live catalog`);
}

if (!findings.length) {
  console.log(`✓ theme-check: catalog theme "${stamped}" is the single visual source${configured ? " and matches ui-spec" : ""}.`);
  process.exit(0);
}

const message = [
  "✗ theme-check: catalog theme selection is invalid.",
  "",
  ...findings.map((finding) => `  - ${finding}`),
  "",
  "Select one theme with <html data-theme=\"…\"> and keep it aligned with ui-spec.app.theme.",
  "Colors, fonts, radius, spacing, shadows and charts must come only from the shared theme catalog.",
  "Do not create or import app-identity.css or app-theme.css.",
].join("\n");

if (warnOnly) {
  console.warn(message);
  process.exit(0);
}
console.error(message);
process.exit(1);
