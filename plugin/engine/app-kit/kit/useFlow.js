// GENERATED from starter/src/components/kit/useFlow.js (sha256:1097789e9ec691ac). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
/**
 * useFlow — one place that knows how to reach a Kissflow flow.
 *
 * Extracted because four components need the same thing and the logic is genuinely hard to get
 * right: ModelChart, DataTable, the SDK-bound Timeline and the SDK-bound KanbanBoard. It was
 * duplicated in the first two, which is how the Process bug in the original Chart.jsx survived
 * so long — the fix lived in one copy.
 *
 * THE PROCESS PROBLEM, which is the whole reason this file exists. The three surfaces disagree
 * about how to list a Process's records:
 *   offline mock    getProcess(id).getItems  does not exist and THROWS (mock-kf.ts:225, on purpose)
 *   live dev proxy  getProcess(id).getItems  works, lists via /myitems (live-kf.ts:76)
 *   real SDK        documented as getAdminItems / getParticipatedItems / getMyItems, and
 *                   agents/kissflow-sdk.md:69 says those return { items, total }, not
 *                   { Data, Columns }
 * So a Process is a try-in-order across four method names with two response shapes normalised.
 * Calling getItems() unconditionally — which the original Chart.jsx did — renders in live dev
 * and dies everywhere else.
 *
 * KEEP GOING PAST AN EMPTY SUCCESS. getAdminItems under a non-admin key, and getMyItems for a
 * user who has raised nothing, both answer `{ items: [] }` rather than throwing. Stopping at the
 * first call that merely doesn't throw renders an empty screen while a later API still had the
 * rows.
 */

import { useEffect, useState } from "react";
import { useKf, useKfDev } from "@kissflow/app-ui";
import appSchema from "../../../lib/kf-schema.json";
import { effectiveRecordScope, fetchParticipatingRows } from "./record-scope.js";
import { readAllPages, shareRead, invalidateReads } from './data-access.js';
import { normaliseCaseRows, caseTarget } from './case-status.js';
export { normaliseCaseRow, caseTarget } from './case-status.js';

/** Normalise the two response shapes the surfaces return. */
const normalise = (r) => ({ Data: r?.Data ?? r?.items ?? [], Columns: r?.Columns ?? [] });

/** A handle for any flow type. Exported because the write paths (create/update) need it too. */
export function flowHandle(kf, flowType, flowId) {
  if (flowType === "Case") return kf.app.getBoard(flowId);
  if (flowType === "Process") return kf.app.getProcess(flowId);
  return kf.app.getDataform(flowId);
}

/** Read a flow's records, whichever surface we are running against. */
export async function fetchRows(kf, flowType, flowId) {
  return shareRead(kf, `${flowType}:${flowId}`, () => fetchRowsUnshared(kf, flowType, flowId));
}
async function fetchRowsUnshared(kf, flowType, flowId) {
  const handle = flowHandle(kf, flowType, flowId);
  const scope = effectiveRecordScope(appSchema, kf, flowId);
  if (scope === "participating") {
    if (flowType !== "Process") throw new Error("RECORD_SCOPE_UNSUPPORTED: participation is process-only");
    return fetchParticipatingRows(handle);
  }
  if (flowType === "Case") return normaliseCaseRows(await readAllPages(opts => handle.getItems(opts)));
  if (flowType !== "Process") return readAllPages(opts => handle.getItems(opts));

  // getAdminItems is the closest analogue to a dataform's getItems (every record), but it needs
  // admin scope — so this is a try-in-order, not a capability check.
  const attempts = ["getAdminItems", "getParticipatedItems", "getMyItems", "getItems"];
  let lastError, empty = null;
  for (const name of attempts) {
    if (typeof handle?.[name] !== "function") continue;
    try {
      // getMyItems defaults to drafts only; "all" is the documented widest scope.
      const result = await readAllPages(opts => handle[name](opts), name === "getMyItems" ? { status: "all" } : {});
      if (result.Data.length) return result;
      empty = empty ?? result;
    } catch (e) {
      if (String(e?.message || '').startsWith('PAGINATION_')) throw e;
      lastError = e;
    }
  }
  if (empty) return empty;
  throw lastError ?? new Error(`No listing API on process ${flowId}`);
}

// A board's statuses as the UI schema carries them ({id, name, category, system}).
export function boardStatusesFor(flowId) {
  return (appSchema?.dataModels || []).find((m) => m.id === flowId)?.statuses || [];
}

function displayRecord(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return row;
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    value && typeof value === "object" && !Array.isArray(value)
      ? (value.Name ?? value.value ?? value._id ?? "—")
      : value,
  ]));
}

/**
 * The hook every SDK-bound kit component uses.
 *
 * Returns { rows, columns, loading, error, blocked, reload }. `blocked` is the dev role-switcher
 * saying this role cannot see the flow — a distinct state from "no rows", because they want
 * different copy: one is a permission boundary, the other an invitation to create something.
 */
export function useFlow(flowType = "Form", flowId, deps = []) {
  const kf = useKf();
  const { active, canAccess } = useKfDev();
  const blocked = active && !canAccess(flowId);
  const identityKey = JSON.stringify([kf?.user?._id, kf?.user?.AppRoles]);

  const [state, setState] = useState({ rows: [], columns: [], loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (blocked) { setState({ rows: [], columns: [], loading: false, error: null, identityKey }); return; }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const { Data, Columns } = await fetchRows(kf, flowType, flowId);
        if (alive) setState({ rows: Data ?? [], columns: Columns ?? [], loading: false, error: null, identityKey });
      } catch (e) {
        if (alive) setState({ rows: [], columns: [], loading: false, error: String(e?.message ?? e), identityKey });
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kf, flowType, flowId, blocked, identityKey, nonce, ...deps]);

  // Generated comprehensive pages use the domain-oriented `records` name, while the original kit
  // components use `rows`. Expose both over the same array instead of forcing every page builder to
  // reimplement an adapter (or crashing at `records.filter`). Write/open helpers belong on the same
  // handle for the same reason: the page should not need to know how Form, Process and Case handles
  // are obtained from the SDK.
  let handle = null;
  try { handle = flowHandle(kf, flowType, flowId); } catch { /* the read effect reports SDK errors */ }
  const call = (name) => (...args) => handle?.[name]?.(...args);
  const visible = !blocked && state.identityKey === identityKey ? state : { ...state, rows: [], columns: [] };
  const reload = () => { invalidateReads(kf); setNonce((n) => n + 1); };
  // ACT ON A WORKFLOW RECORD, the one way every page does it: write the step's fields, then move the
  // record (approve = forward, reject = terminal Rejected, sendback = one step back, submit = a draft
  // leaves the initiator), then re-read. Pages that wired their own approve buttons either forgot the
  // decision field, called a method the SDK does not have, or never refreshed — the rendered check saw
  // an inert control every time. `row` may be a record ({_id}) or a queue item ({id}).
  const act = async (row, data = {}, kind = "approve") => {
    const _id = row?._id ?? row?.id;
    if (!_id) throw new Error("act(): the row needs an _id (or a queue item an id)");
    // the SDK keys a record by instanceId on a Process/Case and by itemId on a Form/Dataset
    const idArgs = flowType === "Form" || flowType === "Dataset" ? { itemId: _id } : { instanceId: _id };
    const hasData = data && Object.keys(data).length > 0;
    // Local guarded workflows expose one atomic command; never persist a rejected
    // decision first via updateItem. Native deployment refuses these policies until
    // an equivalent server-side adapter is verified.
    if (typeof handle?.actItem === "function" && flowType !== "Form" && flowType !== "Dataset") {
      const action = ["approve", "reject", "sendback", "submit"].includes(String(kind).toLowerCase()) ? String(kind).toLowerCase() : "approve";
      const snapshot = visible.rows.find(r => r._id === _id) || row;
      const result = await handle.actItem({ ...idArgs, data, action,
        expectedStep: snapshot._current_step, expectedRevision: snapshot._revision ?? 0 });
      reload();
      return result;
    }
    if (hasData) await handle?.updateItem?.({ ...idArgs, data });
    // A board has no approve/reject/sendback: an action is a STATUS MOVE —
    // POST /case/2/{acc}/{board}/{item}/{current _status_id}/move {_status_id}. The SDK has no move
    // method, so it goes through kf.api; failures are raised, never swallowed into a dead button.
    if (flowType === "Case") {
      const snapshot = visible.rows.find(r => r._id === _id) || row;
      const statuses = boardStatusesFor(flowId);
      const current = snapshot._status_id;
      const target = caseTarget(statuses, current, kind);
      if (!target) throw new Error(`act(): no status to move "${snapshot._current_step || _id}" to for "${kind}" on ${flowId}`);
      if (!current) throw new Error(`act(): ${flowId} item ${_id} has no _status_id — reload the board`);
      if (current === target.id) { reload(); return snapshot; }
      if (typeof kf?.api !== "function" || !kf?.account?._id) throw new Error("act(): this Kissflow page cannot move board items (kf.api unavailable)");
      const res = await kf.api(`/case/2/${kf.account._id}/${flowId}/${_id}/${current}/move`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _status_id: target.id }) });
      if (!res || res.isError || res.errorMessage || res.error || (typeof res.ok === "boolean" && !res.ok))
        throw new Error(`act(): moving to "${target.name}" failed${res?.message || res?.error ? ` — ${res.message || res.error}` : ""}`);
      reload();
      return res;
    }
    // a Form/Dataset record has no workflow: acting on it IS the update (toggle active, set a flag).
    // Silence here was the "Deactivate does nothing" bug — say so instead.
    if (flowType === "Form" || flowType === "Dataset") {
      if (!hasData) throw new Error(`act(): ${flowId} is a ${flowType}; pass the fields to change, e.g. act(row, { active: !row.active })`);
      reload();
      return { _id, ...data };
    }
    // kind: approve | reject | sendback | submit. Anything else (a step id such as "record_payout")
    // means "complete this step", which moves the record forward — the same as approve.
    const method = { approve: "approveItem", reject: "rejectItem", sendback: "sendbackItem", submit: "submitItem" }[String(kind || "approve").toLowerCase()] || "approveItem";
    const result = await handle?.[method]?.(idArgs);
    reload();
    return result;
  };
  return {
    ...visible,
    records: visible.rows.map(displayRecord),
    blocked,
    reload,
    act,
    openForm: call("openForm"),
    createItem: async (...args) => { const r = await handle?.createItem?.(...args); reload(); return r; },
    updateItem: async (...args) => { const r = await handle?.updateItem?.(...args); reload(); return r; },
    submitItem: call("submitItem"),
    approveItem: call("approveItem"),
    rejectItem: call("rejectItem"),
    sendbackItem: call("sendbackItem"),
  };
}

/** Cell values arrive as objects on reference and user fields ({Name} / {value} / {_id}).
 *  Rendering the raw object prints [object Object], which is the most common way a generated
 *  page looks broken while the data is fine. */
export const cellText = (v) =>
  v && typeof v === "object" ? (v.Name ?? v.value ?? v._id ?? "—") : (v ?? "—");

/** Pick a column to group or label by. Mirrors the original Chart.jsx's heuristic, plus a
 *  row-key fallback for the { items, total } shape, which carries no Columns to choose from. */
export function pickKey(preferred, columns, firstRow) {
  if (preferred) return preferred;
  const cols = columns || [];
  const typed = cols.find((c) => !c.IsInternal && /select|status|text/i.test(c.Type));
  if (typed) return typed.Id;
  if (cols[0]) return cols[0].Id;
  return Object.keys(firstRow || {}).find((k) => !k.startsWith("_"));
}
