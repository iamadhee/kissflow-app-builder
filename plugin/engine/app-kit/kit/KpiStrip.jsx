// GENERATED from starter/src/components/kit/KpiStrip.jsx (sha256:af7367d49a4096a5). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import { SurfaceContext } from "./Surface.js";
import { StatTile } from "./StatTile.jsx";

/**
 * KpiStrip — the role's figures as ONE instrument with N dials: a single band under the page header,
 * a hairline between the figures, severity as a 3px rail and the ink of the figure, nothing else.
 *
 * Four cards in a row read as four things; a strip reads as one reading of the operation. Every
 * dashboard the kernel generated laid StatTiles out as cards because the kit had nothing else, and
 * the reviewer called the result a template (DESIGN_GENERIC). The strip is the alternative that
 * costs nothing: the same StatTile, rendered unframed inside a shared frame.
 *
 * `items` are StatTile props ({ label, value, unit, delta, tone, series, supportingText }); children
 * may be StatTiles too. Inside the strip every tile is FLAT — the strip owns the frame.
 *
 * <KpiStrip items={[{ label: "Yard occupancy", value: "68%", supportingText: "2,407 of 3,540 slots" },
 *                   { label: "Rehandle ratio", value: "30%", tone: "warning", supportingText: "3 unproductive of 10 moves" }]} />
 */
const RAIL = {
  danger: "shadow-[inset_3px_0_0_var(--danger-600)]",
  warning: "shadow-[inset_3px_0_0_var(--warning-600)]",
  success: "shadow-[inset_3px_0_0_var(--success-600)]",
  info: "shadow-[inset_3px_0_0_var(--info-600)]",
};

function KpiStrip({ items = [], children, className, ...rest }) {
  const ambient = React.useContext(SurfaceContext);
  const flat = React.useMemo(() => ({ ...(ambient || {}), material: "flat" }), [ambient]);
  const tiles = (Array.isArray(items) ? items : []).filter(Boolean);
  return (
    <SurfaceContext.Provider value={flat}>
      <div
        className={cx(
          "grid grid-flow-col auto-cols-fr overflow-hidden rounded-xl border border-solid border-layer-border bg-ctl-surface shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
          "divide-x divide-solid divide-layer-border",
          className
        )}
        role="group"
        aria-label="Key figures"
        data-kf-component="kpi-strip"
        {...rest}
      >
        {tiles.map((t, i) => (
          <div key={t.id ?? t.label ?? i} className={cx("min-w-0 px-4 py-3", RAIL[t.tone] || null)} data-kpi-cell>
            <StatTile compactVariant="minimal" {...t} bleed={false} />
          </div>
        ))}
        {React.Children.map(children, (child, i) => {
          if (!child) return null;
          // a tile inside the strip is a dial, not a card: the plainest compact form unless the caller chose one.
          // The theme's "split" recipe draws a tinted number panel that reads as a box inside a band.
          const tile = React.isValidElement(child) && child.type === StatTile && child.props.compactVariant == null
            ? React.cloneElement(child, { compactVariant: "minimal", bleed: false }) : child;
          return <div key={`c${i}`} className={cx("min-w-0 px-4 py-3", RAIL[child.props?.tone] || null)} data-kpi-cell>{tile}</div>;
        })}
      </div>
    </SurfaceContext.Provider>
  );
}

export { KpiStrip };
export default KpiStrip;
