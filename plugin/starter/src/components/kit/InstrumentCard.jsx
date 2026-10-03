import React from "react";
import { cn as cx } from "./cn.js";
import { Button } from "./Button.jsx";

/**
 * InstrumentCard · InstrumentGrid — a record read as a gauge.
 *
 * A reefer, a furnace, a cold store, a patient's vitals, a tank level: one measured value that a
 * person compares against a setpoint and a threshold, then acts on. A table row loses it; a stat
 * tile has no setpoint and no action. The card puts, in reading order:
 *
 *   the identity line in mono (where it is · which sensor)
 *   the MEASURED VALUE, large, with its unit
 *   the setpoint and the class of thing ("Setpoint −18°C · Frozen seafood")
 *   the deviation, in severity ink, only when there is one
 *   when it was last read, or an "overdue" chip when the read is late
 *   the record's own id
 *   and — ONLY in alert — the one action. An "Escalate" on a healthy cell is noise.
 *
 * `state`: "ok" (default) | "alert" | "warn" | "overdue". In alert the frame, wash and ink change; the
 * action appears. The caller supplies `action: { label, onClick }`; the card decides when to show it.
 *
 * <InstrumentCard id="C·02·R02·T2" sensor="Sensor C-02-R02t3" value="−14.6" unit="°C"
 *   setpoint="Setpoint −20°C · Frozen meat" deviation="5.4°C over the 3°C threshold"
 *   lastRead="17 min ago" recordId="MAEU7720011" state="alert" action={{ label: "Escalate", onClick }} />
 */
const STATES = {
  ok: { frame: "border-layer-border bg-ctl-surface", value: "text-ctl-fg", dev: "text-ctl-fg-muted" },
  warn: { frame: "border-warning-600 bg-warning-100", value: "text-warning-text", dev: "text-warning-text" },
  alert: { frame: "border-danger-600 bg-danger-100 ring-1 ring-danger-600", value: "text-danger-text", dev: "text-danger-text" },
  overdue: { frame: "border-layer-border bg-ctl-surface", value: "text-ctl-fg", dev: "text-ctl-fg-muted" },
};

function InstrumentCard({
  id,
  sensor,
  value,
  unit,
  setpoint,
  deviation,
  lastRead,
  overdue,
  recordId,
  state = "ok",
  action,
  className,
  ...rest
}) {
  const s = STATES[state] || STATES.ok;
  const showAction = action && (state === "alert" || state === "warn") && typeof action.onClick === "function";
  return (
    <article
      className={cx("flex min-w-0 flex-col gap-2 rounded-xl border border-solid p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)]", s.frame, className)}
      data-kf-component="instrument-card"
      data-state={state}
      {...rest}
    >
      {(id || sensor) && (
        <div className="flex justify-between gap-3 font-mono text-[11.5px] text-ctl-fg-muted">
          <span className="truncate">{id}</span>
          {sensor ? <span className="truncate">{sensor}</span> : null}
        </div>
      )}
      <div className={cx("mt-1 font-mono text-[2.375rem] font-semibold leading-none tracking-[-0.03em] tabular-nums", s.value)} data-kf-block="figure">
        {value}
        {unit ? <span className="text-[1.5rem] font-medium">{unit}</span> : null}
      </div>
      {setpoint ? <div className="text-[12.5px] text-ctl-fg">{setpoint}</div> : null}
      {deviation ? <div className={cx("text-[12.5px] font-semibold", s.dev)}>{deviation}</div> : null}
      {overdue ? (
        <span className="inline-flex self-start rounded-full bg-warning-100 px-2 py-1 text-xs font-semibold text-warning-text" data-kf-block="badge">
          {overdue}
        </span>
      ) : lastRead ? (
        <div className="text-xs text-ctl-fg-muted">{lastRead}</div>
      ) : null}
      {recordId ? <div className="mt-1 font-mono text-xs text-ctl-fg">{recordId}</div> : null}
      {showAction ? (
        <Button variant={state === "alert" ? "danger" : "primary"} className="mt-2 w-full" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </article>
  );
}

/** The grid the cards sit in: as many across as fit at 17.5rem, never a single stretched card. */
function InstrumentGrid({ children, className, ...rest }) {
  return (
    <div className={cx("grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(17.5rem,1fr))]", className)} data-kf-component="instrument-grid" {...rest}>
      {children}
    </div>
  );
}

export { InstrumentCard, InstrumentGrid };
export default InstrumentCard;
