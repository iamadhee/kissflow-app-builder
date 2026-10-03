import { useEffect, useState } from "react";
import { useKf } from "@kissflow/app-ui";

import { Drawer } from "./kit/Drawer.jsx";
import { ItemForm } from "./kit/Forms.jsx";
import { Alert } from "./kit/Alert.jsx";

/**
 * The record form, in preview.
 *
 * In Kissflow, `openForm()` hands off to the PLATFORM — it renders its own native record form over
 * the custom UI, and no page here draws one. Offline there is no platform, so the mock's openForm
 * used to be a no-op and every "open", every row click and every create button in a preview did
 * nothing at all. Nothing errored, so a reviewer could not tell a wired handler from a decorative
 * one — and forty pages of "click a row to see the record" demonstrated nothing.
 *
 * The mock now announces the intent (`kf:open-form`) instead of swallowing it, and this listens.
 * Mounted once in the shell, so every page gets it without a single page-level change.
 *
 * What opens here is the KIT's ItemForm, built from the model's real column metadata. This is preview
 * infrastructure, so it stays out of the interface: reviewers should see the form, not an explanation
 * of how the form is implemented.
 */
// Nothing loaded. `item: null` is what keeps `ready` false, so this is the only shape that may sit
// in state while no record has been read — see the reset in onOpen/close below for why that matters.
const cleared = () => ({ loading: false, item: null, fields: [], error: null });

export function RecordSheet() {
  const kf = useKf();
  const [req, setReq] = useState(null);      // { flowId, family, id, mode }
  const [state, setState] = useState(cleared);

  useEffect(() => {
    // CLEAR BEFORE OPENING. State used to survive a close, so reopening rendered `ready` against the
    // PREVIOUS record for the frame before the fetch effect ran — and ItemForm snapshots `item` into
    // its `values` exactly once, at mount. When those two updates batched, the form never remounted
    // and the previous record stayed on screen for good (open #2 showing record #1's values).
    // Clearing here means a stale item can never satisfy `ready`, whatever the batching does.
    const onOpen = (e) => { setState(cleared()); setReq(e.detail || null); };
    window.addEventListener("kf:open-form", onOpen);
    return () => window.removeEventListener("kf:open-form", onOpen);
  }, []);

  useEffect(() => {
    if (!req?.flowId || !kf?.app) return;
    let alive = true;
    setState({ loading: true, item: null, fields: [], error: null });

    (async () => {
      try {
        // The handle differs by family, exactly as it does everywhere else in this app.
        const h = req.family === "process" ? kf.app.getProcess(req.flowId)
          : req.family === "board" ? kf.app.getBoard(req.flowId)
          : kf.app.getDataform(req.flowId);

        const fields = (await h.getFields?.()) ?? [];
        // A create flow opens with no id yet — that is a blank form, not an error.
        const item = req.id ? await h.getItem?.({ itemId: req.id, instanceId: req.id, _id: req.id }) : {};
        if (!alive) return;
        // NOT FOUND IS NOT BLANK. getItem answers null when the id resolves to no readable row, and
        // this once coerced that to `{}` — which passes `ready` and renders a fully editable "Edit
        // record" form with every field empty and no hint the read failed. Indistinguishable from a
        // record that genuinely has no values, so a stale id looked like data loss. Report it.
        if (item == null) {
          setState({ loading: false, item: null, fields: [], error: `Record ${req.id} was not found in ${req.flowId}.` });
          return;
        }
        setState({ loading: false, item, fields, error: null });
      } catch (err) {
        if (alive) setState({ loading: false, item: null, fields: [], error: String(err?.message ?? err) });
      }
    })();

    return () => { alive = false; };
  }, [req, kf]);

  if (!req) return null;
  const close = () => { setReq(null); setState(cleared()); };
  const ready = !state.loading && !state.error && state.item !== null;
  const readOnly = req.mode === "view";
  const title = readOnly ? "Record details" : req.id ? "Edit record" : "New record";

  if (ready) {
    return (
      <ItemForm.Root
        // ItemForm seeds `values` from `item` once, in a lazy useState with no effect syncing later
        // changes, so it is only ever right if it REMOUNTS per record. ExpressPage's inline copy keys
        // it the same way; without a key here the identity is stable across records and a reused
        // instance keeps the first record's values. Both guards are cheap; relying on either alone is
        // relying on a render race.
        key={req.id ?? "new"}
        flowType={req.family === "process" ? "Process" : req.family === "board" ? "Board" : "Form"}
        flowId={req.flowId}
        item={state.item}
        fields={state.fields}
        readOnly={readOnly}
        onClose={close}
        onSaved={close}
      >
        <Drawer
          open
          onClose={close}
          title={title}
          data-cx-surface="platform-record"
          size="lg"
          footer={readOnly ? null : <ItemForm.Actions />}
        >
          <ItemForm.Fields />
        </Drawer>
      </ItemForm.Root>
    );
  }

  return (
    <Drawer open onClose={close} title={title} size="lg">
      {state.error ? (
        <Alert tone="danger" title="Could not load this record">{state.error}</Alert>
      ) : state.loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}
    </Drawer>
  );
}
