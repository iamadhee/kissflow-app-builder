import { THEME_CATALOG } from "./theme-catalog.generated.js";
import { colorToRgb, normalizeCatalogColor } from "./kit/theme-colors.mjs";

export function normalizePrototypeBrand(color) {
  if (typeof color !== "string") return null;
  try { return normalizeCatalogColor(color); } catch { return null; }
}

// Native color inputs accept sRGB hex; this is an input-device boundary, never a theme token.
export function prototypeColorInputValue(color) {
  const rgb = colorToRgb(normalizePrototypeBrand(color) || "oklch(0.5461 0.2152 262.88)");
  return `#${rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("")}`;
}

export const DEFAULT_PROTOTYPE_THEME_FAMILY = "vela";
export const PROTOTYPE_THEME_CHOICES = THEME_CATALOG;
export const PROTOTYPE_THEME_FAMILIES = PROTOTYPE_THEME_CHOICES.map((choice) => choice.value);
const REMOVED_PROTOTYPE_THEME_FAMILIES = new Set([
  "cobalt",
  "graphite",
  "slate",
  "mallow",
  "sunbeam",
  "mariposa",
  "parade",
  "periwinkle",
  "iris",
  "orbit",
]);

export const PROTOTYPE_SHELL_CHOICES = [
  { value: "sidebar", label: "Sidebar" },
  { value: "top", label: "Top" },
];

export const PROTOTYPE_CHROME_CHOICES = [
  { value: "base", label: "Base" },
  { value: "accent", label: "Accent" },
];

export const PROTOTYPE_DESIGN_CHOICES = [
  { value: "classic", label: "Classic" },
  { value: "float", label: "Floating" },
];

export const PROTOTYPE_MATERIAL_CHOICES = [
  { value: "panel", label: "Panel" },
  { value: "flat", label: "Flat" },
  { value: "bare", label: "Bare" },
  { value: "spacing", label: "Spacing" },
];

export const PROTOTYPE_RADIUS_CHOICES = [
  { value: null, label: "Theme" },
  { value: "0px", label: "Square" },
  { value: "8px", label: "Compact" },
  { value: "16px", label: "Soft" },
  { value: "24px", label: "Round" },
  { value: "32px", label: "Extra" },
];

export const PROTOTYPE_SPACING_RANGE = Object.freeze({
  min: 0.1875,
  max: 0.3125,
  step: 0.000625,
});

export const PROTOTYPE_FONT_SCALE_RANGE = Object.freeze({
  min: 0.8,
  max: 1.2,
  step: 0.01,
});

const UI_SANS_FALLBACK = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const UI_SERIF_FALLBACK = "ui-serif, Georgia, Cambria, serif";

function fontPair(value, label, displayFont, bodyFont, families, displayType = "sans") {
  return Object.freeze({
    value,
    label,
    displayFont,
    bodyFont,
    displayStack: `"${displayFont}", ${displayType === "serif" ? UI_SERIF_FALLBACK : UI_SANS_FALLBACK}`,
    bodyStack: `"${bodyFont}", ${UI_SANS_FALLBACK}`,
    families: Object.freeze(families),
  });
}

export const PROTOTYPE_FONT_PAIR_CHOICES = Object.freeze([
  fontPair("inter-inter", "Inter + Inter", "Inter", "Inter", ["Inter:wght@400;500;600;700"]),
  fontPair("manrope-inter", "Manrope + Inter", "Manrope", "Inter", ["Manrope:wght@400;500;600;700", "Inter:wght@400;500;600;700"]),
  fontPair("space-grotesk-inter", "Space Grotesk + Inter", "Space Grotesk", "Inter", ["Space Grotesk:wght@400;500;600;700", "Inter:wght@400;500;600;700"]),
  fontPair("jakarta-dm-sans", "Plus Jakarta Sans + DM Sans", "Plus Jakarta Sans", "DM Sans", ["Plus Jakarta Sans:wght@400;500;600;700", "DM Sans:wght@400;500;600;700"]),
  fontPair("sora-inter", "Sora + Inter", "Sora", "Inter", ["Sora:wght@400;500;600;700", "Inter:wght@400;500;600;700"]),
  fontPair("outfit-dm-sans", "Outfit + DM Sans", "Outfit", "DM Sans", ["Outfit:wght@400;500;600;700", "DM Sans:wght@400;500;600;700"]),
  fontPair("montserrat-source-sans", "Montserrat + Source Sans 3", "Montserrat", "Source Sans 3", ["Montserrat:wght@400;500;600;700", "Source Sans 3:wght@400;500;600;700"]),
  fontPair("urbanist-inter", "Urbanist + Inter", "Urbanist", "Inter", ["Urbanist:wght@400;500;600;700", "Inter:wght@400;500;600;700"]),
  fontPair("ibm-plex-sans", "IBM Plex Sans + IBM Plex Sans", "IBM Plex Sans", "IBM Plex Sans", ["IBM Plex Sans:wght@400;500;600;700"]),
  fontPair("ibm-plex-serif-sans", "IBM Plex Serif + IBM Plex Sans", "IBM Plex Serif", "IBM Plex Sans", ["IBM Plex Serif:wght@400;500;600;700", "IBM Plex Sans:wght@400;500;600;700"], "serif"),
  fontPair("playfair-inter", "Playfair Display + Inter", "Playfair Display", "Inter", ["Playfair Display:wght@500;600;700", "Inter:wght@400;500;600;700"], "serif"),
  fontPair("dm-serif-dm-sans", "DM Serif Display + DM Sans", "DM Serif Display", "DM Sans", ["DM Serif Display", "DM Sans:wght@400;500;600;700"], "serif"),
  fontPair("merriweather-source-sans", "Merriweather + Source Sans 3", "Merriweather", "Source Sans 3", ["Merriweather:wght@400;700", "Source Sans 3:wght@400;500;600;700"], "serif"),
  fontPair("libre-source-sans", "Libre Baskerville + Source Sans 3", "Libre Baskerville", "Source Sans 3", ["Libre Baskerville:wght@400;700", "Source Sans 3:wght@400;500;600;700"], "serif"),
  fontPair("lora-inter", "Lora + Inter", "Lora", "Inter", ["Lora:wght@400;500;600;700", "Inter:wght@400;500;600;700"], "serif"),
  fontPair("fraunces-manrope", "Fraunces + Manrope", "Fraunces", "Manrope", ["Fraunces:wght@400;600;700", "Manrope:wght@400;500;600;700"], "serif"),
  fontPair("roboto-slab-roboto", "Roboto Slab + Roboto", "Roboto Slab", "Roboto", ["Roboto Slab:wght@400;500;600;700", "Roboto:wght@400;500;700"], "serif"),
  fontPair("bebas-heebo", "Bebas Neue + Heebo", "Bebas Neue", "Heebo", ["Bebas Neue", "Heebo:wght@400;500;600;700"]),
  fontPair("lexend-zilla", "Lexend + Zilla Slab", "Lexend", "Zilla Slab", ["Lexend:wght@400;500;600;700", "Zilla Slab:wght@400;500;600;700"]),
  fontPair("poppins-nunito", "Poppins + Nunito Sans", "Poppins", "Nunito Sans", ["Poppins:wght@400;500;600;700", "Nunito Sans:wght@400;500;600;700"]),
]);

export const PROTOTYPE_BRAND_CHOICES = [
  { value: null, label: "Theme" },
  { value: "oklch(0.1913 0 0)", label: "Black" },
  { value: "oklch(0.552 0.2469 266.16)", label: "Blue" },
  { value: "oklch(0.5325 0.0899 186.83)", label: "Teal" },
  { value: "oklch(0.5143 0.1978 16.93)", label: "Rose" },
  { value: "oklch(0.5534 0.1739 38.4)", label: "Orange" },
];

export const PROTOTYPE_SHADOW_CHOICES = [
  { value: null, label: "Theme" },
  { value: "0", label: "None" },
  { value: "0.5", label: "Subtle" },
  { value: "1", label: "Medium" },
  { value: "1.5", label: "Strong" },
  { value: "2", label: "Max" },
];

const SHELL_VALUES = new Set(PROTOTYPE_SHELL_CHOICES.map((choice) => choice.value));
const CHROME_VALUES = new Set(PROTOTYPE_CHROME_CHOICES.map((choice) => choice.value));
const DESIGN_VALUES = new Set(PROTOTYPE_DESIGN_CHOICES.map((choice) => choice.value));
const MATERIAL_VALUES = new Set(PROTOTYPE_MATERIAL_CHOICES.map((choice) => choice.value));
const RADIUS_VALUES = new Set(PROTOTYPE_RADIUS_CHOICES.map((choice) => choice.value));
const FONT_PAIR_VALUES = new Set(PROTOTYPE_FONT_PAIR_CHOICES.map((choice) => choice.value));
const SHADOW_VALUES = new Set(PROTOTYPE_SHADOW_CHOICES.map((choice) => choice.value));

export function normalizePrototypeThemeFamily(
  value,
  supportedFamilies = PROTOTYPE_THEME_FAMILIES,
  fallback = DEFAULT_PROTOTYPE_THEME_FAMILY,
) {
  const supported = new Set(
    (Array.isArray(supportedFamilies) ? supportedFamilies : [])
      .filter((family) => !REMOVED_PROTOTYPE_THEME_FAMILIES.has(family)),
  );
  if (supported.has(value)) return value;
  if (supported.has(fallback)) return fallback;
  return supported.values().next().value || DEFAULT_PROTOTYPE_THEME_FAMILY;
}

/**
 * Resolve a catalog theme's recommended shell composition into the runtime axis names.
 * These are defaults only: Display options may still change any axis independently.
 */
export function prototypeThemeShellDefaults(
  value,
  fallback = DEFAULT_PROTOTYPE_THEME_FAMILY,
) {
  const family = normalizePrototypeThemeFamily(value, PROTOTYPE_THEME_FAMILIES, fallback);
  const choice = PROTOTYPE_THEME_CHOICES.find((candidate) => candidate.value === family)
    || PROTOTYPE_THEME_CHOICES[0];
  const shell = choice?.shell || {};
  return {
    variant: SHELL_VALUES.has(shell.navigation) ? shell.navigation : "sidebar",
    chrome: CHROME_VALUES.has(shell.chrome) ? shell.chrome : "base",
    design: DESIGN_VALUES.has(shell.geometry) ? shell.geometry : "classic",
    material: MATERIAL_VALUES.has(shell.material) ? shell.material : "panel",
  };
}

export function resolvePrototypeThemeFamily(
  search,
  configuredFamily,
  supportedFamilies = PROTOTYPE_THEME_FAMILIES,
  fallback = DEFAULT_PROTOTYPE_THEME_FAMILY,
) {
  const supported = new Set(
    (Array.isArray(supportedFamilies) ? supportedFamilies : [])
      .filter((family) => !REMOVED_PROTOTYPE_THEME_FAMILIES.has(family)),
  );
  let requested = null;
  try {
    requested = new URLSearchParams(typeof search === "string" ? search : "").get("lang");
  } catch {
    // A malformed query must not replace a known theme family.
  }
  if (supported.has(requested)) return requested;
  return normalizePrototypeThemeFamily(configuredFamily, supportedFamilies, fallback);
}

function normalizeShellVariant(value) {
  if (value === "fixed" || value === "rail") return "sidebar";
  return SHELL_VALUES.has(value) ? value : null;
}

export function prototypeSpacingRem(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)rem$/);
  if (!match) return null;
  const amount = Number(match[1]);
  const { min, max } = PROTOTYPE_SPACING_RANGE;
  if (!Number.isFinite(amount) || amount < min || amount > max) return null;
  return Number(amount.toFixed(6));
}

export function normalizePrototypeSpacing(value) {
  const rem = prototypeSpacingRem(value);
  if (rem == null) return null;
  return `${rem}rem`;
}

export function normalizePrototypeFontScale(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const amount = Number(value);
  const { min, max, step } = PROTOTYPE_FONT_SCALE_RANGE;
  if (!Number.isFinite(amount) || amount < min || amount > max) return null;
  const snapped = Math.round(amount / step) * step;
  if (Math.abs(snapped - amount) > 0.000001) return null;
  return String(Number(snapped.toFixed(2)));
}

export function normalizePrototypeDisplayOptions(value, fallbackVariant = "sidebar") {
  const input = value && typeof value === "object" ? value : {};
  const normalizedFallback = normalizeShellVariant(fallbackVariant) || "sidebar";
  return {
    variant: normalizeShellVariant(input.variant) || normalizedFallback,
    radius: RADIUS_VALUES.has(input.radius) ? input.radius : null,
    spacing: normalizePrototypeSpacing(input.spacing),
    fontScale: normalizePrototypeFontScale(input.fontScale),
    fontPair: FONT_PAIR_VALUES.has(input.fontPair) ? input.fontPair : null,
    brand: normalizePrototypeBrand(input.brand),
    shadowStrength: SHADOW_VALUES.has(input.shadowStrength) ? input.shadowStrength : null,
  };
}

export function readableBrandForeground(color) {
  const normalized = normalizePrototypeBrand(color);
  if (!normalized) return "oklch(1 0 0)";
  const luminance = (value) => {
    const channels = colorToRgb(value);
    const [r, g, b] = channels.map((channel) => (
      channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    ));
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  };
  const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const background = luminance(normalized);
  const dark = luminance("oklch(0.202 0.0079 285.67)");
  if (contrast(background, 1) >= 4.5) return "oklch(1 0 0)";
  if (contrast(background, dark) >= 4.5) return "oklch(0.202 0.0079 285.67)";
  return "oklch(0 0 0)";
}

export function prototypeFontPairStylesheetHref(value) {
  const pair = PROTOTYPE_FONT_PAIR_CHOICES.find((choice) => choice.value === value);
  if (!pair) return null;
  const query = pair.families.map((family) => `family=${family.replaceAll(" ", "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function prototypeFontPairPreviewStylesheetHref() {
  const families = [...new Set(PROTOTYPE_FONT_PAIR_CHOICES.flatMap((choice) => choice.families))];
  const query = families.map((family) => `family=${family.replaceAll(" ", "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function syncPrototypeFontPairStylesheet(documentNode, value) {
  const head = documentNode?.head;
  if (!head) return null;
  const selector = "link[data-kf-prototype-font-pair]";
  const existing = head.querySelector(selector);
  const href = prototypeFontPairStylesheetHref(value);
  if (!href) {
    existing?.remove();
    return null;
  }
  const link = existing || documentNode.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-kf-prototype-font-pair", value);
  if (!existing) head.appendChild(link);
  return link;
}

export function syncPrototypeFontPairPreviewStylesheet(documentNode, enabled) {
  const head = documentNode?.head;
  if (!head) return null;
  const selector = "link[data-kf-prototype-font-pair-preview]";
  const existing = head.querySelector(selector);
  if (!enabled) {
    existing?.remove();
    return null;
  }
  const link = existing || documentNode.createElement("link");
  link.rel = "stylesheet";
  link.href = prototypeFontPairPreviewStylesheetHref();
  link.setAttribute("data-kf-prototype-font-pair-preview", "");
  if (!existing) head.appendChild(link);
  return link;
}

export const PROTOTYPE_ROOT_OVERRIDE_PROPERTIES = [
  "--brand-600",
  "--brand-fg",
  "--color-primary-foreground",
  "--color-brand-600",
  "--radius",
  "--spacing",
  "--font-scale",
  "--font-display",
  "--font-sans",
  "--shadow-strength",
];

function rememberInlineValue(root, property, snapshot) {
  if (snapshot.has(property)) return;
  snapshot.set(property, {
    value: root.style.getPropertyValue(property),
    priority: root.style.getPropertyPriority(property),
  });
}

function restoreInlineValue(root, property, snapshot) {
  const previous = snapshot.get(property);
  if (previous?.value) root.style.setProperty(property, previous.value, previous.priority);
  else root.style.removeProperty(property);
}

export function applyPrototypeRootOverrides(root, options, snapshot = new Map()) {
  if (!root?.style) return snapshot;
  PROTOTYPE_ROOT_OVERRIDE_PROPERTIES.forEach((property) => rememberInlineValue(root, property, snapshot));

  const brand = normalizePrototypeBrand(options?.brand);
  const brandValues = {
    "--brand-600": brand,
    "--brand-fg": brand ? readableBrandForeground(brand) : null,
    "--color-primary-foreground": brand ? "var(--brand-fg)" : null,
    "--color-brand-600": brand ? "var(--brand-600)" : null,
  };
  Object.entries(brandValues).forEach(([property, value]) => {
    if (value == null) restoreInlineValue(root, property, snapshot);
    else root.style.setProperty(property, value);
  });

  const radius = options?.radius || null;
  if (radius == null) restoreInlineValue(root, "--radius", snapshot);
  else root.style.setProperty("--radius", radius);

  const spacing = options?.spacing || null;
  if (spacing == null) restoreInlineValue(root, "--spacing", snapshot);
  else root.style.setProperty("--spacing", spacing);

  const fontScale = options?.fontScale || null;
  if (fontScale == null) restoreInlineValue(root, "--font-scale", snapshot);
  else root.style.setProperty("--font-scale", fontScale);

  const fontPairChoice = PROTOTYPE_FONT_PAIR_CHOICES.find((choice) => choice.value === options?.fontPair);
  if (!fontPairChoice) {
    restoreInlineValue(root, "--font-display", snapshot);
    restoreInlineValue(root, "--font-sans", snapshot);
  } else {
    root.style.setProperty("--font-display", fontPairChoice.displayStack);
    root.style.setProperty("--font-sans", fontPairChoice.bodyStack);
  }

  if (options?.shadowStrength == null) restoreInlineValue(root, "--shadow-strength", snapshot);
  else root.style.setProperty("--shadow-strength", options.shadowStrength);
  return snapshot;
}

export function restorePrototypeRootOverrides(root, snapshot) {
  if (!root?.style || !snapshot) return;
  PROTOTYPE_ROOT_OVERRIDE_PROPERTIES.forEach((property) => restoreInlineValue(root, property, snapshot));
}

export function readPrototypeRootTokens(root) {
  const view = root?.ownerDocument?.defaultView;
  if (!root || !view) return { brand: "", radius: "", spacing: "", fontScale: "", shadowStrength: "" };
  const styles = view.getComputedStyle(root);
  return {
    brand: styles.getPropertyValue("--brand-600").trim(),
    radius: styles.getPropertyValue("--radius").trim(),
    spacing: styles.getPropertyValue("--spacing").trim(),
    fontScale: styles.getPropertyValue("--font-scale").trim(),
    shadowStrength: styles.getPropertyValue("--shadow-strength").trim(),
  };
}
