import { createContext, useContext } from "react";
const DEFAULT = {
    active: false,
    mode: null,
    roleId: null,
    roleName: null,
    schema: null,
    canAccess: () => true,
};
export const KfDevContext = createContext(DEFAULT);
/**
 * Dev role state. Use `canAccess(modelId)` to gate UI by the simulated role:
 *
 *   const { active, roleName, canAccess } = useKfDev();
 *   if (active && !canAccess(FORM_ID)) return <NoAccess role={roleName} />;
 */
export function useKfDev() {
    return useContext(KfDevContext);
}
/** Build a `canAccess` checker from a schema + the active role id. */
export function makeCanAccess(schema, roleId) {
    return (modelId) => {
        if (!schema || !roleId)
            return true;
        const model = schema.dataModels.find((m) => m.id === modelId);
        // No access info synced → don't block (fail open).
        if (!model || !model.roleAccess || model.roleAccess.length === 0)
            return true;
        return model.roleAccess.some((r) => r.id === roleId);
    };
}
