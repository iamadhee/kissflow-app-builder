import { cn as cx } from "./cn.js";
// App identity used in exactly two placements: the sidebar brand band and the top bar.

const VARIANT_CLASSES = {
  sidebar:
    "border-0 border-b border-solid border-[var(--chrome-rule,var(--ctl-border))] px-5 py-4 text-[var(--chrome-fg,var(--ctl-fg))]",
  topbar: "text-[var(--chrome-fg,var(--ctl-fg))]",
};

export function SidebarWordmark({ icon: Icon, name, variant = "sidebar", className = "" }) {
  const placement = variant === "topbar" ? "topbar" : "sidebar";

  return (
    <div
      className={cx(
        "flex min-w-0 items-center gap-3",
        VARIANT_CLASSES[placement],
        className
      )}
      data-sidebar-wordmark-variant={placement}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 [background-image:var(--gradient-primary)] text-sm font-bold text-brand-fg shadow-sm"
        aria-hidden={name ? "true" : undefined}
      >
        {Icon ? <Icon className="size-4" /> : null}
      </span>
      {name ? (
        <div className="min-w-0" data-sidebar-wordmark-label="">
          <div className="break-words font-display text-base font-semibold leading-snug text-current">
            {name}
          </div>
        </div>
      ) : null}
    </div>
  );
}
