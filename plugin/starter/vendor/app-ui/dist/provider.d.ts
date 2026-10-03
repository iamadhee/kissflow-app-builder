import type { KfSchema } from "./offline/schema";
import type { ReactNode } from "react";
interface KfProviderProps {
    children: ReactNode;
    /** Rendered while the SDK initializes. Defaults to null. */
    loader?: ReactNode;
    /** Rendered if the SDK fails to init AND no offline schema is available. */
    fallback?: ReactNode;
    /**
     * Synced app schema (`lib/kf-schema.json`). When provided AND the real SDK can't
     * initialize (i.e. running outside Kissflow in dev), the app boots against an
     * in-memory mock seeded from this schema, with a role switcher — so you can build
     * and test the whole UI without the Kissflow iframe.
     */
    devSchema?: KfSchema;
}
/**
 * Initializes the Kissflow SDK once and exposes it via context (and `window.kf`).
 * Inside Kissflow it uses the real SDK; outside (dev) it falls back to a mock built
 * from `devSchema`. Children render only once a `kf` (real or mock) is ready.
 */
export declare function KfProvider({ children, loader, fallback, devSchema }: KfProviderProps): import("react").JSX.Element;
export {};
