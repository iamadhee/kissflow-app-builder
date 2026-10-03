import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "./gantt.css"; // vendored — the package's exports map blocks the deep import

// InteractiveGantt — a real, EDITABLE Gantt: dependencies, a date axis and drag-to-reschedule.
// GanttChart.jsx is the themed read-only plan view; reach for this one when the user reschedules.
//
// It moved here from components/kf on 15 Sep 2026. Its legacy name is exported beside the canonical
// one because generated applications import `@/components/kf/GanttChart.jsx` and expect THIS API —
// a path the build maps here, never to the kit's own GanttChart, which takes different tasks.
//
// A real Gantt, for the planning apps this product keeps being asked for — turnarounds, shutdowns,
// commissioning, anything where the question is "what overlaps with what".
//
// Distinct from Timeline.jsx, which lays tasks across a rolling window for a dashboard glance. This
// one has dependencies, drag-to-reschedule and a date axis: it is the working view, not the summary.
//
// frappe-gantt is imperative and owns its DOM, so it is created once against a ref and destroyed on
// unmount. Rendering it through React children instead would fight it for the same nodes.

const VIEW_MODES = ["Quarter Day", "Half Day", "Day", "Week", "Month"];

/**
 * tasks: [{ id, name, start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', progress?: 0-100, dependencies?: 'id,id' }]
 * onDateChange / onProgressChange are optional — omit them and the chart is read-only, which is the
 * right default for a page that has nowhere to save an edit.
 */
function InteractiveGantt({ tasks = [], viewMode = "Week", height = 320, onDateChange, onProgressChange }) {
  const host = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!host.current || !tasks.length) return;
    // guard every field: frappe-gantt throws on a missing or unparseable date and takes the whole
    // page down with it, and seed data is exactly where a null date comes from
    const safe = tasks
      .filter((t) => t && t.start && t.end)
      .map((t, i) => ({
        id: String(t.id ?? i),
        name: String(t.name ?? "Untitled"),
        start: String(t.start).slice(0, 10),
        end: String(t.end).slice(0, 10),
        progress: Number.isFinite(+t.progress) ? Math.max(0, Math.min(100, +t.progress)) : 0,
        dependencies: t.dependencies || "",
        custom_class: t.tone ? `kf-gantt-${t.tone}` : "",
      }));
    if (!safe.length) return;

    host.current.innerHTML = "";
    try {
      chart.current = new Gantt(host.current, safe, {
        view_mode: VIEW_MODES.includes(viewMode) ? viewMode : "Week",
        bar_height: 18,
        padding: 16,
        readonly: !onDateChange && !onProgressChange,
        on_date_change: (task, start, end) => onDateChange?.(task, start, end),
        on_progress_change: (task, progress) => onProgressChange?.(task, progress),
      });
    } catch (e) {
      // a broken chart must not blank the page around it
      host.current.innerHTML = `<div class="p-4 text-sm text-ctl-fg-muted">Timeline could not be drawn: ${e.message}</div>`;
    }
    return () => { try { host.current && (host.current.innerHTML = ""); } catch {} };
  }, [tasks, viewMode, onDateChange, onProgressChange]);

  if (!tasks.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-ctl-border bg-ctl-surface py-10 text-sm text-ctl-fg-muted"
           style={{ height }}>
        Nothing scheduled yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-4 text-sm text-ctl-fg" style={{ minHeight: height }}>
      <div ref={host} className="kf-gantt" />
      <style>{`
        .kf-gantt {
          --g-arrow-color: var(--ctl-fg-muted);
          --g-bar-color: var(--brand-600);
          --g-bar-border: var(--brand-600);
          --g-tick-color-thick: var(--ctl-track);
          --g-tick-color: color-mix(in srgb, var(--ctl-border) 45%, transparent);
          --g-actions-background: var(--ctl-surface);
          --g-border-color: var(--ctl-border);
          --g-text-muted: var(--ctl-fg-muted);
          --g-text-light: var(--brand-fg);
          --g-text-dark: var(--ctl-fg);
          --g-progress-color: color-mix(in oklab, var(--brand-800) 82%, var(--brand-600));
          --g-handle-color: var(--ctl-fg);
          --g-weekend-label-color: var(--ctl-track);
          --g-expected-progress: var(--brand-100);
          --g-header-background: var(--ctl-raise);
          --g-row-color: var(--ctl-surface);
          --g-row-border-color: var(--ctl-border);
          --g-today-highlight: var(--brand-600);
          --g-popup-actions: var(--ctl-raise);
          --g-weekend-highlight-color: var(--ctl-raise);
          color: var(--ctl-fg);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
        }
        .kf-gantt .gantt-container {
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border-radius: var(--radius-lg);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
        }
        .kf-gantt .bar { fill: var(--brand-600); }
        .kf-gantt .bar-progress { fill: var(--g-progress-color); }
        .kf-gantt .bar-wrapper .bar,
        .kf-gantt .bar-progress,
        .kf-gantt .bar-expected-progress {
          rx: var(--radius-sm);
        }
        .kf-gantt .bar-wrapper .bar {
          outline-color: color-mix(in oklab, var(--brand-600) 38%, var(--ctl-border));
          transition: filter var(--default-transition-duration) var(--default-transition-timing-function), stroke-width var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-gantt .bar-wrapper:hover .bar {
          filter: brightness(.96);
        }
        .kf-gantt .grid-header { fill: var(--ctl-raise); }
        .kf-gantt .grid-row:nth-child(even) { fill: var(--ctl-track); }
        .kf-gantt .bar-label {
          fill: var(--brand-fg);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
        }
        .kf-gantt .bar-label.big { fill: var(--ctl-fg); }
        .kf-gantt .lower-text {
          color: var(--ctl-fg-muted);
          fill: var(--ctl-fg-muted);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
        }
        .kf-gantt .upper-text {
          color: var(--ctl-fg);
          fill: var(--ctl-fg);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-semibold);
        }
        .kf-gantt .side-header * {
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border: 1px solid var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          transition: background-color var(--default-transition-duration) var(--default-transition-timing-function), border-color var(--default-transition-duration) var(--default-transition-timing-function), color var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-gantt .side-header *:hover {
          color: var(--brand-text);
          background: var(--ctl-raise);
          border-color: var(--ctl-border-strong);
          filter: none;
        }
        .kf-gantt .side-header *:focus-visible {
          outline: none;
          box-shadow: 0 0 0 var(--ring-ctl) var(--brand-ring);
        }
        .kf-gantt .popup-wrapper {
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border: 1px solid var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          font-family: var(--font-sans);
        }
        .kf-gantt .popup-wrapper .title {
          color: var(--ctl-fg);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-semibold);
        }
        .kf-gantt .popup-wrapper .subtitle {
          color: var(--ctl-fg);
          font-size: var(--text-xs);
        }
        .kf-gantt .popup-wrapper .details {
          color: var(--ctl-fg-muted);
          font-size: var(--text-2xs);
        }
        .kf-gantt .popup-wrapper .action-btn {
          color: var(--ctl-fg);
          background: var(--ctl-raise);
          border-color: var(--ctl-border);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
        }
        .kf-gantt .current-date-highlight,
        .kf-gantt .holiday-label,
        .kf-gantt .date-range-highlight {
          border-radius: var(--radius-sm);
        }
        .kf-gantt .kf-gantt-indigo .bar { fill: var(--chart-1); }
        .kf-gantt .kf-gantt-emerald .bar { fill: var(--chart-2); }
        .kf-gantt .kf-gantt-amber .bar { fill: var(--chart-3); }
        .kf-gantt .kf-gantt-rose .bar { fill: var(--chart-4); }
        .kf-gantt .kf-gantt-violet .bar { fill: var(--chart-5); }
        .kf-gantt .kf-gantt-sky .bar { fill: var(--chart-6); }
        .kf-gantt .kf-gantt-fuchsia .bar { fill: var(--chart-7); }
      `}</style>
    </div>
  );
}

export { InteractiveGantt };
/** The name this component had in components/kf. Same implementation, same props. */
export { InteractiveGantt as GanttChart };
export default InteractiveGantt;
