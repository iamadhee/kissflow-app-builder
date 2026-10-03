import type { KfSchema } from "./schema";
/**
 * Dev-mode info for offline/live runs: the simulated role and a helper to check
 * whether that role can access a given model (from the synced `roleAccess`). Outside
 * dev mode (real Kissflow), `active` is false and `canAccess` returns true for all.
 */
export interface KfDevValue {
    active: boolean;
    mode: "offline" | "live" | null;
    roleId: string | null;
    roleName: string | null;
    schema: KfSchema | null;
    /** Can the active role use this model? Always true outside dev mode. */
    canAccess: (modelId: string) => boolean;
}
export declare const KfDevContext: import("react").Context<KfDevValue>;
/**
 * Dev role state. Use `canAccess(modelId)` to gate UI by the simulated role:
 *
 *   const { active, roleName, canAccess } = useKfDev();
 *   if (active && !canAccess(FORM_ID)) return <NoAccess role={roleName} />;
 */
export declare function useKfDev(): KfDevValue;
/** Build a `canAccess` checker from a schema + the active role id. */
export declare function makeCanAccess(schema: KfSchema | null, roleId: string | null): (modelId: string) => boolean;
