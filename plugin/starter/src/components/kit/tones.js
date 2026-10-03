// Theme-aware aliases for the few third-party/specialized widgets that accept a colour value
// rather than a Tailwind class. The names remain stable for existing generated page source, while
// the values follow the selected catalog theme instead of carrying a second fixed palette.
export const TONES = {
  indigo: "var(--chart-1)",
  emerald: "var(--chart-2)",
  amber: "var(--chart-3)",
  rose: "var(--chart-4)",
  violet: "var(--chart-5)",
  sky: "var(--chart-6)",
  fuchsia: "var(--chart-7)",
};

export const TONE_CYCLE = Object.keys(TONES);
export const toneAt = (i) => TONES[TONE_CYCLE[i % TONE_CYCLE.length]];

// Canvas/WebGL libraries cannot resolve CSS var() values themselves. Resolve only at their
// boundary; SVG/DOM consumers should keep the var() string so ordinary CSS cascade still applies.
export function resolveCssColor(value) {
  const color = TONES[value] || value;
  const match = /^var\((--[^,)]+)/.exec(String(color || ""));
  // A RAW LITERAL IS NOT A TONE. This used to pass anything it did not recognise straight through,
  // so `resolveCssColor("#6d5efc")` put one hard-coded colour on a canvas and that canvas was then
  // the single element on the page not wearing the app's theme — invisible in review, because it
  // looks deliberate. The extension mechanism is a TOKEN: name one of the tones above, or pass
  // `var(--your-token)` and define it in the theme.
  if (!match) return undefined;
  if (typeof document === "undefined") return undefined;
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || undefined;
}

export function resolveToken(name) {
  return resolveCssColor(`var(${name})`);
}
