// GENERATED from packages/kernel/src/foundation/expression-contract.mjs (sha256:6428377299d2f259). Do not edit: change the
// source and run `npm run sync:contracts` in packages/kernel. A hand edit here fails the kernel suite.
// One grammar for the foundation checker, scenario evaluator and Kissflow AST emitter.
// No eval, no token-skipping and no unknown-function fallback.
export const FUNCTION_CATEGORIES = Object.freeze({
    CONCATENATE: "String", TOUPPERCASE: "String", TOLOWERCASE: "String", SUBSTRING: "String", FIND: "String", REPLACE: "String", LENGTH: "String", TOTEXT: "String", TRIM: "String", LEFT: "String", RIGHT: "String", INSERT: "String", CODE: "String",
    IF: "Logical", AND: "Logical", OR: "Logical", NOT: "Logical", ISBLANK: "Logical", HAS: "Logical", HASALL: "Logical",
    SUM: "Number", ROUND: "Number", ABS: "Number", AVERAGE: "Number", MIN: "Number", MAX: "Number", CEIL: "Number", FLOOR: "Number", RANDBETWEEN: "Number", POWER: "Number", SQRT: "Number", MOD: "Number", EXTRACTNUMBER: "Number",
    DATEDIFF: "Date", CALENDARDAYS: "Date", DAY: "Date", MONTH: "Date", YEAR: "Date", HOUR: "Date", OFFSET: "Date", EOM: "Date", NOW: "DateTime", TODAY: "Date", DATE: "Date", DATETIME: "DateTime",
    GETVALUE: "List", GET: "List", CONVERT: "Currency", CURRENCY: "Currency",
});
export function parseExpression(source) {
    if (typeof source !== "string" || !source.trim() || source.length > 16000)
        throw new Error("expression must be non-empty and at most 16000 characters");
    const tokens = [];
    const token = /\s+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d*)?|>=|<=|!=|[-+*/(),=<>]/gy;
    let offset = 0, match;
    while (offset < source.length) {
        token.lastIndex = offset;
        match = token.exec(source);
        if (!match)
            throw new Error(`unsupported token at column ${offset + 1}`);
        offset = token.lastIndex;
        if (match[0].trim())
            tokens.push(match[0]);
        if (tokens.length > 1024)
            throw new Error("expression exceeds 1024 tokens");
    }
    let position = 0, depth = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];
    const binary = (next, operators) => {
        let node = next();
        while (operators.includes(peek()))
            node = { kind: "binary", op: take(), left: node, right: next() };
        return node;
    };
    const compare = () => binary(add, ["=", "!=", "<", ">", "<=", ">="]);
    const add = () => binary(multiply, ["+", "-"]);
    const multiply = () => binary(factor, ["*", "/"]);
    function factor() {
        if (++depth > 64)
            throw new Error("expression nesting exceeds 64");
        try {
            const value = take();
            if (value === "(") {
                const node = compare();
                if (take() !== ")")
                    throw new Error("expected closing parenthesis");
                return { ...node, parenthesised: true };
            }
            if (/^\d/.test(value || "")) {
                if (!Number.isFinite(Number(value)))
                    throw new Error("numeric literal must be finite");
                return { kind: "literal", value: Number(value) };
            }
            if (/^["']/.test(value || "")) {
                // Keep decoding explicit; never interpret a string as executable JavaScript.
                const string = value.slice(1, -1).replace(/\\([\\'"nrt])/g, (_, c) => ({ n: "\n", r: "\r", t: "\t" }[c] ?? c));
                return { kind: "literal", value: string };
            }
            if (!/^[A-Za-z_]/.test(value || ""))
                throw new Error(`expected expression operand, found '${value ?? "end"}'`);
            // Boolean constants are literals in the platform grammar. Treating them as field
            // identifiers made valid guards such as `reinspection_required = true` fail with
            // "unknown field 'true'" and invited agents to invent a field to satisfy the check.
            if (/^(true|false)$/i.test(value))
                return { kind: "literal", value: value.toLowerCase() === "true" };
            if (peek() !== "(")
                return { kind: "field", id: value };
            take();
            const name = value.toUpperCase(), args = [];
            if (!Object.hasOwn(FUNCTION_CATEGORIES, name))
                throw new Error(`unsupported function '${name}'`);
            if (peek() !== ")") {
                args.push(compare());
                while (peek() === ",") {
                    take();
                    args.push(compare());
                }
            }
            if (take() !== ")")
                throw new Error(`expected closing parenthesis for ${name}`);
            return { kind: "call", name, args };
        }
        finally {
            depth--;
        }
    }
    const ast = compare();
    if (position !== tokens.length)
        throw new Error(`unexpected token '${peek()}' (use AND/OR functions for logical conditions)`);
    return ast;
}
export function expressionFields(ast) {
    if (ast.kind === "field")
        return [ast.id];
    return [...new Set((ast.args || [ast.left, ast.right].filter(Boolean)).flatMap(expressionFields))];
}
// Deliberately bounded replay support. Unsupported native functions must produce a finding,
// not a guessed value or a passing simulation. Extend only with adapter conformance tests.
export const REPLAY_FUNCTIONS = Object.freeze(["IF", "AND", "OR", "NOT", "ISBLANK", "SUM", "MIN", "MAX", "AVERAGE", "ABS", "ROUND", "CEIL", "FLOOR", "MOD", "LENGTH", "CONCATENATE", "TOTEXT", "TOUPPERCASE", "TOLOWERCASE", "TRIM", "TODAY", "NOW", "GETVALUE", "DATEDIFF", "DAY", "MONTH", "YEAR"]);
// Date arithmetic mirrors the platform's DATEDIFF(start, end, unit, holidays = true): the order of the two dates does
// not matter, the unit is mandatory, and with holidays on, weekend time is not counted. Replay assumes a
// Saturday/Sunday weekend and no account holiday calendar; the live account's calendar can differ.
const DAY_MS = 86_400_000;
export const DATEDIFF_UNITS = Object.freeze(["day", "hour", "minute", "second", "month", "year"]);
const parseIso = (name, v) => { const t = Date.parse(v); if (typeof v !== "string" || !Number.isFinite(t)) throw new Error(`${name} requires ISO dates`); return t; };
const dayStart = (t) => Math.floor(t / DAY_MS) * DAY_MS;
const isWeekend = (t) => [0, 6].includes(new Date(t).getUTCDay());
const addMonths = (t, months) => {
  const d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth() + months, ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return Date.UTC(ty, tm, Math.min(d.getUTCDate(), last), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
};
// dateutil.relativedelta(later, earlier) for later >= earlier: whole months first, then the remainder.
const relativeDelta = (later, earlier) => {
  const a = new Date(later), b = new Date(earlier);
  let months = (a.getUTCFullYear() - b.getUTCFullYear()) * 12 + (a.getUTCMonth() - b.getUTCMonth());
  if (addMonths(earlier, months) > later) months -= 1;
  const rest = (later - addMonths(earlier, months)) / 1000;
  return { years: Math.trunc(months / 12), months: months % 12, days: Math.floor(rest / 86400), hours: Math.floor((rest % 86400) / 3600), minutes: Math.floor((rest % 3600) / 60) };
};
function datediff(start, end, unit, holidays = true) {
  if (start == null || end == null || start === "" || end === "" || !unit) return null;
  const resn = String(unit).toLowerCase();
  if (!DATEDIFF_UNITS.includes(resn)) throw new Error(`DATEDIFF unit must be one of ${DATEDIFF_UNITS.join(", ")}`);
  let a = parseIso("DATEDIFF", start), b = parseIso("DATEDIFF", end);
  if (a > b) [a, b] = [b, a];
  let seconds = Math.floor((b - a) / 1000);
  if (holidays) {
    const first = dayStart(a), last = dayStart(b);
    if (first !== last || !isWeekend(last)) {
      for (let day = first; day <= last; day += DAY_MS) {
        if (!isWeekend(day)) continue;
        if (day === last) seconds -= Math.floor((b - day) / 1000);
        else if (day === first) seconds -= Math.floor((day + DAY_MS - a) / 1000);
        else seconds -= 86400;
      }
    } else seconds = 0;
  }
  if (resn === "day") return seconds / 86400;
  if (resn === "hour") return seconds / 3600;
  if (resn === "minute") return seconds / 60;
  if (resn === "second") return seconds;
  const d = relativeDelta(a + seconds * 1000, a);
  return resn === "year" ? d.years + d.months / 12 + d.days / 365.2425 + d.hours / 8765.82 + d.minutes / 525949.2
    : d.years * 12 + d.months + d.days / 30 + d.hours / 730.485 + d.minutes / 43829.1;
}
const datePart = (name, get) => (v) => (v == null || v === "" ? null : get(new Date(parseIso(name, v))));
export const dateFunctions = Object.freeze({
  DATEDIFF: datediff,
  DAY: datePart("DAY", (d) => d.getUTCDate()), MONTH: datePart("MONTH", (d) => d.getUTCMonth() + 1), YEAR: datePart("YEAR", (d) => d.getUTCFullYear()),
});
// Number.ROUND uses Python's ties-to-even with no precision, Decimal HALF_UP with
// explicit precision. JavaScript Math.round differs for negative ties in both cases.
function nativeRound(value, digits) {
    if (digits === undefined) {
        const floor = Math.floor(value), fraction = value - floor;
        return fraction === 0.5 ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(value);
    }
    if (!Number.isInteger(digits) || digits < 0 || digits > 15)
        throw new Error("ROUND precision must be an integer from 0 to 15 for bounded replay");
    const [mantissa, exp = "0"] = Math.abs(value).toString().split("e"), parts = mantissa.split(".");
    let integer = BigInt(parts.join(""));
    const shift = digits + Number(exp) - (parts[1]?.length || 0);
    if (shift >= 0)
        integer *= 10n ** BigInt(shift);
    else {
        const divisor = 10n ** BigInt(-shift), remainder = integer % divisor;
        integer = integer / divisor + (remainder * 2n >= divisor ? 1n : 0n);
    }
    return Math.sign(value) * Number(integer) / 10 ** digits;
}
export function evaluateExpression(ast, read, context = {}) {
    if (ast.kind === "literal")
        return ast.value;
    if (ast.kind === "field")
        return read(ast.id);
    const evaluate = (node) => evaluateExpression(node, read, context);
    const finite = (value) => { if (typeof value === "number" && !Number.isFinite(value))
        throw new Error("expression result must be finite"); return value; };
    if (ast.kind === "binary") {
        const left = evaluate(ast.left), right = evaluate(ast.right);
        // Platform comparison semantics: a blank operand compares as "not equal to any value" (blank = blank
        // is true), never as an error, so a guard may read the outcome field of a step that was skipped.
        // Arithmetic with a blank stays an error: there is no number to guess.
        const blank = (v) => v == null || v === "";
        if (blank(left) || blank(right)) {
            if (ast.op === "=")
                return blank(left) && blank(right);
            if (ast.op === "!=")
                return !(blank(left) && blank(right));
            if (["<", ">", "<=", ">="].includes(ast.op))
                return false;
            throw new Error(`null operand for '${ast.op}'`);
        }
        if (["+", "-", "*", "/"].includes(ast.op) && (typeof left !== "number" || typeof right !== "number"))
            throw new Error("arithmetic requires numbers");
        if (ast.op === "/" && right === 0)
            throw new Error("division by zero");
        return finite(({ "=": () => left === right, "!=": () => left !== right, "<": () => left < right, ">": () => left > right,
            "<=": () => left <= right, ">=": () => left >= right, "+": () => left + right, "-": () => left - right,
            "*": () => left * right, "/": () => left / right })[ast.op]());
    }
    const bool = (node) => { const v = evaluate(node); if (typeof v !== "boolean")
        throw new Error("condition requires Boolean"); return v; };
    if (ast.name === "IF")
        return bool(ast.args[0]) ? evaluate(ast.args[1]) : evaluate(ast.args[2]);
    if (!REPLAY_FUNCTIONS.includes(ast.name))
        throw new Error(`scenario adapter does not support '${ast.name}'`);
    // short-circuit like every spreadsheet engine the authors know: AND(NOT(ISBLANK(x)), x > 5) never evaluates x > 5 on a blank
    if (ast.name === "AND") {
        for (const a of ast.args)
            if (!bool(a))
                return false;
        return true;
    }
    if (ast.name === "OR") {
        for (const a of ast.args)
            if (bool(a))
                return true;
        return false;
    }
    if (ast.name === "NOT")
        return !bool(ast.args[0]);
    if (ast.name === "ISBLANK") {
        const v = evaluate(ast.args[0]);
        return v == null || v === "";
    }
    if (["TODAY", "NOW"].includes(ast.name)) {
        if (!context.clock || !Number.isFinite(Date.parse(context.clock)))
            throw new Error("date replay requires an explicit ISO scenario clock");
        const iso = new Date(context.clock).toISOString();
        return ast.name === "TODAY" ? iso.slice(0, 10) : iso;
    }
    if (ast.name === "GETVALUE") {
        if (!context.lookup)
            throw new Error("reference replay requires a typed lookup adapter");
        const ref = evaluate(ast.args[0]);
        if (ref == null || ref === "")
            return null;
        return context.lookup(ast.args[0], ref, evaluate(ast.args[1]));
    }
    const functions = { SUM: (...v) => v.reduce((a, b) => a + b, 0), MIN: (...v) => v.some(Boolean) ? Math.min(...v) : null,
        MAX: (...v) => v.some(Boolean) ? Math.max(...v) : null, ABS: Math.abs,
        AVERAGE: (...v) => v.some(Boolean) ? v.reduce((a, b) => a + b, 0) / v.length : null,
        CEIL: (v) => { if (v < 0)
            throw new Error("CEIL negative input requires an explicit native unit adapter"); return Math.ceil(v); },
        FLOOR: (v) => { if (v < 0)
            throw new Error("FLOOR negative input requires an explicit native unit adapter"); return Math.floor(v); },
        MOD: (a, b) => { if (!b)
            throw new Error("division by zero"); return ((a % b) + b) % b; },
        ROUND: nativeRound,
        LENGTH: (v) => v ? [...v].length : null, CONCATENATE: (...v) => v.join(""), TOTEXT: (v) => String(v),
        TOUPPERCASE: (v) => v ? v.toUpperCase() : null, TOLOWERCASE: (v) => v ? v.toLowerCase() : null, TRIM: (v) => v ? v.trim() : null, ...dateFunctions };
    if (!Object.hasOwn(functions, ast.name))
        throw new Error(`scenario adapter does not support '${ast.name}'`);
    const values = ast.args.map(evaluate);
    if (values.some((v) => v == null))
        throw new Error(`null argument for '${ast.name}'`);
    return finite(functions[ast.name](...values));
}
