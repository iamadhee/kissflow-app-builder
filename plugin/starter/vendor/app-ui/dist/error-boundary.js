import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
export class KfErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        console.error("[kf] app crashed:", error, info.componentStack);
    }
    componentDidUpdate(previous) {
        if (this.state.error && previous.resetKey !== this.props.resetKey)
            this.setState({ error: null });
    }
    render() {
        const { error } = this.state;
        if (!error)
            return this.props.children;
        return (_jsxs("div", { "data-kf-render-error": String(error.message || error).slice(0, 300), style: { padding: 24, font: "14px/1.5 ui-sans-serif, system-ui, sans-serif", color: "#7f1d1d" }, children: [_jsx("h2", { style: { margin: "0 0 8px", fontSize: 16, fontWeight: 700 }, children: "This app hit an error and stopped rendering." }), _jsx("p", { style: { margin: "0 0 12px", color: "#991b1b" }, children: String(error.message || error) }), _jsx("pre", { style: { margin: 0, padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, overflowX: "auto", fontSize: 12, whiteSpace: "pre-wrap" }, children: String(error.stack || "").slice(0, 1500) })] }));
    }
}
