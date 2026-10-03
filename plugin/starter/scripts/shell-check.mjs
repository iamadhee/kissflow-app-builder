// shell-check.mjs — enforce the component-system shell boundary.
//
// The app owns Kissflow routing, roles, preview capture and slots. The shared AppShell owns frame
// geometry/chrome/material. Theme family is compiler-selected through data-theme; user appearance
// is the independent Light/Dark/System mode supplied by ThemeProvider + ThemeToggle.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : ".";
const warnOnly = process.argv.includes("--warn-only");
const shellPath = join(dir, "src/components/app-shell.jsx");

if (!existsSync(shellPath)) {
  console.log("✓ shell-check: no src/components/app-shell.jsx — nothing to check.");
  process.exit(0);
}

const shell = readFileSync(shellPath, "utf8");
const errors = [];
const warnings = [];
const requireText = (needle, message) => {
  if (!shell.includes(needle)) errors.push(message);
};

requireText(
  "kit/AppShell",
  "The root layout must delegate its frame to the shared kit/AppShell.jsx component.",
);
for (const prop of ["variant=", "chrome=", "design=", "material="]) {
  requireText(prop, `Shared AppShell is missing ${prop.slice(0, -1)}; pass all four independent shell axes.`);
}
requireText(
  "ThemeProvider",
  "Mount ThemeProvider so Light/Dark/System mode is available independently of the compiler-selected theme family.",
);
if (!shell.includes("ThemeToggle") && !shell.includes("DisplayOptionsPanel")) {
  errors.push("Render ThemeToggle directly or through DisplayOptionsPanel so the user can choose Light, Dark or System.");
}
requireText(
  "document.documentElement",
  "Resolve appearance on document.documentElement; root-scoped dark tokens do not fully re-resolve on a nested wrapper.",
);

if (shell.includes("ThemeSwitcher")) {
  errors.push("ThemeSwitcher is retired. The compiler selects a live catalog family; users only select Light/Dark/System.");
}
if (shell.includes("kit/NavItem") || shell.includes("kit/HeaderIdentity")) {
  warnings.push("Retired shell-piece imports found. AppShell owns its nav rows and frame; pass brand/topbar/footer slots instead.");
}

if (!errors.length && !warnings.length) {
  console.log("✓ shell-check: AppShell axes and Light/Dark/System mode are wired.");
  process.exit(0);
}

const lines = [];
if (errors.length) {
  lines.push("✗ shell-check: app-shell.jsx violates the component-system shell contract.\n");
  for (const error of errors) lines.push(`  - ${error}`);
}
if (warnings.length) {
  lines.push((errors.length ? "\n" : "⚠ shell-check:\n") + "  warnings:");
  for (const warning of warnings) lines.push(`  - ${warning}`);
}
const message = lines.join("\n");

if (warnOnly || !errors.length) {
  console.warn(message);
  process.exit(0);
}
console.error(message);
process.exit(1);
