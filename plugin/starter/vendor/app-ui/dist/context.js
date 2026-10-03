import { createContext } from "react";
export const KfContext = createContext({
    kf: null,
    ready: false,
    error: false,
});
