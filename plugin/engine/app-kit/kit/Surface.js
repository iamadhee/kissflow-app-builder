// GENERATED from starter/src/components/kit/Surface.js (sha256:051b3715aea24712). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";

/**
 * Surface resolution is the shared material/elevation grammar for the kit.
 *
 * Material chooses how a surface separates from its surroundings. Geometry
 * participates in the resting elevation rule: Classic Panel retains depth,
 * while Floating Panel uses its detached spacing and border without a shadow.
 * Explicit component and layer elevation still override that resting rule.
 */

const VALID_GEOMETRIES = new Set(['classic', 'float']);
const VALID_MATERIALS = new Set(['panel', 'flat', 'bare', 'spacing']);
const VALID_ELEVATIONS = new Set(['none', 'sm', 'md', 'lg']);

export const DEFAULT_SURFACE_CONTEXT = Object.freeze({
  geometry: 'classic',
  material: 'panel',
});

export const NEXT_MATERIAL = Object.freeze({
  panel: 'flat',
  flat: 'bare',
  bare: 'bare',
  spacing: 'spacing',
});

/* Keep every class literal visible to Tailwind's scanner. */
export const ELEVATION_CLASS = Object.freeze({
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
});

/* Material chooses one of Tailwind's standard radius utilities. Keeping the
   complete class names here makes them visible to Tailwind's scanner while the
   live --radius bridge in tokens.css keeps every rung theme-responsive. */
export const MATERIAL_RADIUS_CLASS = Object.freeze({
  panel: 'rounded-xl',
  flat: 'rounded-lg',
  bare: 'rounded-none',
  spacing: 'rounded-lg',
});

/* Material owns surface, edge, optional artwork, and backdrop processing. Geometry is
   composed through MATERIAL_RADIUS_CLASS and elevation through ELEVATION_CLASS.
   The actual filter property lives here so every present and future consumer
   of materialStyle() receives the capability rather than reimplementing glass
   per component. Themes default every rung to `none`. */
export const MATERIAL_STYLE = Object.freeze({
  panel: Object.freeze({
    '--material-surface': 'var(--material-panel-surface)',
    '--material-border': 'var(--material-panel-border)',
    '--material-rule': 'var(--material-panel-border)',
    '--material-image': 'var(--material-panel-image)',
    '--material-backdrop-filter': 'var(--material-panel-backdrop-filter)',
    '--material-inset-inline': 'var(--material-panel-inset-inline)',
    '--material-inset-block': 'var(--material-panel-inset-block)',
    '--material-stack-gap': 'var(--material-panel-stack-gap)',
    '--material-inline-gap': 'var(--material-panel-inline-gap)',
    backdropFilter: 'var(--material-backdrop-filter)',
    WebkitBackdropFilter: 'var(--material-backdrop-filter)',
  }),
  flat: Object.freeze({
    '--material-surface': 'var(--material-flat-surface)',
    '--material-border': 'transparent',
    '--material-rule': 'var(--material-flat-border)',
    '--material-image': 'var(--material-flat-image)',
    '--material-backdrop-filter': 'var(--material-flat-backdrop-filter)',
    '--material-inset-inline': 'var(--material-flat-inset-inline)',
    '--material-inset-block': 'var(--material-flat-inset-block)',
    '--material-stack-gap': 'var(--material-flat-stack-gap)',
    '--material-inline-gap': 'var(--material-flat-inline-gap)',
    backdropFilter: 'var(--material-backdrop-filter)',
    WebkitBackdropFilter: 'var(--material-backdrop-filter)',
  }),
  bare: Object.freeze({
    '--material-surface': 'var(--material-bare-surface)',
    '--material-border': 'var(--material-bare-border)',
    '--material-rule': 'var(--material-bare-rule)',
    '--material-image': 'var(--material-bare-image)',
    '--material-backdrop-filter': 'var(--material-bare-backdrop-filter)',
    '--material-inset-inline': 'var(--material-bare-inset-inline)',
    '--material-inset-block': 'var(--material-bare-inset-block)',
    '--material-stack-gap': 'var(--material-bare-stack-gap)',
    '--material-inline-gap': 'var(--material-bare-inline-gap)',
    backdropFilter: 'var(--material-backdrop-filter)',
    WebkitBackdropFilter: 'var(--material-backdrop-filter)',
  }),
  spacing: Object.freeze({
    '--material-surface': 'var(--material-spacing-surface)',
    '--material-border': 'var(--material-spacing-border)',
    '--material-rule': 'var(--material-spacing-border)',
    '--material-image': 'var(--material-spacing-image)',
    '--material-backdrop-filter': 'var(--material-spacing-backdrop-filter)',
    '--material-inset-inline': 'var(--material-spacing-inset-inline)',
    '--material-inset-block': 'var(--material-spacing-inset-block)',
    '--material-stack-gap': 'var(--material-spacing-stack-gap)',
    '--material-inline-gap': 'var(--material-spacing-inline-gap)',
    backdropFilter: 'var(--material-backdrop-filter)',
    WebkitBackdropFilter: 'var(--material-backdrop-filter)',
  }),
});

const FLOATING_PANEL_STYLE = Object.freeze({
  ...MATERIAL_STYLE.panel,
  '--material-border': 'var(--material-floating-border)',
  '--material-rule': 'var(--material-floating-border)',
  /* Floating is panel that has let go of the page, so it keeps panel's paint
     and takes its own rhythm. */
  '--material-inset-inline': 'var(--material-floating-inset-inline)',
  '--material-inset-block': 'var(--material-floating-inset-block)',
  '--material-stack-gap': 'var(--material-floating-stack-gap)',
  '--material-inline-gap': 'var(--material-floating-inline-gap)',
});

export const SurfaceContext = React.createContext(DEFAULT_SURFACE_CONTEXT);

export function normalizeGeometry(value) {
  return VALID_GEOMETRIES.has(value) ? value : 'classic';
}

export function resolveRootMaterial({ appMaterial = 'panel' } = {}) {
  return VALID_MATERIALS.has(appMaterial) ? appMaterial : 'panel';
}

export function normalizeSurfaceContext(value) {
  /* MaterialContext previously provided a string. Accept it during migration so
     installed consumers do not break while the context becomes structured. */
  if (typeof value === 'string') {
    return {
      geometry: 'classic',
      material: VALID_MATERIALS.has(value) ? value : 'panel',
    };
  }
  const geometry = normalizeGeometry(value?.geometry);
  return {
    geometry,
    material: VALID_MATERIALS.has(value?.material)
      ? value.material
      : 'panel',
  };
}

export function nextMaterial(material) {
  return NEXT_MATERIAL[material] || 'bare';
}

export function resolveElevation({ componentElevation, geometry = 'classic', material, role = 'resting' } = {}) {
  if (VALID_ELEVATIONS.has(componentElevation)) return componentElevation;
  if (role === 'blocking-layer') return 'lg';
  if (role === 'attached-layer') return 'md';
  if (normalizeGeometry(geometry) === 'float' && material === 'panel') return 'none';
  return material === 'panel' ? 'md' : 'none';
}

export function materialStyle(material, geometry = 'classic') {
  if (material === 'panel' && normalizeGeometry(geometry) === 'float') {
    return FLOATING_PANEL_STYLE;
  }
  return MATERIAL_STYLE[material] || MATERIAL_STYLE.panel;
}

export function materialRadiusClass(material) {
  return MATERIAL_RADIUS_CLASS[material] || MATERIAL_RADIUS_CLASS.panel;
}

export function elevationClass(elevation) {
  return ELEVATION_CLASS[elevation] || ELEVATION_CLASS.none;
}

/* Compatibility alias for callers that imported the former string context
   from Card.jsx. New code should use SurfaceContext. */
export const MaterialContext = SurfaceContext;
