import { isValidElement } from "react";
import { NavLink } from "react-router-dom";
import { cn as cx } from "./cn.js";

/* Gap and box geometry live in the state-specific classes. Keeping those utilities
   out of the shared base avoids equal-specificity ordering surprises. */
const NAV_ITEM_BASE =
  "group relative flex min-w-0 items-center rounded-[var(--nav-item-radius,var(--radius))] border-0 text-sm text-left cursor-pointer transition-[color,background-color,border-color,box-shadow,transform,translate,width,padding] duration-[var(--default-transition-duration)] outline-none focus-visible:ring-2 focus-visible:ring-brand-ring";
/* Selected navigation is a filled brand action: the icon, label and trailing value all inherit
   the same contrasting foreground. Contexts may still remap these semantic variables, while the
   standalone component lands on the canonical solid treatment. */
const NAV_ITEM_ACTIVE =
  "bg-[var(--nav-item-active-bg,var(--brand-600))] bg-[image:var(--nav-item-active-image,none)] font-[number:var(--nav-item-active-font-weight,400)] shadow-[var(--nav-item-active-shadow,var(--shadow-none))]";
const NAV_ITEM_IDLE =
  "bg-transparent font-[number:var(--nav-item-idle-font-weight,400)] hover:bg-[var(--nav-item-hover-bg,var(--ctl-raise))]";
const NAV_ITEM_SIDEBAR_IDLE_MOTION = "hover:translate-x-0.5 motion-reduce:translate-x-0";
const NAV_ITEM_ACTIVE_STYLE = { color: "var(--nav-item-active-fg, var(--brand-fg))" };
const NAV_ITEM_IDLE_STYLE = { color: "var(--nav-item-idle-fg, var(--ctl-fg))" };

function NavItemContent({
  icon,
  label,
  active,
  collapsed,
  boxCollapsed,
  trailing,
  badge,
  iconClassName,
  labelClassName,
}) {
  const Icon = !isValidElement(icon) ? icon : null;

  return (
    <>
      {icon ? (
        <span
          data-nav-item-icon=""
          style={active ? { color: "var(--nav-item-active-icon, currentColor)" } : undefined}
          className={cx(
            "shrink-0 grid place-items-center w-4 h-4 -translate-y-0.5 text-current",
            iconClassName,
          )}
        >
          {Icon ? <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" /> : icon}
        </span>
      ) : null}

      {/* Always mounted, hidden by class — never unmounted. Conditional rendering put a
         React reconcile and ~35 fresh DOM nodes on the exact frame that STARTS the
         width transition: measured 2.9ms of style+layout against a 0.62ms baseline,
         4.7x a normal frame. ease-ctl schedules 30% of the 216px travel into that same
         first frame, so the heaviest frame was also the one asked to move furthest —
         one late frame skipped ~66px and read as a jump rather than a stutter. An
         identical curve in a mock with a constant node count is smooth.

         `hidden` as a CLASS, not the attribute: Tailwind's preflight `[hidden]` rule
         loses to the `flex` utility at equal specificity, so the attribute form would
         silently fail to hide anything. Dropping `flex` in the collapsed branch also
         keeps the row's `gap-3` from reserving a gutter beside a zero-width label,
         which would shift the rail icon off its centre line. */}
      <span
        data-nav-item-label=""
        className={cx(
          /* Three states, not two. `collapsed` is the settled composition; `boxCollapsed`
             is the target, which on a close flips at once. Between them the label must
             stop occupying width — otherwise the icon cannot centre in the 40px pill —
             while staying painted so its fade still reads. w-0 does both. */
          collapsed
            ? "hidden"
            : boxCollapsed
              ? "w-0 overflow-hidden"
              : "flex min-w-0 flex-1 items-center",
          labelClassName,
        )}
      >
        <span
          className="min-w-0 flex-1 truncate leading-4"
          title={typeof label === "string" ? label : undefined}
        >
          {label}
        </span>
        {trailing}
      </span>

      {collapsed ? badge : null}
    </>
  );
}

/**
 * NavItem supports two ownership models:
 * - With `to`, React Router owns active state for ordinary sidebar links.
 * - With `active`, a shell owns navigation while NavItem still owns the shared
 *   geometry, state treatment, icon, label and badge anatomy.
 *
 * The controlled form is what AppShell uses for nested branches and preview
 * destinations that are not necessarily URL routes.
 */
export function NavItem({
  to,
  end,
  icon,
  label,
  onNavigate,
  active,
  collapsed = false,
  /* Optional compact geometry. Defaults to the rendered composition state. */
  boxCollapsed = collapsed,
  trailing,
  badge,
  placement = "sidebar",
  className,
  activeClassName,
  idleClassName,
  iconClassName,
  labelClassName,
  onClick,
  style,
  ...props
}) {
  const controlled = typeof active === "boolean";
  const topbar = placement === "topbar";

  if (controlled) {
    return (
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={onClick}
        style={active
          ? { ...(style || {}), ...NAV_ITEM_ACTIVE_STYLE }
          : { ...(style || {}), ...NAV_ITEM_IDLE_STYLE }}
        className={cx(
          NAV_ITEM_BASE,
          boxCollapsed
            ? "h-10 w-10 justify-center gap-0 px-0 py-0"
            : topbar
              ? "h-9 w-auto gap-2 px-4 py-0"
              : "w-full gap-3 px-4 py-3",
          className,
          active
            ? (activeClassName || NAV_ITEM_ACTIVE)
            : cx(idleClassName || NAV_ITEM_IDLE, !topbar && !boxCollapsed && NAV_ITEM_SIDEBAR_IDLE_MOTION),
        )}
        {...props}
      >
        <NavItemContent
          icon={icon}
          label={label}
          active={active}
          collapsed={collapsed}
          boxCollapsed={boxCollapsed}
          trailing={trailing}
          badge={badge}
          iconClassName={iconClassName}
          labelClassName={labelClassName}
        />
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={(event) => {
        onClick?.(event);
        onNavigate?.(event);
      }}
      style={(state) => ({
        ...(typeof style === "function" ? style(state) : style || {}),
        ...(state.isActive ? NAV_ITEM_ACTIVE_STYLE : NAV_ITEM_IDLE_STYLE),
      })}
      className={({ isActive }) =>
        cx(
          NAV_ITEM_BASE,
          "w-full gap-3 px-4 py-3",
          isActive
            ? NAV_ITEM_ACTIVE
            : cx(NAV_ITEM_IDLE, !topbar && !boxCollapsed && NAV_ITEM_SIDEBAR_IDLE_MOTION),
          className,
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <NavItemContent
          icon={icon}
          label={label}
          active={isActive}
          trailing={trailing}
          iconClassName={iconClassName}
          labelClassName={labelClassName}
        />
      )}
    </NavLink>
  );
}
