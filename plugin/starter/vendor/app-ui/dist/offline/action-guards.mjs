// Pure action preconditions, shared byte-for-byte with the offline runtime.
// These DENY an action; unlike sequence conditions they never skip a task.
// Native publication: same-record `present` lowers to Mandatory at the step; anything else is refused or recorded.
export const ACTION_GUARD_CAPABILITIES = Object.freeze({ version: 1, replay: true, offline: true, kissflow: false });
const bad = (message) => { throw Object.assign(new Error(message), { code: 'ACTION_GUARD_INVALID' }); };
const ident = (v) => typeof v === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(v);
const scalar = (v) => typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v);
const keys = (o, allowed) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every(k => allowed.includes(k));
const present = (v) => v != null && (typeof v !== 'string' || v.trim() !== '') && (!Array.isArray(v) || v.length > 0);
// Identity comparisons must never fall back to display names or stringified objects.
const identity = (v) => typeof v === 'string' ? v : v && typeof v === 'object' && !Array.isArray(v) ? v._id ?? v.id : undefined;
export function validateActionGuards(guards) {
    if (!Array.isArray(guards) || guards.length > 32)
        bad('action_guards must be an array of at most 32 guards');
    const ids = new Set();
    const test = (t) => {
        if (!keys(t, ['field', 'op', 'value']) || !ident(t.field) || !['present', 'eq'].includes(t.op)
            || (t.op === 'eq' ? !scalar(t.value) : Object.hasOwn(t, 'value')))
            bad('guard tests require exact field and present or scalar eq');
    };
    for (const g of guards) {
        if (!keys(g, ['id', 'actions', 'when', 'require', 'message']) || !ident(g.id) || ids.has(g.id))
            bad('guard requires a unique id');
        ids.add(g.id);
        if (!Array.isArray(g.actions) || !g.actions.length || new Set(g.actions).size !== g.actions.length
            || g.actions.some(a => !['submit', 'approve', 'reject', 'sendback'].includes(a)))
            bad('guard requires explicit supported actions');
        if (typeof g.message !== 'string' || !g.message.trim() || g.message.length > 500)
            bad('guard requires a bounded denial message');
        if (g.when !== undefined)
            test(g.when);
        if (!Array.isArray(g.require) || !g.require.length || g.require.length > 32)
            bad('guard requires 1–32 tests');
        for (const r of g.require) {
            if (!r || typeof r !== 'object' || Array.isArray(r))
                bad('guard requirement must be an object');
            if (!Object.hasOwn(r, 'reference')) {
                test(r);
                continue;
            }
            if (!keys(r, ['reference', 'flow', 'match', 'all']) || !ident(r.reference) || !ident(r.flow)
                || !Array.isArray(r.match) || !r.match.length || r.match.length > 16
                || r.match.some(m => !keys(m, ['field', 'source']) || !ident(m.field) || !ident(m.source))
                || !Array.isArray(r.all) || !r.all.length || r.all.length > 32)
                bad('related guard requires an exact reference, flow, identity matches and tests');
            r.all.forEach(test);
        }
    }
    return guards;
}
/** readRelated(flow,id) must read from the SAME authoritative transaction as the transition.
 * No caller-provided embedded evidence, query fallback, or async check-then-write is accepted. */
export function assertActionGuards(guards, { action, record, readRelated }) {
    validateActionGuards(guards);
    if (guards.length && !['submit', 'approve', 'reject', 'sendback'].includes(action))
        bad('unknown guarded action');
    const test = (r, t) => t.op === 'present' ? present(r[t.field]) : r[t.field] === t.value;
    for (const g of guards) {
        if (!g.actions.includes(action) || g.when && !test(record, g.when))
            continue;
        const ok = g.require.every(r => {
            if (!Object.hasOwn(r, 'reference'))
                return test(record, r);
            const id = identity(record[r.reference]);
            if (typeof id !== 'string' || !id)
                return false;
            const related = readRelated(r.flow, id);
            if (!related || typeof related !== 'object' || Array.isArray(related) || typeof related.then === 'function')
                return false;
            return r.match.every(m => {
                const a = identity(related[m.field]), b = identity(record[m.source]);
                return typeof a === 'string' && !!a && a === b;
            }) && r.all.every(t => test(related, t));
        });
        if (!ok)
            throw Object.assign(new Error(g.message), { code: 'ACTION_GUARD_DENIED', guardId: g.id });
    }
}
/* HOW A GUARD REACHES ITS EVIDENCE decides what the platform can do with it. A `require` that reaches
   THROUGH a reference reads another record: no native adapter denies on that. A `require` on the
   record's own fields is judged from the record alone, and the platform already has an instrument for
   half of it — a field marked Mandatory at a step is refused empty, which is `present` exactly, for
   every action that completes the step. `eq` and `when` have no native form: a step condition ROUTES,
   it does not deny. The architect's `requiredCapabilities` is a forecast made before any guard exists
   (clinic-trials forecast cross-record denial on four flows whose guards read their own computed
   fields); once a guard is written, the guard decides. */
export function classifyActionGuard(g) {
    const require = Array.isArray(g?.require) ? g.require : [];
    const same = require.filter(r => r && typeof r === 'object' && !Object.hasOwn(r, 'reference'));
    return {
        id: g?.id, actions: Array.isArray(g?.actions) ? g.actions : [], when: g?.when || null,
        crossRecord: require.filter(r => r && typeof r === 'object' && Object.hasOwn(r, 'reference')).map(r => ({ reference: r.reference, flow: r.flow })),
        present: same.filter(t => t.op === 'present').map(t => t.field),
        eq: same.filter(t => t.op === 'eq').map(t => ({ field: t.field, value: t.value })),
    };
}
const unsupported = (message) => Object.assign(new Error(message), { code: 'ACTION_GUARD_DEPLOYMENT_UNSUPPORTED' });
const walk = (input, onNode) => {
    const seen = new Set();
    const visit = (v, path) => {
        if (!v || typeof v !== 'object' || seen.has(v))
            return;
        seen.add(v);
        onNode(v, path);
        for (const [k, c] of Object.entries(v))
            visit(c, path ? `${path}.${k}` : k);
    };
    visit(input, '');
};
/** Lower same-record guards onto their steps and refuse the rest. MUTATES `input` (`present` becomes
 * Mandatory at the step). Returns the residuals: what the native form does not hold, named so the
 * release can record them. Throws ACTION_GUARD_DEPLOYMENT_UNSUPPORTED for a guard that reads another
 * record, or for a cross-record forecast with no guard written to judge it by. */
export function lowerNativeActionGuards(input) {
    const steps = [], residuals = [];
    let forecastCrossRecord = false;
    walk(input, (v, path) => {
        if (v.requiredCapabilities?.crossRecordActionGuards === true)
            forecastCrossRecord = true;
        if (Object.hasOwn(v, 'action_guards')) {
            validateActionGuards(v.action_guards);
            if (v.action_guards.length)
                steps.push({ step: v, path });
        }
    });
    const cross = steps.flatMap(({ step, path }) => step.action_guards.map(classifyActionGuard).filter(c => c.crossRecord.length)
        .map(c => `${path}.${c.id} reads ${c.crossRecord.map(x => `${x.flow} through ${x.reference}`).join(', ')}`));
    if (cross.length)
        throw unsupported(`A guard that reads another record cannot be enforced natively: ${cross.join('; ')}. Carry the value onto the guarded record as a computed field and guard on that; do not remove the policy.`);
    if (!steps.length && forecastCrossRecord)
        throw unsupported('crossRecordActionGuards is forecast and no guard is written to judge it by; a denial that reads another record has no native adapter.');
    for (const { step, path } of steps)
        for (const g of step.action_guards) {
            const c = classifyActionGuard(g), at = `${path}.${g.id}`;
            if (!step.field_permissions || typeof step.field_permissions !== 'object')
                step.field_permissions = {};
            const whenText = c.when ? `${c.when.field} ${c.when.op}${Object.hasOwn(c.when, 'value') ? ` ${JSON.stringify(c.when.value)}` : ''}` : null;
            for (const field of c.present) {
                const had = step.field_permissions[field];
                if (had === 'Hidden' || had === 'ReadOnly') {
                    residuals.push({ guard: at, kind: 'permission', field, detail: `'${field}' is ${had} at this step, so it cannot be demanded there; the guard is not lowered` });
                    continue;
                }
                if (c.when) {
                    residuals.push({ guard: at, kind: 'when', field, detail: `'${field}' is required only when ${whenText}; Mandatory is unconditional, so it is not lowered. Not enforced natively` });
                    continue;
                }
                step.field_permissions[field] = 'Mandatory';
                // Mandatory refuses EVERY completion of the step; a guard naming only some of them is over-held
                const review = c.actions.some(a => a !== 'submit');
                const missing = review ? ['approve', 'reject', 'sendback'].filter(a => !c.actions.includes(a)) : [];
                if (missing.length)
                    residuals.push({ guard: at, kind: 'actions', field, detail: `'${field}' is Mandatory at the step, which refuses every completion — the guard named ${c.actions.join('/')}; ${missing.join('/')} now demand it too` });
            }
            for (const t of c.eq)
                residuals.push({ guard: at, kind: 'eq', field: t.field, detail: `'${t.field}' must equal ${JSON.stringify(t.value)}${whenText ? ` when ${whenText}` : ''}: no native instrument denies on a value, a step condition only routes. Not enforced natively` });
        }
    return residuals;
}
/** Refuse what no native adapter holds, before anything is created. Lowers a copy; the input is untouched. */
export function assertNativeActionGuardsSupported(input) {
    lowerNativeActionGuards(structuredClone(input));
}
