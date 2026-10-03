import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useKf } from "./use-kf";
const toPath = (route) => "/" + (route || "").replace(/^\//, "");
const toSlug = (pathname) => pathname.replace(/^\//, "");
/**
 * Keeps the in-iframe MemoryRouter and the parent Kissflow URL in sync:
 *  - seeds the router from the deep-link route the host opened us with,
 *  - applies host-driven route changes (parent back/forward/deep-link),
 *  - mirrors local navigation up to the parent URL.
 * Rendered once near the router root by <KfApp>. Loop-guarded so a host push
 * is never echoed back to the host.
 */
export function RouteSync() {
    const kf = useKf();
    const navigate = useNavigate();
    const location = useLocation();
    // Last path applied from a host-driven change — so we don't echo it back up.
    const fromHostRef = useRef(null);
    const initedRef = useRef(false);
    // react-router's `navigate` changes identity on every location change, so we
    // read it through a ref to keep effects from re-running (which would re-seed
    // the route and re-subscribe on every navigation).
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;
    // Host route APIs are OPTIONAL. The offline mock always defines `kf.app.page` and
    // `kf.context.watchRoute`, but the real SDK only exposes a page context to a Page-category
    // component — an Application-category custom UI (what `deploy-ui` publishes) has none. Calling
    // them unguarded threw inside this effect, React unmounted the whole tree, and the app rendered
    // as an EMPTY FRAME inside Kissflow with nothing in the console to explain it, while every
    // offline preview looked perfect. Route sync is a nicety; never let it take the app down.
    useEffect(function initRouteSync() {
        if (initedRef.current)
            return;
        initedRef.current = true;
        // Two INDEPENDENT capabilities: read the route the host opened us on, and follow it afterwards.
        // Sharing one try meant a throw from getRoute() — which the SDK does when the app is not a Page
        // category — skipped the watchRoute subscription entirely, so the app silently stopped following
        // host navigation for the rest of the session. Each is attempted, and fails, on its own.
        try {
            if (typeof kf?.app?.page?.getRoute === "function") {
                const initial = toPath(kf.app.page.getRoute());
                fromHostRef.current = initial;
                navigateRef.current(initial, { replace: true });
            }
        }
        catch (e) {
            console.warn("[kf] host route unavailable — starting on the in-app route", e);
        }
        try {
            if (typeof kf?.context?.watchRoute === "function") {
                kf.context.watchRoute(({ route }) => {
                    const path = toPath(route);
                    fromHostRef.current = path;
                    navigateRef.current(path);
                });
            }
        }
        catch (e) {
            console.warn("[kf] host route updates unavailable — using in-app routing only", e);
        }
    }, [kf]);
    useEffect(function pushRouteToHost() {
        if (location.pathname === fromHostRef.current)
            return;
        try {
            if (typeof kf?.app?.page?.setRoute === "function")
                kf.app.page.setRoute(toSlug(location.pathname));
        }
        catch { /* host declined the route push — in-app navigation still worked */ }
    }, [kf, location.pathname]);
    return null;
}
