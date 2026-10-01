// GENERATED from starter/src/components/kit/StatusRibbon.jsx (sha256:c22d684fde4699a6). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import { Badge } from "./Badge.jsx";

/**
 * StatusRibbon — a status summary as a thin horizontal band: a label, then each state as a chip
 * WITH ITS COUNT, then one sentence about what to do with it.
 *
 * A STATUS IS A ROW, NEVER A STACK. Three chips centred one above the other in a full-width card
 * are a monument to nothing: no counts, no order, a screen of empty white around them. That was the
 * "Clinical status" panel on three clinical-trials pages, hand-drawn each time because the kit had
 * no instrument for it. The ribbon is that instrument. It never grows taller than one line of
 * chips; on a narrow screen it wraps, it does not stack.
 *
 * items: [{ id?, label, count (or value), tone?: "danger"|"warning"|"success"|"info"|"neutral", severity?: 1..4 }]
 * `note` is the reader's next move — "The critical item is 4 days into a 5-day clock" — not a caption.
 *
 * <StatusRibbon label="Containment" items={[{ label: "Critical", count: 1, tone: "danger" }, …]}
 *               note="The critical item is 4 days into a 5-working-day action clock." />
 */
const number = new Intl.NumberFormat("en-US");

function StatusRibbon({ label, items = [], note, className, ...rest }) {
  const list = (Array.isArray(items) ? items : []).filter((it) => it && it.label != null);
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-solid border-layer-border bg-ctl-surface px-4 py-2",
        className
      )}
      role="group"
      aria-label={label ? `${label} status` : "Status"}
      data-kf-component="status-ribbon"
      {...rest}
    >
      {label ? (
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ctl-fg-muted" data-kf-block="label">
          {label}
        </span>
      ) : null}
      {list.map((it, i) => {
        // `count` is the name; `value` is what a builder who has just computed one writes. Both are the number.
        const count = it.count ?? it.value;
        return (
          <span key={it.id ?? it.label ?? i} className="inline-flex items-center gap-2 text-sm text-ctl-fg-muted" data-ribbon-item>
            <Badge tone={it.tone || "neutral"} {...(it.severity ? { "data-kf-severity": it.severity } : {})}>{it.label}</Badge>
            {count != null ? (
              <span className="font-mono text-[13px] font-semibold tabular-nums text-ctl-fg" data-kf-block="figure">
                {typeof count === "number" ? number.format(count) : count}
              </span>
            ) : null}
          </span>
        );
      })}
      {note ? <span className="ml-auto text-xs text-ctl-fg-muted" data-kf-block="meta">{note}</span> : null}
    </div>
  );
}

export { StatusRibbon };
export default StatusRibbon;
