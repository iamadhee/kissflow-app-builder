// GENERATED from starter/src/components/kit/options.js (sha256:bde20d77888142fe). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
// options.js — one shape for a choice list, whatever the caller has.
//
// The platform's data model emits `options` as plain strings: `["Scheduled", "Arrived"]` is what the
// schema says a Select field carries. The kit's listboxes read `opt.value` and `opt.label`. A page
// that passes the field's own options straight to <Select> — the obvious thing, and what a builder
// writing a standalone decision control does — therefore rendered one blank 36px row per option: an
// open dropdown with nothing in it, no error, no empty state, and no gate that can see it. Reported
// from a live staging build, 15 Sep 2026.
//
// FieldInput already did this mapping on the way in. Doing it in the components means it is true
// however they are reached, and a caller can keep passing whichever shape it already has.
export function normalizeOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((o) => {
    if (o == null) return null;
    if (typeof o === "string" || typeof o === "number") return { value: o, label: String(o) };
    const value = o.value ?? o.Id ?? o.id ?? o._id ?? o.Name ?? o.name;
    const label = o.label ?? o.Name ?? o.name ?? o.title ?? (value == null ? "" : String(value));
    // a label is what a person reads: never fall through to "[object Object]" or an empty row
    return { ...o, value, label: String(label ?? "").trim() || String(value ?? "") };
  // THE INVARIANT: a listbox never renders a row with nothing in it. An option that cannot produce
  // a label is dropped, so an unusable list reads as "No options" — which is true and visible —
  // rather than as a panel of blank rows, which looks like a broken dropdown and reports nothing.
  }).filter((o) => o && o.value !== undefined && o.label !== "");
}
