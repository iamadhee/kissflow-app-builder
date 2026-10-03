import { Children, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Motion with a floor under it: everything here checks prefers-reduced-motion and degrades to no
// animation at all. A dashboard that lurches on every render is worse than a still one, and for some
// people it is a genuine accessibility problem rather than a taste one.
//
// Deliberately small. Two primitives cover almost every case a generated page needs — content
// arriving, and a list arriving in order. Anything more elaborate should be a design decision
// somebody made on purpose, not a default the kit handed out.

const FALLBACK_MOTION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] };

function timeInSeconds(value, fallback) {
  const source = String(value || "").trim();
  const amount = Number.parseFloat(source);
  if (!Number.isFinite(amount)) return fallback;
  return source.endsWith("ms") ? amount / 1000 : amount;
}

function easingCurve(value, fallback) {
  const match = /cubic-bezier\(([^)]+)\)/.exec(String(value || ""));
  if (!match) return fallback;
  const points = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return points.length === 4 && points.every(Number.isFinite) ? points : fallback;
}

function readThemeMotion() {
  if (typeof document === "undefined") return FALLBACK_MOTION;
  const styles = getComputedStyle(document.documentElement);
  const duration = styles.getPropertyValue("--motion-duration-move")
    || styles.getPropertyValue("--default-transition-duration");
  const ease = styles.getPropertyValue("--ease-spring")
    || styles.getPropertyValue("--default-transition-timing-function");
  return {
    duration: timeInSeconds(duration, FALLBACK_MOTION.duration),
    ease: easingCurve(ease, FALLBACK_MOTION.ease),
  };
}

/** Keep JS-driven Framer transitions on the same timing curve as CSS controls,
 * including when ThemeProvider changes the active theme at runtime. */
function useThemeMotion() {
  const [tokens, setTokens] = useState(readThemeMotion);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setTokens(readThemeMotion());
    update();
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => observer.disconnect();
  }, []);

  return tokens;
}

/** Fade + lift on mount. Use for a card, a panel, a section — not for every row. */
export function FadeIn({ children, delay = 0, duration, y = 8, className }) {
  const still = useReducedMotion();
  const themeMotion = useThemeMotion();
  if (still) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} data-kf-motion="fade-in"
      initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration ?? themeMotion.duration, delay, ease: themeMotion.ease }}>
      {children}
    </motion.div>
  );
}

/**
 * A list whose children arrive one after another.
 * Keep `stagger` small — 0.04s over ten rows is texture; 0.2s over ten rows is a wait.
 */
export function Stagger({ children, stagger, duration, y = 6, className }) {
  const still = useReducedMotion();
  const themeMotion = useThemeMotion();
  const items = Children.toArray(children);
  if (still) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} data-kf-motion="stagger"
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: stagger ?? themeMotion.duration / 4 } } }}>
      {items.map((child, index) => (
        <motion.div
          key={child.key ?? index}
          variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: duration ?? themeMotion.duration, ease: themeMotion.ease }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// re-exported so a page that genuinely needs a bespoke animation does not add its own dependency
export { motion, useReducedMotion };
