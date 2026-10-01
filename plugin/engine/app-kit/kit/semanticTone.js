// GENERATED from starter/src/components/kit/semanticTone.js (sha256:8d76cff7be6007d4). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
const COLORED_TONES = new Set(['success', 'warning', 'info', 'danger']);

const ROLE_SUFFIX = {
  base: '600',
  bg: '100',
  text: 'text',
  fg: 'fg',
};

/* Accent and neutral are semantic roles, not colour families with their own
   token ramps. Map them onto the current brand/control contracts so callers
   never reconstruct the retired --tone-accent-* or --tone-neutral-* aliases. */
const UNCOLORED_TONE_TOKENS = {
  accent: {
    base: '--brand-600',
    bg: '--brand-100',
    text: '--brand-text',
    fg: '--brand-fg',
    solid: '--brand-600',
    surfaceImage: '--brand-surface-image',
  },
  neutral: {
    base: '--ctl-fg-muted',
    bg: '--ctl-track',
    text: '--ctl-fg',
    fg: '--ctl-surface',
    solid: '--ctl-fg',
    surfaceImage: '--neutral-surface-image',
  },
};

/** Resolve semantic colors without rebuilding deprecated --tone-<status>-* names. */
function semanticToneToken(tone, role = 'base', fallback) {
  const normalized = String(tone || 'neutral').trim().toLowerCase();
  const resolvedTone = normalized === 'pending' ? 'warning' : normalized;
  let name;

  if (COLORED_TONES.has(resolvedTone)) {
    if (role === 'surfaceImage') {
      name = `--${resolvedTone}-surface-image`;
    } else {
      const suffix = role === 'solid'
        ? (resolvedTone === 'success' || resolvedTone === 'info' ? '700' : '600')
        : ROLE_SUFFIX[role] || ROLE_SUFFIX.base;
      name = `--${resolvedTone}-${suffix}`;
    }
  } else {
    const tokens = UNCOLORED_TONE_TOKENS[resolvedTone] || UNCOLORED_TONE_TOKENS.neutral;
    name = tokens[role] || tokens.base;
  }

  return `var(${name}${fallback ? `, ${fallback}` : ''})`;
}

export { semanticToneToken };
export default semanticToneToken;
