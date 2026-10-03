/**
 * Keeps the in-iframe MemoryRouter and the parent Kissflow URL in sync:
 *  - seeds the router from the deep-link route the host opened us with,
 *  - applies host-driven route changes (parent back/forward/deep-link),
 *  - mirrors local navigation up to the parent URL.
 * Rendered once near the router root by <KfApp>. Loop-guarded so a host push
 * is never echoed back to the host.
 */
export declare function RouteSync(): null;
