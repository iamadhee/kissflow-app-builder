// GENERATED from starter/src/components/kit/Timeline.jsx (sha256:9ea27e5d1bdbcdc8). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { semanticToneToken } from "./semanticTone.js";
import { cn as cx } from "./cn.js";

/**
 * Timeline — the presentational half of FlowTimeline.
 *
 * Every event keeps one semantic contract while the active theme chooses one
 * of four reading patterns: continuous rail, dated rail, grouped dates, or
 * ledger rows. FlowViews.jsx composes this component after loading an SDK flow;
 * Activity History and ExpressPage use it directly with already-shaped events.
 *
 * Event shape:
 *   { id, title, description?, meta?, date?, time?, tone?, icon?, children? }
 */

// The continuous-rail recipe is the original Timeline treatment. Keep its
// authored structure intact so adding theme-owned views never turns the legacy
// activity feed into a look-alike with different spacing or type hierarchy.
//
// One deliberate deviation from that original: the row carries ml-5 pl-3, so the
// rail is CONTAINED inside the list rather than hanging in the surrounding
// surface's left inset. That reverses the older "event text stays flush with the
// Card/Drawer header" rule — text is now inset 32px, the rail 4px. Changed on
// purpose, not drift; kit-sync.test.mjs pins the new geometry.
const MARKS = {
  neutral: "bg-ctl-surface border-field-border text-ctl-fg-muted",
  accent: "bg-brand-600 border-brand-600 text-brand-fg",
  success: "bg-success-600 border-success-600 text-brand-fg",
  warning: "bg-warning-700 border-warning-700 text-brand-fg",
  info: "bg-info-600 border-info-600 text-brand-fg",
  danger: "bg-danger-600 border-danger-600 text-danger-fg",
};

const VARIANTS = new Set(["theme", "continuous-rail", "date-rail", "grouped-dates", "ledger-rows"]);
const variantName = (value) => VARIANTS.has(value) ? value : "theme";

function toneColor(tone) {
  if (tone === "danger") return "var(--danger-600)";
  if (tone === "accent") return "var(--brand-600)";
  if (tone && tone !== "neutral") return semanticToneToken(tone, "base", "var(--ctl-fg-muted)");
  return "var(--ctl-fg-muted)";
}

function dateParts(item) {
  const raw = item.date ?? item.meta;
  const rawText = String(raw ?? "").trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawText);
  const parsed = raw instanceof Date
    ? raw
    : dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(raw);
  const valid = Number.isFinite(parsed.getTime());
  const includesTime = item.time != null
    || raw instanceof Date
    || /[T ]\d{1,2}:\d{2}/.test(rawText);

  if (!valid) {
    const fallback = String(item.meta ?? item.date ?? "Undated");
    return { key: fallback, date: fallback, time: String(item.time ?? ""), full: fallback };
  }

  const date = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = item.time != null
    ? String(item.time)
    : includesTime
      ? parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "";
  return {
    key: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`,
    date,
    time,
    full: String(item.meta ?? [date, time].filter(Boolean).join(", ")),
  };
}

function ContinuousRail({ items, size, onItemClick }) {
  const dot = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  const marked = size === "sm" ? "w-6 h-6" : "w-7 h-7";

  return (
    <ol
      data-flow-timeline-view="continuous-rail"
      className="m-0 flex w-full list-none flex-col p-0"
      style={{ display: "var(--flow-timeline-continuous-display, none)" }}
    >
      {items.map((item, index) => {
        const first = index === 0;
        const last = index === items.length - 1;
        const hasIcon = Boolean(item.icon);
        const railCenter = 'top-[calc(var(--text-sm)*0.6875)]';
        const railToCenter = 'h-[calc(var(--text-sm)*0.6875)]';
        const interactive = onItemClick ? {
          role: "button",
          tabIndex: 0,
          onClick: () => onItemClick(item),
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onItemClick(item);
            }
          },
        } : {};

        return (
          <li
            key={item.id}
            data-flow-timeline-event=""
            data-tone={item.tone}
            className={cx(
              /* ml-5 pulls the row right so the rail and its dots — drawn at -left-2.5,
                 i.e. 16px outside this li once the dot's own -translate-x-1/2 is counted —
                 sit INSIDE the list rather than hanging into the surrounding surface's
                 padding. pl-3 then holds the content clear of that rail. */
              'relative ml-5 flex gap-4 pl-3',
              last ? 'pb-0' : 'pb-5',
              onItemClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
            )}
            {...interactive}
          >
            {!first ? (
              <span
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute -left-2.5 top-0 border-0 border-l border-solid border-layer-border",
                  railToCenter
                )}
              />
            ) : null}
            {!last ? (
              <span
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute -left-2.5 bottom-0 border-0 border-l border-solid border-layer-border",
                  railCenter
                )}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cx(
                "absolute -left-2.5 -translate-x-1/2 -translate-y-1/2 grid place-items-center shrink-0 rounded-full border border-solid",
                railCenter,
                hasIcon ? marked : dot,
                MARKS[item.tone] || MARKS.neutral
              )}
            >
              {hasIcon ? item.icon : null}
            </span>

            {/* gap-2, not gap-1: this list puts pb-5 (20px) between events, so a 4px inner
                gap made each event read as one dense clump in a void. Same within-vs-between
                ratio the theme recipes now use via --flow-timeline-content-gap. */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <span className="text-sm font-medium leading-snug text-ctl-fg text-pretty">{item.title}</span>
                {item.meta ? <span className="shrink-0 text-sm leading-snug text-ctl-fg-muted tabular-nums">{item.meta}</span> : null}
              </div>
              {item.description ? <span className="text-sm leading-relaxed text-ctl-fg-muted text-pretty">{item.description}</span> : null}
              {item.children ? (
                <div style={{ paddingTop: "var(--flow-timeline-children-gap, 0.75rem)" }}>{item.children}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Timeline({ items = [], size = "md", variant = "theme", onItemClick, className }) {
  const events = (Array.isArray(items) ? items : []).map((item, index) => ({
    ...item,
    id: item?.id ?? `${item?.title || "event"}-${index}`,
    title: String(item?.title ?? "Untitled event"),
    tone: item?.tone || "neutral",
    chronology: dateParts(item || {}),
  }));
  const counts = new Map();
  for (const event of events) counts.set(event.chronology.key, (counts.get(event.chronology.key) || 0) + 1);

  if (!events.length) {
    return (
      <div
        className={cx("grid min-h-32 place-items-center text-sm text-ctl-fg-muted", className)}
        data-kf-component="flow-timeline"
        data-flow-timeline-variant={variantName(variant)}
      >
        No events.
      </div>
    );
  }

  return (
    <div
      className={cx("min-w-0", className)}
      style={{
        "--flow-timeline-title-size": size === "sm" ? "var(--text-sm)" : undefined,
        "--flow-timeline-description-size": size === "sm" ? "var(--text-xs-plus)" : undefined,
      }}
      data-kf-component="flow-timeline"
      data-flow-timeline-variant={variantName(variant)}
    >
      <ContinuousRail items={events} size={size} onItemClick={onItemClick} />
      <ol
        data-flow-timeline-view="theme-recipes"
        className="m-0 min-w-0 list-none flex-col p-0"
        style={{
          display: "var(--flow-timeline-recipe-display, flex)",
          gap: "var(--flow-timeline-list-gap, 0px)",
        }}
        aria-label={`${events.length} timeline event${events.length === 1 ? "" : "s"}`}
      >
      {events.map((item, index) => {
        const first = index === 0;
        const last = index === events.length - 1;
        const startsGroup = first || events[index - 1].chronology.key !== item.chronology.key;
        const markerColor = toneColor(item.tone);
        const hasIcon = Boolean(item.icon);

        return (
          <React.Fragment key={item.id}>
            {startsGroup ? (
              <li
                data-flow-timeline-group=""
                className="items-center gap-4"
                style={{
                  display: "var(--flow-timeline-group-display, none)",
                  gridTemplateColumns: "max-content minmax(1rem, 1fr) max-content",
                  marginTop: first ? "0px" : "var(--flow-timeline-group-margin-top, 0px)",
                  marginBottom: "var(--flow-timeline-group-margin-bottom, 0px)",
                }}
              >
                <span className="font-mono text-sm font-semibold uppercase tracking-[.12em] text-ctl-fg-muted">
                  {item.chronology.date}
                </span>
                <span aria-hidden="true" className="h-px bg-ctl-track" />
                <span className="text-sm tabular-nums text-ctl-fg-muted">
                  {counts.get(item.chronology.key)} event{counts.get(item.chronology.key) === 1 ? "" : "s"}
                </span>
              </li>
            ) : null}

            <li
              data-flow-timeline-event=""
              data-tone={item.tone}
              className={cx("relative grid min-w-0", onItemClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring")}
              role={onItemClick ? "button" : undefined}
              tabIndex={onItemClick ? 0 : undefined}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
              onKeyDown={onItemClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onItemClick(item);
                }
              } : undefined}
              style={{
                gridTemplateColumns: "var(--flow-timeline-row-columns, 1.25rem minmax(0, 1fr))",
                gridTemplateAreas: "var(--flow-timeline-row-areas, 'marker content')",
                columnGap: "var(--flow-timeline-row-column-gap, 1rem)",
                paddingTop: "var(--flow-timeline-row-padding-top, 0px)",
                paddingBottom: last ? "0px" : "var(--flow-timeline-row-padding-bottom, 2.25rem)",
                minHeight: "var(--flow-timeline-row-min-height, 0px)",
                borderTop: `${first ? "0px" : "var(--flow-timeline-row-border-width, 0px)"} solid var(--ctl-track)`,
              }}
            >
              <div
                data-flow-timeline-date=""
                className="min-w-0 text-ctl-fg-muted tabular-nums"
                style={{
                  gridArea: "date",
                  display: "var(--flow-timeline-date-display, none)",
                  flexDirection: "var(--flow-timeline-date-direction, column)",
                  gap: "var(--flow-timeline-date-gap, 0.125rem)",
                  textAlign: "var(--flow-timeline-date-align, left)",
                  fontSize: "var(--flow-timeline-date-size, var(--text-sm))",
                  alignSelf: "start",
                }}
              >
                <span style={{ display: "var(--flow-timeline-date-day-display, block)", fontWeight: "var(--flow-timeline-date-weight, 600)" }}>
                  {item.chronology.date}
                </span>
                {item.chronology.time ? (
                  <span style={{ display: "var(--flow-timeline-date-time-display, block)", fontWeight: "var(--flow-timeline-time-weight, 400)" }}>
                    {item.chronology.time}
                  </span>
                ) : null}
              </div>

              <div
                data-flow-timeline-marker-wrap=""
                className="relative flex justify-center self-stretch"
                style={{ gridArea: "marker" }}
                aria-hidden="true"
              >
                {!last ? (
                  <span
                    className="absolute left-1/2 w-px -translate-x-1/2 bg-ctl-track"
                    style={{
                      display: "var(--flow-timeline-connector-display, block)",
                      top: "calc(var(--flow-timeline-marker-margin-top, 0.1875rem) + var(--flow-timeline-marker-height, 0.875rem) / 2)",
                      bottom: "calc(-1 * var(--flow-timeline-row-padding-bottom, 2.25rem))",
                    }}
                  />
                ) : null}
                <span
                  data-flow-timeline-marker=""
                  className="relative z-10 grid shrink-0 place-items-center"
                  style={{
                    width: hasIcon ? "1.75rem" : "var(--flow-timeline-marker-width, 0.875rem)",
                    height: hasIcon ? "1.75rem" : "var(--flow-timeline-marker-height, 0.875rem)",
                    marginTop: "var(--flow-timeline-marker-margin-top, 0.1875rem)",
                    borderRadius: hasIcon ? "999px" : "var(--flow-timeline-marker-radius, 999px)",
                    background: markerColor,
                    color: "var(--ctl-surface)",
                  }}
                >
                  {hasIcon ? item.icon : null}
                </span>
              </div>

              <div
                data-flow-timeline-content=""
                className="flex min-w-0 flex-col"
                style={{ gridArea: "content", gap: "var(--flow-timeline-content-gap, 0.25rem)" }}
              >
                <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                  <span className="min-w-0 font-medium leading-snug text-ctl-fg text-pretty" style={{ fontSize: "var(--flow-timeline-title-size, var(--text-base))" }}>
                    {item.title}
                  </span>
                  {item.chronology.full ? (
                    <span
                      data-flow-timeline-meta=""
                      className="shrink-0 leading-snug text-ctl-fg-muted tabular-nums"
                      style={{ display: "var(--flow-timeline-meta-display, block)", fontSize: "var(--flow-timeline-meta-size, var(--text-sm))" }}
                    >
                      {item.chronology.full}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <span className="leading-relaxed text-ctl-fg-muted text-pretty" style={{ fontSize: "var(--flow-timeline-description-size, var(--text-sm))" }}>
                    {item.description}
                  </span>
                ) : null}
                {item.children ? (
                <div style={{ paddingTop: "var(--flow-timeline-children-gap, 0.75rem)" }}>{item.children}</div>
              ) : null}
              </div>
            </li>
          </React.Fragment>
        );
      })}
      </ol>
    </div>
  );
}

export { Timeline };
export default Timeline;
