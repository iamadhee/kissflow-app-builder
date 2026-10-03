import type { KfSchemaRole } from "./schema";
interface RoleSwitcherProps {
    roles: KfSchemaRole[];
    activeId: string | null;
    onChange: (roleId: string) => void;
    appId?: string;
    /** "offline" = mock data; "live" = real dev data via the proxy. */
    mode?: "offline" | "live";
}
export declare function RoleSwitcher({ roles, activeId, onChange, mode }: RoleSwitcherProps): import("react").JSX.Element;
export {};
