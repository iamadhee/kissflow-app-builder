// lint-ui.mjs — locate the engine's ui-lint and run it against this app's generated pages.
//
// The npm script used to point straight at `../plugins/app-agents/the build engine`, which only
// resolves when the UI directory is the checked-in `starter/` inside the repo. A real run copies the
// starter somewhere else, so the gate silently could not run — a page agent reported exactly that
//  and fell back to grepping by hand. A gate that cannot find
// itself is worse than no gate, because the build still reports success.

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REL = join("plugins", "app-agents", "engine", "ui-lint.mjs");
const target = process.argv[2];

// The checked-in starter is deliberately route-free. Generated run workspaces create src/pages
// before invoking the same prebuild hook, and those pages must still pass the real engine lint.
if (target && !existsSync(resolve(target))) {
  console.log(`ui-lint: ${target} is absent — route-free starter, nothing to lint.`);
  process.exit(0);
}

// Walk up from this file, and honour an explicit override, so the gate works from a copied UI dir.
const candidates = [
  process.env.KF_ENGINE_DIR && join(process.env.KF_ENGINE_DIR, "ui-lint.mjs"),
  ...Array.from({ length: 6 }, (_, i) => resolve(here, "../".repeat(i + 1), REL)),
].filter(Boolean);

const lint = candidates.find((p) => existsSync(p));
if (!lint) {
  console.error("ui-lint: could not locate the engine's ui-lint.mjs. Looked in:");
  for (const c of candidates) console.error(`  ${c}`);
  console.error("Set KF_ENGINE_DIR to <repo>/plugins/app-agents/engine to point at it explicitly.");
  process.exit(2);
}

const r = spawnSync(process.execPath, [lint, ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(r.status ?? 1);
