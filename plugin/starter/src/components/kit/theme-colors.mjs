// Shared color boundary for catalog imports, compatibility palettes and CSS generation.
// Runtime tokens retain alpha. Opaque consumers explicitly composite against their canvas.
const NUMBER = "[+-]?(?:\\d*\\.)?\\d+(?:e[+-]?\\d+)?";
const channelPattern = new RegExp(`^(${NUMBER})(%)?$`, "i");
const clamp = (value) => Math.min(1, Math.max(0, value));
const clean = (value, places = 4) => +value.toFixed(places);

function channel(value, scale = 1) {
  const match = channelPattern.exec(value.trim());
  if (!match) throw new Error(`invalid catalog color channel ${value}`);
  return clamp(Number(match[1]) / (match[2] ? 100 : scale));
}

function rgbToLab([r, g, b]) {
  [r, g, b] = [r, g, b].map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function labToRgb({ L, a, b }) {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  return [
    4.0767416621 * l ** 3 - 3.3077115913 * m ** 3 + 0.2309699292 * s ** 3,
    -1.2684380046 * l ** 3 + 2.6097574011 * m ** 3 - 0.3413193965 * s ** 3,
    -0.0041960863 * l ** 3 - 0.7034186147 * m ** 3 + 1.707614701 * s ** 3,
  ].map((c) => clamp(c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055));
}

function parseColor(color) {
  const value = String(color).trim();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    const rgb = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255);
    return { rgb, lab: rgbToLab(rgb), alpha: digits.length === 8 ? parseInt(digits.slice(6), 16) / 255 : 1 };
  }
  const rgbMatch = /^rgba?\(([^()]*)\)$/i.exec(value);
  if (rgbMatch) {
    const body = rgbMatch[1];
    let components, alpha;
    if (body.includes(",")) {
      const parts = body.split(",");
      if (parts.length === 3 || parts.length === 4) {
        components = parts.slice(0, 3);
        alpha = parts[3];
      }
    } else {
      const parts = body.split("/");
      if (parts.length <= 2) {
        components = parts[0].trim().split(/\s+/);
        alpha = parts[1];
      }
    }
    if (components?.length === 3) {
      const rgb = components.map((c) => channel(c, 255));
      return { rgb, lab: rgbToLab(rgb), alpha: alpha === undefined ? 1 : channel(alpha) };
    }
  }
  const oklch = new RegExp(`^oklch\\(\\s*(${NUMBER}%?)\\s+(${NUMBER})\\s+(${NUMBER})(?:deg)?\\s*(?:/\\s*(${NUMBER}%?)\\s*)?\\)$`, "i").exec(value);
  if (oklch && Number(oklch[2]) >= 0) {
    const L = channel(oklch[1]), C = Number(oklch[2]), h = Number(oklch[3]) * Math.PI / 180;
    const lab = { L, a: C * Math.cos(h), b: C * Math.sin(h) };
    return { lab, rgb: labToRgb(lab), alpha: oklch[4] === undefined ? 1 : channel(oklch[4]) };
  }
  throw new Error(`catalog color must be hex, rgb()/rgba() or oklch(), got ${color}`);
}

export function oklabCss({ L, a, b }, alpha = 1) {
  const C = Math.sqrt(a * a + b * b);
  const H = C < 0.000001 ? 0 : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return `oklch(${clean(L)} ${clean(C)} ${clean(H, 2)}${alpha < 1 ? ` / ${clean(alpha)}` : ""})`;
}

// Canonical catalog notation: convert RGB imports without throwing away transparency.
export function normalizeCatalogColor(color) {
  const { lab, alpha } = parseColor(color);
  return oklabCss(lab, alpha);
}

// Imports may accept older formats, but the live authored catalog must not regress.
export function assertOklchTheme(theme) {
  for (const layer of ["tokens", "derivedTokens", "darkTokens", "darkDerivedTokens"]) {
    for (const [token, value] of Object.entries(theme[layer] || {})) {
      if (/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i.test(String(value))) {
        throw new Error(`${theme.id} ${layer}.${token} must author colors in OKLCH: ${value}`);
      }
    }
  }
}

// Preserve legacy gradient lightness adjustments while emitting whole OKLCH colors.
export function hslPartsToOklch({ h, s, l }, alpha = 1) {
  const L = l / 100, a = (s / 100) * Math.min(L, 1 - L);
  const rgb = [0, 8, 4].map((n) => {
    const k = ((n + h / 30) % 12 + 12) % 12;
    return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
  return oklabCss(rgbToLab(rgb), alpha);
}

export function colorToRgb(color, backdrop = "oklch(1 0 0)") {
  const { rgb, alpha } = parseColor(color);
  if (alpha === 1) return rgb;
  const background = parseColor(backdrop);
  // A translucent canvas itself is flattened against white only at this legacy boundary.
  const base = background.rgb.map((c) => c * background.alpha + 1 - background.alpha);
  return rgb.map((c, i) => c * alpha + base[i] * (1 - alpha));
}

export function colorToOklab(color, backdrop = "oklch(1 0 0)") {
  const parsed = parseColor(color);
  return parsed.alpha === 1 ? parsed.lab : rgbToLab(colorToRgb(color, backdrop));
}

export const colorToOklch = (color, backdrop) => oklabCss(colorToOklab(color, backdrop));
