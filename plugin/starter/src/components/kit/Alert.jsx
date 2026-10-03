import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Alert — an inline, persistent message. Toast's opposite number.
 *
 * A toast is transient and lives at the edge of the screen; an alert stays in
 * the flow, next to what it is about, until the condition clears. If a message
 * needs to survive a page change, it is an Alert.
 *
 * Tones are the same six ramps Badge reads, so a "warning" alert and a warning
 * badge in the same view agree.
 *
 * <Alert tone="warning" title="SLA at risk">Two claims breach in an hour.</Alert>
 */

const TONES = {
  neutral: { soft: 'var(--ctl-track)', ink: 'var(--ctl-fg)', base: 'var(--ctl-fg-muted)', solid: 'var(--ctl-fg)', fg: 'var(--ctl-surface)', edge: 'var(--field-border)' },
  accent: { soft: 'var(--brand-100)', ink: 'var(--brand-text)', base: 'var(--brand-600)', solid: 'var(--brand-600)', fg: 'var(--brand-fg)', edge: 'var(--brand-600)' },
  success: { soft: 'var(--success-100)', ink: 'var(--success-text)', base: 'var(--success-600)', solid: 'var(--success-600)', fg: 'var(--success-fg)', edge: 'var(--success-600)' },
  warning: { soft: 'var(--warning-100)', ink: 'var(--warning-text)', base: 'var(--warning-700)', solid: 'var(--warning-700)', fg: 'var(--warning-fg)', edge: 'var(--warning-600)' },
  info: { soft: 'var(--info-100)', ink: 'var(--info-text)', base: 'var(--info-600)', solid: 'var(--info-600)', fg: 'var(--info-fg)', edge: 'var(--info-600)' },
  danger: { soft: 'var(--danger-100)', ink: 'var(--danger-text)', base: 'var(--danger-600)', solid: 'var(--danger-600)', fg: 'var(--danger-fg)', edge: 'var(--danger-600)' },
};

const GLYPHS = {
  info: 'M8 7.25v4.25M8 4.75h.01',
  warning: 'M8 6v3.5M8 11.75h.01',
  danger: 'M8 6v3.5M8 11.75h.01',
  success: 'M5 8.25 7 10.5l4-5',
};

function Mark({ tone }) {
  const path = GLYPHS[tone] || GLYPHS.info;
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      style={{ width: 'var(--alert-icon-size, 1rem)', height: 'var(--alert-icon-size, 1rem)' }}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Alert({
  tone = 'info',
  variant = 'soft',
  layoutVariant = 'theme',
  title,
  children,
  action,
  icon = true,
  onDismiss,
  className,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  const fallbackSurface = variant === 'outline' ? 'var(--material-surface)' : t.soft;
  const fallbackBorder = variant === 'outline' ? t.edge : 'transparent';
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(
        'grid w-full min-w-0 overflow-hidden border-solid',
        className
      )}
      data-tone={tone}
      data-kf-component="alert"
      data-alert-variant={layoutVariant}
      data-alert-treatment={variant}
      data-has-icon={icon ? 'true' : 'false'}
      style={{
        '--alert-tone-bg': t.soft,
        '--alert-tone-text': t.ink,
        '--alert-tone-base': t.base,
        '--alert-tone-solid': t.solid,
        '--alert-tone-fg': t.fg,
        '--alert-tone-edge': t.edge,
        ...(icon ? {} : {
          '--alert-grid-columns': 'minmax(0, 1fr) auto',
          '--alert-grid-areas': '"content dismiss"',
        }),
        gridTemplateColumns: 'var(--alert-grid-columns, auto minmax(0, 1fr) auto)',
        gridTemplateAreas: 'var(--alert-grid-areas, "icon content dismiss")',
        alignItems: 'var(--alert-grid-align, start)',
        gap: 'var(--alert-gap, 0.75rem)',
        padding: 'var(--alert-padding, 1rem 1.25rem)',
        minHeight: 'var(--alert-min-height, 0px)',
        backgroundColor: `var(--alert-surface, ${fallbackSurface})`,
        backgroundImage: 'var(--alert-image, none)',
        borderColor: `var(--alert-border-color, ${fallbackBorder})`,
        borderWidth: 'var(--alert-border-width, 1px)',
        borderRadius: 'var(--alert-radius, var(--radius-lg))',
        boxShadow: 'var(--alert-shadow, none)',
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span
          className="grid shrink-0 place-items-center"
          style={{
            gridArea: 'icon',
            alignSelf: 'var(--alert-grid-align, start)',
            width: 'var(--alert-icon-width, 1rem)',
            minHeight: 'var(--alert-icon-min-height, 1rem)',
            margin: 'var(--alert-icon-margin, 0.125rem 0 0)',
            padding: 'var(--alert-icon-padding, 0px)',
            borderRadius: 'var(--alert-icon-radius, 0px)',
            color: 'var(--alert-icon-color, var(--alert-tone-base))',
            background: 'var(--alert-icon-bg, transparent)',
          }}
        >
          {icon === true ? <Mark tone={tone} /> : icon}
        </span>
      ) : null}
      <div
        className="grid min-w-0"
        style={{
          gridArea: 'content',
          gridTemplateColumns: 'var(--alert-content-columns, minmax(0, 1fr) auto)',
          gridTemplateAreas: 'var(--alert-content-areas, "title action" "description action")',
          alignItems: 'var(--alert-content-align, start)',
          columnGap: 'var(--alert-content-column-gap, 1.25rem)',
          rowGap: 'var(--alert-content-row-gap, 0.25rem)',
          padding: 'var(--alert-content-padding, 0px)',
        }}
      >
        {title ? (
          <span
            className="min-w-0 text-sm font-semibold leading-snug"
            style={{
              gridArea: 'title',
              color: 'var(--alert-title-color, var(--alert-tone-text))',
              fontSize: 'var(--alert-title-size, 0.875rem)',
              whiteSpace: 'var(--alert-title-white-space, normal)',
            }}
          >
            {title}
          </span>
        ) : null}
        {children ? (
          <span
            className="min-w-0 tracking-wide leading-relaxed text-ctl-fg-muted"
            style={{
              gridArea: 'description',
              fontSize: 'var(--alert-description-size, 0.75rem)',
              whiteSpace: 'var(--alert-description-white-space, normal)',
              overflow: 'var(--alert-description-overflow, visible)',
              textOverflow: 'var(--alert-description-text-overflow, clip)',
            }}
          >
            {children}
          </span>
        ) : null}
        {action ? (
          <span
            className="flex shrink-0 items-center gap-3 [&>*]:whitespace-nowrap"
            style={{ gridArea: 'action', alignSelf: 'var(--alert-action-align, start)' }}
          >
            {action}
          </span>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 grid place-items-center w-6 h-6 rounded-sm bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-[length:var(--ring-ctl)] focus-visible:ring-brand-ring"
          style={{
            gridArea: 'dismiss',
            alignSelf: 'var(--alert-dismiss-align, start)',
            margin: 'var(--alert-dismiss-margin, -0.25rem -0.25rem 0 0)',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export { Alert };
export default Alert;
