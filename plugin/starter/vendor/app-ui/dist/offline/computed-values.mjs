// GENERATED from packages/kernel/src/foundation/computed-values.mjs (sha256:698a3eb5a2fcd120). Do not edit: change the
// source and run `npm run sync:contracts` in packages/kernel. A hand edit here fails the kernel suite.
// The preview uses the SAME parsed expression language as foundation replay. No eval,
// guessed arithmetic, seed overrides, or label-based expression rewriting at runtime.
import { parseExpression, evaluateExpression } from './expression-contract.mjs';
const cloneValue = (v) => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
export function computedContract(field) {
    const source = field.formula || field.expression;
    if (source && field.aggregate)
        throw new Error(`COMPUTED_CONFLICT: ${field.id}`);
    return {
        ...(source ? { formula: source, formulaAst: parseExpression(source), readOnly: true } : {}),
        ...(field.aggregate ? { aggregate: cloneValue(field.aggregate), readOnly: true } : {}),
    };
}
export const isComputed = f => !!(f.formulaAst || f.formula || f.expression || f.aggregate);
const identity = value => value && typeof value === 'object' ? value._id : value;
/** Return detached, fully derived rows. Failure never partially mutates the input store. */
export function deriveRecords(models, store, { clock = new Date().toISOString(), strict = true } = {}) {
    const output = new Map([...store].map(([id, rows]) => [id, rows.map(row => cloneValue({ ...row }))]));
    // a child table is a model of its own for a roll-up (SUM over "Reservation Items"): found by id or
    // name inside its parent, its rows living on the parent row under the table id (or its label)
    const childModels = models.flatMap(m => (m.child_tables || m.childTables || []).map(t => ({ id: t.id, name: t.name, fields: t.fields || [], childOf: m.id, tableLabel: t.name })));
    const model = key => {
        const hits = models.filter(m => m.id === key || m.name === key);
        if (hits.length === 1)
            return hits[0];
        const children = childModels.filter(m => m.id === key || m.name === key);
        if (hits.length + children.length !== 1)
            throw new Error(`COMPUTED_MODEL_UNKNOWN: ${key}`);
        return children[0];
    };
    // the preview never stops rendering over a value it cannot derive: non-strict callers get a blank
    // and a warning; strict callers (evidence, tests) get the error
    const warnings = [];
    output.warnings = warnings;
    const field = (m, key) => {
        const exact = m.fields.find(f => f.id === key);
        const hits = exact ? [exact] : m.fields.filter(f => f.name === key);
        if (hits.length !== 1)
            throw new Error(`COMPUTED_FIELD_UNKNOWN: ${m.id}.${key}`);
        return hits[0];
    };
    const seen = new WeakMap(), active = new WeakMap();
    const related = (m, id) => {
        const hits = (output.get(m.id) || []).filter(r => r._id === identity(id));
        if (hits.length !== 1)
            throw new Error(`COMPUTED_REFERENCE_MISSING: ${m.id}/${identity(id)}`);
        return hits[0];
    };
    const read = (m, row, path) => {
        const [head, ...tail] = path.split('.');
        if (head === '_id' && !tail.length)
            return row._id;
        const f = field(m, head), value = valueOf(m, row, f);
        if (!tail.length)
            return value;
        if (value == null || value === '')
            return null;
        if (!f.ref)
            throw new Error(`COMPUTED_REFERENCE_TYPE: ${m.id}.${head}`);
        const target = model(f.ref);
        return read(target, related(target, value), tail.join('.'));
    };
    const referenceModel = (m, ast) => {
        if (ast.kind === 'field') {
            for (const key of ast.id.split('.'))
                m = model(field(m, key).ref);
            return m;
        }
        if (ast.kind === 'call' && ast.name.toUpperCase() === 'GETVALUE' && ast.args[1]?.kind === 'literal')
            return model(field(referenceModel(m, ast.args[0]), ast.args[1].value).ref);
        throw new Error('COMPUTED_REFERENCE_TYPE: lookup needs a typed reference');
    };
    const valueOf = (m, row, f) => {
        if (!isComputed(f))
            return row[f.id] ?? null;
        const done = seen.get(row) || new Set(), stack = active.get(row) || new Set();
        seen.set(row, done);
        active.set(row, stack);
        if (done.has(f.id))
            return row[f.id];
        if (stack.has(f.id))
            throw new Error(`COMPUTED_CYCLE: ${m.id}.${f.id}`);
        stack.add(f.id);
        let result;
        try {
            if (f.aggregate) {
                const a = f.aggregate, source = model(a.over), fn = String(a.fn || 'SUM').toUpperCase();
                const children = source.childOf === m.id;
                const rows = children ? row[source.id] ?? row[source.tableLabel] ?? [] : output.get(source.id) || [];
                if (!Array.isArray(rows))
                    throw new Error(`COMPUTED_AGGREGATE_ROWS: ${f.id}`);
                const matches = rows.filter(r => children || !a.match || identity(read(source, r, a.match.field)) ===
                    identity(read(m, row, a.match.equals || '_id')));
                // a blank member is skipped (the platform sums what is present); a present non-number is the defect
                const values = matches.map(r => a.field ? read(source, r, a.field) : 1).filter(v => v != null && v !== '');
                if (!['COUNT', 'UNIQUE_COUNT'].includes(fn) && values.some(v => typeof v !== 'number' || !Number.isFinite(v)))
                    throw new Error(`COMPUTED_AGGREGATE_NUMBER: ${f.id}`);
                const sum = values.reduce((a, b) => a + b, 0);
                const ops = { COUNT: () => matches.length, UNIQUE_COUNT: () => new Set(values).size,
                    SUM: () => sum, MIN: () => values.length ? Math.min(...values) : null,
                    MAX: () => values.length ? Math.max(...values) : null,
                    AVG: () => values.length ? sum / values.length : null, AVERAGE: () => values.length ? sum / values.length : null };
                if (!ops[fn])
                    throw new Error(`COMPUTED_AGGREGATE_UNSUPPORTED: ${fn}`);
                result = ops[fn]();
            }
            else {
                const ast = f.formulaAst || parseExpression(f.formula || f.expression);
                result = evaluateExpression(ast, path => read(m, row, path), { clock,
                    lookup: (refAst, id, key) => { const target = referenceModel(m, refAst); return read(target, related(target, id), key); } });
            }
        }
        catch (e) {
            // Same blank-input semantics as foundation replay, not a fabricated zero.
            if (/null (argument|operand)/.test(e.message))
                result = null;
            else if (!strict && !/COMPUTED_CYCLE/.test(e.message)) {
                result = null;
                warnings.push({ model: m.id, field: f.id, error: String(e.message) });
            }
            else
                throw e;
        }
        finally {
            stack.delete(f.id);
        }
        if (typeof result === 'number' && !Number.isFinite(result)) {
            if (strict)
                throw new Error(`COMPUTED_NONFINITE: ${f.id}`);
            result = null;
            warnings.push({ model: m.id, field: f.id, error: `COMPUTED_NONFINITE: ${f.id}` });
        }
        row[f.id] = result;
        if (f.name && !m.fields.some(other => other.id === f.name && other.id !== f.id))
            row[f.name] = result;
        done.add(f.id);
        return result;
    };
    for (const m of models)
        for (const row of output.get(m.id) || [])
            for (const f of m.fields)
                valueOf(m, row, f);
    return output;
}
