import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dev-only overlay shown when the app runs OUTSIDE Kissflow (offline mock mode).
 * Lets you switch the active app role so you can check how screens behave per role.
 * Self-contained inline styles — no dependency on the host app's CSS.
 */
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
export function RoleSwitcher({ roles, activeId, onChange, mode = "offline" }) {
    const live = mode === "live";
    const [dock, setDock] = useState(null);
    // Generated shells expose a footer slot in their navigation rail. Portal the framework-owned
    // selector there so changing roles still updates mock identity, access and navigation as one
    // operation. Custom shells without the slot retain a safe lower-left fallback, away from host
    // support/avatar furniture on the right.
    useLayoutEffect(() => {
        const findDock = () => setDock(document.querySelector("[data-kf-role-switcher-slot]"));
        findDock();
        const observer = new MutationObserver(findDock);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
    const control = (_jsxs("div", { className: "kf-role-switcher", style: dock ? undefined : floatingWrap, "data-kf-offline": "", "data-kf-mode": mode, "data-kf-role-switcher": "", "data-placement": dock?.dataset.kfRoleSwitcherPlacement ?? "safe-fallback", "data-variant": dock?.dataset.kfRoleSwitcherVariant ?? "compact", title: live ? "Previewing with live development data" : "Previewing with sample data", children: [_jsxs("div", { className: "kf-role-switcher-identity", style: dock ? undefined : identityWrap, children: [_jsx("span", { className: "kf-role-switcher-icon", style: dock ? undefined : identityIcon, "aria-hidden": "true", children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "9", cy: "7", r: "4" }), _jsx("path", { d: "M19 8v6M22 11h-6" })] }) }), _jsxs("span", { className: "kf-role-switcher-copy", style: dock ? undefined : identityCopy, children: [_jsx("span", { className: "kf-role-switcher-eyebrow", style: dock ? undefined : eyebrow, children: "Preview experience" }), _jsx("span", { className: "kf-role-switcher-heading", style: dock ? undefined : heading, children: "Switch role" })] })] }), roles.length > 0 && (_jsxs("label", { className: "kf-role-switcher-pick", style: dock ? undefined : pickWrap, children: [_jsx("span", { className: "kf-role-switcher-label", style: dock ? undefined : pickLabel, children: "Viewing as" }), _jsxs("span", { className: "kf-role-switcher-select-frame", style: dock ? undefined : selectFrame, children: [_jsx("select", { value: activeId ?? "", onChange: (e) => onChange(e.target.value), className: "kf-role-switcher-select", style: dock ? undefined : select, "aria-label": "Preview role", children: roles.map((r) => (_jsx("option", { value: r.id, children: r.name }, r.id))) }), _jsx("svg", { className: "kf-role-switcher-chevron", style: dock ? undefined : chevron, width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "m6 9 6 6 6-6" }) })] })] }))] }));
    return dock ? createPortal(control, dock) : control;
}
const baseWrap = {
    zIndex: 2147483647,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    background: "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))",
    color: "#fff",
    font: "12px/1.2 ui-sans-serif, system-ui, -apple-system, sans-serif",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.24)",
    backdropFilter: "blur(14px)",
};
const floatingWrap = {
    ...baseWrap,
    position: "fixed",
    left: 16,
    bottom: 16,
    width: 240,
    borderRadius: 16,
};
const identityWrap = { display: "flex", alignItems: "center", gap: 10, width: "100%" };
const identityIcon = {
    width: 34,
    height: 34,
    flex: "0 0 34px",
    display: "grid",
    placeItems: "center",
    borderRadius: 11,
    color: "#dbeafe",
    background: "linear-gradient(145deg, rgba(59,130,246,0.38), rgba(99,102,241,0.26))",
    border: "1px solid rgba(147,197,253,0.3)",
};
const identityCopy = { display: "grid", gap: 2, minWidth: 0 };
const eyebrow = { color: "#93c5fd", fontSize: 9, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase" };
const heading = { color: "#f8fafc", fontSize: 13, fontWeight: 750, letterSpacing: "-0.01em" };
const pickWrap = { display: "grid", gap: 6, width: "100%" };
const pickLabel = { color: "#94a3b8", fontSize: 9, fontWeight: 750, letterSpacing: "0.11em", textTransform: "uppercase" };
const selectFrame = { position: "relative", display: "block", width: "100%" };
const select = {
    appearance: "none",
    WebkitAppearance: "none",
    width: "100%",
    minWidth: 0,
    background: "rgba(255,255,255,0.1)",
    color: "#f8fafc",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 11,
    padding: "9px 34px 9px 11px",
    font: "600 12px/1.25 ui-sans-serif, system-ui, -apple-system, sans-serif",
    cursor: "pointer",
    outline: "none",
    colorScheme: "dark",
};
const chevron = { position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "#93c5fd", pointerEvents: "none" };
