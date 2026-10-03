import React from "react";
import { cn as cx } from "./cn.js";

/**
 * ThemeProvider — the one place a consuming app sets the theme.
 *
 * Three things, all of which every gallery page has been hand-rolling: toggle
 * the `dark` class on a root element, write the two runtime theme inputs
 * (--brand-600 and --radius) as inline custom properties, and persist the choice.
 *
 * `theme="system"` follows prefers-color-scheme live — it subscribes to the
 * media query rather than reading it once, so a user switching their OS theme
 * mid-session is followed without a reload.
 *
 * It renders a plain div and writes to that node, not to documentElement, so two
 * themed regions can sit on one page (a docs page showing light and dark side by
 * side, or a dark-only sidebar).
 *
 * <ThemeProvider theme="system" accent="#6d5efc" radius={18}>…</ThemeProvider>
 */
const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;


const ThemeContext = createContext({ theme: 'light', resolved: 'light', setTheme: () => {} });

// Sandboxed previews can expose `window` while making the localStorage getter itself throw a
// SecurityError (opaque origins without allow-same-origin). The access must be inside the try;
// even checking the global storage property's type invokes that getter in those frames.
function optionalLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

function ThemeProvider({
  theme: themeProp,
  defaultTheme = 'system',
  onThemeChange,
  accent,
  radius,
  storageKey = 'ui-theme',
  persist = true,
  applyClass = true,
  className,
  style,
  children,
}) {
  const node = useRef(null);

  const [themeState, setThemeState] = useState(() => {
    if (!persist) return defaultTheme;
    try {
      return optionalLocalStorage()?.getItem(storageKey) || defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  });

  const controlled = themeProp != null;
  const theme = controlled ? themeProp : themeState;

  const [systemDark, setSystemDark] = useState(prefersDark);

  /* Subscribed, not sampled: an OS theme change mid-session is followed. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  const setTheme = useCallback(
    (next) => {
      if (!controlled) setThemeState(next);
      if (onThemeChange) onThemeChange(next);
      if (persist) {
        try {
          optionalLocalStorage()?.setItem(storageKey, next);
        } catch (e) {
          /* Private/sandboxed mode: the toggle still works for this session. */
        }
      }
    },
    [controlled, onThemeChange, persist, storageKey]
  );

  /* applyClass={false} hands class ownership to a consumer that already toggles
     documentElement and keeps this node clean. Scoped providers remain fully
     supported: tokens.css restates the derived alias graph on `.dark`, so a
     wrapper-local dark region resolves overlays, fields, materials and chrome
     from the wrapper's dark primitives instead of inheriting frozen light aliases. */
  useEffect(() => {
    if (node.current) node.current.classList.toggle('dark', applyClass && resolved === 'dark');
  }, [resolved, applyClass]);

  const vars = {};
  if (accent) vars['--brand-600'] = accent;
  if (radius != null) vars['--radius'] = typeof radius === 'number' ? radius + 'px' : radius;

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle: () => setTheme(resolved === 'dark' ? 'light' : 'dark') }}>
      <div
        ref={node}
        data-theme={resolved}
        className={cx('bg-ctl-offset text-ctl-fg', className)}
        style={Object.assign(vars, style)}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

/** Three-way switch. A two-way toggle can't express "follow the OS". */
function ThemeToggle({ size = 'md', labels = true, fullWidth = false, className }) {
  const { theme, setTheme } = useTheme();
  const opts = [
    { value: 'light', label: 'Light', icon: 'M8 5.9a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM8 1.8v1.4M8 12.8v1.4M2.9 2.9l1 1M12.1 12.1l1 1M1.8 8h1.4M12.8 8h1.4M2.9 13.1l1-1M12.1 3.9l1-1' },
    { value: 'system', label: 'System', icon: 'M2.5 3.5h11a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1ZM5.5 13.5h5' },
    { value: 'dark', label: 'Dark', icon: 'M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z' },
  ];
  const h = size === 'sm' ? 'h-7' : 'h-8';

  return (
    <div role="radiogroup" aria-label="Theme" className={cx('items-center gap-1 p-1 rounded-xl bg-ctl-track', fullWidth ? 'flex w-full' : 'inline-flex', className)}>
      {opts.map((o) => {
        const on = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            onClick={() => setTheme(o.value)}
            className={cx(
              'inline-flex items-center justify-center gap-2 px-3 rounded-lg text-sm font-medium border-0 cursor-pointer',
              'transition-[background-color,color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
              fullWidth && 'flex-1',
              h,
              on ? 'bg-ctl-surface text-ctl-fg shadow-sm' : 'bg-transparent text-ctl-fg-muted hover:text-ctl-fg'
            )}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5 shrink-0">
              <path d={o.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {labels ? o.label : null}
          </button>
        );
      })}
    </div>
  );
}

export { ThemeProvider, ThemeToggle, useTheme, ThemeContext };
export default ThemeProvider;
