import { useEffect, useState } from "react";
import {
  DEFAULT_PROTOTYPE_THEME_FAMILY,
  PROTOTYPE_THEME_CHOICES,
} from "./prototype-display-options.js";
import {
  COLOR_TOKENS,
  DIRECT_THEME_TOKENS,
  THEME_DERIVED_OVERRIDE_TOKENS,
  THEME_TOKENS,
  TOKEN_GROUPS,
} from "./theme-token-groups.js";

const THEME_NAMES = Object.fromEntries(
  PROTOTYPE_THEME_CHOICES.map((choice) => [choice.value, choice.label]),
);

function readThemeSnapshot() {
  if (typeof document === "undefined") {
    return { family: DEFAULT_PROTOTYPE_THEME_FAMILY, mode: "light", values: {} };
  }

  const root = document.documentElement;
  const computed = getComputedStyle(root);
  return {
    family: root.dataset.theme || DEFAULT_PROTOTYPE_THEME_FAMILY,
    mode: root.classList.contains("dark") ? "dark" : "light",
    values: Object.fromEntries(THEME_TOKENS.map((token) => [token, computed.getPropertyValue(token).trim() || "—"])),
  };
}

function ThemeTokenRow({ token, value, family }) {
  const showsColor = COLOR_TOKENS.has(token) && value !== "—";
  const isDerived = !DIRECT_THEME_TOKENS.includes(token);
  const hasThemeOverride = THEME_DERIVED_OVERRIDE_TOKENS[family]?.includes(token);
  const source = !isDerived || hasThemeOverride ? "ui-themes" : "tokens.css";
  return (
    <div
      data-theme-token={token}
      data-theme-token-source={source}
      className="grid min-w-0 gap-2 border-0 border-b border-solid border-layer-border py-3 last:border-b-0 sm:grid-cols-[minmax(190px,0.8fr)_minmax(0,1.2fr)] sm:items-center"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <code className="min-w-0 break-all text-sm font-medium text-ctl-fg">{token}</code>
        {isDerived ? (
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-2xs font-medium uppercase tracking-wider text-brand-text">
            Derived
          </span>
        ) : null}
        <span className="rounded-full bg-ctl-track px-2 py-0.5 text-2xs font-medium text-ctl-fg-muted">
          From {source}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-2.5 sm:justify-end">
        {showsColor ? (
          <span
            aria-hidden="true"
            className="size-5 shrink-0 rounded-md border border-solid border-layer-border shadow-sm"
            style={{ background: `var(${token})` }}
          />
        ) : null}
        <code className="min-w-0 break-all text-sm text-ctl-fg-muted sm:text-right">{value}</code>
      </div>
    </div>
  );
}

function ThemeTokensSection() {
  const [snapshot, setSnapshot] = useState(readThemeSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    const refresh = () => setSnapshot(readThemeSnapshot());
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  const familyName = THEME_NAMES[snapshot.family] || snapshot.family;

  return (
    <section data-theme-tokens-section="" aria-labelledby="theme-tokens-heading" className="grid gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="theme-tokens-heading" className="m-0 font-display text-xl font-semibold text-ctl-fg">Tokens</h2>
          <p className="m-0 mt-1 text-sm text-ctl-fg-muted">
            Theme JSON tokens and their calculated derivatives for the selected family and color mode.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-brand-100 px-3 py-1.5 font-medium text-brand-text">{familyName}</span>
          <span className="rounded-full bg-ctl-track px-3 py-1.5 font-medium capitalize text-ctl-fg-muted">{snapshot.mode}</span>
          <span className="font-mono text-ctl-fg-muted">{THEME_TOKENS.length} tokens</span>
        </div>
      </header>

      <div className="grid gap-8">
        {TOKEN_GROUPS.map((group) => (
          <section key={group.name} aria-labelledby={`theme-token-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
            <h3 id={`theme-token-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="m-0 mb-2 font-display text-sm font-semibold uppercase tracking-wider text-ctl-fg-muted">
              {group.name}
            </h3>
            <div>
              {group.tokens.map((token) => <ThemeTokenRow key={token} token={token} value={snapshot.values[token] || "—"} family={snapshot.family} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export { THEME_TOKENS, ThemeTokensSection };
export default ThemeTokensSection;
