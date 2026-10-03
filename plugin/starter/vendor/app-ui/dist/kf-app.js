import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useMemo, useState } from "react";
import { MemoryRouter, useLocation, useRoutes } from "react-router-dom";
import { PageTitleContext } from "./layout-context";
import { KfErrorBoundary } from "./error-boundary";
import { KfProvider } from "./provider";
import { RouteSync } from "./route-sync";
function RoutedApp({ routes, loader }) {
    const location = useLocation();
    const route = useRoutes(routes);
    // Isolate page failures from the persistent shell and preview role switcher. A broken role page
    // must not trap the reviewer on that role: navigation changes reset only this route boundary.
    return (_jsx(KfErrorBoundary, { resetKey: location.pathname, children: _jsx(Suspense, { fallback: loader ?? null, children: route }) }));
}
function PageTitleProvider({ children }) {
    const [title, setTitle] = useState("");
    const value = useMemo(() => ({ title, setTitle }), [title]);
    return (_jsx(PageTitleContext.Provider, { value: value, children: children }));
}
/**
 * Root of a Kissflow App UI. Boots the SDK, sets up the in-iframe router, keeps
 * routes in sync with the parent Kissflow URL, and (optionally) wraps everything
 * in a persistent `layout`.
 *
 * ```tsx
 * import routes from "~react-pages";
 * import { AppShell } from "./components/app-shell";
 * createRoot(el).render(<KfApp routes={routes} layout={AppShell} />);
 * ```
 */
export function KfApp({ routes, layout: Layout, loader, fallback, devSchema }) {
    const content = _jsx(RoutedApp, { routes: routes, loader: loader });
    return (
    // Boundary OUTSIDE the provider so it also catches a crash in boot/route-sync — the exact
    // failures that otherwise show up as an empty iframe with no reachable console.
    _jsx(KfErrorBoundary, { children: _jsx(KfProvider, { loader: loader, fallback: fallback, devSchema: devSchema, children: _jsx(PageTitleProvider, { children: _jsxs(MemoryRouter, { children: [_jsx(RouteSync, {}), Layout ? _jsx(Layout, { children: content }) : content] }) }) }) }));
}
