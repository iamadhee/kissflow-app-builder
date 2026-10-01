// GENERATED from starter/src/components/kit/Button.jsx (sha256:3fa24b0b4e6b3d97). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Button — the first primitive of the system.
 *
 * React + JSX + Tailwind. Two sources feed it and nothing else:
 *   tailwind.theme.css — v4 CSS-first theme: named entries only where
 *                        Tailwind has no default (duration-[var(--default-transition-duration)], border…)
 *                        plus the color aliases; the core scales (text-sm,
 *                        rounded-lg, shadow-sm) read tokens.css directly
 *   tokens.css         — everything a product tunes (theme surfaces, accent,
 *                        elevation, and the radius and type scales)
 * No literals, and no arbitrary-value type hints to get wrong.
 *
 * <Button variant="primary" size="md" onClick={save}>Save changes</Button>
 */
const { forwardRef } = React;


const BASE = [
  'inline-flex items-center justify-center shrink-0 gap-2',
  '[font-weight:var(--button-font-weight)] leading-none whitespace-nowrap tracking-normal',
  'border border-solid [border-radius:var(--button-radius)] select-none appearance-none',
  'transition-[background-color,background-image,border-color,color,box-shadow,transform] ease-ctl duration-[var(--default-transition-duration)]',
  'enabled:hover:[transform:translateY(var(--interactive-hover-lift))] enabled:active:[transform:translateY(0)] motion-reduce:transform-none',
  'outline-none focus-visible:ring-[length:var(--ring-ctl)] focus-visible:ring-brand-ring',
  'focus-visible:ring-offset-[length:var(--ring-offset-ctl)] focus-visible:ring-offset-ctl-offset',
  'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:shadow-none',
].join(' ');

const SIZES = {
  sm: 'h-8 px-4 text-xs',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
};

/** Glyph size tracks the label step, so it stays in one place per size. */
const GLYPH = { sm: '12px', md: '14px', lg: '16px' };

const VARIANTS = {
  primary: cx(
    'bg-brand-600 [background-image:var(--gradient-primary)] border-transparent text-brand-fg [box-shadow:var(--button-primary-shadow)]',
    'hover:bg-brand-700 hover:[background-image:var(--gradient-primary-hover)] hover:border-transparent',
    'active:bg-brand-800 active:[background-image:var(--gradient-primary-active)] active:border-transparent active:shadow-none'
  ),
  secondary: cx(
    'bg-ctl-surface [border-color:var(--button-secondary-border)] text-ctl-fg [box-shadow:var(--button-secondary-shadow)]',
    'hover:bg-ctl-raise hover:[border-color:var(--button-secondary-border-hover)]',
    'active:bg-ctl-track active:shadow-none'
  ),
  ghost: cx(
    'bg-transparent border-transparent text-ctl-fg-muted',
    'hover:bg-ctl-raise active:bg-ctl-track'
  ),
  /* The creation affordance: dashed = "this makes something new". Use for add/attach/create
     actions that live INSIDE a composition (add evidence, flag blocker, drop a file) so they
     read as invitations, distinct from the solid commands that act on what already exists. */
  affordance: cx(
    'bg-transparent border-dashed border-ctl-border-strong text-ctl-fg-muted',
    'hover:text-ctl-fg hover:border-field-border-hover hover:bg-ctl-raise',
    'active:bg-ctl-track'
  ),
  danger: cx(
    'bg-danger-600 border-danger-600 text-danger-fg shadow-sm',
    'hover:bg-danger-700 hover:border-danger-700',
    'active:bg-danger-800 active:border-danger-800 active:shadow-none'
  ),
  link: cx(
    'bg-transparent border-transparent text-brand-text underline-offset-4',
    'hover:underline'
  ),
};

function Spinner({ size }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="animate-spin [animation-duration:700ms]"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Stand-in glyph: swap for your icon set's component. */
function PlaceholderIcon({ size }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size }}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const ButtonBase = forwardRef(function ButtonBase(
  {
    variant = 'primary',
    size = 'md',
    type = 'button',
    as,
    icon = false,
    iconRight = false,
    loading = false,
    disabled = false,
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const Tag = as || 'button';
  const isLink = variant === 'link';
  const isDisabled = disabled || loading;
  const glyph = GLYPH[size] || GLYPH.md;

  const classes = cx(
    BASE,
    isLink ? 'h-auto p-0 text-sm' : SIZES[size] || SIZES.md,
    VARIANTS[variant] || VARIANTS.primary,
    fullWidth && 'w-full',
    isDisabled && 'pointer-events-none',
    className
  );

  return (
    <Tag
      ref={ref}
      className={classes}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={Tag === 'button' ? undefined : isDisabled || undefined}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {loading ? <Spinner size={glyph} /> : icon ? <PlaceholderIcon size={glyph} /> : null}
      {children}
      {iconRight && !loading ? <PlaceholderIcon size={glyph} /> : null}
    </Tag>
  );
});

ButtonBase.displayName = 'Button';

/** Plain-function facade so both bundlers and lightweight loaders can resolve it. */
function Button({ innerRef, ...props }) {
  return <ButtonBase ref={innerRef} {...props} />;
}

export { Button, ButtonBase };
export default Button;
