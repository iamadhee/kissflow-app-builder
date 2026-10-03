import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import KFSDK from "@kissflow/lowcode-client-sdk";
import { KfContext } from "./context";
import { createMockKf } from "./offline/mock-kf";
import { createLiveKf } from "./offline/live-kf";
import { RoleSwitcher } from "./offline/role-switcher";
import { KfDevContext, makeCanAccess } from "./offline/dev-context";
// How long to wait for the real SDK before falling back to the offline mock.
// `KFSDK.initialize()` never resolves outside Kissflow, so we race it against this.
const INIT_TIMEOUT_MS = 2500;
function captureError(code, message) {
    return Object.assign(new Error(message), { code });
}
function normalizeCaptureValue(value) {
    return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
const meta = import.meta.env ?? {};
const isDev = Boolean(meta.DEV);
// Set by the dev-server proxy plugin when admin keys are present in .env.
const liveEnabled = Boolean(meta.VITE_KF_LIVE);
/**
 * `?preview=1` — run a PRODUCTION bundle against the offline mock, outside Kissflow.
 *
 * This is what lets the prototype and the shipped app be the same artifact. The prototype used to be
 * a separate hand-rolled HTML page, so the UI a user approved and the UI that shipped were different
 * code and drifted apart. Now the real custom UI is built once, reviewed at `?preview=1`, and the
 * identical bundle is deployed.
 *
 * Deliberately a RUNTIME flag, not a build flag: the deployed bundle is byte-identical to the
 * reviewed one, and since Kissflow never adds this parameter, a live app whose SDK fails still shows
 * an honest error instead of silently rendering mock rows as if they were real records.
 */
const previewRequested = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
// VITE_KF_PREVIEW is a BUILD-time force used ONLY by the react-prototype build (proto-react.mjs) so the
// self-contained prototype boots the mock in the chat's preview pane without a ?preview=1 URL. The deploy
// build never sets it, so a live app with a failed SDK still errors honestly instead of showing mock rows.
const offlineAllowed = isDev || previewRequested || Boolean(meta.VITE_KF_PREVIEW);
/**
 * Initializes the Kissflow SDK once and exposes it via context (and `window.kf`).
 * Inside Kissflow it uses the real SDK; outside (dev) it falls back to a mock built
 * from `devSchema`. Children render only once a `kf` (real or mock) is ready.
 */
export function KfProvider({ children, loader = null, fallback, devSchema }) {
    const [mode, setMode] = useState("init");
    const [sdk, setSdk] = useState(null);
    // Active role for dev mode (defaults to the first synced role).
    const [roleId, setRoleId] = useState(() => devSchema?.roles?.[0]?.id ?? null);
    const captureRoleRef = useRef({ roleId: null, roleName: null });
    // Live (real dev data via proxy) when admin keys are present, else an in-memory mock.
    const devKf = useMemo(() => {
        if (!devSchema)
            return null;
        return liveEnabled ? createLiveKf(devSchema) : createMockKf(devSchema);
    }, [devSchema]);
    const devMode = liveEnabled ? "live" : "offline";
    useEffect(function initSdk() {
        let cancelled = false;
        Promise.race([
            KFSDK.initialize().then((s) => ({ ok: true, s })),
            new Promise((res) => setTimeout(() => res({ ok: false }), INIT_TIMEOUT_MS)),
        ])
            .then((r) => {
            if (cancelled)
                return;
            if (r.ok) {
                window.kf = r.s;
                setSdk(r.s);
                setMode("online");
            }
            else {
                setMode(offlineAllowed && devKf ? devMode : "error");
            }
        })
            .catch(() => {
            if (!cancelled)
                setMode(offlineAllowed && devKf ? devMode : "error");
        });
        return () => {
            cancelled = true;
        };
    }, [devKf, devMode]);
    const isDevMode = mode === "offline" || mode === "live";
    // `?fullscreen=1` — set by the App Builder chat when it iframes THIS dev/preview URL directly
    // (Kissflow's own app pages refuse to be framed at all, X-Frame-Options: SAMEORIGIN; a URL-mode
    // custom UI bundle we serve ourselves has no such header, so it's the one artifact that CAN be
    // embedded). Suppresses the floating dev role-switcher so the embed shows only the app.
    const fullscreen = useMemo(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fullscreen") === "1", []);
    // Reflect the chosen role onto the (stable) dev `kf` user — keeps kf identity stable
    // so route-sync doesn't re-init, while consumers re-render via a new value object.
    const value = useMemo(() => {
        if (!isDevMode || !devKf) {
            return { kf: sdk, ready: mode === "online", error: mode === "error" };
        }
        const role = devSchema?.roles.find((r) => r.id === roleId) ?? null;
        const u = devKf.user;
        u.AppRoles = role ? [{ _id: role.id, Name: role.name }] : [];
        u.Role = role?.name;
        if (mode === "offline" && devSchema?.previewUsers?.length) {
            const identity = devSchema.previewUsers.find(user => role && user.roles.includes(role.id));
            u._id = identity?.id || `preview-unassigned:${roleId || "none"}`;
            u.Name = identity?.name || "Unassigned preview identity";
            u.AppRoles = identity ? devSchema.roles.filter(r => identity.roles.includes(r.id)).map(r => ({ _id: r.id, Name: r.name })) : [];
        }
        window.kf = devKf;
        return { kf: devKf, ready: true, error: false };
    }, [isDevMode, mode, devKf, sdk, roleId, devSchema]);
    const devValue = useMemo(() => {
        const role = isDevMode ? devSchema?.roles.find((r) => r.id === roleId) ?? null : null;
        return {
            active: isDevMode,
            mode: mode === "live" ? "live" : mode === "offline" ? "offline" : null,
            roleId: isDevMode ? roleId : null,
            roleName: role?.name ?? null,
            schema: isDevMode ? devSchema ?? null : null,
            canAccess: makeCanAccess(isDevMode ? devSchema ?? null : null, isDevMode ? roleId : null),
        };
    }, [isDevMode, mode, devSchema, roleId]);
    // Headless visual QA needs to choose a role without guessing which <select> happens to be the
    // role switcher. Expose a deliberately small preview-only control surface owned by the same
    // provider that owns role state. AppShell adds page navigation to this shared bridge.
    captureRoleRef.current = { roleId: devValue.roleId, roleName: devValue.roleName };
    useEffect(() => {
        if (!isDevMode || !devSchema || typeof window === "undefined")
            return;
        const captureWindow = window;
        const bridge = captureWindow.__KF_CAPTURE__ ?? { version: 1 };
        captureWindow.__KF_CAPTURE__ = bridge;
        const getRoleState = () => ({ ...captureRoleRef.current });
        const selectRole = async (target) => {
            const requested = typeof target === "string"
                ? [target]
                : [target.id, target.name, ...(target.aliases ?? [])].filter(Boolean);
            const aliases = new Set(requested.map(normalizeCaptureValue).filter(Boolean));
            const matches = devSchema.roles.filter((candidate) => [candidate.id, candidate.name, ...(candidate.aliases ?? [])]
                .some((alias) => aliases.has(normalizeCaptureValue(alias))));
            if (matches.length > 1)
                throw captureError("ROLE_AMBIGUOUS", `Ambiguous preview role: ${requested.join(", ")}`);
            const role = matches[0];
            if (!role)
                throw captureError("ROLE_UNKNOWN", `Unknown preview role: ${requested.join(", ") || "(empty)"}`);
            setRoleId(role.id);
            const deadline = Date.now() + 8000;
            while (Date.now() < deadline) {
                const current = captureRoleRef.current;
                if (current.roleId === role.id)
                    return { ...current };
                await new Promise((resolve) => setTimeout(resolve, 25));
            }
            throw captureError("ROLE_TIMEOUT", `Preview role did not switch to ${role.name}`);
        };
        bridge.version = 1;
        bridge.getRoleState = getRoleState;
        bridge.selectRole = selectRole;
        return () => {
            if (bridge.getRoleState === getRoleState)
                delete bridge.getRoleState;
            if (bridge.selectRole === selectRole)
                delete bridge.selectRole;
        };
    }, [isDevMode, devSchema]);
    if (mode === "init")
        return _jsx(_Fragment, { children: loader });
    if (mode === "error") {
        return _jsx(_Fragment, { children: fallback ?? _jsx("div", { children: "Please open this app inside Kissflow." }) });
    }
    return (_jsx(KfContext.Provider, { value: value, children: _jsxs(KfDevContext.Provider, { value: devValue, children: [children, isDevMode && devSchema && !fullscreen && (_jsx(RoleSwitcher, { roles: devSchema.roles, activeId: roleId, onChange: setRoleId, appId: devSchema.app?.id, mode: mode === "live" ? "live" : "offline" }))] }) }));
}
