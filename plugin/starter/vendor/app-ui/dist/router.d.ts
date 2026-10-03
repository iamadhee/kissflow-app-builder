export { Link as KfLink } from "react-router-dom";
export interface KfRouter {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
    forward: () => void;
}
/**
 * Programmatic navigation inside a Kissflow App UI. Route changes are mirrored
 * to the parent Kissflow URL automatically by <RouteSync> — no SDK calls needed.
 */
export declare function useKfRouter(): KfRouter;
