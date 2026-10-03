import { Circle } from "lucide-react";
import { NAV_ICONS } from "../../lib/nav-icons.generated.js";

// Nav icons are lucide component names carried in the IR: the model picks one per page, the Express
// compiler validates it against lucide's own export list and writes the resolved name into nav.json,
// and the build emits `lib/nav-icons.generated.js` with static named imports for exactly the icons a
// run uses. This module is therefore a lookup, not a guess.
//
// It replaces a 33-name semantic vocabulary matched by keyword rules against the label. That table
// could only ever cover domains someone had thought of — it had no word for leave, absence, holiday
// or cancellation — its patterns were singular-only, so ordinary plural nav labels ("My Requests")
// missed, and every miss collapsed onto the same clipboard glyph as ten of its own entries, which
// made a failure indistinguishable from a choice. A name from the real icon set has none of those
// failure modes: it is either a component that exists or a compile-time error.
//
// A DYNAMIC lookup over the whole library would cost 1,023 KB in the single-file build (measured)
// against 11 KB for the ~15 static imports a real app needs, which is why resolution happens at
// compile time and this map is generated per run.

/** The lucide component for a nav item, or a neutral mark when the manifest names none. */
export function resolveNavIcon(item = {}) {
  return NAV_ICONS[String(item?.icon || "")] || Circle;
}
