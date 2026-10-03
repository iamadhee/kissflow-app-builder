import { assertActionGuards } from "./action-guards.mjs";
import { deriveRecords, isComputed } from "./computed-values.mjs";
// the preview runs in sandboxes without structuredClone (the engine's record-scope test); JSON is enough for rows
const cloneValue = (v) => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const PROCESS_SAMPLE = {
    _status: "In Progress",
    _current_step: "Review",
    _current_assigned_to: { Name: "Dev User", _id: "u_mock" },
    _submitted_at: "2026-06-23T10:00:00.000Z",
    _request_number: 1001,
    _progress: 40,
    _counter: 1,
};
// Deterministic hash → stable demos, but VARIED values (not monotonic) so charts actually shape:
// trends curve, breakdowns spread across categories, pipelines spread across statuses.
const HASH = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) {
    x ^= s.charCodeAt(i);
    x = Math.imul(x, 16777619);
} return x >>> 0; };
const STATUSES = ["Draft", "In Progress", "Pending Approval", "Approved", "Rejected", "Completed"];
const DATE_BASE = Date.parse("2026-06-30T00:00:00.000Z"); // fixed "today" so dates are stable + recent
/** A deterministic but well-spread sample value for a field, seeded by (model, field, row). */
function sampleValue(field, i, model, refModelId = () => null) {
    const t = (field.type || "Text").toLowerCase();
    const r = (HASH(`${model.id}:${field.id}:${i}`) % 10000) / 10000; // 0..1, deterministic
    switch (t) {
        case "number":
            return Math.round(5 + r * 95);
        case "currency":
            return Number((50000 + r * 4950000).toFixed(0)); // 50k – 5M, well spread
        case "date":
        case "datetime": {
            const iso = new Date(DATE_BASE - Math.floor(r * 330) * 86400000).toISOString(); // spread ~11 months back
            return t === "date" ? iso.slice(0, 10) : iso;
        }
        case "email":
            return `user${i + 1}@example.com`;
        case "boolean":
        case "yes/no":
            return r > 0.5;
        // Reference and User fields come back from the REAL SDK as objects, not strings. The mock used
        // to hand back a plain string for both, so a page that rendered `{row.Owner}` looked fine in the
        // preview and printed "[object Object]" once live — the single most expensive kind of
        // prototype/runtime divergence, because review cannot catch it. Match the real shape.
        case "reference":
        case "user":
        case "userpicker": {
            const word = (field.name.split(/\s+/)[0] || "Item").replace(/[^A-Za-z]/g, "") || "Item";
            const pool = t === "reference"
                ? [`${word} A`, `${word} B`, `${word} C`, `${word} D`, `${word} E`]
                : ["Nadia Farrell", "Tom Okafor", "Priya Raman", "Sam Whitfield", "Dev User"];
            const pick = Math.floor(r * r * pool.length) % pool.length;
            // A synthesized Reference must point at a row that EXISTS. It used to mint `Asset_1` from the
            // field name while the target's rows are `Asset_A01_n`, so any page joining strictly by _id
            // found nothing and silently fell back to name matching — thin in preview, and it trains the
            // page to write a fallback it does not need. `field.ref` (the target flow) makes the id real.
            const targetId = t === "reference" && field.ref ? refModelId(field.ref) : null;
            return { _id: targetId ? `${targetId}_${pick + 1}` : `${field.id}_${pick + 1}`, Name: pool[pick] };
        }
        case "select":
        case "dropdown": {
            // no option list in the synced schema → synthesize 5 stable, field-named categories with
            // uneven frequency (r*r skews toward A/B) so a donut/bar has real shape, not equal slices.
            const word = (field.name.split(/\s+/)[0] || "Item").replace(/[^A-Za-z]/g, "") || "Item";
            const pool = [`${word} A`, `${word} B`, `${word} C`, `${word} D`, `${word} E`];
            return pool[Math.floor(r * r * pool.length) % pool.length];
        }
        default:
            return `${field.name} ${i + 1}`;
    }
}
/**
 * Rows for a model: the app's own seeded domain data when the schema carries any, else synthesized.
 *
 * A seeded row owns its domain truth. Fields it omits receive type-correct empty values rather than
 * invented facts; only process/case system metadata is synthesized. This prevents a deliberately
 * absent "Booked Cost" from becoming a random $4.2M while still leaving no field undefined.
 */
function rowsFor(model, seed, refModelId = () => null) {
    if (seed === undefined)
        return makeRows(model, undefined, refModelId).map((row) => withDisplayAliases(model, row));
    const filler = makeRows(model, seed.length, refModelId);
    return seed.map((row, i) => {
        const system = Object.fromEntries(Object.entries(filler[i]).filter(([key]) => key.startsWith('_')));
        const empty = Object.fromEntries(model.fields.map(f => [f.id, null]));
        return withDisplayAliases(model, { ...system, ...empty, ...row, _id: row._id || filler[i]._id });
    });
}
/**
 * Live Kissflow rows carry a "Name" — and generated pages lean on that convention with fallback
 * chains like `r.name || r.title`. Mock rows key everything by field id, so those chains missed and
 * whole galleries rendered a literal placeholder label per row. Alias the first non-empty text
 * field under Name/name/title (never overwriting a real value) so the convention holds offline.
 */
/**
 * Pages read row keys in whatever spelling their builder used — "Expiry Date" vs the field's
 * "Expiry date", "Customer" vs "Buyer customer", "Financing terms" vs "Financing option". Exact-key
 * misses rendered em dashes over real values, one spelling at a time. Rows therefore answer
 * TOLERANTLY at read time: exact key, then case/punctuation-insensitive, then unique containment,
 * then unique shared-leading-token. Ambiguity stays a miss — guessing between two candidates would
 * put the wrong value in a cell.
 */
function tolerantRow(row) {
    const normKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return new Proxy(row, {
        get(target, key, receiver) {
            if (typeof key !== "string" || key in target)
                return Reflect.get(target, key, receiver);
            const wanted = normKey(key);
            if (!wanted)
                return undefined;
            const keys = Object.keys(target);
            const exact = keys.find((candidate) => normKey(candidate) === wanted);
            if (exact)
                return target[exact];
            const contains = keys.filter((candidate) => {
                const n = normKey(candidate);
                return n.includes(wanted) || wanted.includes(n);
            });
            if (contains.length === 1)
                return target[contains[0]];
            const lead = key.toLowerCase().match(/[a-z0-9]{4,}/)?.[0];
            if (lead) {
                const kin = keys.filter((candidate) => !candidate.startsWith("_") && candidate.toLowerCase().includes(lead));
                if (kin.length === 1)
                    return target[kin[0]];
            }
            return undefined;
        },
    });
}
function withDisplayAliases(model, row) {
    // Pages read rows by field NAME as often as by field id; expose every value under both.
    for (const field of model.fields) {
        if (row[field.id] !== undefined && field.name && !model.fields.some(f => f.id === field.name && f.id !== field.id))
            row[field.name] = row[field.id];
    }
    if (row.Name == null || row.name == null || row.title == null) {
        const textual = model.fields.filter((field) => typeof row[field.id] === "string" && String(row[field.id]).trim());
        // A name-like field beats whatever text field happens to come first — the first string on a
        // lead is often a priority enum, and a gallery of "High / Medium / Low" chips names nothing.
        const f = textual.find((field) => /name|title|subject|customer|vehicle|vin|model|reference/i.test(field.name)) ?? textual[0];
        const display = f ? String(row[f.id]) : null;
        if (display != null) {
            if (row.Name == null)
                row.Name = display;
            if (row.name == null)
                row.name = display;
            if (row.title == null)
                row.title = display;
        }
    }
    return row;
}
function makeRows(model, count, refModelId = () => null) {
    const isProcess = model.type === "Process";
    const n = count ?? 18 + (HASH(model.id) % 22); // 18–39 rows, varied per flow → enough to chart
    return Array.from({ length: n }, (_, i) => {
        const row = { _id: `${model.id}_${i + 1}` };
        for (const f of model.fields)
            row[f.id] = sampleValue(f, i, model, refModelId);
        // Spread items across the model's REAL states when we know them, so a state-scoped view (an
        // approval queue, a kanban lane) actually has rows and advancing one moves it. This applies to
        // CASES as much as processes — a case's lane IS its status, and stamping state only on processes
        // left every onboarding card with no status, so a five-lane board rendered them all in a
        // fallback lane (caught regenerating hr-board).
        const steps = model.steps ?? [];
        const at = steps.length ? HASH(`${model.id}:s:${i}`) % steps.length : -1;
        if (at >= 0)
            Object.assign(row, {
                _status: model.type === "Case" ? steps[at] : at === 0 ? "Draft" : "In Progress",
                _current_step: steps[at],
                _progress: Math.round(((at + 1) / (steps.length + 1)) * 100),
            });
        // Process-only system fields (request number, assignee, submitted-at) — a case has none of these.
        if (isProcess)
            Object.assign(row, PROCESS_SAMPLE, {
                _request_number: 1001 + i,
                _status: at >= 0 ? (at === 0 ? "Draft" : "In Progress") : STATUSES[HASH(`${model.id}:${i}`) % STATUSES.length],
                _current_step: at >= 0 ? steps[at] : PROCESS_SAMPLE._current_step,
                _progress: at >= 0 ? Math.round(((at + 1) / (steps.length + 1)) * 100) : HASH(`${model.id}:p:${i}`) % 100,
            });
        return row;
    });
}
function columns(model) {
    return model.fields.map((f) => ({
        Id: f.id,
        Name: f.name,
        Type: f.type,
        IsInternal: false,
        Required: f.required,
        ReadOnly: isComputed(f),
        formula: f.formula,
        formulaAst: f.formulaAst,
        Options: f.options ?? [],
    }));
}
let idSeq = 1000;
const nextId = (prefix) => `${prefix}_${++idSeq}`;
/**
 * Build a mock `kf`. The provider mutates `kf.user.AppRoles` when the dev switches
 * role, so the same instance is reused (stable identity for route-sync).
 */
export function createMockKf(schema) {
    const stores = new Map();
    const modelById = new Map();
    // flow NAME -> flow id, so a Reference can be pointed at a row that actually exists
    const norm = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const byName = new Map(schema.dataModels.map((m) => [norm(m.name), m.id]));
    const refModelId = (name) => byName.get(norm(name)) ?? null;
    // Generated pages address flows in whatever id style their builder assumed — the graph id
    // (flow_listing), the human name (Vehicle Listing), or a Kissflow-account-style id
    // (Vehicle_Listing_A00). The schema knows one spelling; a literal Map.get on another renders
    // every page as "no records" (the carlot empty-pages defect). Resolve exact id first, then the
    // normalized name/id with any trailing account suffix stripped.
    const byNorm = new Map();
    for (const m of schema.dataModels) {
        byNorm.set(norm(m.id), m.id);
        byNorm.set(norm(m.name), m.id);
    }
    const resolveFlowId = (flowId) => {
        if (modelById.has(flowId))
            return flowId;
        const raw = String(flowId || "");
        return byNorm.get(norm(raw)) ?? byNorm.get(norm(raw.replace(/_[A-Za-z]\d{2,}$/, ""))) ?? flowId;
    };
    for (const m of schema.dataModels) {
        stores.set(m.id, rowsFor(m, schema.seed ? schema.seed[m.id] || [] : undefined, refModelId).map(tolerantRow));
        modelById.set(m.id, m);
    }
    const hasComputed = schema.dataModels.some(m => m.fields.some(isComputed));
    let computedDirty = true;
    const computationClock = schema.computationClock || new Date().toISOString();
    const derive = (source = stores) => {
        const out = deriveRecords(schema.dataModels, source, { clock: computationClock, strict: false });
        for (const w of out.warnings || []) {
            const key = `${w.model}.${w.field}`;
            if (!warned.has(key)) {
                warned.add(key);
                console.warn(`[preview] computed value left blank: ${key} — ${w.error}`);
            }
        }
        return out;
    };
    const warned = new Set();
    const refreshComputed = () => {
        if (!hasComputed || !computedDirty)
            return;
        const next = derive();
        for (const m of schema.dataModels)
            stores.set(m.id, (next.get(m.id) || []).map((r) => tolerantRow(withDisplayAliases(m, r))));
        computedDirty = false;
    };
    const validateChange = (flow, id, candidate) => {
        if (!hasComputed)
            return candidate;
        const next = new Map(stores);
        const rows = (stores.get(flow) || []).filter(r => r._id !== id);
        next.set(flow, candidate ? [...rows, candidate] : rows);
        const derived = derive(next); // Validate the complete dependency closure BEFORE a write.
        computedDirty = true;
        return candidate ? derived.get(flow)?.find((row) => row._id === id) || candidate : null;
    };
    const assertWritable = (m, data) => {
        for (const key of Object.keys(data))
            if (m?.fields.some(f => (f.id === key || f.name === key) && isComputed(f)))
                throw new Error(`COMPUTED_READ_ONLY: ${key}`);
    };
    refreshComputed();
    /**
     * `family` matters because the REAL SDK surfaces differ, and the mock used to expose one merged
     * API for all three. A Process has NO `getItems()` — it has getMyItems / getMyTasksItems /
     * getParticipatedItems / getAdminItems — but the mock answered `getItems()` happily, so four
     * pages were written against a method that does not exist, sailed through review against seeded
     * data, and died live with "getProcess(...).getItems is not a function". A mock that is more
     * permissive than the real thing manufactures exactly this bug, so the shapes now match.
     */
    function flowHandle(rawFlowId, idKey, family = "dataform") {
        const flowId = resolveFlowId(rawFlowId);
        const rows = () => stores.get(flowId) ?? [];
        const model = modelById.get(flowId);
        const cols = () => (model ? columns(model) : []);
        const getId = (args = {}) => args[idKey];
        /**
         * Move an item along its workflow: +1 approve/submit, -1 send back, 0 with a terminal status
         * for reject. Past the last step the item completes. Mirrors the live semantics the pages are
         * written against (in Kissflow, Approve IS Submit), so the same handler works in both worlds.
         */
        const policyFor = (row, data = {}) => {
            assertWritable(model, data);
            if (model?.guardedWriteRoles === undefined)
                return null;
            const held = (kf.user.AppRoles || []).map((r) => r._id || r.id);
            if (!model.guardedWriteRoles.some(id => held.includes(id)))
                throw new Error("ACTION_ROLE_DENIED: no write grant");
            const policy = model.actionPolicy?.find(s => [s.id, s.name].includes(String(row._current_step)));
            if (model.type === "Process" && (!policy || policy.terminal || policy.unsupported || ["Completed", "Rejected"].includes(String(row._status))))
                throw new Error("ACTION_POLICY_UNSUPPORTED: no executable current human task");
            if (policy && !policy.actors.some(id => held.includes(id)))
                throw new Error("ACTION_ROLE_DENIED: current task belongs to another role");
            for (const key of Object.keys(data)) {
                const field = model.fields.find(f => f.id === key);
                const mode = policy?.fields[key] || (policy?.initiating && !Object.keys(policy.fields).length || !policy ? "Editable" : "ReadOnly");
                if (!field || !["Editable", "Mandatory"].includes(mode))
                    throw new Error(`ACTION_FIELD_DENIED: ${key}`);
                const value = data[key], type = field.type.toLowerCase();
                if (value == null || value === "")
                    continue; // requiredness is checked at action time
                const valid = ["number", "currency", "slider", "starrating"].includes(type) ? typeof value === "number" && Number.isFinite(value)
                    : ["boolean", "checkbox"].includes(type) ? typeof value === "boolean"
                        : ["attachment", "image", "multiselect", "checkboxgroup"].includes(type) ? Array.isArray(value) && value.every(v => typeof v === "string" ? !!v.trim() : v && typeof v === "object" && typeof v._id === "string" && !!v._id)
                            : ["reference", "user", "userpicker"].includes(type) ? typeof value === "string" || typeof value === "object" && !Array.isArray(value) && typeof value._id === "string"
                                : typeof value === "string";
                if (!valid)
                    throw new Error(`ACTION_VALUE_INVALID: ${key}`);
            }
            return policy;
        };
        const advance = (id, delta, terminal, action = "approve", data = {}, expectedRevision, expectedStep) => {
            const row = rows().find((r) => r._id === id);
            if (!row)
                return;
            assertScopedWrite(row);
            const policy = policyFor(row, data);
            if (expectedRevision !== undefined && expectedRevision !== (row._revision ?? 0))
                throw new Error("ACTION_REVISION_CONFLICT: re-read this record");
            if (expectedStep !== undefined && expectedStep !== row._current_step)
                throw new Error("ACTION_STEP_CONFLICT: the task has changed");
            const candidate = validateChange(flowId, id, { ...row, ...data });
            if (policy)
                for (const f of model?.fields || []) {
                    const mode = policy.fields[f.id];
                    if ((mode === "Mandatory" || f.required && (mode === "Editable" || policy.initiating && !Object.keys(policy.fields).length))
                        && (candidate[f.id] == null || candidate[f.id] === "" || Array.isArray(candidate[f.id]) && !candidate[f.id].length))
                        throw new Error(`ACTION_REQUIRED_INPUT: ${f.id}`);
                }
            assertActionGuards(policy?.action_guards || [], { action, record: candidate, readRelated: (flow, refId) => {
                    const matches = (stores.get(flow) || []).filter(r => r._id === refId);
                    return matches.length === 1 ? matches[0] : null;
                } });
            // One synchronous critical section: all checks precede ANY record/history mutation.
            Object.assign(row, model?.guardedWriteRoles !== undefined ? cloneValue(data) : data, { _revision: Number(row._revision ?? 0) + 1 });
            if (scoped) {
                if (!createdByMe(row) || row._status !== "Draft") {
                    const history = Array.isArray(row.ActivityInstance) ? row.ActivityInstance : [];
                    row.ActivityInstance = [...history, { NodeType: "UserTask", ActedBy: { _id: userId() } }];
                }
                // The simple offline step-name model cannot resolve the next native user assignment.
                // Never leave stale assignment granting the previous actor another role's next task.
                row._current_assigned_to = [];
            }
            const steps = model?.steps ?? [];
            if (terminal) {
                Object.assign(row, { _status: terminal, _current_step: terminal, _progress: 100 });
                return;
            }
            const at = steps.indexOf(String(row._current_step));
            const next = at < 0 ? (delta > 0 ? steps.length : 0) : at + delta;
            if (next >= steps.length || !steps.length) {
                Object.assign(row, { _status: "Completed", _current_step: "Completed", _progress: 100 });
                return;
            }
            const i = Math.max(0, next);
            Object.assign(row, {
                _current_step: steps[i],
                _status: i === 0 ? "Draft" : "In Progress",
                _progress: Math.round(((i + 1) / (steps.length + 1)) * 100),
            });
        };
        const page = (all, opts = {}) => {
            const size = opts.pageSize ?? all.length;
            const from = ((opts.pageNumber ?? 1) - 1) * size;
            return { Data: all.slice(from, from + size).map(snapshot), count: all.length, Columns: cols() };
        };
        const snapshot = (row) => {
            refreshComputed();
            const current = stores.get(flowId)?.find(r => r._id === row._id) || row;
            return model?.guardedWriteRoles !== undefined || hasComputed ? cloneValue({ ...current }) : current;
        };
        const me = () => (kf?.user?.Name ?? "Dev User");
        const scoped = model?.roleAccess?.some(g => g.scope && !["all", "all-items"].includes(g.scope));
        const userId = () => kf?.user?._id;
        const assignedToMe = (r) => {
            const values = Array.isArray(r._current_assigned_to) ? r._current_assigned_to : [r._current_assigned_to];
            return values.some((v) => v?._id && v._id === userId());
        };
        const createdByMe = (r) => r._created_by?._id != null && r._created_by._id === userId();
        const actedByMe = (r) => Array.isArray(r.ActivityInstance)
            && r.ActivityInstance.some((a) => a?._stage !== "Withdrawn" && ["UserTask", "MultiUserTask"].includes(a?.NodeType) && a?.ActedBy?._id === userId());
        const unrestricted = () => model?.roleAccess?.some(g => (!g.scope || ["all", "all-items"].includes(g.scope))
            && kf.user.AppRoles?.some((r) => (r._id || r.id) === g.id));
        const readable = (r) => !scoped || unrestricted() || createdByMe(r) || assignedToMe(r) || actedByMe(r);
        const assertScopedWrite = (r) => {
            if (!scoped)
                return;
            const initiating = r._status === "Draft" && createdByMe(r) && model?.roleAccess?.some(g => g.initiator === true
                && kf.user.AppRoles?.some((role) => (role._id || role.id) === g.id));
            if (!["Draft", "In Progress"].includes(String(r._status)) || (!initiating && !assignedToMe(r)))
                throw new Error("RECORD_SCOPE_DENIED: only the current assignee or authorized draft creator may write");
        };
        const mine = (r) => {
            const v = r._current_assigned_to;
            return !v?.Name || v.Name === me();
        };
        // Process-only listing API — mirrors the real SDK exactly (no `getItems` here).
        const processApi = {
            getMyItems: async (opts = {}) => page(rows().filter((r) => (!scoped || createdByMe(r)) && (!opts.status || opts.status === "all" || String(r._status) === opts.status)), opts),
            getMyTasksItems: async (opts = {}) => page(rows().filter((r) => (scoped ? assignedToMe(r) : mine(r)) && (!opts.activityId || String(r._current_step) === opts.activityId)), opts),
            getParticipatedItems: async (opts = {}) => page(rows().filter(r => !scoped || actedByMe(r)), opts),
            getAdminItems: async (opts = {}) => {
                if (scoped && !unrestricted())
                    throw new Error("RECORD_SCOPE_DENIED: no all-record grant");
                return page(rows(), opts);
            },
        };
        return {
            // Dataform and Board expose getItems; Process does not — calling it must fail here too.
            ...(family === "process" ? processApi : { getItems: async (opts = {}) => page(rows(), opts) }),
            getItem: async (args) => (() => { const row = rows().find((r) => r._id === getId(args) && readable(r)); return row ? snapshot(row) : null; })(),
            createItem: async (args = {}) => {
                if (scoped && !model?.roleAccess?.some(g => g.initiator === true && kf.user.AppRoles?.some((r) => (r._id || r.id) === g.id)))
                    throw new Error("RECORD_SCOPE_DENIED: initiation is not granted");
                const row = { _id: nextId(flowId), ...(model?.guardedWriteRoles !== undefined ? cloneValue(args.data ?? {}) : args.data ?? {}) };
                if (model?.type === "Process")
                    Object.assign(row, PROCESS_SAMPLE);
                if (model?.actionPolicy?.length)
                    Object.assign(row, { _current_step: model.actionPolicy[0].name, _status: "Draft" });
                policyFor(row, args.data || {});
                if (scoped)
                    row._created_by = { _id: userId(), Name: me() };
                validateChange(flowId, row._id, row);
                rows().push(row);
                return snapshot(row);
            },
            updateItem: async (args) => {
                const row = rows().find((r) => r._id === getId(args));
                if (row)
                    assertScopedWrite(row);
                if (row)
                    policyFor(row, args.data || {});
                if (scoped && args.data && Object.keys(args.data).some(k => k.startsWith("_") || k === "ActivityInstance"))
                    throw new Error("RECORD_SCOPE_DENIED: caller cannot rewrite native ownership or participation");
                if (row && args.data) {
                    validateChange(flowId, row._id, { ...row, ...args.data });
                    Object.assign(row, cloneValue(args.data), { _revision: Number(row._revision ?? 0) + 1 });
                }
                return row ? snapshot(row) : null;
            },
            deleteItem: async (args) => {
                if (model?.guardedWriteRoles !== undefined)
                    throw new Error("ACTION_DELETE_UNSUPPORTED: guarded records cannot be deleted through the preview adapter");
                if (scoped)
                    throw new Error("RECORD_SCOPE_UNSUPPORTED: scoped deletion has no preview proof adapter");
                const list = rows();
                const i = list.findIndex((r) => r._id === getId(args));
                if (i >= 0) {
                    validateChange(flowId, list[i]._id, null);
                    list.splice(i, 1);
                }
            },
            // Workflow actions really move the item. `submitItem` used to be a no-op and reject/sendback
            // did not exist at all, so a prototype's Approve button either did nothing or threw
            // "sendbackItem is not a function" — the reviewer could not tell a wired handler from a
            // decorative one. Advancing through the model's own step names makes the preview honest:
            // approve an item and it leaves the queue exactly as it will in the live app.
            submitItem: async (args = {}) => advance(getId(args), +1, undefined, "submit"),
            approveItem: async (args = {}) => advance(getId(args), +1, undefined, "approve"),
            sendbackItem: async (args = {}) => advance(getId(args), -1, undefined, "sendback"),
            rejectItem: async (args = {}) => advance(getId(args), 0, "Rejected", "reject"),
            ...(model?.actionPolicy ? { actItem: async (args) => {
                    const action = String(args.action);
                    if (!["submit", "approve", "reject", "sendback"].includes(action) || args.expectedStep === undefined || args.expectedRevision === undefined)
                        throw new Error("ACTION_REQUEST_INVALID: action, expectedStep and expectedRevision are required");
                    advance(getId(args), action === "reject" ? 0 : action === "sendback" ? -1 : 1, action === "reject" ? "Rejected" : undefined, action, args.data || {}, args.expectedRevision, args.expectedStep);
                } } : {}),
            discardItem: async () => { },
            getFields: async () => cols(),
            // OPENING A RECORD, OFFLINE.
            //
            // In Kissflow this hands off to the PLATFORM: it renders its own native record form over the
            // custom UI, and the app never draws it. Offline there is no platform, so this was `async
            // () => {}` — correct in the narrow sense, and the reason every "open", every row click and
            // every create button in a preview did nothing at all. A reviewer cannot tell a wired handler
            // from a decorative one, which is the same failure the submit/sendback methods above were
            // written to fix.
            //
            // So it announces the intent instead of swallowing it, and the shell renders the kit's own
            // ItemForm in a sheet. Same call site, honest in both places: the platform's form in Kissflow,
            // a representative one in preview.
            openForm: async (args = {}) => {
                if (typeof window === "undefined")
                    return;
                const id = (args.itemId ?? args.instanceId ?? args._id ?? getId(args));
                const mode = args.mode === "view" ? "view" : "edit";
                window.dispatchEvent(new CustomEvent("kf:open-form", {
                    detail: { flowId, family, id, mode, activityInstanceId: args._activity_instance_id ?? args.activityInstanceId ?? null },
                }));
            },
        };
    }
    let route = "/";
    const variables = {};
    const setVar = async (k, v) => {
        if (typeof k === "object")
            Object.assign(variables, k);
        else
            variables[k] = v;
    };
    const page = {
        _id: "page_mock",
        getRoute: () => route,
        setRoute: (p) => {
            route = p;
        },
        getParameter: async (k) => `mock_${k}`,
        getAllParameters: async () => ({}),
        getVariable: async (k) => variables[k],
        setVariable: setVar,
        openPopup: async (id) => console.info("[mock] openPopup", id),
        getComponent: async () => ({ refresh: async () => { }, onMount: (cb) => cb() }),
        popup: {
            _id: "popup_mock",
            getParameter: async (k) => `mock_${k}`,
            getAllParameters: async () => ({}),
            close: async () => { },
            getComponent: async () => ({ refresh: async () => { }, onMount: (cb) => cb() }),
        },
    };
    const kf = {
        user: { _id: "u_mock", Name: "Dev User", Email: "dev@example.com", AppRoles: [], Role: undefined },
        account: { _id: schema.app.accountId ?? "acc_mock" },
        env: { isMobile: false },
        context: {
            watchParams: () => { },
            // Offline navigation is driven by the in-iframe MemoryRouter; the host never
            // pushes routes, so watchRoute never fires.
            watchRoute: () => { },
        },
        app: {
            _id: schema.app.id,
            page,
            getVariable: async (k) => variables[k],
            setVariable: setVar,
            openPage: async (id) => {
                route = "/" + id;
            },
            getDataform: (id) => flowHandle(id, "itemId", "dataform"),
            getProcess: (id) => flowHandle(id, "instanceId", "process"),
            getBoard: (id) => flowHandle(id, "instanceId", "board"),
            getDecisionTable: () => ({}),
        },
        client: {
            showInfo: async (m) => console.info("[mock] showInfo", m),
            showConfirm: async (o) => {
                console.info("[mock] showConfirm", o);
                return { action: "OK" };
            },
            redirect: async (url) => console.info("[mock] redirect", url),
            getImageUrl: async () => "data:image/png;base64,iVBORw0KGgo=",
        },
        formatter: {
            toDate: async (v) => v,
            toDateTime: async (v) => v,
            toNumber: async (v) => v,
            toCurrency: async (v, c) => `${c} ${v}`,
            toBoolean: async (v) => (["yes", "1", "true"].includes(String(v).toLowerCase()) ? "true" : "false"),
        },
        api: async (url, args) => {
            console.info("[mock] kf.api", args?.method ?? "GET", url);
            if (url.includes("/account/"))
                return { _id: kf.account._id, Name: "Mock Account", _mock: true };
            return { _mock: true, url };
        },
    };
    return kf;
}
