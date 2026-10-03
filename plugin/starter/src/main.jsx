import { createRoot } from "react-dom/client";
import { KfApp } from "@kissflow/app-ui";
import routes from "~react-pages";

import { AppShell } from "./components/app-shell.jsx";
import { AppBootScreen } from "./components/app-boot-screen.jsx";
import { resolvePrototypeThemeFamily } from "./components/prototype-display-options.js";
// Synced app schema (run `npm run kf:sync` to refresh). Enables offline dev mode:
// outside Kissflow the app boots against a mock seeded from this schema, with a
// role switcher. Inside Kissflow the real SDK is used and this is ignored.
import devSchema from "../lib/kf-schema.json";
import uiSpec from "../lib/ui-spec.json";

import "./index.css";
// Imported AFTER index.css so Tailwind utility classes win where explicitly used.
// Tailwind preflight is disabled (tailwind.config.js) so this cannot touch the
// existing kf design system.
import "./shadcn.css";
// Catalog sibling overrides — selected before first paint from ui-spec (or a review-only URL flag).
import "./theme-variants.css";

// The selected catalog theme is part of ui-spec. A query override remains useful for review, but
// normal users see that complete theme without needing a URL flag or switcher.
{
  document.documentElement.dataset.theme = resolvePrototypeThemeFamily(location.search, uiSpec?.app?.theme);
}
// Admin / Super Admin see-all in the offline preview. Kissflow admin roles have full app
// access, but the synced per-model roleAccess only lists the explicitly-granted business
// roles — so without this the app boots on "Admin" (schema role #0) with zero nav and every
// data widget "Restricted". Grant every admin-type role access to every model so the default
// role shows a working, complete view. (Business roles keep their own scoped access.)
for (const _r of devSchema?.roles || []) {
  if (!/(^|\b)(admin|super admin)(\b|$)/i.test(_r?.name || "")) continue;
  for (const _m of devSchema?.dataModels || []) {
    _m.roleAccess = _m.roleAccess || [];
    if (!_m.roleAccess.some((x) => x.id === _r.id)) _m.roleAccess.push({ id: _r.id, name: _r.name, permission: [] });
  }
}

// A small hello for the curious dev who opens the console — app name from the synced schema.
const _appName = devSchema?.app?.name || String(devSchema?.app?.id || "App").replace(/_A\d+$/, "").replace(/_/g, " ").trim();
console.log(`%c⚡ ${_appName} · built with @kissflow/app-ui`, "color:#6366f1;font-weight:700;font-size:13px");

// AppShell is the persistent root layout (like Next's app/layout.tsx). Do not replace the
// self-contained first-paint loader until the compiled application stylesheet proves it loaded.
// If that asset is missing or rejected, the user keeps seeing a styled preparation screen rather
// than the raw navigation and page markup.
const cssReady = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-app-css-ready").trim() === "1";
const root = createRoot(document.getElementById("root"));
const mount = () => root.render(
  <KfApp routes={routes} layout={AppShell} devSchema={devSchema} loader={<AppBootScreen />} />,
);

if (cssReady()) {
  mount();
} else {
  let attempts = 0;
  const waitForCss = () => {
    if (cssReady()) return mount();
    attempts += 1;
    if (attempts < 300) requestAnimationFrame(waitForCss);
    else console.error("Application styles did not load; keeping the safe loading screen visible.");
  };
  requestAnimationFrame(waitForCss);
}
