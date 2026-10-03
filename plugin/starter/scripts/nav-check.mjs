// nav-check.mjs — the sidebar has to make sense before the build passes.
//
//   node scripts/nav-check.mjs [appDir]        # defaults to cwd
//   node scripts/nav-check.mjs . --warn-only   # report, exit 0
//
// WHY THIS EXISTS. Every gate in this app checks something a machine can see in ONE file: does the
// page compile (ui-lint), does the app have an identity (theme-check). Nothing checked the nav,
// which is the one artifact that only makes sense in relation to OTHER files — a route is only
// valid if a page exists, a label is only clear if no sibling shares it, a role only has a home if
// exactly one item is gated to it.
//
// The failures this was written from, all shipped and all found by a human looking at the screen:
//
//   1. nav.json listed 40 routes and only 4 pages existed. The shell lands a role on its FIRST nav
//      item, so most roles opened a route with no component: a blank white page, no error anywhere.
//   2. An ungated `{label:"Home", to:"/", roles:[]}` row — added as a stopgap while pages were still
//      generating — outlived its reason. Empty `roles` means "every role", so it rendered ALONGSIDE
//      each role's own link, giving every user two rows both labelled "Home".
//   3. All three real items were also labelled "Home", so switching role changed nothing visible in
//      the sidebar. The app looked stuck even though routing was correct.
//
// None of those is a code defect. Every one of them is a data defect in one small JSON file, and
// every one of them made the app look broken to the first person who opened it.
//
// WHAT THIS DELIBERATELY DOES NOT DO: it does not judge whether the nav is well DESIGNED — whether
// the items are the right ones, or in a sensible order. That is a person's call. It checks only the
// things that are objectively wrong and silently so.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { navigationFindings } from "../src/components/kit/nav-contract.js";

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");
const appDir = resolve(args.find((a) => !a.startsWith("--")) || ".");

const read = (p) => { try { return readFileSync(join(appDir, p), "utf8"); } catch { return ""; } };
const findings = [];
const fail = (kind, msg, fix) => findings.push({ level: "error", kind, msg, fix });
const warn = (kind, msg, fix) => findings.push({ level: "warn", kind, msg, fix });

// ── inputs ───────────────────────────────────────────────────────────────────────────────────────
let nav;
try { nav = JSON.parse(read("lib/nav.json") || "[]"); }
catch (e) { console.error(`✗ nav-check: lib/nav.json is not valid JSON — ${e.message}`); process.exit(1); }
if (!Array.isArray(nav)) { console.error("✗ nav-check: lib/nav.json must be an array of menus."); process.exit(1); }

const items = nav.flatMap((m) => (m.items || []).map((it) => ({ ...it, menu: m.name ?? m.label })));

const pagesDir = join(appDir, "src/pages");
const pageRoutes = new Set();
if (existsSync(pagesDir)) {
  const walk = (dir, prefix = "") => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.isDirectory()) { walk(join(dir, f.name), `${prefix}/${f.name}`); continue; }
      if (!/\.(jsx|tsx)$/.test(f.name)) continue;
      const base = f.name.replace(/\.(jsx|tsx)$/, "");
      if (base.startsWith("[")) continue;                    // catch-all / dynamic — matches anything
      pageRoutes.add(base === "index" ? (prefix || "/") : `${prefix}/${base}`);
    }
  };
  walk(pagesDir);
}

// The source starter intentionally contains neither routes nor navigation. A generated workspace
// injects both before prebuild. Empty-on-both-sides is therefore a valid template; only a half-built
// app (pages without nav, or nav without pages) is an error.
if (!items.length && !pageRoutes.size) {
  console.log("✓ nav-check: route-free starter — no pages or navigation to validate.");
  process.exit(0);
}
if (!items.length) {
  console.error("✗ nav-check: pages exist but lib/nav.json declares no items — the sidebar renders empty and no role has a landing page.");
  process.exit(warnOnly ? 0 : 1);
}
if (!pageRoutes.size) {
  console.error("✗ nav-check: lib/nav.json declares items but src/pages has no route files.");
  process.exit(warnOnly ? 0 : 1);
}

const roleCatalog = (() => {
  try { return (JSON.parse(read("lib/kf-schema.json") || "{}").roles || []); }
  catch { return []; }
})();
const roles = roleCatalog.map(r => r.name).filter(Boolean);
const norm = (s) => String(s || "").trim().replace(/^\//, "").toLowerCase();

// ── 1. every route resolves to a page file ───────────────────────────────────────────────────────
// The one that produces a blank screen with no error.
for (const it of items) {
  const route = String(it.to || "");
  if (!route) { fail("NAV_NO_ROUTE", `nav item "${it.label ?? "(unlabelled)"}" has no \`to\``, "give it a route, or remove it"); continue; }
  const known = [...pageRoutes].some((p) => norm(p) === norm(route));
  if (!known) {
    fail("NAV_DEAD_ROUTE",
      `nav item "${it.label ?? route}" → ${route}, but no page file matches`,
      `create src/pages${route === "/" ? "/index" : route}.jsx, or drop the nav row until it exists`);
  }
}

// Role semantics are shared with the preview/deployment compiler.
findings.push(...navigationFindings(nav, { roles: roleCatalog }));

// ── 5. a page nobody can reach ───────────────────────────────────────────────────────────────────
// A warning, not an error: development-only routes may legitimately have no nav row.
const navRoutes = new Set(items.map((it) => norm(it.to)));
// Summarised, not listed, so several development-only routes cannot bury the actionable signal.
const unreachable = [...pageRoutes].filter((p) => p !== "/" && !navRoutes.has(norm(p)));
if (unreachable.length)
  warn("PAGE_UNREACHABLE",
    `${unreachable.length} page(s) have no nav item, reachable only by URL${unreachable.length <= 6 ? `: ${unreachable.join(", ")}` : ""}`,
    "expected only for development routes; add a nav row for every real app screen");

// ── report ───────────────────────────────────────────────────────────────────────────────────────
const errors = findings.filter((f) => f.level === "error");
for (const f of findings) {
  console.log(`  ${f.level === "error" ? "✗" : "⚠"} ${f.kind}  ${f.msg}\n      → ${f.fix}`);
}
console.log(findings.length
  ? `\n${errors.length ? "✗" : "✅"} nav-check — ${errors.length} error(s), ${findings.length - errors.length} warning(s) · ${items.length} nav item(s), ${pageRoutes.size} page(s), ${roles.length} role(s)`
  : `✓ nav-check: ${items.length} nav item(s) across ${roles.length} role(s), every route resolves`);
process.exit(errors.length && !warnOnly ? 1 : 0);
