// GENERATED from starter/src/components/kit/labels.js (sha256:f909cbb199bf8f08). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
// Normalize generated English labels without rewriting authored names (iPhone,
// eBay), acronyms or non-English text. IDs and routing keys are never changed.
const ACRONYMS = new Set(['nav', 'imo', 'poa', 'id', 'kpi', 'sla', 'api', 'fx', 'hr', 'url', 'vat']);
export function tabLabel(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\b[a-zA-Z]+(?:['’][a-zA-Z]+)?\b/g, word => {
    if (ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
    if (word !== word.toLowerCase()) return word;
    return word[0].toUpperCase() + word.slice(1);
  });
}
