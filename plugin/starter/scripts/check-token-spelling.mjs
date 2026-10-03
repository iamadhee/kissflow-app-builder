#!/usr/bin/env node
/**
 * Every color token must be a complete CSS color when the @theme bridge reads it.
 *
 *   node scripts/check-token-spelling.mjs [path/to/tokens.css]
 *
 * The current contract uses whole colors throughout. This check derives the source variables from
 * shadcn.css and rejects the one legacy spelling that fails silently in a whole-color bridge: a bare
 * HSL triplet such as `220 27% 91%` passed directly to a Tailwind color utility.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] ? resolve(process.argv[2]) : join(here, "..", "src", "tokens.css");
const bridgeFile = join(dirname(file), "shadcn.css");

let css, bridgeCss;
try {
  css = readFileSync(file, "utf8");
  bridgeCss = readFileSync(bridgeFile, "utf8");
} catch {
  console.error(`✗ check-token-spelling: cannot read ${file} and its Tailwind bridge ${bridgeFile}`);
  process.exit(1);
}

const ti = bridgeCss.indexOf("@theme inline");
if (ti < 0) {
  console.error("✗ check-token-spelling: no `@theme inline` block in the Tailwind bridge.");
  process.exit(1);
}
const theme = bridgeCss.slice(ti, bridgeCss.indexOf("\n}", ti));

/** Tokens the bridge WRAPS in hsl() — they must hold a bare "H S% L%" triplet. */
const wantsTriplet = new Set();
/** Tokens the bridge passes through RAW — they must hold a complete colour. */
const wantsColour = new Set();

for (const m of theme.matchAll(/^\s*--color-[a-z0-9-]+\s*:\s*(.+?);/gm)) {
  const val = m[1].trim();
  const wrapped = /^hsl\(\s*var\(\s*(--[a-z0-9-]+)/.exec(val);
  if (wrapped) { wrapped[1] && wantsTriplet.add(wrapped[1]); continue; }
  const first = /^var\(\s*(--[a-z0-9-]+)/.exec(val);
  if (!first) continue;
  wantsColour.add(first[1]);
  // twin pattern: the fallback half names a token that IS wrapped, so record that side too
  const inner = /hsl\(\s*var\(\s*(--[a-z0-9-]+)/.exec(val);
  if (inner) wantsTriplet.add(inner[1]);
}

const isTriplet = (v) => /^-?[\d.]+\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(v.trim());
// A complete colour is anything CSS can paint: hsl()/rgb()/oklch()/#hex/a named colour, or a var()
// chain that resolves to one. Deliberately permissive — the failure being caught is the specific,
// unambiguous case of a bare triplet, and a gate that also guesses at exotic-but-valid values would
// cry wolf on the contract's own gradients and rgba plates.
const looksColour = (v) => !isTriplet(v.trim());

const heads = [...css.matchAll(/^:root(?:\[data-theme="([a-z-]+)"\])?\s*\{/gm)];
const problems = [];

for (let i = 0; i < heads.length; i++) {
  const lang = heads[i][1] || "vela";
  const body = css.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : css.length);
  for (const d of body.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    const [, tok, rawVal] = d;
    const val = rawVal.trim();
    if (wantsColour.has(tok) && !wantsTriplet.has(tok) && !looksColour(val))
      problems.push({ lang, tok, val, need: "a whole colour", got: "a bare triplet",
                      fix: `hsl(${val})` });
    else if (wantsTriplet.has(tok) && !wantsColour.has(tok) && !isTriplet(val) && /^hsl\(\s*[\d.]/.test(val))
      problems.push({ lang, tok, val, need: "a bare triplet", got: "a wrapped colour",
                      fix: val.replace(/^hsl\(\s*/, "").replace(/\s*\)$/, "") });
  }
}

if (!problems.length) {
  console.log(`✓ check-token-spelling: every token matches its bridge shape `
    + `(${wantsTriplet.size} wrapped · ${wantsColour.size} raw, across ${heads.length} language block(s))`);
  process.exit(0);
}

console.error(`✗ check-token-spelling: ${problems.length} token(s) spelled the wrong way for the bridge.\n`);
for (const p of problems) {
  console.error(`  [${p.lang}] ${p.tok}: ${p.val}`);
  console.error(`      the bridge needs ${p.need}, this is ${p.got} — write: ${p.tok}: ${p.fix};`);
}
console.error(`
  This does NOT fail loudly at runtime. An invalid value means the property is never set, so the
  element silently inherits — a divider becomes currentColor (near-black), a field edge likewise.
  The build stays green and the page still renders.

  If these came from engine/proto-kit/gen-language-blocks.mjs, fix it there (putColor vs put) and
  regenerate, rather than editing tokens.css by hand.`);
process.exit(1);
