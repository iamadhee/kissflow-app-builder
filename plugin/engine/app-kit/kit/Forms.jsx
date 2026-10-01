// GENERATED from starter/src/components/kit/Forms.jsx (sha256:1a17bfcef5a3ec3b). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
/**
 * FieldInput · FormCard · ItemForm · NewButton · NewMenu — the write path, on theme tokens.
 *
 * REDESIGNED 2026-08-13 from Forms.dc.html (Claude Design project "Mobile app style guide sheet",
 * 2b8a920b-a786-4430-bd63-b0bc0dbe6229). This file's own thesis, verbatim: "Fields draws
 * controls; this creates and updates records — which means it owns field dispatch, validation,
 * the saving state, and what happens when a save fails." Same reason it stays split from
 * Fields.jsx as before: these talk to the SDK, Fields.jsx is presentational.
 *
 * WHAT CHANGED, beyond drawing through tokens.css:
 *
 *   Panel        --material-surface, role="list" (p-6 — "a form is rows, not a metric tile"), was
 *                role="doc" (p-7). A field grid is rows, so it takes the same density Cards.jsx
 *                gives a list card, not the airier doc density prose gets.
 *   Grid         2 columns, gap-x-4 and gap-y-6 so rows have more separation than columns. A field can span
 *                both columns; long fields (textarea/rich text, and the multi-value read-only
 *                types) do.
 *   Required     an asterisk in --danger-600 AFTER the label, never a "(required)" word.
 *   Invalid      edge + label + hint all move to --danger-600 / --danger-text TOGETHER —
 *                the old file had no invalid state at all, so this is new, not a fix.
 *   Read-only    Reference/ReferenceList/User/UserList/Group now render their OWN box —
 *                --ctl-track fill, no edge, an Avatar/AvatarStack + name — not a `readOnly`
 *                <input>. "A value on display, not a control": the old readOnly-input still LOOKED
 *                like a text box you could click into, which is exactly the wrong invitation for a
 *                field whose only real editor is the platform's own filtered lookup.
 *   Boolean      now Switch (Fields.jsx's own toggle), not a hand-rolled checkbox — the old inline
 *                `<input type=checkbox>` predates Switch existing in the kit at all.
 *   Save states  see "THE STATE MACHINE" below — two real behaviour bugs fixed, not just restyled.
 *   NewButton    defaults to rank="primary" (was "strong") — Forms.dc.html's own split: "ONE flow
 *                -> primary-rank button naming the flow," "SEVERAL -> strong-rank button + a
 *                chevron opening a menu." NewMenu is the "several" case, so IT gets strong now.
 *   NewMenu      was N buttons in a row (kit had no menu primitive when this file last shipped).
 *                Floating.jsx now exports DropdownMenu, but hasn't been redesigned onto these
 *                tokens yet (still reads --popover, the pre-Foundations bridge) — so
 *                rather than visually clash with a kit that is otherwise entirely token-clean,
 *                this reaches for @radix-ui/react-dropdown-menu directly (already a dependency;
 *                Floating.jsx pulls the same package) and draws the surface in the SAME classes
 *                Cards.jsx already established (bg-layer-surface, shadow-md, rounded-xl and a layer edge).
 *                Swap this for Floating.jsx's own exports once that file lands — it is the more
 *                correct home for it, just not a token-consistent one yet.
 *   API          one prop added, `required` (field ids that must be non-empty before the write is
 *                attempted) — on FormCard, ItemForm, NewButton and NewMenu, per Forms.dc.html's own
 *                API table. FieldInput's OWN new prop is `required` too (a single field's flag,
 *                not a list) — Forms.dc.html counts it as the fourth thing that gets the prop.
 *                Everything else — prop names, defaults, SDK calls, callback contracts — unchanged.
 *
 * THE STATE MACHINE. Forms.dc.html names five states and asks for all of them to be real:
 *   1. Editing   — no message, submit stays primary+enabled.
 *   2. Invalid   — a required field is empty; ONLY on a submit attempt (not on first paint, or
 *                  every blank required form would open already in this state) does the offending
 *                  field(s) turn danger. No summary banner — Forms.dc.html is explicit that a
 *                  single field's problem doesn't need one; the footer's note line carries the
 *                  count instead, which is what that line is FOR.
 *   3. Saving    — the button shows a spinner, drops to opacity-40, and goes inert — but NOT via
 *                  the `disabled` attribute for the transient case, only for the permanent one
 *                  (zero editable fields on the flow, a structural dead end unrelated to busy).
 *                  `disabled` mid-save would pull the button out of tab order for however long the
 *                  request takes, which reads as the page having broken far more than a busy
 *                  button does. `pointer-events-none` + `aria-disabled` gets the same "can't
 *                  activate this right now" without it. THIS WAS A REAL BUG: the old submit button
 *                  used `disabled={busy}` outright.
 *   4. Failed    — button returns to normal, a danger Callout appears above the fields with the
 *                  reason, and — THE OTHER REAL BUG — `setValues({})` never ran on the failure
 *                  path even before this pass (it only clears on the SUCCESS branch), so values
 *                  were already preserved. Confirmed, not re-fixed; flagged because the port
 *                  instructions asked to check for it by name.
 *   5. Saved     — button goes solid --success-600 ("Created" for FormCard, "Saved" for
 *                  ItemForm — same state, the two components' own verb), a success Callout shows
 *                  the record id in mono. FormCard clears its fields (ready for the next one —
 *                  Forms.dc.html's own worked example shows the new record's id, which only makes
 *                  sense for a CREATE). ItemForm does NOT clear — those values are the record now,
 *                  wiping them would look like data loss, not confirmation, and nothing in the doc
 *                  says an edit form should blank itself out after saving successfully.
 *                  A NOTED GAP, NOT FIXED HERE: ItemForm still calls `onSaved` then `onClose` on
 *                  success, same order as before — dropping the `onClose` call was considered and
 *                  reverted, because RecordSheet.jsx (the one real caller) passes the SAME
 *                  function for both props, so the sheet closes either way and the Saved state
 *                  never paints there regardless of what ItemForm does. Fixing that means
 *                  RecordSheet no longer auto-closing on save, which is that component's call to
 *                  make, not a change to make unilaterally from inside ItemForm — and doing it
 *                  here anyway would silently change behaviour for every OTHER caller that passes
 *                  two distinct callbacks, expecting `onClose` to still fire. The Saved rendering
 *                  below is real and correct for any caller that passes `onSaved` without
 *                  `onClose`, or that closes on a delay of its own.
 */

import { createContext, useContext, useState } from "react";
import { useKf } from "@kissflow/app-ui";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { Card } from "./Card.jsx";
import { Button, ButtonBase } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { DatePicker } from "./DatePicker.jsx";
import { Textarea } from "./Textarea.jsx";
import { Toggle } from "./Toggle.jsx";
import { FieldValue } from "./FieldValue.jsx";
import { FileDrop } from "./FileDrop.jsx";
import { Avatar, AvatarGroup } from "./Avatar.jsx";
import { Alert as Callout } from "./Alert.jsx";
import { flowHandle, cellText } from "./useFlow.js";

const ButtonRow = ({ children, className = "" }) => <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
const buttonVariant = (rank) => rank === "outline" || rank === "secondary" ? "secondary" : rank === "danger" ? "danger" : rank === "ghost" ? "ghost" : "primary";

const fieldId = (f) => f.Id ?? f.id;

/** A value counts as "empty" for required-field purposes when it's unset or blank text.
 *  `false` and `0` are real, saved values — a Switch left off is a choice, not a gap. */
const isEmpty = (v) => v === undefined || v === null || (Array.isArray(v) && !v.length) || (typeof v === "string" && v.trim() === "");

/** Long-form fields, and the multi-value read-only ones, take both grid columns rather than
 *  half a row — "nothing spans one and a half." */
const spansFull = (type) => /textarea|multiline|longtext|richtext|referencelist|userlist|multiuser|userandgroup/i.test(String(type));

/** The label, with the required mark composed in — never a separate "(required)" word, and
 *  the whole label recolours to --danger-text when the field is currently invalid. The
 *  asterisk itself always reads --danger-600 regardless of validity: it marks the RULE, not
 *  the current state of following it. */
function fieldLabel(text, required, invalid) {
  return (
    <span style={invalid ? { color: "var(--danger-text)" } : undefined}>
      {text}
      {required && (
        <span aria-hidden="true" style={{ color: "var(--danger-600)" }}>
          {" "}
          *
        </span>
      )}
    </span>
  );
}

function DangerDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="flex-none">
      <circle cx="6" cy="6" r="5.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 3.4v3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6" cy="8.4" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The hint every invalid field shows — small danger icon + a short reason. Field-level only,
 *  no summary banner for a single field: Forms.dc.html's own words. */
function invalidHint() {
  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--danger-text)" }}>
      <DangerDot /> Required
    </span>
  );
}

/**
 * ReadOnlyField — what Reference/ReferenceList/User/UserList/Group render instead of a control.
 *
 * "A value on display, not a control": --ctl-track fill, no edge, an Avatar/AvatarStack next
 * to the record's own name(s). Choosing a DIFFERENT record needs the platform's filtered lookup
 * against the target model, which is a real control this kit doesn't have and shouldn't fake with
 * a text box over a foreign key — so this only ever shows what the record already points at.
 *
 * `cellText` (useFlow.js) is reused rather than re-derived: it exists specifically because a
 * reference/user cell arrives as an object and stringifying one directly prints
 * "[object Object]" — the same bug this component exists to keep from reappearing here.
 */
function ReadOnlyField({ id, label, value, invalid }) {
  const names = (Array.isArray(value) ? value : value != null ? [value] : [])
    .map((v) => {
      const t = cellText(v);
      return t === "—" ? null : t;
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none text-ctl-fg">
          {label}
        </label>
      )}
      <div
        id={id}
        className="flex h-10 w-full items-center gap-2 rounded-lg bg-ctl-track pl-3 pr-4"
        // No edge by default — the one deliberate exception is the invalid state, which every
        // field type shares; a real border only appears then, never a permanent one.
        style={{ borderStyle: "solid", borderWidth: invalid ? "1px" : 0, borderColor: invalid ? "var(--danger-600)" : "transparent" }}
        title="Linked records are chosen in Kissflow's own form"
      >
        {names.length > 0 && (names.length > 1 ? <AvatarGroup people={names.map((name) => ({ name }))} max={3} size="xs" /> : <Avatar name={names[0]} size="xs" />)}
        <span className={"truncate text-sm " + (names.length ? "text-ctl-fg" : "text-ctl-fg-muted")}>
          {names.length ? names.join(", ") : "Not set"}
        </span>
      </div>
      {invalid && <p className="m-0 text-xs">{invalidHint()}</p>}
    </div>
  );
}

/**
 * FieldInput — one field, dispatched on its declared Type.
 *
 * Kissflow's field types are many and this maps the ones a create/edit form actually meets. The
 * fallback is a text input rather than nothing, because an unmapped type should still be
 * editable — a field that silently refuses to render is worse than one that renders plainly.
 *
 * `required` is NEW: pass true to show the asterisk and, once the field is actually empty AND
 * invalid, the danger treatment. FormCard/ItemForm compute that second half (see "THE STATE
 * MACHINE") and pass it in as `invalid` — a single field has no way to know on its own whether a
 * submit has even been attempted yet.
 */
export function FieldInput({ field, value, onChange, required = false, invalid = false, readOnly = false }) {
  if (!field) return null;
  const id = fieldId(field);
  const text = field.Name ?? field.name ?? id;
  const type = String(field.Type ?? field.type ?? "Text");
  const set = (v) => onChange?.(id, v);

  const label = fieldLabel(text, required, invalid);
  const hint = invalid ? invalidHint() : undefined;

  if (readOnly) {
    const parts = (Array.isArray(value) ? value : [value])
      .map((part) => typeof part === "boolean" ? (part ? "Yes" : "No") : cellText(part))
      .filter((part) => part !== "—");
    return (
      <div className="flex w-full flex-col gap-2">
        <span id={`${id}-label`} className="text-xs tracking-wide leading-snug text-ctl-fg-muted">
          {label}
        </span>
        <FieldValue
          id={id}
          value={parts.join(", ")}
          multiline={spansFull(type)}
          aria-labelledby={`${id}-label`}
        />
      </div>
    );
  }

  // REFERENCE / USER fields hold an OBJECT — see ReadOnlyField's own comment for why this stays
  // read-only rather than an editable text box.
  if (/^(Reference|ReferenceList|User|UserList|MultiUser|UserAndGroup|UserAndGroupList|Group)$/i.test(type)) {
    return <ReadOnlyField id={id} label={label} value={value} invalid={invalid} />;
  }

  // Choice-like types carry their options on the field definition under several possible keys,
  // depending on which surface produced the schema.
  const options = field.Options ?? field.options ?? field.Choices ?? [];

  if (/textarea|multiline|longtext|richtext/i.test(type)) {
    return <Textarea id={id} label={label} hint={hint} value={value ?? ""} onChange={(e) => set(e.target.value)} invalid={invalid} />;
  }
  if (/attachment|^file$/i.test(type)) {
    // a working input: the chosen files' names become the field's value (the shape the seed and the
    // SDK use for attachments), so a submitter can provide the evidence a required receipt asks for
    const names = (Array.isArray(value) ? value : value ? [value] : []).map((f) => (f && typeof f === "object" ? f.name || f.Name || f._id : String(f))).filter(Boolean);
    return <div className="flex flex-col gap-2"><span>{label}</span>
      <FileDrop multiple files={names} accept="image/*,.pdf"
        onFiles={(picked) => set([...names, ...picked.map((f) => f.name).filter((n) => !names.includes(n))])}
        onRemove={(f) => set(names.filter((n) => n !== ((f && f.name) || String(f))))}
        hint={invalid ? "Required" : hint || "Drop a receipt image or PDF, or click to browse"} />
    </div>;
  }
  if (/multiselect|multichoice|checkboxlist/i.test(type)) {
    const selected = Array.isArray(value) ? value : [];
    return <fieldset className="flex flex-col gap-2"><legend>{label}</legend>{options.map((o) => {
      const key = typeof o === "string" ? o : o.value ?? o.Id ?? o.id;
      const title = typeof o === "string" ? o : o.label ?? o.Name ?? o.name;
      return <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={selected.includes(key)}
        onChange={(e) => set(e.target.checked ? [...selected, key] : selected.filter((v) => v !== key))} />{title}</label>;
    })}{hint}</fieldset>;
  }
  if (/select|dropdown|choice|status|radio/i.test(type)) {
    return (
      <Select
        id={id}
        label={label}
        hint={hint}
        value={value ?? ""}
        onChange={(next) => set(next)}
        invalid={invalid}
        options={options.map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o.value ?? o.Id ?? o.id, label: o.label ?? o.Name ?? o.name }))}
      />
    );
  }
  if (/bool|checkbox|toggle|yesno/i.test(type)) {
    return (
      <Toggle id={id} label={label} hint={hint} checked={!!value} onChange={(e) => set(e.target.checked)} labelPosition="left" size="sm" stretch={false} />
    );
  }
  // DATE — the kit's picker, never the browser's. `<input type="date">` hands the whole control to
  // the user agent: Chrome draws a square, Chrome-blue month grid that answers to no token in
  // tokens.css, sits at the browser's locale rather than the form's, and looks nothing like the app
  // around it — the one control that visibly breaks the theme. DatePicker (typed entry + the kit's
  // Calendar) has been in the primitives review all along; dispatch simply never reached it and fell
  // through to the native input below. Value in and out is ISO, exactly what the native input gave,
  // so nothing downstream changes.
  if (/date/i.test(type) && !/datetime/i.test(type)) {
    // A seeded or stored date may arrive as a full ISO timestamp or a Date; the picker reads a plain
    // YYYY-MM-DD, and a value it cannot read renders as an empty field with the date silently gone.
    const asDate = value instanceof Date ? value.toISOString() : String(value ?? "");
    return <DatePicker label={label} hint={hint} display="dmy" invalid={invalid}
      value={/^\d{4}-\d{2}-\d{2}/.test(asDate) ? asDate.slice(0, 10) : ""} onChange={(iso) => set(iso)} />;
  }
  const inputType = /datetime/i.test(type) ? "datetime-local" : /date/i.test(type) ? "date" : /^time$/i.test(type) ? "time" : /number|currency|decimal|integer/i.test(type) ? "number" : /email/i.test(type) ? "email" : /phone/i.test(type) ? "tel" : /url|website/i.test(type) ? "url" : "text";
  return <Input id={id} label={label} hint={hint} type={inputType} step={inputType === "number" ? "any" : undefined}
    value={value ?? ""} onChange={(e) => set(inputType === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)} invalid={invalid} />;
}

/** The fields a create/edit form should offer: skip internals and system columns. Same filter
 *  the legacy FormCard used, so the two offer the same set. */
const editable = (fields = [], max) => fields.filter((f) => !f.IsInternal && !f.ReadOnly && !f.readOnly && !f.formula && !f.formulaAst && !f.aggregate && !/^_/.test(fieldId(f) ?? "")).slice(0, max);

/** The field grid — 2 columns with wider row gaps, long fields spanning both. Shared by FormCard and
 *  ItemForm so the two layouts cannot drift apart. */
function FieldGrid({ fields, values, onChange, required, invalidIds, readOnly = false }) {
  if (!fields.length) return <p className="m-0 text-sm text-ctl-fg-muted">{readOnly ? "No fields to display." : "No editable fields on this flow."}</p>;
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
      {fields.map((f) => {
        const id = fieldId(f);
        return (
          <div key={id} className={spansFull(f.Type ?? f.type) ? "sm:col-span-2" : ""}>
            <FieldInput
              field={f}
              value={values[id]}
              onChange={onChange}
              required={required.includes(id)}
              invalid={invalidIds.includes(id)}
              readOnly={readOnly}
            />
          </div>
        );
      })}
    </div>
  );
}

/** The footer every write-path card shares: a border-top rule, a note on the left, Cancel (when
 *  there is somewhere to cancel TO) then Submit, right-aligned. The border is set via inline
 *  style rather than the `border-t` utility — preflight is off (see tokens.css's own note on
 *  `border`), so a bare width-only utility with no explicit style computes to an invisible
 *  0px border, same failure Callout.jsx's "always" edge exists to avoid. */
function FormFooter({ note, onCancel, busy, done, submitLabel, savedLabel, submitDisabled, bleed = true, divider = true, className = "" }) {
  return (
    <div
      className={`${bleed ? "-mx-5 px-5 " : ""}flex flex-wrap items-center justify-between gap-3${divider ? " pt-4" : ""}${className ? ` ${className}` : ""}`}
      style={divider ? { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--ctl-border)" } : undefined}
    >
      <p className="m-0 text-xs text-ctl-fg-muted">{note}</p>
      <ButtonRow>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          type="submit"
          data-cx-action="submit"
          loading={busy}
          disabled={submitDisabled}
          aria-disabled={busy || undefined}
          // Busy is NOT the `disabled` attribute (see file banner) — opacity/cursor carry the
          // state instead, so the button never leaves the tab order mid-save. The Saved state's
          // shadow drops via the `shadow-none` CLASS, not an inline boxShadow — Buttons.jsx's own
          // file banner is explicit that an inline boxShadow wins the cascade over the composed
          // shadow class and silently deletes the focus ring riding the same property.
          className={(busy ? "pointer-events-none cursor-default opacity-40 " : "") + (done ? "shadow-none" : "")}
          style={done ? { backgroundImage: "none", background: "var(--success-600)", borderColor: "var(--success-600)" } : undefined}
        >
          {busy ? "Saving…" : done ? savedLabel : submitLabel}
        </Button>
      </ButtonRow>
    </div>
  );
}

/**
 * FormCard — create a record.
 *
 * `onCreated(record)` fires after a successful createItem, which is how a caller refreshes a
 * list beside it. Errors render in place rather than throwing: a form that vanishes on a
 * validation failure loses everything the user typed.
 */
export function FormCard({ flowType = "Form", flowId, title = "Create record", max = 6, fields = [], required = [], onCreated }) {
  const kf = useKf();
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null); // holds the created record, so its id can be shown
  const [attempted, setAttempted] = useState(false);

  const shown = editable(fields, max);
  const set = (id, v) => {
    setValues((s) => ({ ...s, [id]: v }));
    if (done) setDone(null); // editing again leaves the Saved state
  };

  const missing = shown.filter((f) => required.includes(fieldId(f)) && isEmpty(values[fieldId(f)]));
  const invalidIds = attempted ? missing.map(fieldId) : [];

  const submit = async (e) => {
    e?.preventDefault?.();
    if (busy || !shown.length) return;
    setAttempted(true);
    if (missing.length) return; // Invalid state — field-level only, no SDK call, no banner
    setBusy(true);
    setError(null);
    try {
      const data = Object.fromEntries(shown.map(f => [fieldId(f), values[fieldId(f)]]).filter(([, value]) => value !== undefined));
      const created = await flowHandle(kf, flowType, flowId).createItem({ data });
      setValues({});
      setAttempted(false);
      setDone(created ?? {});
      onCreated?.(created);
    } catch (err) {
      setError(String(err?.message ?? err)); // values are left exactly as typed
    } finally {
      setBusy(false);
    }
  };

  const createdId = done?._id ?? done?.Id ?? done?.id;

  return (
    <form onSubmit={submit}>
    <Card role="group" title={title}>
      <div className="flex flex-col gap-4">
      {error && (
        <Callout tone="danger" title="Could not save" onDismiss={() => setError(null)}>
          {error}
        </Callout>
      )}
      {done && (
        <Callout tone="success" onDismiss={() => setDone(null)}>
          Record created{createdId ? <> — <span className="font-mono">{String(createdId)}</span></> : "."}
        </Callout>
      )}
      <FieldGrid fields={shown} values={values} onChange={set} required={required} invalidIds={invalidIds} />
      <FormFooter
        note={invalidIds.length ? `${invalidIds.length} required field${invalidIds.length > 1 ? "s" : ""} need${invalidIds.length > 1 ? "" : "s"} a value` : ""}
        busy={busy}
        done={Boolean(done)}
        submitLabel="Create"
        savedLabel="Created"
        submitDisabled={!shown.length}
      />
      </div>
    </Card>
    </form>
  );
}

const ItemFormContext = createContext(null);

function useItemFormContext(name) {
  const value = useContext(ItemFormContext);
  if (!value) throw new Error(`${name} must be rendered inside ItemForm.Root`);
  return value;
}

/**
 * ItemForm.Root — shared record state and the edit/view boundary.
 *
 * Root deliberately owns no surface or spacing. A caller can therefore place Fields in a Drawer
 * or Modal body and Actions in that layer's footer while both slots keep one validation/save
 * state. Edit mode owns the native form; read-only mode owns a plain content boundary and never
 * mounts actions or a submit path.
 */
export function ItemFormRoot({ flowType = "Form", flowId, item, fields = [], required: requiredProp, readOnly = false, onClose, onSaved, formId, submitLabel, children }) {
  const kf = useKf();
  // required defaults to what the schema says: a page that forgets the list still gets a form that
  // refuses an empty submission with a visible "Required" mark instead of silently doing nothing
  const required = Array.isArray(requiredProp) ? requiredProp : fields.filter((f) => f && (f.Required ?? f.required) === true).map(fieldId);
  const [values, setValues] = useState(() => ({ ...(item ?? {}) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState(null);

  const shown = editable(fields, Infinity);
  const set = (id, v) => {
    setValues((s) => ({ ...s, [id]: v }));
    if (saved) setSaved(false);
  };
  const itemId = item?._id ?? item?.Id ?? item?.id;

  const missing = shown.filter((f) => required.includes(fieldId(f)) && isEmpty(values[fieldId(f)]));
  const invalidIds = attempted ? missing.map(fieldId) : [];

  const save = async (e) => {
    e?.preventDefault?.();
    if (readOnly || busy || !shown.length) return;
    setAttempted(true);
    if (missing.length) return;
    setBusy(true);
    setError(null);
    try {
      const handle = flowHandle(kf, flowType, flowId);
      const data = Object.fromEntries(shown.map(f => [fieldId(f), values[fieldId(f)]]).filter(([, value]) => value !== undefined));
      let result;
      if (itemId == null) {
        // Retain a created process draft if submission fails; retry must not create a duplicate.
        result = createdDraftId ? await handle.updateItem({ instanceId: createdDraftId, data }) : await handle.createItem({ data });
        const newId = createdDraftId ?? result?._id ?? result?.Id ?? result?.id;
        if (flowType === "Process") {
          if (!newId) throw new Error('PROCESS_CREATE_ID_MISSING: SDK did not return a record identity');
          setCreatedDraftId(newId);
          if (typeof handle.submitItem !== 'function') throw new Error(`PROCESS_SUBMIT_UNAVAILABLE: draft ${newId} was created but not submitted`);
          await handle.submitItem({ instanceId: newId });
        }
      } else {
        const idArgs = flowType === "Form" ? { itemId } : { instanceId: itemId };
        const activityInstanceId = item?._activity_instance_id ?? item?.activityInstanceId ?? item?.ActivityInstanceId;
        result = await handle.updateItem({
          ...idArgs,
          ...(flowType === "Process" && activityInstanceId ? { activityInstanceId } : {}),
          data,
        });
      }
      setAttempted(false);
      setSaved(true);
      onSaved?.(result ?? values);
      onClose?.();
    } catch (err) {
      setError(String(err?.message ?? err)); // values are left exactly as typed
    } finally {
      setBusy(false);
    }
  };

  // the primary action reads what it does: an explicit label wins; otherwise a new Process record is
  // "Submit" (it starts the workflow), an existing record "Save", a new Form/Dataset record "Create"
  const actionLabel = submitLabel || (item ? "Save" : flowType === "Process" || flowType === "Case" ? "Submit" : "Create");
  const state = {
    actionLabel,
    error,
    setError,
    saved,
    setSaved,
    itemId,
    shown,
    values,
    set,
    required,
    invalidIds,
    readOnly,
    note: invalidIds.length ? `${invalidIds.length} required field${invalidIds.length > 1 ? "s" : ""} need${invalidIds.length > 1 ? "" : "s"} a value` : "",
    onClose,
    busy,
    submitDisabled: readOnly || !shown.length,
  };

  if (readOnly) {
    return (
      <ItemFormContext.Provider value={state}>
        <div id={formId} data-item-form-mode="view">{children}</div>
      </ItemFormContext.Provider>
    );
  }

  return (
    <ItemFormContext.Provider value={state}>
      <form id={formId} onSubmit={save}>{children}</form>
    </ItemFormContext.Provider>
  );
}

/** Fields own only form messages and controls; a containing surface owns the outer padding. */
export function ItemFormFields({ className = "" }) {
  const { error, setError, saved, setSaved, itemId, shown, values, set, required, invalidIds, readOnly } = useItemFormContext("ItemForm.Fields");
  return (
    <div className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
      {error && (
        <Callout tone="danger" title="Could not save" onDismiss={() => setError(null)}>
          {error}
        </Callout>
      )}
      {saved && (
        <Callout tone="success" onDismiss={() => setSaved(false)}>
          Record saved{itemId ? <> — <span className="font-mono">{String(itemId)}</span></> : "."}
        </Callout>
      )}
      <FieldGrid fields={shown} values={values} onChange={set} required={required} invalidIds={invalidIds} readOnly={readOnly} />
    </div>
  );
}

/**
 * Actions are borderless by default because a Drawer or Modal footer owns the full-width rule and
 * inset. `divider` and `bleed` are reserved for the backwards-compatible standalone Card path.
 */
export function ItemFormActions({ divider = false, bleed = false, className }) {
  const { note, onClose, busy, saved, submitDisabled, readOnly, actionLabel } = useItemFormContext("ItemForm.Actions");
  if (readOnly) return null;
  return (
    <FormFooter
      note={note}
      onCancel={onClose}
      busy={busy}
      done={saved}
      submitLabel={actionLabel || "Save"}
      savedLabel="Saved"
      submitDisabled={submitDisabled}
      divider={divider}
      bleed={bleed}
      className={className ?? (bleed ? "" : "w-full")}
    />
  );
}

/**
 * ItemForm — backwards-compatible standalone composition.
 *
 * Layered editors should prefer ItemForm.Root + ItemForm.Fields + ItemForm.Actions so the layer
 * owns its structural footer. `embedded` remains only as a compatibility path for older callers.
 */
export function ItemForm({ embedded = false, readOnly = false, ...props }) {
  return (
    <ItemFormRoot {...props} readOnly={readOnly}>
      {embedded ? (
        <div className="flex flex-col gap-4">
          <ItemFormFields />
          <ItemFormActions divider />
        </div>
      ) : (
        <Card role="group" title={readOnly ? "Record details" : "Edit record"}>
          <div className="flex flex-col gap-4">
            <ItemFormFields />
            <ItemFormActions divider bleed />
          </div>
        </Card>
      )}
    </ItemFormRoot>
  );
}

ItemForm.Root = ItemFormRoot;
ItemForm.Fields = ItemFormFields;
ItemForm.Actions = ItemFormActions;

/**
 * NewButton — create an empty record and hand it back.
 *
 * Without a callback, open the platform's new-record form so required values can be entered
 * before creation. Callers providing `onCreated` retain the explicit create-and-callback API.
 * `rank` defaults to "primary" — Forms.dc.html's own split for the
 * ONE-flow case; NewMenu (several flows) is the one that reaches for "strong".
 *
 * `required` is accepted for signature parity with FormCard/ItemForm, per Forms.dc.html's API
 * table, but does nothing here on purpose: NewButton has no field UI to validate against — it
 * delegates required-field validation to the platform form. The explicit `onCreated` path
 * still relies on flow defaults; callers needing input must use the default form-opening path.
 */
export function NewButton({ flowType = "Form", flowId, label = "New", rank = "primary", required = [], onCreated }) {
  const kf = useKf();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const handle = flowHandle(kf, flowType, flowId);
      if (typeof onCreated === "function") onCreated(await handle.createItem({}));
      else await handle.openForm({});
    } catch (err) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <Button variant={buttonVariant(rank)} onClick={create} loading={busy} disabled={busy} data-cx-action="create">
        {busy ? "Creating…" : label}
      </Button>
      {error && (
        <span className="text-xs" style={{ color: "var(--danger-text)" }}>
          {error}
        </span>
      )}
    </span>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * NewMenu — NewButton across several flows. `items: [{ flowType, flowId, label }]`.
 *
 * "SEVERAL flows -> strong-rank button + a chevron opening a menu... a row of four primaries has
 * no primary." A single item collapses straight to NewButton — Forms.dc.html's own "one flow"
 * case, so a one-item NewMenu should look exactly like reaching for NewButton directly rather
 * than opening a dropdown with one row in it.
 *
 * Built on @radix-ui/react-dropdown-menu directly rather than Floating.jsx's own DropdownMenu —
 * see the file banner's NewMenu paragraph for why.
 */
export function NewMenu({ items = [], label = "New", required = [], onCreated }) {
  const kf = useKf();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  if (!items.length) return null;
  if (items.length === 1) {
    const it = items[0];
    return <NewButton flowType={it.flowType} flowId={it.flowId} label={it.label ?? label} onCreated={onCreated} />;
  }

  const create = async (it, i) => {
    setBusyId(it.flowId ?? i);
    setError(null);
    try {
      onCreated?.(await flowHandle(kf, it.flowType, it.flowId).createItem({}));
    } catch (err) {
      setError(String(err?.message ?? err));
    } finally {
      setBusyId(null);
      setOpen(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <ButtonBase variant="primary">
            {label}
            <ChevronDown />
          </ButtonBase>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={6}
            // Same semantic layer contract as the rest of the kit — layer surface and edge,
            // medium elevation and the large radius — even though Floating.jsx
            // (the more natural home for a floating surface) hasn't been redesigned onto these
            // tokens yet.
            className="z-40 min-w-40 rounded-xl border border-solid border-layer-border bg-layer-surface p-1 text-ctl-fg shadow-md outline-none"
          >
            {items.map((it, i) => {
              const busy = busyId === (it.flowId ?? i);
              return (
                <DropdownMenuPrimitive.Item
                  key={it.flowId ?? i}
                  disabled={busy}
                  onSelect={(e) => {
                    e.preventDefault(); // keep the menu open until the write settles
                    create(it, i);
                  }}
                  className="flex w-full cursor-pointer select-none items-center rounded-md border-0 bg-transparent px-3 py-2 text-left text-sm text-ctl-fg outline-none data-[highlighted]:bg-ctl-raise data-[disabled]:cursor-default data-[disabled]:opacity-50"
                >
                  {busy ? "Creating…" : it.label ?? "New"}
                </DropdownMenuPrimitive.Item>
              );
            })}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
      {error && (
        <span className="text-xs" style={{ color: "var(--danger-text)" }}>
          {error}
        </span>
      )}
    </span>
  );
}
