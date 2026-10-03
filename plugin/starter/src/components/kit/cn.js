import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — join class names AND let the last one actually win.
 *
 * Every component in this kit used to carry its own private helper:
 *
 *   const cx = (...parts) => parts.filter(Boolean).join(' ')
 *
 * Sixty-five copies of it. A plain join is fine until a component sets a utility and its caller sets
 * another for the same CSS property. Then both land with identical specificity, and the winner is
 * whichever Tailwind happened to emit later in the generated stylesheet — decided by its internal
 * class ordering, not by the order they appear in the class attribute. The caller cannot see it,
 * cannot predict it, and cannot fix it by reordering. A SurfaceGroup emitting `gap-5` while its
 * caller passed `gap-4` is why two sibling rows on one depot dashboard came out spaced differently
 * for no visible reason.
 *
 * `twMerge` understands which utilities target the same property and keeps only the last, so a
 * component's own classes become genuine DEFAULTS that a caller can override — which is what every
 * caller already assumed was happening. This is shadcn's `cn()` convention; we take the convention,
 * not the library.
 *
 * What it does NOT do, so nobody expects it to: it resolves collisions on ONE element. It has no
 * opinion about the space between a card's children, or about a Table row and a Queue row agreeing
 * on their inset. That is a spacing contract, and it is a separate piece of work.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
