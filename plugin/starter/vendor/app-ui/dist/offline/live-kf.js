// A dashboard renders many widgets bound to the SAME flow, and re-renders often — without
// this every widget would re-fetch, hammering the API (429s). GET results are cached for a
// short window and concurrent identical GETs share one in-flight promise; any write clears it.
const _cache = new Map();
const _inflight = new Map();
const _CACHE_TTL = 15000; // 15s
async function _fetch(base, path, method, body) {
    const res = await fetch(`${base}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
        json = text ? JSON.parse(text) : null;
    }
    catch {
        json = text;
    }
    if (!res.ok) {
        const msg = json?.message || json?.en_message || `${res.status}`;
        throw new Error(`Kissflow ${method} ${path.split("?")[0]} → ${res.status}: ${msg}`);
    }
    return json;
}
async function call(base, path, method = "GET", body) {
    if (method !== "GET") {
        _cache.clear();
        return _fetch(base, path, method, body);
    } // writes invalidate
    const key = path;
    const cached = _cache.get(key);
    if (cached && Date.now() - cached.t < _CACHE_TTL)
        return cached.v;
    const flight = _inflight.get(key);
    if (flight)
        return flight;
    const p = _fetch(base, path, "GET")
        .then((v) => { _cache.set(key, { t: Date.now(), v }); _inflight.delete(key); return v; })
        .catch((e) => { _inflight.delete(key); throw e; });
    _inflight.set(key, p);
    return p;
}
export function createLiveKf(schema, base = "/__kf") {
    const acct = schema.app.accountId ?? "";
    const appQ = `_application_id=${schema.app.id}`;
    function flow(family, id) {
        // path relative to the proxy base; `call` prepends `base`.
        const url = (sub = "") => `/${family}/2/${acct}/${id}${sub}?${appQ}`;
        const idOf = (a = {}) => (a.itemId ?? a.instanceId);
        // Kissflow's REST runtime exposes exactly ONE list view for a process to an integration
        // key: `/myitems`. The builder view-ids `mytasks` / `admin` / `allitems` / `list` are NOT
        // REST-listable — the API parses them as item-ids (404 IdNotFoundError). Those views only
        // resolve inside Kissflow's own product UI, where there is a real user session. So over the
        // dev live-proxy we list every process via `/myitems` regardless of the page's view, and
        // forms via their view (or `/list`). Inside Kissflow the published pages use the real views.
        const listPath = family === "process" ? "/myitems" : "/list";
        return {
            getItems: async (opts = {}) => {
                const seg = family === "process" ? "/myitems" : (opts.view ? `/${opts.view}` : listPath);
                // Processes: `_response_type=full` returns the whole record (status, stage, dates,
                // assignee, submitted field values) instead of the sparse default list projection
                // (which returns only `Name`). Lets the dashboards read real status/stage/aging.
                const j = await call(base, url(seg) + (family === "process" ? "&_response_type=full" : ""));
                const Data = j?.Data ?? [];
                return { Data, count: j?.count ?? Data.length, Columns: j?.Columns ?? [] };
            },
            getItem: async (a) => call(base, url(`/${idOf(a)}`)),
            createItem: async (a = {}) => {
                // Forms use a draft → submit flow; processes/cases create directly.
                const draft = await call(base, url(""), "POST", a.data ?? {});
                if (family === "form" && draft?._id) {
                    return call(base, url(`/${draft._id}/submit`), "POST", {});
                }
                return draft;
            },
            updateItem: async (a) => call(base, url(`/${idOf(a)}`), "POST", a.data ?? {}),
            deleteItem: async (a) => {
                await call(base, url(`/${idOf(a)}`), "DELETE");
            },
            submitItem: async () => { },
            discardItem: async () => { },
            getFields: async () => {
                // the real field schema (not the list view's columns)
                const j = await call(base, url("/fields"));
                return Array.isArray(j) ? j : j?.Columns ?? [];
            },
            openForm: async () => { },
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
        _id: "page_live",
        getRoute: () => route,
        setRoute: (p) => {
            route = p;
        },
        getParameter: async () => undefined,
        getAllParameters: async () => ({}),
        getVariable: async (k) => variables[k],
        setVariable: setVar,
        openPopup: async () => { },
        getComponent: async () => ({ refresh: async () => { }, onMount: (cb) => cb() }),
        popup: {
            _id: "popup_live",
            getParameter: async () => undefined,
            getAllParameters: async () => ({}),
            close: async () => { },
            getComponent: async () => ({ refresh: async () => { }, onMount: (cb) => cb() }),
        },
    };
    const kf = {
        user: { _id: "u_live", Name: "Live (dev key)", Email: "dev@example.com", AppRoles: [], Role: undefined },
        account: { _id: acct },
        env: { isMobile: false },
        context: { watchParams: () => { }, watchRoute: () => { } },
        app: {
            _id: schema.app.id,
            page,
            getVariable: async (k) => variables[k],
            setVariable: setVar,
            openPage: async (id) => {
                route = "/" + id;
            },
            getDataform: (id) => flow("form", id),
            getProcess: (id) => flow("process", id),
            getBoard: (id) => flow("case", id),
            getDecisionTable: () => ({}),
        },
        client: {
            showInfo: async (m) => console.info("[live] showInfo", m),
            showConfirm: async () => ({ action: "OK" }),
            redirect: async (url) => console.info("[live] redirect", url),
            getImageUrl: async () => "data:image/png;base64,iVBORw0KGgo=",
        },
        formatter: {
            toDate: async (v) => v,
            toDateTime: async (v) => v,
            toNumber: async (v) => v,
            toCurrency: async (v, c) => `${c} ${v}`,
            toBoolean: async (v) => (["yes", "1", "true"].includes(String(v).toLowerCase()) ? "true" : "false"),
        },
        // Pass-through to any Kissflow REST endpoint via the proxy.
        api: async (url, args) => call(base, `${url.startsWith("/") ? "" : "/"}${url}`, args?.method ?? "GET", args?.body),
    };
    return kf;
}
