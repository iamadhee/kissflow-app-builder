import React from "react";
import { cn as cx } from "./cn.js";
import { NavItem } from "./NavItem.jsx";
import {
  SurfaceContext,
  elevationClass,
  materialRadiusClass,
  materialStyle,
  resolveElevation,
  resolveRootMaterial,
} from "./Surface.js";

/**
 * AppShell — sidebar, topbar, scrolling content. The archetype most product
 * screens live inside.
 *
 * The layout is a fixed-height flex column with one scroll container, so the
 * sidebar and topbar never move and only the content scrolls. That is the whole
 * difference between a shell and a page: a page scrolls, a shell holds still.
 *
 * Two nav models, one component. `variant` picks:
 *   sidebar  side navigation, always expanded (default)
 *   top    horizontal nav in the bar, no sidebar at all
 * They are one component rather than two because the content region, the
 * scroll ownership and the slot contract are identical — only the nav's
 * orientation differs.
 *
 * `chrome` is a separate axis: base or accent. It colours the shell's own
 * surfaces and nothing inside them, so a brand-coloured sidebar never bleeds
 * into the page. Each treatment is a complete set written onto the shell root as
 * --chrome-*, which is why no nav row carries a per-treatment class.
 *
 * `rightPanel` adds a third column for context that belongs to the app rather
 * than the page — activity, help, an inspector. It is a peer of the sidebar, not
 * of the content, so it survives navigation.
 *
 * Nav items are data with an optional `items` array for one level of nesting —
 * the same shape Tree takes, so a nav and a tree can be fed from one source.
 *
 * <AppShell nav={items} active="claims" variant="sidebar" brand={…} topbar={…}>…</AppShell>
 */
const { useState } = React;


/* Slots take either node props or children carrying data-slot="name" — the same
   contract Toolbar uses, because a JSX caller and a template caller cannot pass
   nodes the same way. Unslotted children fall through to the main content. */
function useSlots(children, names) {
  /* Fragments are transparent. React.Children.toArray counts a Fragment as ONE
     child and never looks inside it, and a template's <sc-if>/<sc-for> wraps its
     branch in exactly that — so a slot declared inside a conditional lost its
     data-slot and fell through to the content. Flattening first makes a
     conditional slot behave like an unconditional one. */
  const flat = (nodes) =>
    React.Children.toArray(nodes).reduce(
      (out, n) => out.concat(n && n.type === React.Fragment ? flat(n.props.children) : n),
      []
    );
  const kids = flat(children);
  const slotOf = (n) => (n && n.props ? n.props['data-slot'] : null);
  const out = { rest: kids.filter((k) => names.indexOf(slotOf(k)) < 0) };
  names.forEach((name) => {
    const found = kids.filter((k) => slotOf(k) === name);
    out[name] = found.length ? found : null;
  });
  return out;
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('w-3.5 h-3.5 shrink-0 transition-transform ease-ctl duration-[var(--default-transition-duration)]', open && 'rotate-90')}
    >
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* No bg-* and no w-/px- here. Everything in cx() lands as an equal-specificity
   utility, so stylesheet order decides the winner, not argument order — a
   bg-transparent in the shared base silently beat every design's active fill,
   and w-full/px-3 beat the collapsed row's own w-10/px-0. The rule: any
   property a caller overrides has to be absent from the base, not merely earlier
   in the list. */
/* The design axis, orthogonal to chrome: chrome decides the shell's COLOUR,
   design decides its GEOMETRY — where the edges are, how the content region is
   bounded, how tall the topbar sits, what an active row looks like. Keeping them
   separate is what makes 3 × 3 combinations coherent instead of nine one-off
   skins; every entry below reads the same chrome variables.

     classic   full-bleed panes divided by hairlines. The original.
     float     both panes detached — gutter around everything, two bordered
               panels. Radius and spacing create separation without elevation. */
const DESIGN = {
  classic: {
    root: '',
    asideBg: 'bg-chrome-surface',
    aside: '',
    body: '',
    head: 'h-14 px-3',
    top: 'h-16 px-6 bg-ctl-surface',
    nav: 'px-3 pb-3 gap-1',
    row: 'rounded-lg border border-solid',
    active: 'border-[var(--chrome-active-border)] bg-chrome-active-bg text-chrome-active-fg font-medium',
    idle: 'border-transparent bg-transparent text-chrome-fg hover:bg-chrome-hover',
  },
  float: {
    root: 'p-3 gap-3',
    asideBg: 'bg-chrome-surface',
    aside: 'overflow-hidden',
    body: 'rounded-xl overflow-hidden',
    head: 'h-14 px-3',
    top: 'h-16 px-5 bg-transparent',
    nav: 'px-3 pb-3 gap-1',
    row: 'rounded-lg border border-solid',
    active: 'border-[var(--chrome-active-border)] bg-chrome-active-bg text-chrome-active-fg font-medium',
    idle: 'border-transparent bg-transparent text-chrome-fg hover:bg-chrome-hover',
  },
};

function NavRows({ items, active, onNavigate, design = 'classic', depth = 0 }) {
  const [open, setOpen] = useState(() => items.filter((i) => i.items && i.defaultOpen).map((i) => i.id));

  return items.map((item, idx) => {
    if (item.type === 'group') {
      const first = idx === 0;
      return (
        <span
          key={item.id || item.label}
          className={cx('relative block h-11 shrink-0 overflow-hidden', first && 'h-7')}
        >
          <span
            className="absolute inset-x-0 bottom-2 block px-2 font-chrome-label text-2xs font-normal uppercase tracking-[0.18em] text-ctl-fg-subtle"
          >
            {item.label}
          </span>
        </span>
      );
    }

    const hasKids = Boolean(item.items && item.items.length);
    const on = item.id === active;
    const expanded = open.indexOf(item.id) > -1;
    const trailing = (
      <>
        {item.count != null ? (
          /* On an active row the count inherits the row's own colour at 70%
             instead of chrome-muted: a solid brand pill leaves muted grey
             unreadable, and inheriting works across every tint style. */
          <span
            className={cx(
              'shrink-0 font-mono text-2xs font-normal tabular-nums tracking-normal',
              on ? 'text-current opacity-70' : 'text-chrome-muted'
            )}
          >
            {item.count}
          </span>
        ) : null}
        {hasKids ? <Chevron open={expanded} /> : null}
      </>
    );

    return (
      <div key={item.id} className="flex flex-col">
        <NavItem
          data-nav-id={item.id}
          active={on}
          icon={item.icon}
          label={item.label}
          trailing={trailing}
          aria-expanded={hasKids ? expanded : undefined}
          onClick={() => {
            if (hasKids) setOpen((o) => (expanded ? o.filter((x) => x !== item.id) : o.concat(item.id)));
            if (onNavigate) onNavigate(item.id, item);
          }}
          className="ease-ctl duration-[var(--default-transition-duration)]"
          labelClassName="gap-3"
          style={depth ? { paddingLeft: 10 + depth * 14 } : undefined}
        />

        {hasKids && expanded ? (
          <div className="flex flex-col">
            <NavRows items={item.items} active={active} onNavigate={onNavigate} design={design} depth={depth + 1} />
          </div>
        ) : null}
      </div>
    );
  });
}

/* Each treatment is a complete set. Written onto the shell root as custom
   properties so every nav row reads one name (bg-chrome-hover) regardless of
   which treatment is active — the alternative is a class matrix per row. */
const CHROME = {
  base: {
    '--chrome-surface': 'var(--chrome-base-surface)',
    '--chrome-border': 'var(--chrome-base-border)',
    /* The authored chrome border owns the shell seam too. This lets themes
       choose a quiet, bright, or absent frame without weakening borders on
       cards and controls elsewhere in the app. */
    '--chrome-rule': 'var(--chrome-base-border)',
    '--chrome-fg': 'var(--chrome-base-fg)',
    '--chrome-muted': 'var(--chrome-base-muted)',
    /* Base chrome is a light surface, so idle navigation needs a small step
       away from the primary ink without dropping all the way to muted text. */
    '--chrome-idle-fg': 'color-mix(in oklab, var(--chrome-base-fg) 50%, var(--chrome-base-muted) 30%)',
    '--chrome-backdrop-filter': 'var(--chrome-base-backdrop-filter)',
    '--chrome-hover': 'var(--chrome-base-hover)',
    '--chrome-active-bg': 'var(--chrome-base-active-bg)',
    '--chrome-active-image': 'var(--chrome-base-active-image)',
    '--chrome-active-fg': 'var(--chrome-base-active-fg)',
    '--chrome-active-icon': 'var(--chrome-base-active-icon)',
    '--chrome-active-shadow': 'var(--chrome-base-active-shadow)',
    '--chrome-item-radius': 'var(--chrome-base-item-radius)',
    '--chrome-idle-font-weight': 'var(--chrome-base-idle-font-weight)',
    '--chrome-active-font-weight': 'var(--chrome-base-active-font-weight)',
    '--chrome-active-border': 'var(--brand-ring)',
  },
  accent: {
    '--chrome-surface': 'var(--chrome-accent-surface)',
    '--chrome-border': 'var(--chrome-accent-border)',
    '--chrome-rule': 'var(--chrome-accent-border)',
    '--chrome-fg': 'var(--chrome-accent-fg)',
    '--chrome-muted': 'var(--chrome-accent-muted)',
    /* Accent chrome keeps its existing high-contrast navigation foreground. */
    '--chrome-idle-fg': 'var(--chrome-accent-fg)',
    '--chrome-backdrop-filter': 'var(--chrome-accent-backdrop-filter)',
    '--chrome-hover': 'var(--chrome-accent-hover)',
    '--chrome-active-bg': 'var(--chrome-accent-active-bg)',
    '--chrome-active-image': 'var(--chrome-accent-active-image)',
    '--chrome-active-fg': 'var(--chrome-accent-active-fg)',
    '--chrome-active-icon': 'var(--chrome-accent-active-icon)',
    '--chrome-active-shadow': 'var(--chrome-accent-active-shadow)',
    '--chrome-item-radius': 'var(--chrome-accent-item-radius)',
    '--chrome-idle-font-weight': 'var(--chrome-accent-idle-font-weight)',
    '--chrome-active-font-weight': 'var(--chrome-accent-active-font-weight)',
    '--chrome-active-border': 'color-mix(in oklab, oklch(1 0 0) 42%, var(--brand-800))',
  },
};

/* Controls dropped INTO the sidebar are page controls: Select, ThemeToggle and
   anything else a caller puts in a slot read --ctl-* / --field-*, which are tuned
   for the page ground and know nothing about chrome. On base that passes
   unnoticed because the sidebar shares the page surface; on accent they render
   as white slabs punched into the brand.

   Remapping the control tokens on the shell's own chrome surfaces fixes every
   control at once — including ones this component has never heard of — and costs
   no component change, which is the same reason CHROME is a variable set rather
   than a class matrix. The LAYER tokens are deliberately absent: a dropdown
   floats above the whole app, so it stays a page layer rather than becoming part
   of the sidebar. */
const CHROME_CONTROLS = {
  /* The same object is installed on the actual sidebar or topbar surface. Keep
     backdrop processing here so both navigation variants, and any future
     chrome treatment, inherit the resolved theme capability automatically. */
  backdropFilter: 'var(--chrome-backdrop-filter)',
  WebkitBackdropFilter: 'var(--chrome-backdrop-filter)',
  /* surface is the RAISED step and track the ground it sits in, so they map to
     --chrome-hover and --chrome-surface in that order. Mapping surface to the
     chrome surface instead reads inverted: a segmented control's selected pill
     comes out the same colour as the sidebar with its container floating above
     it. --chrome-hover is the interactive lift over --chrome-surface by
     definition, on every treatment and in both modes, so the pair keeps its
     polarity without the shell having to know whether the chrome is light. */
  '--ctl-surface': 'var(--chrome-hover)',
  '--ctl-track': 'var(--chrome-surface)',
  '--ctl-fg': 'var(--chrome-fg)',
  '--ctl-fg-muted': 'var(--chrome-muted)',
  '--nav-item-idle-fg': 'var(--chrome-idle-fg)',
  '--nav-item-hover-bg': 'var(--chrome-hover)',
  '--nav-item-active-bg': 'var(--chrome-active-bg)',
  '--nav-item-active-image': 'var(--chrome-active-image)',
  '--nav-item-active-fg': 'var(--chrome-active-fg)',
  '--nav-item-active-icon': 'var(--chrome-active-icon)',
  '--nav-item-active-shadow': 'var(--chrome-active-shadow)',
  '--nav-item-radius': 'var(--chrome-item-radius)',
  '--nav-item-idle-font-weight': 'var(--chrome-idle-font-weight)',
  '--nav-item-active-font-weight': 'var(--chrome-active-font-weight)',
  '--field-surface': 'var(--chrome-hover)',
  '--field-border': 'var(--chrome-border)',
};

/* The sidebar's rules — its frame, brand band and footer — all draw
   --chrome-rule at full strength. That is the right weight when the border IS
   the edge, and too heavy when something else already separates the pane: panel
   casts a shadow, so there the line is a refinement and can be softened, while
   flat and bare have nothing else. Spacing deliberately removes the frame and
   relies on the geometry's gap. The `top` variant has no sidebar at all and
   the same token draws its header rule, so softening it there would leave the
   bar unbounded. Hence the guard on material and variant below.

   --chrome-border remains available to controls placed inside the chrome; the
   structural rule is separate so an intentionally borderless field treatment
   cannot erase the application frame. */
const SIDEBAR_BORDER_FADE = {
  base: 'color-mix(in oklab, var(--chrome-base-border) 72%, var(--chrome-base-surface))',
  /* Accent uses a smaller border share because its saturated surface already
     separates the chrome from the page. The rule remains theme-owned without
     becoming a bright frame around a dark sidebar. */
  accent: 'color-mix(in oklab, var(--chrome-accent-border) 28%, var(--chrome-accent-surface))',
};

function PanelIcon({ open }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <path d="M2.5 3.5h11v9h-11zM10 3.5v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path
        d={open ? 'M6.5 6.5 8 8 6.5 9.5' : 'M7.5 6.5 6 8l1.5 1.5'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Horizontal nav. Deliberately flat: a dropdown per top-level item is a Menu's
   job, and a nav bar that opens menus is two components pretending to be one.
   A branch reads active when any descendant is, and its children surface in the
   page's own tabs instead. */
function TopRows({ items, active, onNavigate }) {
  const branchHas = (item, id) => item.id === id || (item.items || []).some((k) => branchHas(k, id));

  return items
    .filter((item) => item.type !== 'group')
    .map((item) => {
      const on = branchHas(item, active);
      return (
        <NavItem
          key={item.id}
          data-nav-id={item.id}
          placement="topbar"
          active={on}
          icon={item.icon}
          label={item.label}
          trailing={item.count != null ? (
            <span className={cx('shrink-0 text-sm tabular-nums', on ? 'text-current opacity-70' : 'text-chrome-muted')}>
              {item.count}
            </span>
          ) : null}
          onClick={() => onNavigate && onNavigate(item.id, item)}
          className="shrink-0 whitespace-nowrap shadow-none"
          labelClassName="gap-2"
        />
      );
    });
}

function AppShell({
  nav = [],
  active,
  onNavigate,
  brand,
  topbar,
  sidebarFooter,
  rightPanel,
  rightPanelTitle,
  rightPanelOpen,
  onRightPanelToggle,
  variant = 'sidebar',
  chrome = 'base',
  design = 'classic',
  material = 'panel',
  sidebarBorder,
  defaultPanelOpen = true,
  children,
  className,
}) {
  const [panelState, setPanelState] = useState(defaultPanelOpen);
  const slot = useSlots(children, ['brand', 'topbar', 'sidebarFooter', 'rightPanel']);
  const brandNode = brand || slot.brand;
  const topbarNode = topbar || slot.topbar;
  const footerNode = sidebarFooter || slot.sidebarFooter;
  const panelNode = rightPanel || slot.rightPanel;
  const content = slot.rest;
  const rootMaterial = resolveRootMaterial({ appMaterial: material });
  /* Bare and Spacing remove the card treatment from the shell, so their page
     ground is the same clean surface as their content rather than the tinted
     offset canvas. Spacing is white in light appearance and resolves back to
     the theme surface in dark appearance. */
  const shellGround = rootMaterial === 'spacing'
    ? 'bg-material-surface'
    : rootMaterial === 'bare'
      ? 'bg-ctl-surface'
      : 'bg-ctl-offset';

  const treatment = CHROME[chrome] ? chrome : 'base';
  /* 'light' is the default because the softened seam is what every panelled
     shell wants; 'normal' keeps the full-strength border, 'none' hides it. */
  /* Accent is exempt from the MATERIAL half of the guard. That half exists because
     a flat or bare sidebar has nothing but its border holding it apart from the
     page — true for base, whose surface sits close to the page ground, and
     false for accent, which is unmistakable
     without any line at all. Left full strength there the border is DARKER than
     its own surface and draws a gouge rather than a seam.
     The VARIANT half still applies to every treatment: `top` has no sidebar, and
     the same token draws its header rule. */
  const separatedBySurface = treatment === 'accent';
  const fadeable = (rootMaterial === 'panel' || separatedBySurface) && variant !== 'top';
  const borderMode = fadeable ? (sidebarBorder || 'light') : 'normal';
  const vars =
    borderMode === 'normal'
      ? CHROME[treatment]
      : {
          ...CHROME[treatment],
          '--chrome-rule':
            borderMode === 'none'
              ? `var(--chrome-${treatment}-surface)`
              : SIDEBAR_BORDER_FADE[treatment],
        };
  /* Spacing is one clean workspace and never carries decorative canvas art.
     Classic Bare is likewise one opaque working surface. Floating Bare may
     still show a theme's artwork in the gutter around its detached frame. */
  const plainWorkspace = rootMaterial === 'spacing' || (rootMaterial === 'bare' && design === 'classic');
  const shellVars = {
    ...vars,
    '--shell-page-bg-image': plainWorkspace
      ? 'none'
      : 'var(--page-bg-image)',
  };
  const d = DESIGN[design] || DESIGN.classic;

  /* Chrome still owns the sidebar's fill, ink and navigation states, but its
     outer frame is a material surface just like Card. Sharing the resolver is
     important: a theme's panel gloss, glass blur, edge and elevation must not
     stop at the page content while the adjacent sidebar invents a second
     treatment. Classic keeps only the attached right-hand seam; Float uses the
     complete material frame. Bare retains one structural rule in Classic so
     the two full-bleed work areas do not visually merge. */
  const floating = design === 'float';
  const bodySurface = floating && rootMaterial === 'spacing' ? 'bg-transparent' : floating ? 'bg-ctl-surface' : '';
  const sidebarMaterial = materialStyle(rootMaterial, design);
  const sidebarElevation = elevationClass(resolveElevation({ geometry: design, material: rootMaterial }));
  const sidebarRadius = floating ? materialRadiusClass(rootMaterial) : '';
  const sidebarFrame = rootMaterial === 'spacing'
    ? 'border-0'
    : rootMaterial === 'bare'
    ? (floating
        ? 'border-0'
        : 'border-0 border-r border-solid border-[var(--material-bare-rule)]')
    : rootMaterial === 'flat'
      ? (floating
          ? 'border border-solid border-[var(--material-floating-border)]'
          : 'border-0')
      : (floating
          ? 'border border-solid border-[var(--material-floating-border)]'
          : 'border-0 border-r border-solid border-material-border');
  const edge = {
    aside: cx(sidebarFrame, sidebarElevation),
    body: floating
      ? (rootMaterial === 'bare' || rootMaterial === 'spacing'
          ? 'border-0 shadow-none'
          : 'border border-solid border-[var(--material-floating-border)] shadow-none')
      : '',
    top: rootMaterial === 'spacing'
      ? 'border-0'
      : cx('border-0 border-b border-solid', rootMaterial === 'bare' ? 'border-[var(--material-bare-rule)]' : 'border-layer-border'),
    panel: rootMaterial === 'spacing'
      ? 'border-0 shadow-none'
      : cx('border-0 border-l border-solid shadow-none', rootMaterial === 'bare' ? 'border-[var(--material-bare-rule)]' : 'border-layer-border'),
  };
  const panelControlled = rightPanelOpen != null;
  const panelOpen = panelControlled ? rightPanelOpen : panelState;
  const togglePanel = () => {
    if (!panelControlled) setPanelState((o) => !o);
    if (onRightPanelToggle) onRightPanelToggle(!panelOpen);
  };

  /* The panel is a peer of the sidebar, not of the page, so it is declared once
     here and rendered by both branches below. */
  const panel = panelNode ? (
    <aside
      className={cx(
        'flex flex-col shrink-0 min-h-0 overflow-hidden bg-ctl-surface',
        edge.panel,
        'transition-[width] ease-ctl duration-[var(--default-transition-duration)]',
        panelOpen ? 'w-panel' : 'w-0 border-l-0 shadow-none'
      )}
      aria-hidden={!panelOpen}
    >
      <div className={cx(
        'flex items-center justify-between gap-2 h-14 shrink-0 px-4 border-0 border-b border-solid',
        rootMaterial === 'spacing' ? 'border-transparent' : rootMaterial === 'bare' ? 'border-[var(--material-bare-rule)]' : 'border-layer-border'
      )}>
        <span className="truncate text-sm font-semibold text-ctl-fg">{rightPanelTitle || 'Details'}</span>
        <button
          type="button"
          onClick={togglePanel}
          aria-label="Hide panel"
          className="shrink-0 grid place-items-center w-8 h-8 -mr-1 rounded-md bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
        >
          <PanelIcon open />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">{panelNode}</div>
    </aside>
  ) : null;

  const panelButton = panelNode && !panelOpen ? (
    <button
      type="button"
      onClick={togglePanel}
      aria-label="Show panel"
      className="shrink-0 grid place-items-center w-8 h-8 rounded-md bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
    >
      <PanelIcon open={false} />
    </button>
  ) : null;

  if (variant === 'top')
    return (
      <SurfaceContext.Provider value={{ geometry: design, material: rootMaterial }}>
      <div
        className={cx('flex flex-col w-full h-full min-h-0 overflow-hidden [background-image:var(--shell-page-bg-image)] [background-size:var(--page-bg-size)] [background-position:var(--page-bg-position)] [background-repeat:var(--page-bg-repeat)] dark:bg-none text-ctl-fg', shellGround, className)}
        style={shellVars}
        data-kf-component="app-shell"
        data-chrome={chrome}
        data-design={design}
        data-material={rootMaterial}
        data-material-requested={material}
      >
        <div style={CHROME_CONTROLS} className={cx('flex items-center gap-6 shrink-0 bg-chrome-surface text-chrome-fg', edge.top, d.head)}>
          {brandNode ? <div className="shrink-0">{brandNode}</div> : null}
          {/* Horizontal nav flattens: a dropdown per top-level item is a Menu's
             job, not a nav bar's, so nested children surface as a second row
             under the active branch instead.

             It scrolls rather than shrinking: a nav wide enough to overflow (a
             real product's fifteen destinations) was being CUT by the bar's
             overflow-hidden, so the last items existed but could not be reached.
             min-w-0 lets it yield space to the topbar slot, overflow-x keeps
             every item reachable, and the scrollbar is hidden because a visible
             one inside a 56px bar reads as a rendering fault. */}
          <nav className="flex items-center gap-2 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TopRows items={nav} active={active} onNavigate={onNavigate} />
          </nav>
          {topbarNode || panelButton ? (
            <div className="flex items-center gap-4 ml-auto shrink-0 justify-end">
              {topbarNode}
              {panelButton}
            </div>
          ) : null}
        </div>
        {/* float gives the content its own card here too, the way sidebar does.
            This branch has no aside, so it never carried d.body — which left `float`
            meaning different things per variant: two detached panes in sidebar,
            and nothing at all here, so the content sat straight on the page ground.
            d.root supplies the gutter that insets the card from the bar and the
            window. Both are '' in classic, so that design is untouched. */}
        <div className={cx('flex flex-1 min-h-0 min-w-0', d.root)}>
          <div className={cx('flex flex-col flex-1 min-w-0 min-h-0', d.body, bodySurface, edge.body)}>
            <main className="flex-1 min-h-0 min-w-0 overflow-y-auto">{content}</main>
          </div>
          {panel}
        </div>
      </div>
      </SurfaceContext.Provider>
    );

  return (
    <SurfaceContext.Provider value={{ geometry: design, material: rootMaterial }}>
    <div
      className={cx('relative flex w-full h-full min-h-0 overflow-hidden [background-image:var(--shell-page-bg-image)] [background-size:var(--page-bg-size)] [background-position:var(--page-bg-position)] [background-repeat:var(--page-bg-repeat)] dark:bg-none text-ctl-fg', shellGround, d.root, className)}
      style={shellVars}
      data-kf-component="app-shell"
      data-chrome={chrome}
      data-design={design}
      data-material={rootMaterial}
      data-material-requested={material}
    >
      <aside
        style={Object.assign({}, CHROME_CONTROLS, sidebarMaterial)}
        className={cx(
          'flex w-[var(--sidebar-width)] flex-col shrink-0 min-h-0 overflow-hidden text-chrome-fg [background-image:var(--material-image)]',
          d.asideBg,
          d.aside,
          sidebarRadius,
          edge.aside
        )}
      >
        <div className="flex flex-col shrink-0 h-full min-h-0">
          {/* SidebarWordmark owns the sidebar brand band's inset and divider. */}
          <div className="shrink-0">{brandNode}</div>

          <nav className={cx('flex flex-col flex-1 min-h-0 overflow-y-auto', d.nav)}>
            <NavRows items={nav} active={active} onNavigate={onNavigate} design={design} />
          </nav>

          {footerNode ? (
            <div className="shrink-0 p-2 border-0 border-t border-solid border-[var(--chrome-rule)]">
              {footerNode}
            </div>
          ) : null}
        </div>
      </aside>

      <div className={cx('flex flex-col flex-1 min-w-0 min-h-0', d.body, bodySurface, edge.body)}>
        {topbarNode || panelButton ? (
          <div className={cx('flex items-center gap-4 shrink-0', d.top, edge.top)}>
            {topbarNode}
            {panelButton}
          </div>
        ) : null}
        {/* One scroll container: the shell holds still, the content moves. */}
        <div className="flex flex-1 min-h-0 min-w-0">
          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto">{content}</main>
          {panel}
        </div>
      </div>
    </div>
    </SurfaceContext.Provider>
  );
}

export { AppShell };
export default AppShell;
