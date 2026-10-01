// GENERATED from starter/src/components/kit/ModelChart.jsx (sha256:8a97fe832f0977f9). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

import { Card } from "./Card.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Alert as Callout } from "./Alert.jsx";
import { Badge } from "./Badge.jsx";
import { useFlow, cellText, pickKey } from "./useFlow.js";

function NoAccess({ what = "this data" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Badge tone="neutral">Restricted</Badge>
      <p className="m-0 text-base font-semibold leading-snug text-ctl-fg">No access to {what}.</p>
      <p className="m-0 max-w-sm text-sm text-ctl-fg-muted">Your role does not include this.</p>
    </div>
  );
}

/**
 * ModelChart — a ranked breakdown that fetches its own rows, groups them, and owns its panel.
 *
 * REDESIGNED 2026-08-13 from ModelChart.dc.html (Claude Design project "Mobile app style guide
 * sheet", 2b8a920b-a786-4430-bd63-b0bc0dbe6229). Its own framing: "The only chart in the system
 * that brings its own surface — and the only one that has to be honest about what it is not
 * showing." Both halves of that sentence are load-bearing below: OWN PANEL, and the
 * rank → cap → declare contract that makes the cap honest.
 *
 * DATA-FETCHING MOVED TO useFlow.js. This file used to carry its own `fetchRows`/`pickGroupKey` —
 * a byte-for-byte duplicate of the logic FlowViews.jsx's SDK-bound components also needed, which
 * useFlow.js's own banner names as exactly why it was extracted ("duplicated in the first two
 * [ModelChart, DataTable], which is how the Process bug in the original Chart.jsx survived so
 * long — the fix lived in one copy"). This file is that consolidation happening: `useFlow` now
 * owns the fetch (blocked/loading/error/rows/columns/reload), `pickKey` owns the groupBy
 * auto-detect, `cellText` owns the {Name}/{value}/{_id} cell unwrap. Nothing about the Process
 * fallback chain (getAdminItems → getParticipatedItems → getMyItems → getItems, continuing past a
 * successful-but-EMPTY response rather than stopping at it) changed — it lives in useFlow.js now,
 * unmodified, and this file inherits any future fix to it for free.
 *
 * ONE SIDE EFFECT WORTH NAMING: grouping is now a separate `useMemo` over `state.rows` /
 * `state.columns`, decoupled from the fetch itself. The old file's own comment insisted "groupBy
 * IS in the deps" of its fetch effect, because fetching and grouping were the same function —
 * changing groupBy re-ran the network call just to recompute a local tally. That coupling is gone:
 * `useFlow` does not refetch on `groupBy`, and the memo below recomputes the tally from
 * already-fetched rows with no new SDK call. The GUARANTEE the old comment was protecting —
 * changing groupBy on a mounted chart never keeps a stale grouping — still holds, just for free
 * instead of by re-fetching.
 *
 * WHY NOT `<Gate/>` (FlowViews.jsx's exported shared state machine, which names ModelChart as its
 * own "next candidate"). Reused everywhere it actually fits — `useFlow`, `NoAccess`, `EmptyState`,
 * `Callout` are the same imports Gate itself uses — but not the Gate component wholesale, for four
 * reasons specific to this page's own spec:
 *   1. OWN PANEL. Gate is content-only — FlowTimeline/FlowBoard render inside whatever surface
 *      their caller supplies. ModelChart.dc.html's whole opening line is that this component
 *      brings its own (`--ctl-surface` · `shadow-sm`), in every state, with its own title.
 *   2. The loading skeleton is a different shape. Gate's `GateSkeleton` is a title+meta ROW
 *      (avatar circle + two text bars) — right for a timeline entry or a board card, wrong for a
 *      ranked bar: this page's own loading rows have to show label·track·value at descending
 *      widths, "the real row's anatomy... a block of equal bars would be cheaper and would tell
 *      you nothing about what is arriving."
 *   3. The error detail differs. Gate's error line is `CODE · resourceId · elapsed` — a good
 *      generic diagnostic, but this page's spec asks for the thing actually useful when a Process
 *      chart fails: which listing APIs were tried, in order.
 *   4. The empty CONDITION differs. Gate checks `!state.rows.length`; this component's empty
 *      condition is `!ranked.length` — the grouped/counted result, not the raw row count (the two
 *      only diverge when every row's groupBy value is nullish, which is rare, but the honest check
 *      is on what the chart is about to draw, not on what the fetch returned).
 *
 * OWN PANEL, verbatim: `--ctl-surface` fill, `shadow-sm` — unlike DataCharts.jsx's
 * primitives (BarChart, HBars, FunnelChart, …), which carry no surface of their own and expect a
 * caller-supplied Card. `Panel` below is Cards.jsx's own `Card`/`CardTitle`, role="list", not a
 * hand-rolled surface — Cards.jsx already draws exactly this fill+shadow+radius combination, so
 * re-declaring it here would be a second copy of a decision Cards.jsx already made. ModelChart
 * adds one 4px inset around Card's regular 20px content shell and one 4px body lead-in, giving
 * this dense chart an effective 24px panel inset and 20px title-to-chart separation without
 * changing Card spacing everywhere else.
 *
 * THE THREE ORDERING RULES — the actual point of this component, verified against the file this
 * replaces and found ALREADY CORRECT, not a bug this pass fixed:
 *   1. RANK — `ranked` sorts every group descending by value before anything else touches it.
 *   2. CAP — `rows` slices the top `cap` (default 8) OF THE RANKED LIST. Capping before sorting
 *      would make "top 8" mean "the first 8 groups in insertion order," and the longest bar on
 *      screen would not be the largest value.
 *   3. DECLARE — `max` is computed from `rows` (the rows actually shown), never from `ranked` (the
 *      full set). Scoping it to the visible set is what keeps every bar honestly proportioned even
 *      if the cap or the ranking ever changes; today, with rank running first, `rows[0]` already
 *      IS the overall max whenever there is data, so this is defence-in-depth, not a fix for a
 *      live bug.
 * The footer now ALWAYS renders in the ready state — "Top {cap} of {total} groups · {hidden} more
 * not shown" when something is hidden, "All {total} groups shown" when the cap covers everything.
 * The old file only rendered a footer in the first case, so a five-value status field got no
 * chrome at all; this page's spec wants the situation stated either way, not just when it is bad
 * news.
 *
 * `cap` is NEW — the hard-coded `CAP = 8` became a prop, default unchanged. Whatever it is, the
 * hidden count is stated in the footer; there is no cap value that renders silently.
 *
 * THE BAR FILL, restyled per ModelChart.dc.html's own token mapping. The old file cycled
 * `var(--chart-N-grad, var(--chart-N))` across every row by index — every language's full ramp,
 * one series colour per row. The new spec narrows this: only the LEADING (rank-0) row carries
 * colour, via `--gradient-data` (falling back to the flat `--chart-1` if a language ever declares
 * no gradient) — "the row at the series max," the same rule DataCharts' own HBars specimen now
 * documents for itself. Every row after it walks a de-emphasis INK scale instead of the chart
 * ramp: `--ctl-fg` → `--ctl-fg-soft` → `--ctl-fg-muted` → `--ctl-fg-subtle`, holding at the last
 * step for any further rows rather than continuing to `--ctl-border` — one step darker than
 * `--ctl-track`'s own fill, so it "stops before it disappears into the track" instead of
 * reaching a step that would.
 *
 * COLUMN WIDTHS. `min-w-20`/`max-w-28`/`min-w-5` are the SAME utilities HBars,
 * FunnelChart, StackedBar and ProgressBar already read — not re-declared as one-off arbitrary
 * values here even though ModelChart.dc.html's own prose gives literal pixel numbers (112px
 * label, ~34px value). `max-w-28` is exactly 112px on Tailwind's default spacing scale, which is
 * the tell that the source page is DESCRIBING the shared utility's current number, not asking for
 * a different one just for this file. `min-w-5` does not equal the prose's "~34px" as closely,
 * but the tilde there reads as an observed render width in the source mock
 * (three tabular-mono digits at whatever size lands once DataCharts.dc.html's own type token
 * exists), not a second number to fork into a one-file override — forking it would mean five
 * components sharing one bar row start disagreeing about how wide a value column is. Left as the
 * shared scale; revisit if DataCharts.dc.html explicitly retunes this column.
 *
 * Bars use Tailwind's direct `rounded-full` utility, matching the rest of the
 * component kit without introducing a component-specific radius token.
 * Tailwind's `h-2.5`/`gap-2` follow the active spacing scale for bar thickness and the
 * label-track-value column gap; `duration-200` controls movement. The vertical row rhythm
 * is deliberately one step roomier (`gap-4`, 16px), so ranked items scan as distinct entries
 * instead of collapsing into a dense stack.
 *
 * Tailwind preflight is OFF in this project (src/shadcn.css), so headings/paragraphs/lists below
 * reset their own UA margin — drop an `m-0` and a stray UA gap reads as a spacing bug.
 */

// Mirrors useFlow.js's own `attempts` constant inside `fetchRows` — DISPLAY ONLY. useFlow.js does
// not export which method names it actually tried (only the fetch, not the attempt list, is
// shared), so this is named again here purely to render the mono "Tried:" line below. If
// useFlow.js's own list ever changes, this is the line that goes stale.
const PROCESS_ATTEMPTS = ["getAdminItems", "getParticipatedItems", "getMyItems", "getItems"];

const MODEL_CHART_VARIANTS = new Set(["theme", "ranked-bars", "share-ledger"]);
const modelChartVariant = (value) => MODEL_CHART_VARIANTS.has(value) ? value : "theme";

// The de-emphasis ink walk. Index 0 (the leading/rank-0 row) never reads this — see `fillAt`.
const INK_STEPS = [
  "var(--ctl-fg)",
  "var(--ctl-fg-soft)",
  "var(--ctl-fg-muted)",
  "var(--ctl-fg-subtle)",
];

/** Row 0 gets the brand gradient; every row after it holds at the last ink step that still clears
 *  `--ctl-track`, rather than continuing on to `--ctl-border` and disappearing into it. */
function fillAt(i) {
  if (i === 0) return "var(--gradient-data, var(--chart-1))";
  return INK_STEPS[Math.min(i - 1, INK_STEPS.length - 1)];
}

/** ModelChart's own shell — see the file banner's "OWN PANEL". Every state below renders through
 *  this, including error, so the caller's `title` never disappears just because a fetch failed. */
function Panel({ title, children, variant = "theme", total }) {
  const resolvedVariant = modelChartVariant(variant);
  const totalLabel = total === 1 ? "1 item in all" : `${total} items in all`;
  return (
    <div
      className="w-full min-w-0"
      data-kf-component="model-chart"
      data-model-chart-variant={resolvedVariant}
    >
      <Card
        role="list"
        title={title}
        actions={total != null ? (
          <span
            className="whitespace-nowrap text-sm text-ctl-fg-muted"
            style={{ display: "var(--model-chart-total-display, none)" }}
            data-model-chart-total=""
          >
            {totalLabel}
          </span>
        ) : undefined}
        className="p-1"
        data-model-chart-panel=""
      >
        <div className="pt-1" data-model-chart-body="">
          {children}
        </div>
      </Card>
    </div>
  );
}

/** Loading — the real row's anatomy (label bar · track bar · value bar) at descending widths, not
 *  a block of equal bars. Descending widths are the one signal available before any real value has
 *  arrived that this is going to be a RANKED list. */
function LoadingRows() {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0" aria-hidden="true">
      {[86, 72, 59, 46, 34].map((w, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="min-w-20 max-w-28 h-3 animate-pulse rounded-sm bg-ctl-raise" style={{ animationDuration: "1.6s" }} />
          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ctl-track">
            <span
              className="absolute inset-y-0 left-0 animate-pulse rounded-full bg-ctl-raise"
              style={{ width: `${w}%`, animationDuration: "1.6s" }}
            />
          </span>
          <span className="min-w-5 h-3 animate-pulse rounded-sm bg-ctl-raise" style={{ animationDuration: "1.6s" }} />
        </li>
      ))}
    </ul>
  );
}

export function ModelChart({ title, flowType = "Form", flowId, groupBy, cap = 8, variant = "theme" }) {
  const state = useFlow(flowType, flowId);

  // The grouped/ranked tally. A pure transform of already-fetched rows — see the file banner on
  // why groupBy no longer needs to be a fetch dependency. RANK happens here, before cap or max.
  const ranked = useMemo(() => {
    const key = pickKey(groupBy, state.columns, state.rows[0]);
    const counts = {};
    for (const r of state.rows) {
      const k = String(cellText(r[key]));
      counts[k] = (counts[k] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.rows, state.columns, groupBy]);

  if (state.blocked) return <Panel title={title} variant={variant}><NoAccess /></Panel>;

  if (state.loading) return <Panel title={title} variant={variant}><LoadingRows /></Panel>;

  if (state.error) {
    const tried = flowType === "Process" ? PROCESS_ATTEMPTS : ["getItems"];
    return (
      <Panel title={title} variant={variant}>
        {/* Title stays generic and true for every flowType — FlowViews.jsx's Gate uses the same
            "Could not load" headline for the same reason: a hardcoded, flowType-specific title
            ("No listing API on this process") would be WRONG whenever the real cause is a genuine
            SDK/network error surfacing as `lastError` rather than the chain simply running dry
            (useFlow.js:59-60) — which is the common case, not the rare one. The real message is
            still shown in full below; the "Tried:" line adds what the message alone does not say:
            which APIs were attempted, in order. */}
        <Callout tone="danger" title="Could not load this chart">
          {state.error}
          <p className="m-0 mt-2 font-mono text-data tabular-nums opacity-75">
            Tried: {tried.join(", ")}
          </p>
        </Callout>
      </Panel>
    );
  }

  if (!ranked.length) {
    return (
      <Panel title={title} variant={variant}>
        <EmptyState
          icon={<BarChart3 />}
          title="No data for this chart yet"
          description="Every listing API answered, none had rows. That is an honest empty, not a failure."
        />
      </Panel>
    );
  }

  // CAP — top `cap` of the RANKED list, never cap-then-sort.
  const rows = ranked.slice(0, cap);
  // DECLARE — max comes from the rows actually shown, not the full ranked set.
  const max = Math.max(1, ...rows.map((d) => d.value));
  const hidden = ranked.length - rows.length;
  const total = ranked.reduce((sum, item) => sum + item.value, 0);
  const hiddenValue = ranked.slice(rows.length).reduce((sum, item) => sum + item.value, 0);
  const shareRows = hidden > 0
    ? [...rows, { label: `${hidden} ${hidden === 1 ? "group" : "groups"} not shown`, value: hiddenValue, hidden: true }]
    : rows;

  return (
    <Panel title={title} variant={variant} total={total}>
      <div
        className="min-w-0 flex-col"
        style={{ display: "var(--model-chart-ranked-display, flex)" }}
        data-model-chart-view="ranked-bars"
      >
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {rows.map((d, i) => (
            <li key={d.label} className="group flex items-center gap-2">
              <span className="min-w-20 max-w-28 truncate text-xs text-ctl-fg-muted" title={d.label}>
                {d.label}
              </span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ctl-track">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ease-standard group-hover:brightness-105"
                  style={{ width: `${(d.value / max) * 100}%`, background: fillAt(i) }}
                />
              </span>
              <span className="min-w-5 text-right font-mono text-data tabular-nums text-ctl-fg">
                {d.value}
              </span>
            </li>
          ))}
        </ul>
        {/* Always rendered in the ready state — said out loud either way, not only when something is
            hidden. See the file banner's "THE THREE ORDERING RULES" for why DECLARE is the point. */}
        <p className="m-0 mt-4 border-t border-ctl-raise pt-3 text-xs text-ctl-fg-muted">
          {hidden > 0 ? (
            <>
              Top <span className="font-mono tabular-nums text-ctl-fg">{cap}</span> of{" "}
              <span className="font-mono tabular-nums text-ctl-fg">{ranked.length}</span> groups ·{" "}
              <span className="font-mono tabular-nums text-ctl-fg">{hidden}</span> more not shown
            </>
          ) : (
            <>
              All <span className="font-mono tabular-nums text-ctl-fg">{ranked.length}</span> groups shown
            </>
          )}
        </p>
      </div>

      <div
        className="min-w-0 flex-col"
        style={{ display: "var(--model-chart-share-display, none)" }}
        data-model-chart-view="share-ledger"
      >
        <div className="overflow-x-auto">
          <ul className="m-0 grid min-w-[44rem] list-none gap-4 p-0">
            {shareRows.map((d, i) => {
              const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
              const fill = d.hidden
                ? "repeating-linear-gradient(120deg, var(--ctl-border) 0 0.4rem, transparent 0.4rem 0.75rem)"
                : i === 0
                  ? "var(--gradient-data, var(--chart-1))"
                  : "color-mix(in oklab, var(--chart-1) 45%, var(--ctl-track))";
              return (
                <li
                  key={d.label}
                  className="group grid min-h-8 grid-cols-[minmax(12rem,1.35fr)_minmax(16rem,1fr)_4.5rem_2.5rem] items-center gap-x-4"
                  data-model-chart-hidden-row={d.hidden ? "" : undefined}
                >
                  <span
                    className={`min-w-0 truncate text-sm ${d.hidden ? "italic text-ctl-fg-subtle" : "text-ctl-fg-muted"}`}
                    title={d.label}
                  >
                    {d.label}
                  </span>
                  <span className="relative h-2.5 overflow-hidden rounded-full bg-ctl-track">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ease-standard group-hover:brightness-105"
                      style={{ width: `${percent}%`, background: fill }}
                    />
                  </span>
                  <span className={`text-right font-mono text-sm font-semibold tabular-nums ${d.hidden ? "text-ctl-fg-subtle" : "text-ctl-fg"}`}>
                    {percent}%
                  </span>
                  <span className={`text-right font-mono text-sm tabular-nums ${d.hidden ? "text-ctl-fg-subtle" : "text-ctl-fg-muted"}`}>
                    {d.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="m-0 mt-5 border-t border-ctl-raise pt-4 text-sm text-ctl-fg-muted">
          Bars are share of all <span className="font-mono tabular-nums text-ctl-fg">{total}</span> items, so{" "}
          {hidden > 0 ? (
            <>the {rows.length} shown and the hidden {hidden === 1 ? "group" : "groups"} add to 100%</>
          ) : (
            <>all {rows.length} groups add to 100%</>
          )}
        </p>
      </div>
    </Panel>
  );
}
