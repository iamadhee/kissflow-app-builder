import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
/**
 * Catches render/effect errors anywhere below it and SHOWS them.
 *
 * Without a boundary, React unmounts the entire tree on an uncaught error, so the app renders as a
 * blank frame. Inside the Kissflow iframe that is close to undiagnosable: the frame is cross-origin
 * from the host page, so its console is not reachable from the outside, and a blank app looks
 * exactly like one that is still loading. That cost a full debugging cycle on a one-line crash
 * (`kf.app.page.getRoute()` where the host exposes no page context).
 *
 * A visible message costs nothing when everything works and turns "it's blank" into a stack trace.
 */
interface Props {
    children: ReactNode;
    resetKey?: string;
}
interface State {
    error: Error | null;
}
export declare class KfErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    componentDidUpdate(previous: Props): void;
    render(): string | number | boolean | Iterable<ReactNode> | import("react").JSX.Element | null | undefined;
}
export {};
