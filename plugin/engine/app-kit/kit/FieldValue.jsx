// GENERATED from starter/src/components/kit/FieldValue.jsx (sha256:2549a1bcd4f69355). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * FieldValue — what a field renders INSTEAD of its control when `readOnly`.
 *
 * Read-only is not a restyle of the control, it is a REPLACEMENT of it. That is the
 * whole design: if the stepper buttons, the scrub handle, the tag ✕, the dropdown and
 * the file input are never rendered, then no mutation path can survive by oversight.
 * Blocking each of them individually across twelve components is a list you can be
 * incomplete on — not rendering them is categorical. It is also why `readOnly` needs no
 * per-control interaction guards: there is no control to guard.
 *
 * NAMING — this is deliberately NOT Forms.jsx's `ReadOnlyField`, and the two are not
 * interchangeable. `ReadOnlyField` is a whole labelled row that Reference/User/Group
 * fields render because this kit has no lookup control to offer; it owns its own label
 * and carries a --ctl-track fill. `FieldValue` is only the control-shaped slot, drops
 * into an existing field's label/message wrapper, and is borderless with no fill.
 * Forms.jsx uses this for ItemForm's whole-record view mode; its relationship fields still use
 * the richer ReadOnlyField identity treatment while the surrounding form remains editable.
 *
 * NO LAYOUT SHIFT. The size classes mirror the field shells exactly (h-10/px-4 at md),
 * so switching a form between editable and read-only moves nothing. That is the one
 * real cost of "value instead of control" and it is cheap to avoid, so it is avoided.
 *
 * STATIC AND COPYABLE. A read-only value is content, not an action, so it does not add a tab
 * stop or a focus ring. `select-text` still lets pointer users select and copy the value, while
 * screen readers encounter it in the normal reading order.
 *
 * `aria-readonly` is set but only takes effect where a caller also supplies a supporting
 * role — it is inert on a bare div rather than a lie about semantics. The label stays
 * associated because the caller passes the control's own `id` straight through.
 *
 * OUTSIDE A FORM IT IS TEXT. The mirrored box exists so a form does not move when it switches to
 * read-only; in a table cell it is a lie about what the thing is. A builder put this in a 112px
 * column and the fixed h-10 held 40px while the value needed 60, with overflow visible — so two
 * rows drew over each other and "Priya Shah Honda Accord" rendered through the row beneath it.
 * `inline` drops the shell: no fixed height, no form padding, wraps like the text it is.
 *
 * <FieldValue id={id} size="md" value="Acme Corp" />
 * <FieldValue inline value="Acme Corp" />            // in a table cell, a card, a list row
 * <FieldValue id={id} multiline value={notes} />
 * <FieldValue id={id}>{tags.map(t => <Tag key={t}>{t}</Tag>)}</FieldValue>
 */

/* Mirrors Input's SHELL sizing so the read-only slot occupies the identical box. */
const SIZES = { sm: "h-8 px-3 gap-2 text-xs", md: "h-10 px-4 gap-2 text-sm", lg: "h-12 px-5 gap-3 text-base" };
/* Inline keeps only the type scale: no height, no horizontal padding, free to wrap. */
const INLINE = { sm: "gap-2 text-xs", md: "gap-2 text-sm", lg: "gap-2 text-base" };
/* Multiline releases the fixed height and uses Tailwind's nearest standard minimum-height step. */
const MULTILINE = { sm: "px-3 py-2 gap-2 text-xs", md: "px-4 py-3 gap-2 text-sm", lg: "px-5 py-3 gap-3 text-base" };

/* An empty read-only field must still say something, or the row silently collapses to a
   blank strip that reads as a rendering bug. Em dash is what cellText already uses for
   "no value" elsewhere in the kit, so the vocabulary matches. */
const EMPTY = "—";

function FieldValue({
  id,
  size = "md",
  value,
  defaultValue,
  placeholder = EMPTY,
  multiline = false,
  inline = false,
  children,
  className,
  ...rest
}) {
  /* Uncontrolled callers pass defaultValue and never value; reading only `value` would
     render every one of them empty. */
  const resolved = value != null && value !== "" ? value : defaultValue;
  const isEmpty = children == null && (resolved == null || resolved === "");

  return (
    <div
      id={id}
      aria-readonly="true"
      data-field-readonly=""
      className={cx(
        "flex w-full min-w-0 items-center border-0 bg-transparent rounded-lg select-text",
        "text-ctl-fg",
        /* The value itself stays full-strength; only a genuinely absent value is muted,
           so "read-only" never reads as "disabled". */
        isEmpty && "text-ctl-fg-muted",
        /* A value that is not standing in for a control has no shell to mirror: it wraps, it has no
           fixed height, and it takes no form padding. Anything else overflows the moment the column
           is narrower than the value. */
        inline
          ? cx("items-start whitespace-normal break-words", INLINE[size] || INLINE.md)
          : multiline
          ? cx("items-start whitespace-pre-wrap min-h-36", MULTILINE[size] || MULTILINE.md)
          : SIZES[size] || SIZES.md,
        className
      )}
      {...rest}
    >
      {children != null ? children : isEmpty ? placeholder : String(resolved)}
    </div>
  );
}

export { FieldValue };
export default FieldValue;
