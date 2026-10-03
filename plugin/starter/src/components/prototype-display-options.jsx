import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./kit/ThemeProvider.jsx";
import {
  PROTOTYPE_BRAND_CHOICES,
  PROTOTYPE_CHROME_CHOICES,
  PROTOTYPE_DESIGN_CHOICES,
  PROTOTYPE_FONT_PAIR_CHOICES,
  PROTOTYPE_FONT_SCALE_RANGE,
  PROTOTYPE_MATERIAL_CHOICES,
  PROTOTYPE_RADIUS_CHOICES,
  PROTOTYPE_SHADOW_CHOICES,
  PROTOTYPE_SHELL_CHOICES,
  PROTOTYPE_SPACING_RANGE,
  PROTOTYPE_THEME_CHOICES,
  normalizePrototypeBrand,
  normalizePrototypeFontScale,
  normalizePrototypeSpacing,
  prototypeColorInputValue,
  prototypeSpacingRem,
  syncPrototypeFontPairPreviewStylesheet,
} from "./prototype-display-options.js";

const cx = (...parts) => parts.filter(Boolean).join(" ");
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path d="M12 3v2.25M12 18.75V21M3 12h2.25M18.75 12H21M5.64 5.64l1.6 1.6M16.76 16.76l1.6 1.6M18.36 5.64l-1.6 1.6M7.24 16.76l-1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DockIcon({ position }) {
  const edge = position === "left"
    ? <path d="M3 3h3.5v10H3z" fill="currentColor" />
    : position === "bottom"
      ? <path d="M3 9.5h10V13H3z" fill="currentColor" />
      : <path d="M9.5 3H13v10H9.5z" fill="currentColor" />;
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      {edge}
    </svg>
  );
}

function DockButton({ position, active, onClick }) {
  const label = `Dock display options to ${position}`;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "grid size-8 place-items-center rounded-md border border-solid cursor-pointer outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-brand-ring",
        active
          ? "border-brand-600 bg-field-selected text-brand-700 shadow-sm"
          : "border-transparent bg-transparent text-ctl-fg-muted hover:border-field-border hover:bg-ctl-raise hover:text-ctl-fg",
      )}
    >
      <DockIcon position={position} />
    </button>
  );
}

function ResizeHandle({ dock, onPointerDown, onKeyDown }) {
  const bottom = dock === "bottom";
  const label = bottom ? "Resize display options height" : "Resize display options width";
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={bottom ? "horizontal" : "vertical"}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cx(
        "group absolute z-20 touch-none outline-none",
        bottom
          ? "inset-x-0 top-0 h-3 -translate-y-1/2 cursor-row-resize"
          : dock === "left"
            ? "inset-y-0 right-0 w-3 translate-x-1/2 cursor-col-resize"
            : "inset-y-0 left-0 w-3 -translate-x-1/2 cursor-col-resize",
      )}
    >
      <span className={cx(
        "absolute rounded-full bg-layer-border-strong transition-[background-color,transform] group-hover:bg-brand-600 group-focus-visible:bg-brand-600",
        bottom
          ? "left-1/2 top-1/2 h-1 w-14 -translate-x-1/2 -translate-y-1/2 group-hover:scale-y-125 group-focus-visible:scale-y-125"
          : "left-1/2 top-1/2 h-14 w-1 -translate-x-1/2 -translate-y-1/2 group-hover:scale-x-125 group-focus-visible:scale-x-125",
      )} />
    </div>
  );
}

function VariableHeading({ title, variable, value }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <h3 className="m-0 font-display text-sm font-semibold text-ctl-fg">{title}</h3>
      <span className="flex items-center gap-1.5 text-[11px] text-ctl-fg-muted">
        <code className="rounded bg-ctl-track px-1.5 py-0.5">{variable}</code>
        <code>{value}</code>
      </span>
    </div>
  );
}

function OptionGroup({ id, title, children }) {
  return (
    <div role="group" aria-labelledby={id} className="grid gap-4">
      <h3
        id={id}
          className="m-0 font-display font-chrome-label text-[11px] font-medium uppercase tracking-[0.16em] text-ctl-fg-subtle"
      >
        {title}
      </h3>
      <div className="grid gap-7">{children}</div>
    </div>
  );
}

function Choice({ selected, label, onChange, name, value, children, className }) {
  return (
    <label
      className={cx(
        "group grid min-w-0 gap-2 rounded-xl text-center text-xs font-medium text-ctl-fg cursor-pointer",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className={cx(
        "grid min-h-20 place-items-center overflow-hidden rounded-xl border border-solid bg-ctl-offset p-2 transition-[border-color,box-shadow,background-color] outline-none",
        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-layer-surface",
        selected ? "border-brand-600 bg-field-selected shadow-sm" : "border-layer-border group-hover:border-field-border-hover",
      )}>
        {children}
      </span>
      <span>{label}</span>
    </label>
  );
}

function ShellThumbnail({ variant }) {
  return (
    <span className="grid h-14 w-full overflow-hidden rounded-md border border-solid border-ctl-border bg-ctl-surface">
      {variant === "top" ? (
        <span className="grid grid-rows-[14px_1fr]">
          <span className="border-0 border-b border-solid border-ctl-border bg-ctl-raise" />
          <span className="m-2 rounded-sm bg-ctl-track" />
        </span>
      ) : (
        <span className="grid grid-cols-[32px_1fr]">
          <span className="grid content-start gap-1 border-0 border-r border-solid border-ctl-border bg-ctl-raise p-1.5">
            <span className="size-2 rounded-full bg-brand-600" />
            <span className="mt-1 h-1 rounded bg-ctl-border-strong" />
            <span className="h-1 rounded bg-ctl-border-strong" />
            <span className="h-1 rounded bg-ctl-border-strong" />
          </span>
          <span className="m-2 rounded-sm bg-ctl-track" />
        </span>
      )}
    </span>
  );
}

function ChromeThumbnail({ chrome }) {
  const accent = chrome === "accent";
  return (
    <span className="grid h-14 w-full grid-cols-[28px_1fr] overflow-hidden rounded-md border border-solid border-ctl-border bg-ctl-surface">
      <span className={cx(
        "grid content-start gap-1 border-0 border-r border-solid p-1.5",
        accent
          ? "border-brand-600 bg-brand-600"
          : "border-ctl-border bg-ctl-surface",
      )}>
        <span className={cx("size-2 rounded-full", accent ? "bg-brand-fg" : "bg-brand-600")} />
        <span className={cx("mt-1 h-1 rounded", accent ? "bg-brand-fg/70" : "bg-ctl-border-strong")} />
        <span className={cx("h-1 rounded", accent ? "bg-brand-fg/70" : "bg-ctl-border-strong")} />
      </span>
      <span className="m-2 rounded-sm bg-ctl-track" />
    </span>
  );
}

function DesignThumbnail({ design }) {
  const floating = design === "float";
  return (
    <span className={cx(
      "grid h-14 w-full grid-cols-[28px_1fr] overflow-hidden rounded-md border border-solid border-ctl-border",
      floating ? "gap-1.5 bg-ctl-offset p-1.5" : "bg-ctl-surface",
    )}>
      <span className={cx(
        "bg-ctl-raise",
        floating
          ? "rounded-sm border border-solid border-layer-border shadow-sm"
          : "border-0 border-r border-solid border-ctl-border",
      )} />
      <span className={cx(
        "bg-ctl-track",
        floating ? "rounded-sm border border-solid border-layer-border" : "m-2 rounded-sm",
      )} />
    </span>
  );
}

function MaterialThumbnail({ material }) {
  const spacing = material === "spacing";
  return (
    <span className="grid h-14 w-full place-items-center rounded-md border border-solid border-ctl-border bg-ctl-offset p-2">
      <span className={cx(
        "grid h-full w-[84%] content-center rounded-md border border-solid px-2",
        spacing ? "gap-2" : "gap-1",
        material === "panel"
          ? "border-transparent bg-layer-surface shadow-sm"
          : material === "flat"
            ? "border-transparent bg-ctl-raise shadow-none"
            : spacing
              ? "border-transparent bg-[var(--material-spacing-surface)] shadow-none"
              : "border-transparent bg-transparent shadow-none",
      )}>
        <span className={cx("h-1 w-2/3 rounded", spacing ? "bg-ctl-fg-muted" : "bg-ctl-border-strong")} />
        <span className={cx("h-1 w-full rounded", spacing ? "bg-ctl-fg-muted" : "bg-ctl-track")} />
        <span className={cx("h-1 w-4/5 rounded", spacing ? "bg-ctl-fg-muted" : "bg-ctl-track")} />
      </span>
    </span>
  );
}

function RadiusThumbnail({ radius }) {
  return (
    <span
      className="block h-12 w-full border border-solid border-brand-600 bg-field-selected"
      style={{ borderRadius: radius }}
    />
  );
}

function ShadowThumbnail({ strength }) {
  return (
    <span
      className="block h-11 w-[72%] rounded-lg border border-solid border-layer-border bg-layer-surface shadow-sm"
      style={{ '--shadow-strength': String(strength ?? 1) }}
    />
  );
}

export function DisplayOptionsTrigger({ open, onClick }) {
  return (
    <nav
      aria-label="Prototype tools"
      className={cx(
        "fixed right-0 top-1/2 -translate-y-1/2",
        open && "invisible pointer-events-none",
      )}
      style={{ zIndex: 2147482997 }}
    >
      <button
        type="button"
        aria-label="Open display options"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={onClick}
        className="group relative grid size-12 place-items-center rounded-l-xl border border-r-0 border-solid border-brand-700 bg-brand-600 text-brand-fg shadow-md cursor-pointer transition-[background-color,box-shadow,transform] hover:bg-brand-700 hover:shadow-lg active:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-layer-surface"
      >
        <SettingsIcon />
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg border border-solid border-layer-border bg-layer-surface px-3 py-2 text-sm font-medium text-ctl-fg opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Display options
        </span>
      </button>
    </nav>
  );
}

export function DisplayOptionsPanel({ open, options, resolvedTokens, onChange, onClose, onReset }) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const [panelSize, setPanelSize] = useState({ side: null, bottom: null });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const doc = panel?.ownerDocument || document;
    const view = doc.defaultView || window;
    restoreFocusRef.current = doc.activeElement;

    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onCloseRef.current?.();
      }
    };

    // This is a non-modal inspector: the prototype stays bright, scrollable and
    // interactive behind it. Escape still dismisses the inspector before any
    // document-level RecordSheet or Drawer handler sees the same keystroke.
    view.addEventListener("keydown", onKeyDown, true);
    return () => {
      view.removeEventListener("keydown", onKeyDown, true);
      const previous = restoreFocusRef.current;
      if (previous?.isConnected && typeof previous.focus === "function") {
        previous.focus({ preventScroll: true });
      }
      restoreFocusRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    const doc = panelRef.current?.ownerDocument || document;
    syncPrototypeFontPairPreviewStylesheet(doc, open);
    return () => syncPrototypeFontPairPreviewStylesheet(doc, false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
      return undefined;
    }

    const doc = panelRef.current?.ownerDocument || document;
    const shell = doc.querySelector(".kf-shell-host");
    if (!shell) return undefined;

    if (panelSize.side == null) shell.style.removeProperty("--kf-display-options-side-size");
    else shell.style.setProperty("--kf-display-options-side-size", `${panelSize.side}px`);
    if (panelSize.bottom == null) shell.style.removeProperty("--kf-display-options-bottom-size");
    else shell.style.setProperty("--kf-display-options-bottom-size", `${panelSize.bottom}px`);

    return () => {
      shell.style.removeProperty("--kf-display-options-side-size");
      shell.style.removeProperty("--kf-display-options-bottom-size");
    };
  }, [open, panelSize]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  if (!open) return null;
  const resolvedRadius = options.radius || resolvedTokens.radius || "16px";
  const resolvedSpacing = options.spacing || resolvedTokens.spacing || "0.25rem";
  const spacingSliderValue = prototypeSpacingRem(resolvedSpacing) ?? 0.25;
  const spacingLabel = `${spacingSliderValue}rem`;
  const resolvedFontScale = options.fontScale || resolvedTokens.fontScale || "1";
  const parsedFontScale = Number.parseFloat(resolvedFontScale);
  const fontScaleSliderValue = Math.min(
    PROTOTYPE_FONT_SCALE_RANGE.max,
    Math.max(
      PROTOTYPE_FONT_SCALE_RANGE.min,
      Number((Number.isFinite(parsedFontScale) ? parsedFontScale : 1).toFixed(2)),
    ),
  );
  const activeTheme = PROTOTYPE_THEME_CHOICES.find((choice) => choice.value === options.family)
    || PROTOTYPE_THEME_CHOICES[0];
  const activeFontPair = PROTOTYPE_FONT_PAIR_CHOICES.find((choice) => choice.value === options.fontPair) || null;
  const fontPairChoices = [
    { value: "theme", label: "Theme fonts" },
    ...PROTOTYPE_FONT_PAIR_CHOICES,
  ];
  const resolvedBrand = options.brand || resolvedTokens.brand || "oklch(0.5803 0.2303 260.38)";
  const resolvedShadow = options.shadowStrength ?? resolvedTokens.shadowStrength ?? "0.8";
  const colorInput = prototypeColorInputValue(resolvedBrand);
  const dock = ["left", "bottom", "right"].includes(options.dock) ? options.dock : "right";
  const bottomDock = dock === "bottom";
  const resizePanel = (rawSize, activeDock = dock) => {
    const view = panelRef.current?.ownerDocument?.defaultView || window;
    const viewportSize = activeDock === "bottom" ? view.innerHeight : view.innerWidth;
    const minimum = activeDock === "bottom" ? 240 : 320;
    const remainingViewport = activeDock === "bottom" ? 120 : 280;
    const maximum = Math.max(minimum, viewportSize - remainingViewport);
    const size = Math.round(Math.min(maximum, Math.max(minimum, rawSize)));
    setPanelSize((current) => ({
      ...current,
      [activeDock === "bottom" ? "bottom" : "side"]: size,
    }));
  };
  const beginResize = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragCleanupRef.current?.();

    const doc = event.currentTarget.ownerDocument;
    const view = doc.defaultView || window;
    const shell = doc.querySelector(".kf-shell-host");
    const previousCursor = doc.body.style.cursor;
    const previousUserSelect = doc.body.style.userSelect;
    shell?.setAttribute("data-display-options-resizing", "");
    doc.body.style.cursor = bottomDock ? "row-resize" : "col-resize";
    doc.body.style.userSelect = "none";

    const onPointerMove = (moveEvent) => {
      const rawSize = bottomDock
        ? view.innerHeight - moveEvent.clientY
        : dock === "left"
          ? moveEvent.clientX
          : view.innerWidth - moveEvent.clientX;
      resizePanel(rawSize, dock);
    };
    const cleanup = () => {
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", cleanup);
      view.removeEventListener("pointercancel", cleanup);
      doc.body.style.cursor = previousCursor;
      doc.body.style.userSelect = previousUserSelect;
      shell?.removeAttribute("data-display-options-resizing");
      dragCleanupRef.current = null;
    };
    dragCleanupRef.current = cleanup;
    view.addEventListener("pointermove", onPointerMove);
    view.addEventListener("pointerup", cleanup);
    view.addEventListener("pointercancel", cleanup);
  };
  const resizeWithKeyboard = (event) => {
    const decreaseKey = bottomDock ? "ArrowDown" : dock === "left" ? "ArrowLeft" : "ArrowRight";
    const increaseKey = bottomDock ? "ArrowUp" : dock === "left" ? "ArrowRight" : "ArrowLeft";
    if (event.key !== decreaseKey && event.key !== increaseKey) return;
    event.preventDefault();
    const measuredSize = bottomDock
      ? panelRef.current?.getBoundingClientRect().height
      : panelRef.current?.getBoundingClientRect().width;
    resizePanel((measuredSize || (bottomDock ? 420 : 400)) + (event.key === increaseKey ? 16 : -16), dock);
  };

  /* Portalled to <body>: rendered in place, any ancestor with a transform/filter/contain becomes
     the fixed-position containing block, and the panel then scrolls away with the page instead of
     staying pinned to the viewport. React context (theme, options) flows through the portal. */
  return createPortal(
    <aside
      ref={panelRef}
      role="dialog"
      aria-labelledby="kf-display-options-title"
      aria-describedby="kf-display-options-description"
      tabIndex={-1}
      data-kf-display-options=""
      data-dock={dock}
      className={cx(
        "fixed flex flex-col overflow-clip border border-solid border-layer-border bg-layer-surface text-ctl-fg shadow-lg outline-none",
        bottomDock
          ? "inset-x-0 bottom-0 h-[min(420px,50dvh)] max-h-[calc(100dvh-12px)] rounded-t-2xl"
          : dock === "left"
            ? "inset-y-0 left-0 w-[400px] max-w-[calc(100vw-12px)] rounded-r-2xl"
            : "inset-y-0 right-0 w-[400px] max-w-[calc(100vw-12px)] rounded-l-2xl",
      )}
      style={{
        zIndex: 2147482999,
        ...(bottomDock && panelSize.bottom != null ? { height: `${panelSize.bottom}px` } : {}),
        ...(!bottomDock && panelSize.side != null ? { width: `${panelSize.side}px` } : {}),
      }}
    >
        <ResizeHandle dock={dock} onPointerDown={beginResize} onKeyDown={resizeWithKeyboard} />
        <div className="flex shrink-0 items-start justify-between gap-4 border-0 border-b border-solid border-layer-border px-5 py-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ctl-fg-muted">Prototype tools</span>
            <h2 id="kf-display-options-title" className="m-0 mt-1 font-display text-lg font-semibold leading-tight">Display options</h2>
            <p id="kf-display-options-description" className="m-0 mt-1 text-sm text-ctl-fg-muted">Adjust how this prototype looks and behaves.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div role="group" aria-label="Dock position" className="flex items-center rounded-lg border border-solid border-field-border bg-ctl-offset p-0.5">
              {["left", "bottom", "right"].map((position) => (
                <DockButton
                  key={position}
                  position={position}
                  active={dock === position}
                  onClick={() => onChange("dock", position)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Close display options"
              onClick={onClose}
              className="ml-1 grid size-9 shrink-0 place-items-center rounded-lg border border-solid border-field-border bg-transparent text-ctl-fg-muted cursor-pointer hover:bg-ctl-raise hover:text-ctl-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* overscroll-contain: when the panel's own scroll hits an edge, the wheel must not chain
            into the page behind it — that read as "the panel scrolls the page, not itself". */}
        <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-7 overflow-y-auto overscroll-contain px-5 py-5">
          <OptionGroup id="kf-display-foundation" title="Foundation">
            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 font-display text-sm font-semibold text-ctl-fg">Theme family</h3>
                <span className="text-[10px] font-medium text-ctl-fg-muted" title="Previous or next theme">
                  <kbd className="font-mono">Alt + [</kbd>
                  <span aria-hidden="true"> / </span>
                  <kbd className="font-mono">Alt + ]</kbd>
                </span>
              </div>
              <div role="radiogroup" aria-label="Theme family" className="grid grid-cols-2 gap-2">
                {PROTOTYPE_THEME_CHOICES.map((choice) => {
                  const selected = activeTheme.value === choice.value;
                  return (
                    <label key={choice.value} className="min-w-0 cursor-pointer">
                      <input
                        type="radio"
                        name="kf-display-theme-family"
                        value={choice.value}
                        checked={selected}
                        onChange={() => onChange("family", choice.value)}
                        className="peer sr-only"
                      />
                      <span className={cx(
                        "flex min-h-10 items-center justify-center rounded-lg border border-solid px-3 py-2 text-center text-xs font-medium text-ctl-fg outline-none transition-[border-color,background-color,box-shadow]",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-layer-surface",
                        selected
                          ? "border-brand-600 bg-field-selected shadow-sm"
                          : "border-field-border bg-field-surface hover:border-field-border-hover hover:bg-ctl-raise",
                      )}>
                        {choice.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3">
              <h3 className="m-0 font-display text-sm font-medium text-ctl-fg">Appearance</h3>
              <ThemeToggle labels className="w-full justify-between" />
            </section>
          </OptionGroup>

          <OptionGroup id="kf-display-shell-composition" title="Shell composition">
            <section className="grid gap-3">
              <VariableHeading title="Navigation" variable="variant" value={options.variant} />
              <div role="radiogroup" aria-label="Navigation" className="grid grid-cols-3 gap-3">
                {PROTOTYPE_SHELL_CHOICES.map((choice) => (
                  <Choice
                    key={choice.value}
                    name="kf-display-shell"
                    value={choice.value}
                    selected={options.variant === choice.value}
                    label={choice.label}
                    onChange={() => onChange("variant", choice.value)}
                  >
                    <ShellThumbnail variant={choice.value} />
                  </Choice>
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Geometry" variable="design" value={options.design} />
              <div role="radiogroup" aria-label="Geometry" className="grid grid-cols-2 gap-3">
                {PROTOTYPE_DESIGN_CHOICES.map((choice) => (
                  <Choice
                    key={choice.value}
                    name="kf-display-design"
                    value={choice.value}
                    selected={options.design === choice.value}
                    label={choice.label}
                    onChange={() => onChange("design", choice.value)}
                  >
                    <DesignThumbnail design={choice.value} />
                  </Choice>
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Chrome" variable="chrome" value={options.chrome} />
              <div role="radiogroup" aria-label="Chrome" className="grid grid-cols-3 gap-3">
                {PROTOTYPE_CHROME_CHOICES.map((choice) => (
                  <Choice
                    key={choice.value}
                    name="kf-display-chrome"
                    value={choice.value}
                    selected={options.chrome === choice.value}
                    label={choice.label}
                    onChange={() => onChange("chrome", choice.value)}
                  >
                    <ChromeThumbnail chrome={choice.value} />
                  </Choice>
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <VariableHeading
                title="Material"
                variable="shellMaterial"
                value={options.material}
              />
              <div role="radiogroup" aria-label="Material" className="grid grid-cols-4 gap-3">
                {PROTOTYPE_MATERIAL_CHOICES.map((choice) => (
                  <Choice
                    key={choice.value}
                    name="kf-display-material"
                    value={choice.value}
                    selected={options.material === choice.value}
                    label={choice.label}
                    onChange={() => onChange("material", choice.value)}
                  >
                    <MaterialThumbnail material={choice.value} />
                  </Choice>
                ))}
              </div>
            </section>
          </OptionGroup>

          <OptionGroup id="kf-display-theme-refinements" title="Theme refinements">
            <section className="grid gap-3">
              <VariableHeading title="Brand color" variable="--brand-600" value={resolvedBrand} />
              <div role="radiogroup" aria-label="Brand color" className="grid grid-cols-7 gap-2">
                {PROTOTYPE_BRAND_CHOICES.map((choice) => {
                  const color = choice.value || resolvedTokens.brand || "oklch(0.5803 0.2303 260.38)";
                  return (
                    <label
                      key={choice.label}
                      title={choice.label}
                      className={cx(
                        "group relative grid aspect-square place-items-center rounded-full cursor-pointer",
                      )}
                    >
                      <input
                        type="radio"
                        name="kf-display-brand"
                        value={choice.value ?? "theme"}
                        checked={options.brand === choice.value}
                        onChange={() => onChange("brand", choice.value)}
                        aria-label={choice.label}
                        className="peer sr-only"
                      />
                      <span className={cx(
                        "grid size-full place-items-center rounded-full border border-solid bg-transparent p-1 outline-none",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-layer-surface",
                        options.brand === choice.value ? "border-brand-600 ring-2 ring-brand-ring" : "border-layer-border hover:border-field-border-hover",
                      )}>
                        <span className="size-full rounded-full border border-solid border-black/10" style={{ background: color }} />
                      </span>
                    </label>
                  );
                })}
              </div>
              <label className="flex items-center justify-between gap-4 rounded-xl bg-ctl-raise px-3.5 py-3 text-sm">
                <span>
                  <strong className="block font-medium text-ctl-fg">Custom brand color</strong>
                  <span className="text-xs text-ctl-fg-muted">Pick any color; foreground contrast adjusts automatically.</span>
                </span>
                <input
                  type="color"
                  aria-label="Custom brand color"
                  value={colorInput}
                  onChange={(event) => onChange("brand", normalizePrototypeBrand(event.target.value))}
                  className="size-9 shrink-0 rounded-lg border border-solid border-field-border bg-field-surface p-1 cursor-pointer"
                />
              </label>
            </section>

            <section className="grid gap-3">
              <h3 className="m-0 font-display text-sm font-semibold text-ctl-fg">Font pair</h3>
              <div role="radiogroup" aria-label="Font pair" className="grid grid-cols-2 gap-2">
                {fontPairChoices.map((choice) => {
                  const selected = (activeFontPair?.value || "theme") === choice.value;
                  return (
                    <label key={choice.value} className="min-w-0 cursor-pointer">
                      <input
                        type="radio"
                        name="kf-display-font-pair"
                        value={choice.value}
                        checked={selected}
                        aria-label={choice.label}
                        onChange={() => onChange("fontPair", choice.value === "theme" ? null : choice.value)}
                        className="peer sr-only"
                      />
                      <span className={cx(
                        "flex min-h-10 items-center justify-center rounded-lg border border-solid px-3 py-2 text-center text-xs font-medium text-ctl-fg outline-none transition-[border-color,background-color,box-shadow]",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-layer-surface",
                        selected
                          ? "border-brand-600 bg-field-selected shadow-sm"
                          : "border-field-border bg-field-surface hover:border-field-border-hover hover:bg-ctl-raise",
                      )}>
                        <span aria-hidden="true" className="flex flex-wrap items-baseline justify-center gap-x-1">
                          {choice.value === "theme" ? (
                            <span data-font-role="theme" style={{ fontFamily: "var(--font-display)" }}>
                              Theme fonts
                            </span>
                          ) : (
                            <>
                              <span data-font-role="display" style={{ fontFamily: choice.displayStack }}>
                                {choice.displayFont}
                              </span>
                              <span>+</span>
                              <span data-font-role="body" style={{ fontFamily: choice.bodyStack }}>
                                {choice.bodyFont}
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Font scale" variable="--font-scale" value={resolvedFontScale} />
              <label className="grid gap-3 rounded-xl border border-solid border-layer-border bg-ctl-offset px-3.5 py-3">
                <span className="sr-only">Font scale</span>
                <input
                  type="range"
                  min={PROTOTYPE_FONT_SCALE_RANGE.min}
                  max={PROTOTYPE_FONT_SCALE_RANGE.max}
                  step={PROTOTYPE_FONT_SCALE_RANGE.step}
                  value={fontScaleSliderValue}
                  aria-label="Font scale"
                  aria-valuetext={`${Math.round(fontScaleSliderValue * 100)}% font scale`}
                  onChange={(event) => {
                    const fontScale = normalizePrototypeFontScale(event.target.value);
                    if (fontScale) onChange("fontScale", fontScale);
                  }}
                  className="w-full cursor-pointer accent-brand-600"
                />
                <span className="flex justify-between text-[10px] font-medium text-ctl-fg-muted">
                  <span>Smaller {Math.round(PROTOTYPE_FONT_SCALE_RANGE.min * 100)}%</span>
                  <span>Larger {Math.round(PROTOTYPE_FONT_SCALE_RANGE.max * 100)}%</span>
                </span>
              </label>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Spacing" variable="--spacing" value={spacingLabel} />
              <label className="grid gap-3 rounded-xl border border-solid border-layer-border bg-ctl-offset px-3.5 py-3">
                <span className="sr-only">Spacing</span>
                <input
                  type="range"
                  min={PROTOTYPE_SPACING_RANGE.min}
                  max={PROTOTYPE_SPACING_RANGE.max}
                  step={PROTOTYPE_SPACING_RANGE.step}
                  value={spacingSliderValue}
                  aria-label="Spacing"
                  aria-valuetext={`${spacingSliderValue}rem spacing`}
                  onChange={(event) => {
                    const spacing = normalizePrototypeSpacing(`${event.target.value}rem`);
                    if (spacing) onChange("spacing", spacing);
                  }}
                  className="w-full cursor-pointer accent-brand-600"
                />
                <span className="flex justify-between text-[10px] font-medium text-ctl-fg-muted">
                  <span>{PROTOTYPE_SPACING_RANGE.min}rem</span>
                  <span>{PROTOTYPE_SPACING_RANGE.max}rem</span>
                </span>
              </label>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Corner radius" variable="--radius" value={resolvedRadius} />
              <div role="radiogroup" aria-label="Corner radius" className="grid grid-cols-3 gap-3">
                {PROTOTYPE_RADIUS_CHOICES.map((choice) => (
                  <Choice
                    key={choice.label}
                    name="kf-display-radius"
                    value={choice.value ?? "theme"}
                    selected={options.radius === choice.value}
                    label={choice.label}
                    onChange={() => onChange("radius", choice.value)}
                  >
                    <RadiusThumbnail radius={choice.value || resolvedTokens.radius || "16px"} />
                  </Choice>
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <VariableHeading title="Shadow strength" variable="--shadow-strength" value={resolvedShadow} />
              <div role="radiogroup" aria-label="Shadow strength" className="grid grid-cols-3 gap-3">
                {PROTOTYPE_SHADOW_CHOICES.map((choice) => (
                  <Choice
                    key={choice.label}
                    name="kf-display-shadow"
                    value={choice.value ?? "theme"}
                    selected={options.shadowStrength === choice.value}
                    label={choice.label}
                    onChange={() => onChange("shadowStrength", choice.value)}
                  >
                    <ShadowThumbnail strength={choice.value ?? resolvedTokens.shadowStrength} />
                  </Choice>
                ))}
              </div>
            </section>
          </OptionGroup>
        </div>

        <div className="shrink-0 border-0 border-t border-solid border-layer-border bg-layer-surface px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="h-10 w-full rounded-lg border border-solid border-field-border bg-transparent text-sm font-medium text-ctl-fg cursor-pointer hover:bg-ctl-raise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
          >
            Reset to prototype defaults
          </button>
        </div>
    </aside>,
    document.body
  );
}
