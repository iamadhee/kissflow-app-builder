// GENERATED from starter/src/components/kit/Queue.jsx (sha256:e3c6ee49441de494). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
/**
 * ApprovalRow · ApprovalQueue · WipStrip — an inbox row that carries its own
 * decision, the list around it, and the per-stage counter band above it.
 *
 * Click lives on the title rather than the row, so the decision buttons never
 * sit inside a competing click target. A decided row stays in place, becomes
 * quieter, and swaps its actions for a stable outcome badge. Identity remains
 * textual; the queue does not infer an avatar from owner or contact fields.
 */
import { Check, ChevronRight, X } from "lucide-react";

import { Button } from "./Button.jsx";
import { Badge } from "./Badge.jsx";
import { semanticToneToken } from "./semanticTone.js";
import { cn as cx } from "./cn.js";

const badgeTone = (tone) => tone === "pending" ? "warning" : ["neutral", "accent", "success", "warning", "info", "danger"].includes(tone) ? tone : "neutral";

const OUTCOME = {
  approved: { tone: "success", label: "Approved", Icon: Check },
  rejected: { tone: "danger", label: "Rejected", Icon: X },
};

const QUEUE_VARIANTS = new Set(["theme", "status-row", "age-ledger", "narrative", "column-ledger", "summary-first"]);
const queueVariant = (value) => QUEUE_VARIANTS.has(value) ? value : "theme";

function ToneBadge({ tone, children, className = "", style, ...rest }) {
  return (
    <span
      {...rest}
      className={cx("items-center rounded-full px-3 py-1 text-xs font-semibold leading-none", className)}
      style={{ color: semanticToneToken(tone, "text"), background: semanticToneToken(tone, "bg"), ...style }}
    >
      {children}
    </span>
  );
}

export function ApprovalRow({
  title,
  meta,
  description,
  severity,
  tone = "neutral",
  status,
  state,
  age,
  ageValue,
  ageLabel,
  onApprove,
  onReject,
  onOpen,
  decided,
  variant = "theme",
  actionLabels = { approve: "Approve", reject: "Reject" },
  className = "",
  ...rest
}) {
  // several meta values ("$6,200.00", "Sofia Alvarez", "In Progress") are one line separated by
  // middle dots; run together they read as one broken word
  const metaLine = Array.isArray(meta)
    ? meta.filter((m) => m != null && m !== false && m !== "").flatMap((m, i) => (i ? [<span key={`sep-${i}`}> · </span>, m] : [m]))
    : meta;
  // data-* attributes pass through to the row's root: a data surface carries the locators the
  // rendered check (and any test) uses to find rows. Nothing else in `rest` is forwarded.
  const locators = Object.fromEntries(Object.entries(rest).filter(([key]) => key.startsWith("data-")));
  const outcome = OUTCOME[decided];
  const hasActions = Boolean(onApprove || onReject);
  const chip = severity || status;
  const stateLabel = state || (!severity ? status : undefined);
  const ageMetric = ageValue || age;
  const toneVars = {
    "--approval-queue-tone-base": semanticToneToken(tone, "base"),
    "--approval-queue-tone-bg": semanticToneToken(tone, "bg"),
    "--approval-queue-tone-text": semanticToneToken(tone, "text"),
  };

  const titleNode = onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      className="m-0 rounded-sm border-0 bg-transparent p-0 text-left text-sm font-semibold leading-snug text-ctl-fg cursor-pointer outline-none hover:underline focus-visible:ring-[length:var(--ring-ctl)] focus-visible:ring-brand-ring"
    >
      {title}
    </button>
  ) : (
    <span className="text-sm font-semibold leading-snug text-ctl-fg">{title}</span>
  );

  return (
    <div
      {...locators}
      className={cx(
        "grid border-0 border-t border-solid border-ctl-border first:border-t-0",
        outcome && "opacity-60",
        className
      )}
      data-kf-component="approval-row"
      data-approval-queue-row=""
      data-approval-queue-variant={queueVariant(variant)}
      data-decided={decided || undefined}
      style={{
        ...toneVars,
        gridTemplateColumns: "var(--approval-queue-row-columns)",
        gridTemplateAreas: "var(--approval-queue-row-areas)",
        alignItems: "var(--approval-queue-row-align)",
        columnGap: "var(--approval-queue-row-gap)",
        padding: "var(--approval-queue-row-padding)",
      }}
    >
      <span
        aria-hidden="true"
        data-approval-queue-marker=""
        style={{
          gridArea: "marker",
          display: "var(--approval-queue-marker-display)",
          width: "var(--approval-queue-marker-width)",
          height: "var(--approval-queue-marker-height)",
          borderRadius: "var(--approval-queue-marker-radius)",
          boxShadow: "var(--approval-queue-marker-shadow)",
          background: "var(--approval-queue-tone-base)",
        }}
      />

      {ageMetric ? (
        <div
          data-approval-queue-age=""
          className="flex-col items-start justify-center font-data-emphasis tabular-nums"
          style={{ gridArea: "age", display: "var(--approval-queue-age-display)", color: "var(--approval-queue-tone-text)" }}
        >
          <span className="text-3xl font-semibold leading-none">{ageMetric}</span>
          <span
            className="mt-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[.12em]"
            style={{ display: "var(--approval-queue-age-label-display)" }}
          >
            {ageLabel || severity || status}
          </span>
        </div>
      ) : null}

      <div className="min-w-0" style={{ gridArea: "main" }}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          {severity ? (
            <span
              data-approval-queue-inline-severity=""
              className="font-mono text-xs font-semibold uppercase tracking-[.12em]"
              style={{ display: "var(--approval-queue-inline-severity-display)", color: "var(--approval-queue-tone-text)" }}
            >
              {severity}
            </span>
          ) : null}
          {titleNode}
        </div>
        {description ? (
          <p
            data-approval-queue-description=""
            className="m-0 mt-2 text-sm leading-relaxed text-ctl-fg"
            /* a description the PAGE supplies is data (a claim's category, amount, receipt) and shows in
               every theme; the theme variable only decides whether the row's optional summary line appears */
            style={{ display: typeof description === "string" ? "var(--approval-queue-description-display)" : "block" }}
          >
            {description}
          </p>
        ) : null}
        {meta || state || ageMetric ? (
          <p className="m-0 mt-2 text-xs leading-relaxed tabular-nums text-ctl-fg-muted">
            {severity ? (
              <span data-approval-queue-meta-severity="" style={{ display: "var(--approval-queue-meta-severity-display)" }}>{severity} · </span>
            ) : null}
            {metaLine}
            {state ? <span data-approval-queue-inline-state="" style={{ display: "var(--approval-queue-inline-state-display)" }}>{meta ? " · " : ""}{state}</span> : null}
            {ageMetric ? <span data-approval-queue-inline-age="" style={{ display: "var(--approval-queue-inline-age-display)" }}>{meta || state ? " · " : ""}{ageMetric}</span> : null}
          </p>
        ) : null}
      </div>

      {chip && !outcome ? (
        <ToneBadge
          tone={badgeTone(tone)}
          data-approval-queue-chip=""
          className="justify-self-end"
          style={{ gridArea: "chip", display: "var(--approval-queue-chip-display)" }}
        >
          {chip}
        </ToneBadge>
      ) : null}

      {stateLabel ? (
        <span
          data-approval-queue-state=""
          className="text-sm text-ctl-fg-muted"
          style={{ gridArea: "state", display: "var(--approval-queue-state-display)" }}
        >
          {stateLabel}
        </span>
      ) : null}

      <div data-approval-queue-actions="" className="flex flex-none items-center gap-3 justify-self-end" style={{ gridArea: "actions" }}>
        {outcome ? (
          <Badge tone={outcome.tone} size="sm" className="w-fit flex-none">
            <outcome.Icon size={12} aria-hidden="true" />
            {outcome.label}
          </Badge>
        ) : hasActions ? (
          <>
          {onReject ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReject}
              data-cx-action="reject"
              className="enabled:hover:!border-danger-600 enabled:hover:!bg-danger-100 enabled:hover:!text-danger-text"
            >
              {actionLabels.reject}
            </Button>
          ) : null}
          {onApprove ? (
            <Button variant="primary" size="sm" onClick={onApprove} data-cx-action="approve">
              {actionLabels.approve}
            </Button>
          ) : null}
          </>
        ) : onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            data-cx-action="open"
            data-approval-queue-arrow=""
            aria-label={`Open ${title}`}
            className="items-center justify-center rounded-full border-0 bg-transparent p-1 text-ctl-fg-muted cursor-pointer hover:bg-ctl-track hover:text-ctl-fg focus-visible:outline-none focus-visible:ring-[length:var(--ring-ctl)] focus-visible:ring-brand-ring"
            style={{ display: "var(--approval-queue-arrow-display)" }}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ApprovalQueue({
  items = [],
  empty = "Nothing waiting on you.",
  title,
  description,
  countLabel,
  summary = [],
  variant = "theme",
  className = "",
  ...row
}) {
  // a page may hand summary a single object, a string or nothing: never crash the queue over it
  summary = Array.isArray(summary) ? summary : summary && typeof summary === "object" ? [summary] : [];
  items = Array.isArray(items) ? items : [];
  const hasHeader = Boolean(title || description || countLabel);
  const resolvedVariant = queueVariant(variant);
  return (
    <div
      className={cx("flex min-w-0 flex-col", className)}
      data-kf-component="approval-queue"
      data-approval-queue-variant={resolvedVariant}
    >
      {hasHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
          <div className="min-w-0">
            {title ? <h3 className="m-0 font-display text-lg font-semibold text-ctl-fg">{title}</h3> : null}
            {description ? <p className="m-0 mt-1 text-sm text-ctl-fg-muted">{description}</p> : null}
          </div>
          {countLabel ? <ToneBadge tone="danger" className="inline-flex text-sm">{countLabel}</ToneBadge> : null}
        </div>
      ) : null}

      {summary.length ? (
        <div
          data-approval-queue-summary=""
          className="grid-cols-1 gap-3 border-0 border-b border-solid border-ctl-border pb-5 sm:grid-cols-3"
          style={{ display: "var(--approval-queue-summary-display)" }}
        >
          {summary.slice(0, 3).map((item, index) => (
            <div
              key={item.id ?? item.label ?? index}
              className="rounded-[var(--radius-nested)] px-4 py-4"
              style={{ color: semanticToneToken(item.tone, "text"), background: semanticToneToken(item.tone, "bg") }}
            >
              <p className="m-0 font-data-emphasis text-2xl font-semibold leading-none tabular-nums">{item.value}</p>
              <p className="m-0 mt-2 text-xs font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div
        data-approval-queue-columns=""
        className="grid-cols-[0.375rem_minmax(0,1fr)_minmax(8rem,0.34fr)_4.5rem_auto] gap-x-5 border-0 border-b border-solid border-ctl-border px-0 py-3 font-mono text-[length:var(--text-2xs)] font-semibold uppercase tracking-[.12em] text-ctl-fg-muted"
        style={{ display: "var(--approval-queue-columns-display)" }}
      >
        <span aria-hidden="true" />
        <span>Request</span>
        <span>Status</span>
        {items.some((it) => it && (it.age != null || it.ageValue != null || it.ageLabel != null)) ? <span className="text-right">Age</span> : <span aria-hidden="true" />}
        <span aria-hidden="true" />
      </div>

      {items.length ? (
        <div className={cx("flex flex-col", (hasHeader || summary.length) && "border-0 border-t border-solid border-ctl-border")}>
          {items.map((it, i) => (
            <ApprovalRow
              key={it.id ?? i}
              data-cx-row={it["data-cx-row"] ?? it.id ?? String(i)}
              {...it}
              variant={resolvedVariant}
              onApprove={row.onApprove && (() => row.onApprove(it))}
              onReject={row.onReject && (() => row.onReject(it))}
              onOpen={row.onOpen && (() => row.onOpen(it))}
              actionLabels={row.actionLabels}
            />
          ))}
        </div>
      ) : (
        <p className="m-0 py-10 text-center text-sm text-ctl-fg-muted">{empty}</p>
      )}
    </div>
  );
}

function stageDot(tone) {
  if (tone === "danger") return "var(--danger-600)";
  if (tone === "pending") return "var(--warning-600)";
  if (!tone || tone === "neutral") return "var(--ctl-fg-muted)";
  return semanticToneToken(tone, 'base', 'var(--ctl-fg-muted)');
}

const WIP_STRIP_VARIANTS = new Set(["theme", "capacity-rails", "limit-ledger"]);
const wipStripVariant = (value) => WIP_STRIP_VARIANTS.has(value) ? value : "capacity-rails";

function normalizeWipStages(stages) {
  return stages.map((stage, index) => {
    const count = Math.max(0, Number(stage.count) || 0);
    const hasCap = stage.cap != null && Number.isFinite(Number(stage.cap));
    const cap = hasCap ? Math.max(0, Number(stage.cap)) : null;
    const overCap = hasCap && count > cap;
    const pct = hasCap && cap > 0 ? Math.min(100, count / cap * 100) : count > 0 ? 100 : 0;
    const indicatorColor = overCap ? "var(--danger-600)" : stageDot(stage.tone);
    return {
      ...stage,
      key: stage.key ?? stage.label ?? index,
      label: String(stage.label ?? `Stage ${index + 1}`),
      count,
      cap,
      hasCap,
      overCap,
      pct,
      indicatorColor,
    };
  });
}

function CapacityRails({ stages, explicit }) {
  return (
    <div
      className="overflow-x-auto"
      data-wip-strip-view="capacity-rails"
      style={{ display: `var(--wip-strip-capacity-display, ${explicit ? "flex" : "none"})` }}
    >
      {stages.map((stage, i) => (
        <div
          key={stage.key}
          className={cx(
            "min-w-36 flex-1 px-5 py-5",
            i > 0 && "border-0 border-l border-solid border-ctl-border"
          )}
        >
          <p className="m-0 flex items-center gap-2 truncate text-sm font-normal text-ctl-fg-muted">
            <span
              className="w-1.5 h-1.5 flex-none rounded-full"
              style={{ background: stage.indicatorColor }}
              aria-hidden="true"
            />
            {stage.label}
          </p>
          <p
            className="m-0 mt-3 font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums"
            style={{ color: stage.overCap ? "var(--danger-text)" : "var(--ctl-fg)" }}
          >
            {stage.overCap ? `${stage.count}/${stage.cap}` : stage.count}
          </p>
          <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-ctl-track" aria-hidden="true">
            <span
              className="block h-full rounded-full transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
              style={{ width: `${stage.pct}%`, background: stage.indicatorColor }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function LimitLedger({ stages, explicit }) {
  return (
    <div
      className="overflow-x-auto"
      data-wip-strip-view="limit-ledger"
      style={{ display: `var(--wip-strip-limit-display, ${explicit ? "flex" : "none"})` }}
    >
      {stages.map((stage, i) => (
        <div
          key={stage.key}
          className={cx(
            "min-w-40 flex-1 px-5 py-5",
            i > 0 && "border-0 border-l border-solid border-ctl-border"
          )}
        >
          <p className="m-0 flex items-center gap-2 truncate text-sm font-normal text-ctl-fg-muted">
            <span
              className="h-1.5 w-1.5 flex-none rounded-full"
              style={{ background: stage.indicatorColor }}
              aria-hidden="true"
            />
            {stage.label}
          </p>
          <p className="m-0 mt-3 flex items-baseline gap-2 font-data-emphasis tabular-nums" style={{ color: stage.indicatorColor }}>
            <span className="text-[36px] font-medium leading-none tracking-[-.035em]">{stage.count}</span>
            {stage.hasCap ? <span className="text-lg font-medium leading-none">of {stage.cap}</span> : null}
          </p>
          {stage.hasCap ? (
            <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-ctl-track" aria-hidden="true">
              <span
                className="block h-full rounded-full transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
                style={{ width: `${stage.pct}%`, background: stage.indicatorColor }}
              />
            </span>
          ) : (
            <p className="m-0 mt-3 text-sm text-ctl-fg-subtle">no limit</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function WipStrip({ stages = [], className = "", variant = "capacity-rails" }) {
  if (!stages.length) return null;
  const resolvedVariant = wipStripVariant(variant);
  const normalized = normalizeWipStages(stages);
  const themeSelected = resolvedVariant === "theme";

  return (
    <div
      className={cx("w-full overflow-hidden rounded-xl bg-material-surface", className)}
      data-kf-component="wip-strip"
      data-wip-strip-variant={resolvedVariant}
    >
      {(themeSelected || resolvedVariant === "capacity-rails") && <CapacityRails stages={normalized} explicit={!themeSelected} />}
      {(themeSelected || resolvedVariant === "limit-ledger") && <LimitLedger stages={normalized} explicit={!themeSelected} />}
    </div>
  );
}

export default ApprovalQueue;
