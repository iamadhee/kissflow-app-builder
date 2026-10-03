import type { KfInstance } from "./context";
/** Returns the initialized Kissflow SDK instance. Throws if used before ready. */
export declare function useKf(): KfInstance;
/** Whether the SDK has finished initializing. */
export declare function useKfReady(): boolean;
