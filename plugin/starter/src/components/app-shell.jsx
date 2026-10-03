import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKf, useKfDev } from "@kissflow/app-ui";
import { Zap } from "lucide-react";
import { resolveNavIcon } from "./nav-icons.js";
import { SHOW_LAYOUTS_CATALOG } from "./shell-preview-flags.js";
import appSchema from "../../lib/kf-schema.json";
import navManifest from "../../lib/nav.json";
import uiSpec from "../../lib/ui-spec.json";
import { AppShell as ComponentSystemShell } from "./kit/AppShell.jsx";
import { resolveRootMaterial } from "./kit/Surface.js";
import { SidebarWordmark } from "./kit/SidebarWordmark.jsx";
import { ThemeProvider, useTheme } from "./kit/ThemeProvider.jsx";
import { DisplayOptionsPanel, DisplayOptionsTrigger } from "./prototype-display-options.jsx";
import {
  applyPrototypeRootOverrides,
  DEFAULT_PROTOTYPE_THEME_FAMILY,
  normalizePrototypeDisplayOptions,
  normalizePrototypeThemeFamily,
  PROTOTYPE_THEME_CHOICES,
  PROTOTYPE_THEME_FAMILIES,
  prototypeThemeShellDefaults,
  readPrototypeRootTokens,
  resolvePrototypeThemeFamily,
  restorePrototypeRootOverrides,
  syncPrototypeFontPairStylesheet,
} from "./prototype-display-options.js";

// App display name — from the synced metadata, NEVER hardcoded. Falls back to a prettified
// id so it stays correct for whatever app is connected (re-sync → new name, no code change).
const APP_NAME = appSchema?.app?.name || String(appSchema?.app?.id || "App").replace(/_A\d+$/, "").replace(/_/g, " ").trim();
const DEFAULT_THEME_FAMILY = resolvePrototypeThemeFamily(
  typeof window !== "undefined" ? window.location.search : "",
  uiSpec?.app?.theme,
  PROTOTYPE_THEME_FAMILIES,
  DEFAULT_PROTOTYPE_THEME_FAMILY,
);
const THEME_SHELL_DEFAULTS = prototypeThemeShellDefaults(DEFAULT_THEME_FAMILY);

// The new component system treats navigation, chrome colour, geometry and material as independent
// axes. Accept both the new object form and the old archetype string while generated ui-spec files
// migrate. Unknown values always land on the component system's conservative defaults.
const shellInput = uiSpec?.app?.shell;
const shellSpec = shellInput && typeof shellInput === "object" ? shellInput : {};
const legacyShell = typeof shellInput === "string" ? shellInput : null;
const NAV_VARIANTS = new Set(["sidebar", "top"]);
const CHROME_VARIANTS = new Set(["base", "accent"]);
const DESIGN_VARIANTS = new Set(["classic", "float"]);
const MATERIAL_VARIANTS = new Set(["panel", "flat", "bare", "spacing"]);
const DISPLAY_DOCKS = new Set(["left", "bottom", "right"]);
const legacyNavVariant = legacyShell === "top-bar" ? "top" : "sidebar";
const requestedNavVariant = shellSpec.variant || shellSpec.nav || uiSpec?.app?.navVariant;
const SHELL_VARIANT = requestedNavVariant === "fixed" || requestedNavVariant === "rail"
  ? "sidebar"
  : NAV_VARIANTS.has(requestedNavVariant)
    ? requestedNavVariant
    : legacyShell ? legacyNavVariant : THEME_SHELL_DEFAULTS.variant;
const requestedChrome = shellSpec.chrome || uiSpec?.app?.chrome;
const SHELL_CHROME = CHROME_VARIANTS.has(requestedChrome)
  ? requestedChrome
  : legacyShell === "rail-dark" ? "accent" : THEME_SHELL_DEFAULTS.chrome;
const requestedDesign = shellSpec.design || uiSpec?.app?.design;
const SHELL_DESIGN = DESIGN_VARIANTS.has(requestedDesign) ? requestedDesign : THEME_SHELL_DEFAULTS.design;
const requestedMaterial = shellSpec.material || uiSpec?.app?.material;
const SHELL_MATERIAL = MATERIAL_VARIANTS.has(requestedMaterial) ? requestedMaterial : THEME_SHELL_DEFAULTS.material;
const ROLE_SWITCHER_PLACEMENTS = new Set(["rail-footer", "header-end", "profile-chip"]);
const ROLE_SWITCHER_VARIANTS = new Set(["compact", "profile"]);
// Preview role selection is shell furniture. Comprehensive's design specialist chooses it beside
// the shell; Express gets the compact rail default. A right rail never docks at its lower-right edge
// (host support/avatar furniture owns that corner), even when an older spec omitted the new field.
// LIGHT IS THE DEFAULT, unconditionally. "system" made the same app open dark or light by viewer
// OS, and letting the design genome pick dark meant a build could open dark "by design" when the
// person never asked — every retained theme is light-first with dark derived, so opening light is
// always safe. Dark is a PERSON'S choice, made in Display Options and persisted per app.
const DEFAULT_COLOR_MODE = "light";
const requestedRolePlacement = uiSpec?.app?.roleSwitcher?.placement;
const safeRequestedRolePlacement = SHELL_VARIANT === "top" && requestedRolePlacement === "rail-footer"
  ? "header-end"
  : requestedRolePlacement;
const ROLE_SWITCHER_PLACEMENT = ROLE_SWITCHER_PLACEMENTS.has(safeRequestedRolePlacement)
  ? safeRequestedRolePlacement
  : SHELL_VARIANT === "top" ? "header-end" : "rail-footer";
const ROLE_SWITCHER_VARIANT = ROLE_SWITCHER_VARIANTS.has(uiSpec?.app?.roleSwitcher?.variant)
  ? uiSpec.app.roleSwitcher.variant
  : "compact";
const IS_UI_TEST = import.meta.env.KF_UI_TEST === "true";
const IS_GENERATED_PROTOTYPE = import.meta.env.VITE_KF_PREVIEW === "1";

// THE COMPONENT CATALOG NEVER SHIPS IN A GENERATED PROTOTYPE. `shell-preview-content.jsx` pulls the
// five component-review galleries, and importing it statically added ~1.8 MB to every prototype —
// unreachable weight, since the catalog renders only when `usingPreviewNavigation` is true and that
// needs an EMPTY nav manifest, which a real app never has.
//
// A plain React.lazy would not help here: the single-file build sets rollup's `inlineDynamicImports`,
// which collapses split chunks straight back into the one entry. So the elimination has to happen at
// BUILD time — Vite replaces `import.meta.env.VITE_KF_PREVIEW` with a literal, the ternary below
// folds to `null`, and the `import()` in the dead branch is dropped from the graph entirely.
const ShellPreviewContent = IS_GENERATED_PROTOTYPE
  ? null
  : lazy(() => import("./shell-preview-content.jsx"));
const SHELL_TWEAKS_STORAGE_KEY = IS_GENERATED_PROTOTYPE
  ? `kf-prototype-display-options:${appSchema?.app?.id || "app"}`
  : "kf-shell-tweaks";
const DEFAULT_SHELL_TWEAKS = {
  variant: SHELL_VARIANT,
  chrome: SHELL_CHROME,
  design: SHELL_DESIGN,
  material: SHELL_MATERIAL,
  family: DEFAULT_THEME_FAMILY,
  radius: null,
  spacing: null,
  fontScale: null,
  fontPair: null,
  brand: null,
  shadowStrength: null,
  dock: "right",
  compositionVersion: 1,
};

// Builder previews run in an opaque-origin iframe. In that environment the localStorage property
// exists, but reading its getter throws before a global-property type guard can help.
function optionalLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadShellTweaks() {
  try {
    const saved = JSON.parse(optionalLocalStorage()?.getItem(SHELL_TWEAKS_STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return { ...DEFAULT_SHELL_TWEAKS };
    const family = normalizePrototypeThemeFamily(
      saved.family,
      PROTOTYPE_THEME_FAMILIES,
      DEFAULT_SHELL_TWEAKS.family,
    );
    const themeShell = prototypeThemeShellDefaults(family);
    // State written before theme-owned compositions existed carried the same generic shell for
    // every family. Migrate it once so an already-selected theme receives its intended defaults.
    const acceptsPersistedComposition = saved.compositionVersion === 1;
    const persistedVariant = saved.variant === "fixed" || saved.variant === "rail" ? "sidebar" : saved.variant;
    const display = normalizePrototypeDisplayOptions(saved, DEFAULT_SHELL_TWEAKS.variant);
    return {
      variant: acceptsPersistedComposition && NAV_VARIANTS.has(persistedVariant) ? persistedVariant : themeShell.variant,
      chrome: acceptsPersistedComposition && CHROME_VARIANTS.has(saved.chrome) ? saved.chrome : themeShell.chrome,
      design: acceptsPersistedComposition && DESIGN_VARIANTS.has(saved.design) ? saved.design : themeShell.design,
      material: acceptsPersistedComposition && MATERIAL_VARIANTS.has(saved.material) ? saved.material : themeShell.material,
      family,
      radius: display.radius,
      spacing: display.spacing,
      fontScale: display.fontScale,
      fontPair: display.fontPair,
      brand: display.brand,
      shadowStrength: display.shadowStrength,
      dock: DISPLAY_DOCKS.has(saved.dock) ? saved.dock : DEFAULT_SHELL_TWEAKS.dock,
      compositionVersion: 1,
    };
  } catch {
    return DEFAULT_SHELL_TWEAKS;
  }
}

// Toaster is now token-native, which means THIS FILE NO LONGER LOADS kf-ui.css. That import was
// the last thing pulling all 330 legacy rules into every page in the app.
import { Toaster, toast } from "./kit/Fx.jsx";
import { RecordSheet } from "./RecordSheet.jsx";

// Root layout (passed to <KfApp layout={AppShell} />). Renders ONCE and stays
// mounted across navigation — the sidebar keeps its state, only `children`
// (the matched route) swaps. Pages set the header via usePageTitle("…").
//
// `models` = the data models a page reads. The nav is role-aware: a page shows
// only if the active role can reach at least one of its models (pages with no
// data — home, test — always show). Mirrors how a Kissflow role sees its own nav.
// Only real, published pages — test/draft/old-version pages (test page1, droptest,
// "CC TEST", "@V1") are hidden from the nav.
// Nav is built ENTIRELY from lib/nav.json — generated by kf-gen-page from the app's SYNCED
// role permissions (page → roles). No hardcoded pages or roles; the active role filters it.
// The app's OWN nav tree (menus → items) from lib/nav.json — rendered verbatim, role-gated.
const NAV_MENUS = Array.isArray(navManifest) ? navManifest : [];
const PREVIEW_NAV_MENUS = [
  {
    name: "Workspace",
    items: [
      { page: "preview-overview", to: "preview-overview", label: "Overview", icon: "overview" },
      { page: "preview-claims", to: "preview-claims", label: "Claims", icon: "cases", count: 128 },
      { page: "preview-approvals", to: "preview-approvals", label: "Approvals", icon: "approvals", count: 14 },
      { page: "preview-centers", to: "preview-centers", label: "Service centers", icon: "facilities" },
    ],
  },
  {
    name: "Insights",
    items: [
      { page: "preview-analytics", to: "preview-analytics", label: "Analytics", icon: "analytics" },
      { page: "preview-sla", to: "preview-sla", label: "SLA monitor", icon: "time", count: 3 },
    ],
  },
  {
    name: "Manage",
    items: [
      { page: "preview-team", to: "preview-team", label: "Review team", icon: "people" },
      { page: "preview-settings", to: "preview-settings", label: "Settings", icon: "settings" },
    ],
  },
  ...(SHOW_LAYOUTS_CATALOG
    ? [{
        name: "Review",
        items: [
          { page: "preview-layouts", to: "preview-layouts", label: "Layouts", icon: "overview" },
        ],
      }]
    : []),
];

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

// ThemeProvider intentionally keeps its family-neutral Light/Dark/System state separate from the
// compiler-selected theme family in documentElement.dataset.theme. Derived root tokens only
// re-resolve when `.dark` is on the root itself, so bridge the provider's resolved mode there.
function DocumentThemeMode({ children, onResolvedChange }) {
  const { resolved } = useTheme();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    onResolvedChange?.(resolved);
    return () => document.documentElement.classList.remove("dark");
  }, [resolved, onResolvedChange]);

  return children;
}

export function AppShell({ children }) {
  const kf = useKf();
  const { active, canAccess, roleName } = useKfDev();

  // Render the app's nav tree, each menu showing only the items the active role may see
  // (from the app's own SubMenu VisibleTo). Empty roles = visible to all. Admin / Super Admin
  // are see-all (Kissflow admin roles have full app access; explicit per-item roles only list
  // the business roles), so they get the whole nav instead of an empty sidebar.
  // "Viewing as" — a role override that works INSIDE Kissflow too, not only in the offline preview.
  //
  // Live, a person sees the union of every app role they belong to, so whoever built the app (who is
  // usually in all of them) can never see what one persona actually gets without editing role
  // membership in app settings and reloading. That made "show me the Technician's app" a five-minute
  // detour. This scopes the NAV to one role on demand.
  //
  // It is a VIEW switch, not a permission switch: the server still returns whatever the signed-in
  // user may read, so this cannot be used to test data scoping — hence the explicit label rather
  // than a bare role picker that would imply otherwise.
  const APP_ROLES = (appSchema?.roles || []).map((r) => r.name).filter(Boolean);
  const [viewAs, setViewAs] = useState(() => APP_ROLES[0] || null);
  // Keep the preview "View as" override coherent with the capture/dev role bridge: headless QA
  // (and the engine's own runtime smoke) switches roles via __KF_CAPTURE__.selectRole, which only
  // moves useKfDev()'s roleId/roleName — never this component's own `viewAs` state. Without this
  // sync, `viewAs` (initialized to the first app role) permanently shadows every later role switch,
  // so every route after the first role's nav items reads as invisible. The human dropdown below
  // still works: it sets `viewAs` directly, and the next bridge-driven switch re-syncs from there.
  useEffect(() => {
    if (active && roleName) setViewAs(roleName);
  }, [active, roleName]);
  const [navOpen, setNavOpen] = useState(false);
  const [previewNav, setPreviewNav] = useState(PREVIEW_NAV_MENUS[0].items[0].to);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [shellTweaks, setShellTweaks] = useState(loadShellTweaks);
  const [resolvedDisplayTokens, setResolvedDisplayTokens] = useState({ brand: "", radius: "", spacing: "", fontScale: "", shadowStrength: "" });
  const [resolvedColorMode, setResolvedColorMode] = useState(null);
  const rootOverrideSnapshot = useRef(null);
  const rootThemeSnapshot = useRef(null);
  const skipNextShellTweaksPersist = useRef(false);
  const [isNarrow, setIsNarrow] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches
  ));
  const effectiveRole = viewAs || roleName;
  const scoped = Boolean(viewAs) || active;
  const controlsEnabled = IS_GENERATED_PROTOTYPE || (active && IS_UI_TEST);
  const activeShell = controlsEnabled ? shellTweaks : DEFAULT_SHELL_TWEAKS;
  const resolvedShellMaterial = resolveRootMaterial({
    appMaterial: activeShell.material,
  });
  const usingPreviewNavigation = active && NAV_MENUS.length === 0;
  const sourceMenus = usingPreviewNavigation ? PREVIEW_NAV_MENUS : NAV_MENUS;
  // A desktop top bar becomes the standard sidebar drawer on narrow screens. A horizontally clipped
  // row of destinations is not usable mobile navigation, while the drawer preserves every item.
  const renderedVariant = isNarrow && activeShell.variant === "top" ? "sidebar" : activeShell.variant;
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!rootThemeSnapshot.current) rootThemeSnapshot.current = { value: root.getAttribute("data-theme") };
    root.dataset.theme = activeShell.family;
  }, [activeShell.family]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!controlsEnabled) {
      if (rootOverrideSnapshot.current) {
        restorePrototypeRootOverrides(root, rootOverrideSnapshot.current);
        rootOverrideSnapshot.current = null;
      }
      return;
    }
    if (!rootOverrideSnapshot.current) rootOverrideSnapshot.current = new Map();
    applyPrototypeRootOverrides(root, activeShell, rootOverrideSnapshot.current);
    setResolvedDisplayTokens(readPrototypeRootTokens(root));
  }, [controlsEnabled, activeShell.brand, activeShell.radius, activeShell.spacing, activeShell.fontScale, activeShell.fontPair, activeShell.shadowStrength, activeShell.family, resolvedColorMode]);

  useEffect(() => {
    syncPrototypeFontPairStylesheet(document, controlsEnabled ? activeShell.fontPair : null);
    return () => syncPrototypeFontPairStylesheet(document, null);
  }, [controlsEnabled, activeShell.fontPair]);

  useLayoutEffect(() => () => {
    const root = document.documentElement;
    if (rootOverrideSnapshot.current) {
      restorePrototypeRootOverrides(root, rootOverrideSnapshot.current);
      rootOverrideSnapshot.current = null;
    }
    if (rootThemeSnapshot.current) {
      const { value } = rootThemeSnapshot.current;
      if (value == null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", value);
      rootThemeSnapshot.current = null;
    }
  }, []);

  useEffect(() => {
    if (!controlsEnabled) return;
    if (skipNextShellTweaksPersist.current) {
      skipNextShellTweaksPersist.current = false;
      return;
    }
    try {
      optionalLocalStorage()?.setItem(SHELL_TWEAKS_STORAGE_KEY, JSON.stringify(shellTweaks));
    } catch {
      // Storage is optional; the panel still works for the current session.
    }
  }, [controlsEnabled, shellTweaks]);

  const changeShellTweak = (key, value) => {
    setShellTweaks((current) => {
      if (key !== "family") return { ...current, [key]: value, compositionVersion: 1 };
      const family = normalizePrototypeThemeFamily(
        value,
        PROTOTYPE_THEME_FAMILIES,
        DEFAULT_SHELL_TWEAKS.family,
      );
      return {
        ...current,
        ...prototypeThemeShellDefaults(family),
        family,
        compositionVersion: 1,
      };
    });
  };

  useEffect(() => {
    if (!controlsEnabled) return undefined;

    const onThemeShortcut = (event) => {
      if (
        event.defaultPrevented
        || event.isComposing
        || !event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || (event.code !== "BracketLeft" && event.code !== "BracketRight")
      ) return;

      const target = event.target;
      if (
        target instanceof HTMLElement
        && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']"))
      ) return;

      const currentIndex = Math.max(0, PROTOTYPE_THEME_FAMILIES.indexOf(activeShell.family));
      const direction = event.code === "BracketRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + PROTOTYPE_THEME_FAMILIES.length)
        % PROTOTYPE_THEME_FAMILIES.length;
      const nextFamily = PROTOTYPE_THEME_FAMILIES[nextIndex];
      const nextTheme = PROTOTYPE_THEME_CHOICES.find((choice) => choice.value === nextFamily);

      event.preventDefault();
      changeShellTweak("family", nextFamily);
      toast(`Theme: ${nextTheme?.label || nextFamily}`, "info", 1800);
    };

    document.addEventListener("keydown", onThemeShortcut);
    return () => document.removeEventListener("keydown", onThemeShortcut);
  }, [controlsEnabled, activeShell.family]);

  const resetShellTweaks = () => {
    skipNextShellTweaksPersist.current = true;
    setShellTweaks({ ...DEFAULT_SHELL_TWEAKS });
    try { optionalLocalStorage()?.removeItem(SHELL_TWEAKS_STORAGE_KEY); } catch { /* optional */ }
  };

  useEffect(() => {
    if (!controlsEnabled || !tweaksOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setTweaksOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [controlsEnabled, tweaksOpen]);

  const isAdmin = /(^|\b)(admin|super admin)(\b|$)/i.test(effectiveRole || "");
  const visibleMenus = sourceMenus
    .map((m) => ({
      name: m.name,
      items: (m.items || [])
        .filter((it) => !scoped || isAdmin || !it.roles || it.roles.length === 0 || (effectiveRole && it.roles.includes(effectiveRole)))
        .map((it) => ({ ...it, icon: resolveNavIcon(it) })),
    }))
    .filter((m) => m.items.length);

  // Land on the role's first page. There is no route at "/" — every page is a named route — so
  // without this the app opens on an empty content area. Inside Kissflow that is the normal entry
  // path, because an Application-category custom UI gets no deep-link route from the host, so "/"
  // is exactly where it starts.
  //
  // The SAME redirect has to fire when the dev role switcher changes role mid-session, not only
  // on first load at "/". Flipping roles recomputes `visibleMenus` (a different role sees a
  // different "Home"), but the router was never told to navigate — so the sidebar pointed at the
  // new role's page while the content area kept rendering the old role's, and the two disagreed.
  // Scoped to routes nav.json actually lists (`allNavRoutes`): only those role-owned pages can go
  // stale under a role switch. An unlisted development route is left alone.
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const firstPage = visibleMenus[0]?.items[0]?.to;
  const allNavRoutes = useMemo(
    () => new Set(NAV_MENUS.flatMap((m) => (m.items || []).map((it) => it.to))),
    [],
  );
  const visibleRoutes = useMemo(
    () => new Set(visibleMenus.flatMap((m) => m.items.map((it) => it.to))),
    [visibleMenus],
  );
  const captureRouteRef = useRef({ pathname, roleName: effectiveRole });
  captureRouteRef.current = { pathname, roleName: effectiveRole };

  // The visual capture runner must prove an exact role + route pair. Driving arbitrary DOM controls
  // was racy (and broke as soon as the role selector moved into the rail), so the app shell exposes
  // exact page navigation beside the provider-owned role control on a preview-only bridge.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bridge = window.__KF_CAPTURE__ || { version: 1 };
    window.__KF_CAPTURE__ = bridge;
    const getRouteState = () => {
      const current = captureRouteRef.current.pathname;
      const item = NAV_MENUS.flatMap((menu) => menu.items || []).find((candidate) => candidate.to === current);
      return { path: current, page: item?.page || null, roleName: captureRouteRef.current.roleName || null };
    };
    const openPage = async (page) => {
      const target = String(page || "").trim();
      const item = NAV_MENUS.flatMap((menu) => menu.items || []).find((candidate) =>
        candidate.page === target || candidate.to === target,
      );
      if (!item) {
        const error = new Error(`Unknown preview page: ${target || "(empty)"}`);
        error.code = "PAGE_UNKNOWN";
        throw error;
      }
      navigate(item.to, { replace: true });
      const deadline = Date.now() + 8000;
      while (Date.now() < deadline) {
        if (captureRouteRef.current.pathname === item.to) return getRouteState();
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      const error = new Error(`Preview route did not open: ${target}`);
      error.code = "PAGE_TIMEOUT";
      throw error;
    };
    bridge.version = 1;
    bridge.getRouteState = getRouteState;
    bridge.openPage = openPage;
    return () => {
      if (bridge.getRouteState === getRouteState) delete bridge.getRouteState;
      if (bridge.openPage === openPage) delete bridge.openPage;
    };
  }, [navigate]);

  useEffect(() => {
    document.documentElement.dataset.kfActiveRole = effectiveRole || "";
    document.documentElement.dataset.kfActiveRoute = usingPreviewNavigation ? previewNav : pathname;
    return () => {
      delete document.documentElement.dataset.kfActiveRole;
      delete document.documentElement.dataset.kfActiveRoute;
    };
  }, [effectiveRole, pathname, previewNav, usingPreviewNavigation]);
  useEffect(() => {
    if (usingPreviewNavigation) return;
    if (!firstPage) return;
    const onOwnedRoute = allNavRoutes.has(pathname);
    if (pathname === "/" || (onOwnedRoute && !visibleRoutes.has(pathname))) {
      navigate(firstPage, { replace: true });
    }
  }, [pathname, firstPage, allNavRoutes, visibleRoutes, navigate, usingPreviewNavigation]);

  // Close the drawer when the route changes. Tapping a nav item is a navigation AND a dismissal,
  // and leaving the drawer over the page you just asked for is the most common way a mobile nav
  // feels broken. Keyed on pathname rather than wired to each NavLink so it cannot be missed when
  // a new link is added.
  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(max-width: 900px)");
    const onChange = (event) => {
      setIsNarrow(event.matches);
      if (!event.matches) setNavOpen(false);
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, []);

  // Escape closes it. The scrim is a real button so it is already reachable by keyboard and
  // announced; this is for the case where focus is inside the drawer.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // Adapt the generated, role-filtered nav.json tree to the new component system's nav contract.
  // Route paths remain the stable ids so active state and programmatic navigation cannot drift.
  const shellNav = visibleMenus.flatMap((menu, menuIndex) => {
    const group = {
      type: "group",
      id: `group-${menuIndex}-${menu.name || "navigation"}`,
      label: menu.name,
    };
    const items = menu.items.map((item) => {
      const ItemIcon = item.icon;
      return {
        ...item,
        id: item.to,
        icon: ItemIcon ? <ItemIcon size={16} strokeWidth={1.9} aria-hidden="true" /> : null,
      };
    });
    return [group, ...items];
  });

  const brand = (
    <SidebarWordmark
      icon={Zap}
      name={APP_NAME}
      variant={renderedVariant === "top" ? "topbar" : "sidebar"}
    />
  );

  const roleSwitcher = (
    <div
      className="kf-shell-role-switcher"
      data-kf-role-switcher-slot=""
      data-kf-role-switcher-placement={ROLE_SWITCHER_PLACEMENT}
      data-kf-role-switcher-variant={ROLE_SWITCHER_VARIANT}
    />
  );
  const viewAsControl = APP_ROLES.length > 1 ? (
    <label className="view-as" title="Scopes the navigation to one role. Data access is still whatever the signed-in user may read.">
      <span className="view-as-label">Viewing as</span>
      <select
        className="view-as-select"
        value={viewAs ?? APP_ROLES[0] ?? ""}
        onChange={(event) => setViewAs(event.target.value)}
      >
        {APP_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
      </select>
    </label>
  ) : null;

  // Avatar leads, identity stacks beside it. The mark is the fastest thing to recognise, and
  // giving the name and the address one shared left edge keeps the block readable when either
  // string is long enough to ellipsize. Email is optional — the SDK exposes it, but an app whose
  // host never populates it must not render an empty second line.
  const userIdentity = (
    <div className="kf-shell-user">
      <span className="user-avatar">{initials(kf.user?.Name) || "•"}</span>
      <span className="user-identity">
        <span className="user-name">{kf.user?.Name ?? "Signed in"}</span>
        {kf.user?.Email ? <span className="user-email">{kf.user.Email}</span> : null}
      </span>
    </div>
  );

  const sidebarAccount = (
    <div className="kf-shell-sidebar-account">
      {viewAsControl}
      {!active ? roleSwitcher : null}
      {userIdentity}
    </div>
  );

  // Top navigation has no sidebar; keep the account controls reachable there as the only fallback.
  // The sidebar variant leaves the shell header empty so the page owns its breadcrumb and title.
  const topbar = renderedVariant === "top" ? (
    <div className="kf-shell-topbar">
      <div className="kf-shell-account">
          {viewAsControl}
        {!active ? roleSwitcher : null}
        {userIdentity}
      </div>
    </div>
  ) : null;

  return (
    <div
      className="kf-shell-host"
      data-nav={navOpen ? "open" : undefined}
      data-shell-variant={renderedVariant}
      data-shell-chrome={activeShell.chrome}
      data-shell-design={activeShell.design}
      data-shell-material={activeShell.material}
      data-shell-resolved-material={resolvedShellMaterial}
      data-material={resolvedShellMaterial}
      data-shell-tweaks={controlsEnabled && tweaksOpen ? "open" : undefined}
      data-display-options={controlsEnabled && tweaksOpen ? "open" : undefined}
      data-display-options-dock={controlsEnabled && tweaksOpen ? activeShell.dock : undefined}
      data-kf-generated={IS_GENERATED_PROTOTYPE ? "" : undefined}
    >
      {renderedVariant !== "top" ? (
        <button
          type="button"
          className="nav-toggle"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
          aria-controls="app-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? (
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path d="M2 2l11 11M13 2L2 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
              <path d="M1 1h14M1 7h14M1 13h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </button>
      ) : null}

      {navOpen ? (
        <button type="button" className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
      ) : null}

      <div id="app-nav" className="kf-component-shell">
        <ThemeProvider
          defaultTheme={DEFAULT_COLOR_MODE}
          storageKey={`kf-color-mode:${appSchema?.app?.id || "app"}`}
          applyClass={false}
          className="kf-shell-theme-provider"
        >
          <DocumentThemeMode onResolvedChange={setResolvedColorMode}>
            <ComponentSystemShell
              nav={shellNav}
              active={usingPreviewNavigation ? previewNav : pathname}
              onNavigate={(id, item) => {
                if (usingPreviewNavigation) {
                  setPreviewNav(item?.to || id);
                  setNavOpen(false);
                  return;
                }
                navigate(item?.to || id);
              }}
              brand={brand}
              topbar={topbar}
              sidebarFooter={renderedVariant === "top" ? null : sidebarAccount}
              variant={renderedVariant}
              chrome={activeShell.chrome}
              design={activeShell.design}
              material={activeShell.material}
              className="kf-component-app-shell"
            >
              <div className="content kf-shell-content">
                {usingPreviewNavigation ? <ShellPreviewContent section={previewNav} /> : children}
              </div>
            </ComponentSystemShell>
            {active ? (
              <div
                hidden
                data-kf-role-switcher-slot=""
                data-kf-role-switcher-placement="hidden"
                data-kf-role-switcher-variant="compact"
              />
            ) : null}
            {controlsEnabled ? (
              <DisplayOptionsPanel
                open={tweaksOpen}
                options={shellTweaks}
                resolvedTokens={resolvedDisplayTokens}
                onChange={changeShellTweak}
                onClose={() => setTweaksOpen(false)}
                onReset={resetShellTweaks}
              />
            ) : null}
          </DocumentThemeMode>
        </ThemeProvider>
      </div>
      {controlsEnabled ? (
        <DisplayOptionsTrigger open={tweaksOpen} onClick={() => setTweaksOpen((open) => !open)} />
      ) : null}
      <Toaster />
      {/* Renders the record form in PREVIEW. In Kissflow, openForm() hands off to the

          platform and this never fires. */}
      <RecordSheet />
    </div>
  );
}
