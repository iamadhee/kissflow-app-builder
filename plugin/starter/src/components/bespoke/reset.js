// Page-scoped element reset for the bespoke pages. Tailwind preflight is OFF in this workspace, so
// the user agent's element chrome (button borders, list bullets, heading margins) shows through
// under every utility class. This reset lives in the base layer with zero-specificity selectors
// (:where), so any Tailwind class on the page still wins. It is injected once into <head> rather
// than imported as a stylesheet because the build inlines CSS into the entry and drops css
// assets: a lazy page chunk's own stylesheet would 404 at preload.
//
// Every bespoke page needs it: shared/ui.jsx imports this once and puts RESET_CLASS on <Page>, so a
// page that composes from the house style is reset by construction.
export const RESET_CLASS = "bespoke-page";

const RESET = `@layer base {
  .${RESET_CLASS} :where(h1, h2, h3, h4, p, ul, ol, dl, dt, dd, figure, hr, table) { margin: 0; padding: 0; }
  .${RESET_CLASS} :where(ul, ol) { list-style: none; }
  .${RESET_CLASS} :where(button) { font: inherit; color: inherit; background: transparent; border: 0; padding: 0; margin: 0; cursor: pointer; text-align: inherit; appearance: none; }
  .${RESET_CLASS} :where(button:disabled) { cursor: not-allowed; }
  .${RESET_CLASS} :where(input, select, textarea) { font: inherit; color: inherit; margin: 0; }
  .${RESET_CLASS} :where(input[type="number"]) { appearance: textfield; }
  .${RESET_CLASS} :where(textarea) { resize: vertical; }
  .${RESET_CLASS} :where(table) { border-spacing: 0; }
  .${RESET_CLASS} :where(th) { font-weight: inherit; text-align: inherit; }
}`;

if (typeof document !== "undefined" && !document.getElementById("bespoke-reset")) {
  const style = document.createElement("style");
  style.id = "bespoke-reset";
  style.textContent = RESET;
  document.head.appendChild(style);
}
