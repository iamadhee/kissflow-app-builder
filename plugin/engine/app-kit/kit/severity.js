// GENERATED from starter/src/components/kit/severity.js (sha256:2f630748179285fd). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
/* severity.js — one ordered scale, one place that knows the words for it.
 *
 * `tone` is CATEGORICAL: danger, warning, success, info differ but do not rank, which is how a queue
 * of states ends up with no order and how a single measure gets drawn in seven categorical hues.
 * `severity` is ORDERED: 1..4, painted from --severity-1..4, which every theme derives from its own
 * hues at one shared lightness with chroma rising by step.
 *
 * Extracted because Badge and CalendarView both rank things and a second copy of this map is a second
 * opinion about whether "major" is worse than "high".
 */

/** The words an author actually writes, and the step each one means. */
const SEVERITY = {
  ok: 1, low: 1, clear: 1, minor: 1, info: 1,
  medium: 2, med: 2, watch: 2, moderate: 2, warning: 2,
  high: 3, major: 3, elevated: 3,
  critical: 4, crit: 4, severe: 4, blocker: 4, breach: 4,
};

/**
 * The step, or null. Accepts the number or the word; anything else is not a rank and is ignored
 * rather than guessed at — a wrong rank is worse than no rank, because the reader believes it.
 */
export function normalizedSeverity(value) {
  if (value == null || value === false) return null;
  if (typeof value === "number") return Number.isInteger(value) && value >= 1 && value <= 4 ? value : null;
  return SEVERITY[String(value).trim().toLowerCase()] || null;
}

/** The ink, wash and line for a step, for a component that paints its own element. */
export function severityPaint(step) {
  return step ? {
    color: `var(--severity-${step})`,
    background: `var(--severity-${step}-wash)`,
    borderColor: `var(--severity-${step}-line)`,
  } : null;
}

export { SEVERITY };
