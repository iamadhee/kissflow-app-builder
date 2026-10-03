import { useNavigate } from "react-router-dom";
export { Link as KfLink } from "react-router-dom";
/**
 * Programmatic navigation inside a Kissflow App UI. Route changes are mirrored
 * to the parent Kissflow URL automatically by <RouteSync> — no SDK calls needed.
 */
export function useKfRouter() {
    const navigate = useNavigate();
    return {
        push: (path) => navigate(path),
        replace: (path) => navigate(path, { replace: true }),
        back: () => navigate(-1),
        forward: () => navigate(1),
    };
}
