/**
 * ExpressPage — the deterministic page grammar used by the express compiler.
 *
 * The model chooses the domain, page archetype, fields, actions and a compact design genome. This
 * component expands those decisions into the repetitive React wiring: role-aware data access,
 * loading/error/empty states, platform forms, metrics, queues and registers. A generated route may
 * still be replaced with hand-authored JSX; the compiler treats that as an anchor and preserves it.
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { orderedGroups, remainingPaneHeight, resolveRecordSelection, summarizeRecords, supportsRecordTrend } from "./express-layout-state.mjs";
import "./ExpressPage.css";
import { useKf, usePageTitle } from "@kissflow/app-ui";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Inbox, Plane, Plus, Search } from "lucide-react";

import appSchema from "../../../lib/kf-schema.json";
import { LAYOUT_TEMPLATES } from "../layout-catalog.generated.js";
import { useFlow, flowHandle, cellText } from "./useFlow.js";
import { PageHeader } from "./PageHeader.jsx";
import { Card } from "./Card.jsx";
import { ExpressCatalog } from "./ExpressCatalog.jsx";
import { StatTile } from "./StatTile.jsx";
import { PageBody, SurfaceCell, SurfaceGroup } from "./SurfaceGroup.jsx";
import { Button } from "./Button.jsx";
import { Table } from "./Table.jsx";
import { ApprovalQueue } from "./Queue.jsx";
import { Badge } from "./Badge.jsx";
import { SearchBar } from "./Fx.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { SkeletonText } from "./Skeleton.jsx";
import { Alert as Callout } from "./Alert.jsx";
import { BarChart } from "./BarChart.jsx";
import { FunnelChart } from "./FunnelChart.jsx";
import { GanttChart } from "./GanttChart.jsx";
import { GaugeRing } from "./GaugeRing.jsx";
import { HBars } from "./HBars.jsx";
import { Heatmap } from "./Heatmap.jsx";
import { LineChart } from "./LineChart.jsx";
import { DonutLegend } from "./DonutLegend.jsx";
import { ProgressList } from "./ProgressList.jsx";
import { SegmentBar } from "./SegmentBar.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Textarea } from "./Textarea.jsx";
import { Timeline } from "./Timeline.jsx";
import { Stepper } from "./Stepper.jsx";
import { Calendar } from "./Calendar.jsx";
import { KanbanBoard } from "./Board.jsx";
import { Avatar } from "./Avatar.jsx";
import { DescriptionList } from "./DescriptionList.jsx";
import { StackedBar } from "./StackedBar.jsx";
import { Pagination } from "./Pagination.jsx";
import { Tabs } from "./Tabs.jsx";
import { Drawer } from "./Drawer.jsx";
import { Accordion } from "./Accordion.jsx";
import { ProgressBar } from "./ProgressBar.jsx";
import { Tooltip } from "./Tooltip.jsx";
import { WipStrip } from "./Queue.jsx";
import { Modal } from "./Modal.jsx";
import { ItemForm } from "./Forms.jsx";

const StatusChip = ({ tone, ...props }) => <Badge tone={tone === "pending" ? "warning" : tone} {...props} />;

function NoAccess({ what = "this data" }) {
  return <EmptyState bordered={false} tone="neutral" title={`No access to ${what}.`} description="Your role does not include this. Ask an administrator if you think that is wrong." />;
}

function ActivityFeed({ items = [] }) {
  return <Timeline items={items.map((item, index) => ({
    id: item.key ?? index,
    title: [item.actor, item.action].filter(Boolean).join(" ") || item.object,
    description: [item.object, item.body].filter(Boolean).join(" · "),
    meta: item.meta,
    tone: item.tone === "pending" ? "warning" : item.tone,
  }))} />;
}

const TONES = ["info", "warning", "accent", "success", "danger", "neutral"];
const DASHBOARD_LAYOUTS = new Set(["dashboard", "command-center", "metric-hero", "my-day", "pipeline-review"]);
const SYSTEM_FIELDS = {
  _current_step: { id: "_current_step", label: "Status", type: "Status" },
  _status: { id: "_status", label: "State", type: "Status" },
  _created_at: { id: "_created_at", label: "Created", type: "DateTime" },
};

const norm = (v) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function modelFor(page) {
  return (appSchema?.dataModels || []).find((m) => norm(m.id) === norm(page.flowId) || norm(m.name) === norm(page.flowName));
}
function fieldFor(model, ref) {
  if (!ref) return null;
  if (typeof ref === "object") return { id: ref.id || ref.name, label: ref.label || ref.name || ref.id, type: ref.type || "Text" };
  if (SYSTEM_FIELDS[ref]) return SYSTEM_FIELDS[ref];
  const hit = (model?.fields || []).find((f) => norm(f.id) === norm(ref) || norm(f.name) === norm(ref));
  return hit ? { ...hit, label: hit.name } : { id: ref, label: ref, type: "Text" };
}

function rawCell(row, field) {
  if (!field) return undefined;
  return row?.[field.id] ?? row?.[field.label];
}

function displayCell(row, field) {
  const value = rawCell(row, field);
  if (value == null || value === "") return "—";
  if (/date|time/i.test(field?.type || "")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  if (/currency/i.test(field?.type || "") && Number.isFinite(Number(value))) {
    // Cents only when the amount has them: a $1,110 order total does not need ".00", and an $18.50
    // price per guest must not be rounded to $19 — which is what one shared rule did to both.
    const amount = Number(value);
    const places = Number.isInteger(amount) ? 0 : 2;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD",
      minimumFractionDigits: places, maximumFractionDigits: places }).format(amount);
  }
  if (/number|decimal|currency/i.test(field?.type || "") && Number.isFinite(Number(value))) return Number(value).toLocaleString();
  return cellText(value);
}

function statusTone(value) {
  const v = String(value || "").toLowerCase();
  if (/done|closed|complete|approved|active|paid|resolved/.test(v)) return "success";
  if (/reject|fail|cancel|overdue|blocked/.test(v)) return "danger";
  if (/wait|hold|risk|review/.test(v)) return "warning";
  if (/progress|working|assign|processing/.test(v)) return "warning";
  return "info";
}

function priorityTone(value) {
  const v = String(value || "").toLowerCase();
  if (/urgent|critical|high|severe/.test(v)) return "danger";
  if (/medium|moderate|normal/.test(v)) return "warning";
  if (/low|minor/.test(v)) return "neutral";
  return "info";
}

function categorySeries(value) {
  const text = String(value ?? "").trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return (hash % 8) + 1;
}

function chipKind(field) {
  const hint = norm(`${field?.id || ""} ${field?.label || ""}`);
  if (/priority|severity|urgency/.test(hint)) return "priority";
  if (field?.id === "_current_step" || /status|state|stage|step/.test(hint) || /status/i.test(field?.type || "")) return "status";
  if (/select/i.test(field?.type || "")) return "category";
  return null;
}

function RegisterChip({ field, value, children }) {
  const kind = chipKind(field);
  if (kind === "priority") return <Badge tone={priorityTone(value)} data-chip-kind={kind}>{children}</Badge>;
  if (kind === "status") return <StatusChip tone={statusTone(value)} data-chip-kind={kind}>{children}</StatusChip>;
  return <Badge series={categorySeries(value)} data-chip-kind="category">{children}</Badge>;
}

function byRef(fields, ref) {
  return fields.find((f) => norm(f.id) === norm(ref) || norm(f.label) === norm(ref)) || SYSTEM_FIELDS[ref];
}

function scopedRows(rows, where, fields) {
  if (!where?.field) return rows;
  const field = byRef(fields, where.field);
  return rows.filter((row) => {
    const value = String(rawCell(row, field) ?? "").toLowerCase();
    if (where.equals != null) return value === String(where.equals).toLowerCase();
    if (where.includes != null) return value.includes(String(where.includes).toLowerCase());
    return true;
  });
}

function metricRaw(rows, metric, fields) {
  const scoped = scopedRows(rows, metric?.where, fields);
  if (!metric || metric.op === "count") return scoped.length;
  const field = byRef(fields, metric.field);
  const values = scoped.map((r) => Number(rawCell(r, field))).filter(Number.isFinite);
  if (metric.op === "sum") return values.reduce((a, b) => a + b, 0);
  if (metric.op === "avg") return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  // The plan names which stages END the work ("Provision" ends a request), and the validator requires
  // it; the word list is only the fallback for a metric that names none.
  if (metric.op === "open") {
    const terminal = new Set((metric.terminalValues || []).map((v) => String(v).toLowerCase()));
    return scoped.filter((r) => {
      const state = String(r._current_step || r._status || "");
      return terminal.size ? !terminal.has(state.toLowerCase()) : !/done|closed|complete|approved|resolved/i.test(state);
    }).length;
  }
  if (metric.op === "stepCount") return scoped.filter((r) => norm(r._current_step || r._status) === norm(metric.step)).length;
  if (metric.op === "percentWhere") return rows.length ? (scoped.length / rows.length) * 100 : 0;
  if (metric.op === "variance") {
    const planned = byRef(fields, metric.planned), actual = byRef(fields, metric.actual);
    return scoped.reduce((sum, row) => sum + (Number(rawCell(row, actual)) || 0) - (Number(rawCell(row, planned)) || 0), 0);
  }
  return scoped.length;
}

// A KPI without a trend reads as a placeholder. Derive an HONEST series from the metric's own
// scoped rows — seven date buckets over _created_at (count/open) or the summed field (sum) — and a
// delta from the last two buckets. Rows without dates yield nothing: no fabricated trends, ever.
function metricTrend(rows, metric, fields) {
  if (metric?.series || metric?.delta) return { series: metric.series, delta: metric.delta };
  // A record-count sparkline is not a history of averages, percentages, or current workflow state.
  if (!supportsRecordTrend(metric?.op)) return {};
  const scoped = scopedRows(rows, metric?.where, fields);
  const dated = scoped.map((row) => ({ row, t: new Date(row._created_at || row._modified_at || NaN).getTime() }))
    .filter((entry) => Number.isFinite(entry.t));
  if (dated.length < 3) return {};
  const min = Math.min(...dated.map((entry) => entry.t)), max = Math.max(...dated.map((entry) => entry.t));
  if (max <= min) return {};
  const buckets = Array(7).fill(0);
  const field = byRef(fields, metric?.field);
  for (const entry of dated) {
    const index = Math.min(6, Math.floor(((entry.t - min) / (max - min)) * 7));
    buckets[index] += metric?.op === "sum" && field ? (Number(rawCell(entry.row, field)) || 0) : 1;
  }
  const last = buckets[6], previous = buckets[5];
  const delta = previous || last ? (last >= previous ? `+${Math.round(last - previous)}` : `${Math.round(last - previous)}`) : undefined;
  return { series: buckets, delta };
}

function formatValue(value, format) {
  if (format === "currency") return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
  if (format === "percent") return `${Math.round(value || 0)}%`;
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : String(value ?? "—");
}

function Metrics({ rows, metrics, fields, emphasis }) {
  // Metrics are authored dashboard content, never default page chrome. The compiler strips them
  // from non-dashboard pages, and this empty guard keeps legacy/custom configs from inventing a KPI
  // band at runtime.
  const resolved = metrics || [];
  if (!resolved.length) return null;
  // The KPI row always fills: columns follow the metric count (capped by emphasis) instead of a
  // fixed grid that leaves dead tiles' worth of empty track when the plan sends two metrics.
  const shownCount = Math.min(4, Math.max(1, resolved.length));
  const cap = emphasis === "data" ? 4 : 3;
  // Capping the columns is a density choice, but a cap that does not divide the metric count just
  // moves the dead space rather than removing it: four metrics at a cap of three left one tile
  // alone on a second row with two empty tracks beside it. Fall back to a count that divides.
  const columns = shownCount <= cap ? shownCount : (shownCount % cap === 0 ? cap : 2);
  const lgCols = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[columns];
  return (
    <SurfaceGroup layout="grid" gap="md" className={`grid-cols-1 items-start sm:grid-cols-2 ${lgCols}`} data-express-metrics="">
      {resolved.slice(0, 4).map((m, i) => {
        const trend = metricTrend(rows, m, fields);
        return (
        <StatTile
          key={m.label || i}
          label={m.label || "Total"}
          value={formatValue(metricRaw(rows, m, fields), m.format)}
          series={m.series || trend.series}
          delta={m.delta || trend.delta}
          tone={m.tone || TONES[i % 4]}
        />
        );
      })}
    </SurfaceGroup>
  );
}

const isPeopleField = (f) => /user|people/i.test(f.type || "") || /owner|assignee|technician|manager|approver|agent|requester|reviewer|contact/i.test(f.label || "");
const isPercentField = (f) => /number|decimal|percent/i.test(f.type || "") && /percent|progress|utilization|completion|score/i.test(f.label || "");
function registerCell(row, f) {
  if (chipKind(f))
    return <RegisterChip key={f.id} field={f} value={rawCell(row, f)}>{displayCell(row, f)}</RegisterChip>;
  const v = displayCell(row, f);
  if (isPeopleField(f) && v && v !== "—")
    return <span key={f.id} className="flex items-center gap-2"><Avatar name={String(v)} size="xs" /><span className="truncate">{v}</span></span>;
  if (isPercentField(f)) {
    const n = Number(rawCell(row, f));
    if (Number.isFinite(n)) return <span key={f.id} className="flex min-w-[110px] items-center gap-2"><ProgressBar value={Math.max(0, Math.min(100, n))} className="flex-1" /><span className="text-xs tabular-nums">{Math.round(n)}%</span></span>;
  }
  return v;
}
// A row that shows two values is a label, not a record: the reader cannot tell two of them apart
// without opening one. Every record surface — table, list, card — carries at least four of the
// page's fields whenever the flow HAS four; a three-field flow still renders three.
const MIN_RECORD_FIELDS = 4;
function fillRecordFields(fields, taken, count) {
  const claimed = new Set(taken.filter(Boolean).map((f) => f.id));
  const extra = [];
  for (const field of fields) {
    if (extra.length >= count) break;
    if (!claimed.has(field.id)) extra.push(field);
  }
  return extra;
}

function Register({ rows, fields, onOpen, compact, pageSize = 10 }) {
  const shown = fields;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (<>
    <Table
      compact={compact}
      rowKey={(r, i) => r._row?._id || i}
      onRowClick={(row) => onOpen(row._row || row)}
      columns={shown.map((f) => ({
        key: f.id,
        label: f.description ? <Tooltip label={f.description}><span>{f.label}</span></Tooltip> : f.label,
        mono: /number|date|time|currency/i.test(f.type || ""),
      }))}
      rows={visible.map((row) => ({ ...Object.fromEntries(shown.map((f) => [f.id, registerCell(row, f)])), _row: row }))}
      empty="No records yet."
    />
    {rows.length > pageSize && <div className="mt-3 flex justify-end"><Pagination page={currentPage} pageCount={pageCount} onChange={setPage} /></div>}
  </>);
}

function Queue({ rows, fields, onOpen, pageSize = 8 }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const title = fields[0];
  const status = fields.find((f) => f.id === "_current_step" || /status|state|stage|step/i.test(f.label)) || SYSTEM_FIELDS._current_step;
  // title + status are two of the four; the rest of the row is the next unclaimed fields, joined
  // by ApprovalRow into one meta line.
  const meta = fillRecordFields(fields, [title, status], MIN_RECORD_FIELDS - 2);
  // Several themes lay a queue out as an AGE LEDGER: the row template reserves 8.5rem down the left
  // for how long the item has been waiting. Passing no age left that column empty on every row — a
  // wide bite of nothing before each title, which is what it looked like. How long a record has sat
  // is not invented; it is the distance from its own created date, and it is what a queue is for.
  const waited = (row) => {
    const started = Date.parse(rawCell(row, SYSTEM_FIELDS._created_at));
    if (!Number.isFinite(started)) return null;
    const days = Math.max(0, Math.round((Date.now() - started) / 86400000));
    return { ageValue: String(days), ageLabel: days === 1 ? "day waiting" : "days waiting" };
  };
  return (<div className="w-full min-w-0">
    <ApprovalQueue
      items={visible.map((row, i) => ({
        id: row._id || i,
        title: displayCell(row, title),
        meta: meta.length ? meta.map((field) => displayCell(row, field)) : undefined,
        status: displayCell(row, status),
        tone: statusTone(rawCell(row, status)),
        ...(waited(row) || {}),
        _row: row,
      }))}
      onOpen={(item) => onOpen(item._row)}
      empty="Nothing is waiting right now."
    />
    {pageCount > 1 && <div className="mt-3 flex justify-end"><Pagination page={currentPage} pageCount={pageCount} onChange={setPage} /></div>}
  </div>);
}

function aggregate(rows, section, fields) {
  const scoped = scopedRows(rows, section.where, fields);
  const group = byRef(fields, section.groupBy || section.dateField || section.titleField);
  const value = byRef(fields, section.value);
  return summarizeRecords(scoped, {
    labelOf: (row) => {
      if (section.kind !== "trend-chart" || !rawCell(row, group)) return displayCell(row, group);
      const date = new Date(rawCell(row, group));
      return Number.isNaN(date.getTime()) ? displayCell(row, group) : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    },
    readValue: value ? (row) => rawCell(row, value) : undefined,
    timeOf: section.kind === "trend-chart" ? (row) => new Date(rawCell(row, group)).setHours(0, 0, 0, 0) : undefined,
    op: section.op, limit: section.limit,
  });
}

function Panel({ title, eyebrow, subtitle, children, className = "", ...rest }) {
  return (
    <Card title={title} eyebrow={eyebrow} subtitle={subtitle} className={className} {...rest}>
      {children}
    </Card>
  );
}

function DonutPanel({ data, section }) {
  return (
    <Panel title={section.title} eyebrow={section.eyebrow}>
      <DonutLegend data={data} size="auto" caption={section.caption || "total"} />
    </Panel>
  );
}

function FormPanel({ section, fields, onCreate }) {
  const chosen = (section.fields || []).map((ref) => byRef(fields, ref)).filter(Boolean);
  return (
    // Card already owns a subtitle slot in its header — a hand-rolled <p> here duplicated
    // that role from inside the body, with its own spacing and type that drifted from it.
    <Panel title={section.title || "Start a request"} eyebrow={section.eyebrow || "New"} subtitle={section.description}>
      <div className={`grid gap-4 ${section.columns === 1 ? "grid-cols-1" : "md:grid-cols-2"}`}>
        {chosen.map((field) => <div key={field.id} className="flex items-center justify-between gap-2">
          <span className="text-sm text-ctl-fg">{field.label}</span>
          <span className="text-xs text-ctl-fg-muted">{field.type}</span>
        </div>)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-ctl-raise pt-4">
        <p className="m-0 text-xs text-ctl-fg-muted">Open the complete form to enter and save these fields.</p>
        <Button variant="primary" onClick={() => onCreate?.()} disabled={!onCreate}><Plane size={15} />{section.actionLabel || "Open form"}</Button>
      </div>
    </Panel>
  );
}

function TimelinePanel({ rows, section, fields, onOpen }) {
  const date = byRef(fields, section.dateField);
  const title = byRef(fields, section.titleField) || fields[0];
  const meta = byRef(fields, section.metaField) || fillRecordFields(fields, [date, title], 1)[0];
  const items = [...scopedRows(rows, section.where, fields)].sort((a, b) => new Date(rawCell(a, date) || 0) - new Date(rawCell(b, date) || 0)).slice(0, section.limit || 5);
  const timelineItems = items.map((row, index) => ({
    id: row._id || index,
    title: displayCell(row, title),
    description: meta ? displayCell(row, meta) : undefined,
    date: rawCell(row, date),
    meta: displayCell(row, date),
    tone: TONES[index % TONES.length],
    row,
  }));
  return (
    <Panel title={section.title} eyebrow={section.eyebrow}>
      <Timeline items={timelineItems} onItemClick={(item) => onOpen(item.row)} />
    </Panel>
  );
}

function GanttPanel({ rows, section, fields, onOpen }) {
  const start = byRef(fields, section.startField) || fields.find((field) => /start|begin/i.test(field.label));
  const end = byRef(fields, section.endField) || fields.find((field) => /end|finish|due/i.test(field.label));
  const title = byRef(fields, section.titleField) || fields[0];
  const status = byRef(fields, section.statusField) || fields.find((field) => /status|state|stage|step/i.test(field.label));
  const tasks = scopedRows(rows, section.where, fields).map((row, index) => ({
    id: row._id || index,
    name: displayCell(row, title),
    start: rawCell(row, start),
    end: rawCell(row, end),
    status: status ? displayCell(row, status) : "Draft",
    row,
  }));
  return (
    <Panel>
      <GanttChart
        tasks={tasks}
        title={section.title || "Plan schedule"}
        subtitle={section.description}
        onTaskClick={(task) => onOpen(task.row)}
      />
    </Panel>
  );
}

function CalendarPanel({ rows, section, fields, onOpen }) {
  const dateField = byRef(fields, section.dateField);
  const titleField = byRef(fields, section.titleField) || fields[0];
  const statusField = fields.find((f) => /status|stage|state|step/i.test(f.label)) || null;
  const dated = scopedRows(rows, section.where, fields)
    .map((row) => ({ row, date: new Date(rawCell(row, dateField)) }))
    .filter((x) => !Number.isNaN(x.date.getTime()))
    .sort((a, b) => a.date - b.date);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // Anchor on the month with something to LOOK AT: the first upcoming record, else the latest one.
  const anchor = (dated.find((x) => x.date >= today) || dated[dated.length - 1] || { date: today }).date;
  const [view, setView] = useState({ y: anchor.getFullYear(), m: anchor.getMonth() });
  if (!dated.length) return <Panel title={section.title} eyebrow={section.eyebrow}><EmptyState title="No scheduled dates" description="Dated records will appear here." /></Panel>;
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const byDay = new Map();
  for (const x of dated) { const k = dayKey(x.date); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(x); }
  const first = new Date(view.y, view.m, 1);
  const startCol = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startCol; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthCount = dated.filter((x) => x.date.getFullYear() === view.y && x.date.getMonth() === view.m).length;
  const upcoming = dated.filter((x) => x.date >= today).slice(0, 6);
  const agenda = upcoming.length ? upcoming : dated.slice(-6).reverse();
  const nav = (delta) => setView((v) => { const d = new Date(v.y, v.m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const fmtDay = (d) => d.toLocaleDateString(undefined, { weekday: "short" });
  const fmtMon = (d) => d.toLocaleDateString(undefined, { month: "short" });
  return (
    <Panel title={section.title} eyebrow={section.eyebrow}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="m-0 text-sm font-semibold text-ctl-fg">{monthLabel}
              <span className="ml-2 text-xs font-medium text-ctl-fg-muted">{monthCount ? `${monthCount} scheduled` : "nothing scheduled"}</span>
            </p>
            <span className="inline-flex items-center gap-1">
              <Button variant="ghost" size="sm" aria-label="Previous month" onClick={() => nav(-1)}><ChevronLeft size={15} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}>Today</Button>
              <Button variant="ghost" size="sm" aria-label="Next month" onClick={() => nav(1)}><ChevronRight size={15} /></Button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <p key={d} className="m-0 px-1.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[.08em] text-ctl-fg-muted">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-ctl-raise">
            {cells.map((d, i) => {
              if (d == null) return <div key={`x${i}`} className="min-h-[74px] bg-ctl-surface/60" />;
              const date = new Date(view.y, view.m, d);
              const items = byDay.get(dayKey(date)) || [];
              const isToday = dayKey(date) === dayKey(today);
              return (
                <div key={i} className="min-h-[74px] bg-ctl-surface p-1.5">
                  <p className={`m-0 mb-1 grid size-5 place-items-center rounded-full text-[11px] font-semibold ${isToday ? "bg-brand-600 text-brand-fg" : items.length ? "text-ctl-fg" : "text-ctl-fg-muted"}`}>{d}</p>
                  {items.slice(0, 2).map((x, k) => (
                    <button key={k} type="button" onClick={() => onOpen?.(x.row)}
                      className="mb-0.5 block w-full cursor-pointer truncate rounded-sm border-0 bg-brand-100 px-1.5 py-0.5 text-left text-[10.5px] font-medium leading-snug text-brand-text">
                      {displayCell(x.row, titleField)}
                    </button>
                  ))}
                  {items.length > 2 && <p className="m-0 px-1 text-[10px] font-medium text-ctl-fg-muted">+{items.length - 2} more</p>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0">
          <p className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-[.12em] text-ctl-fg-muted">{upcoming.length ? "Coming up" : "Most recent"}</p>
          <div className="flex flex-col gap-2.5">
            {agenda.map((x, i) => (
              <button key={i} type="button" onClick={() => onOpen?.(x.row)}
                className="grid cursor-pointer grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-ctl-raise bg-transparent p-2 text-left">
                <span className="grid rounded-md bg-brand-100 py-1 text-center">
                  <span className="text-sm font-bold leading-none text-brand-text">{x.date.getDate()}</span>
                  <span className="mt-0.5 text-[9.5px] font-semibold uppercase text-brand-text/80">{fmtMon(x.date)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-semibold text-ctl-fg">{displayCell(x.row, titleField)}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] text-ctl-fg-muted">
                    {fmtDay(x.date)}
                    {statusField && <Badge tone={statusTone(rawCell(x.row, statusField))} size="sm">{displayCell(x.row, statusField)}</Badge>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ActivityPanel({ rows, section, fields }) {
  const actor = byRef(fields, section.actorField) || fields.find((f) => /owner|assignee|requester|manager|approver|agent/i.test(f.label));
  const action = byRef(fields, section.actionField) || fields.find((f) => /status|stage|step|action/i.test(f.label)) || SYSTEM_FIELDS._current_step;
  const object = byRef(fields, section.objectField || section.titleField) || fields[0];
  const body = byRef(fields, section.metaField);
  const date = byRef(fields, section.dateField) || SYSTEM_FIELDS._created_at;
  const items = scopedRows(rows, section.where, fields).slice(0, section.limit || 6).map((row, i) => ({
    key: row._id || i, actor: actor ? displayCell(row, actor) : "Team", action: displayCell(row, action),
    object: displayCell(row, object), body: body ? displayCell(row, body) : undefined,
    meta: displayCell(row, date), tone: statusTone(rawCell(row, action)),
  }));
  return <Panel title={section.title} eyebrow={section.eyebrow}><ActivityFeed items={items} /></Panel>;
}

function StepsPanel({ rows, section, fields, workflowSteps }) {
  const steps = section.steps?.length ? section.steps : workflowSteps;
  const currentValue = rows.find((row) => row._current_step || row._status)?._current_step || rows.find((row) => row._status)?._status;
  const current = Math.max(0, steps.findIndex((step) => norm(typeof step === "string" ? step : step.label) === norm(currentValue)));
  return <Panel title={section.title} eyebrow={section.eyebrow}><Stepper steps={steps.map((step) => typeof step === "string" ? { label: step } : step)} current={current} /></Panel>;
}

function BoardPanel({ rows, section, fields, onOpen, onCreate, workflowSteps = [] }) {
  const stage = byRef(fields, section.groupBy) || SYSTEM_FIELDS._current_step;
  const title = byRef(fields, section.titleField) || fields[0];
  const note = byRef(fields, section.metaField) || fields[1];
  // A card's own column carries its stage, so title + note + whatever else the flow names is its
  // four. The owner and priority SLOTS stay typed — an avatar is a person and a chip is a priority,
  // so a guest count must never be cast as either. Anything else the card still owes goes into the
  // note line, which is just text.
  const owner = byRef(fields, section.ownerField) || fields.find((f) => /owner|assignee/i.test(f.label));
  const priority = byRef(fields, section.priorityField) || fields.find((f) => /priority|severity/i.test(f.label));
  // A reference/code field reads as the card's eyebrow rather than as a fact row.
  const reference = fields.find((f) => /sequence/i.test(f.type || "") || /\b(id|code|no|number|ref|reference)\b/i.test(f.label || ""));
  const named = [stage, title, note, owner, priority, reference].filter(Boolean);
  // A board card is the only view of its record until someone opens it, so it carries more than the
  // four-value floor: title plus four facts, and the chips and avatar on top of that.
  const spare = fillRecordFields(fields, named, 4);
  const factFields = [note, ...spare].filter(Boolean).slice(0, 4);
  const progress = byRef(fields, section.progressField) || fields.find((f) => /progress|percent/i.test(f.label));
  const grouped = new Map();
  for (const row of scopedRows(rows, section.where, fields)) {
    const label = displayCell(row, stage);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push({
      id: row._id,
      eyebrow: reference && reference !== title ? displayCell(row, reference) : undefined,
      title: displayCell(row, title),
      facts: factFields.map((field) => ({ label: field.label, value: displayCell(row, field) })),
      owner: owner ? displayCell(row, owner) : undefined,
      priority: priority ? displayCell(row, priority) : undefined,
      progress: progress ? Number(rawCell(row, progress)) : undefined,
      _row: row,
    });
  }
  for (const step of workflowSteps) if (!grouped.has(step)) grouped.set(step, []);
  const columns = orderedGroups(grouped, workflowSteps).map(([label, items], i) => ({ key: label, label, tone: ["sky", "amber", "violet", "emerald", "rose", "slate"][i % 6], items }));
  return <Panel title={section.title} eyebrow={section.eyebrow}><KanbanBoard columns={columns} onCardClick={(item) => onOpen(item._row)} onAdd={onCreate} className="min-h-0 shadow-none" /></Panel>;
}

function StagesPanel({ rows, section, fields, workflowSteps = [] }) {
  const stage = byRef(fields, section.groupBy) || SYSTEM_FIELDS._current_step;
  const grouped = new Map();
  for (const row of scopedRows(rows, section.where, fields)) {
    const label = displayCell(row, stage);
    grouped.set(label, (grouped.get(label) || 0) + 1);
  }
  const stages = orderedGroups(grouped, workflowSteps).map(([label, count], i) => ({ key: label, label, count, cap: section.cap, tone: TONES[i % TONES.length] }));
  return <Panel title={section.title} eyebrow={section.eyebrow}><WipStrip stages={stages} /></Panel>;
}

const WIDTH = {
  full: "lg:col-span-12", half: "lg:col-span-6", third: "lg:col-span-4", "two-thirds": "lg:col-span-8",
};
const WIDTH_ORDER = ["third", "half", "two-thirds", "full"];
const HEIGHT_CLASSES = new Set(["compact", "standard", "tall", "workbench"]);
const GRID_SPAN = {
  2: { 1: "", 2: "lg:col-span-2" },
  3: { 1: "", 2: "lg:col-span-2", 3: "lg:col-span-3" },
  4: { 1: "", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" },
};

// Width is a semantic property of a widget, not a coin flip in the page plan. The plan may ask for
// MORE room, but it cannot squeeze a horizontally dense surface below its useful minimum. This keeps
// deterministic data wiring while letting the composer arrange unlike widgets intelligently.
const SPAN12 = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8", 9: "lg:col-span-9", 10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12" };
const WIDTH_UNITS = { third: 4, half: 6, "two-thirds": 8, full: 12 };

// ROWS MUST FILL. Each section takes its proportional span, then every row that would end short
// expands its members (last one first) to absorb the remainder — a lone half-width widget owns its
// whole row instead of leaving dead columns beside it. Deterministic from the section order alone,
// so the same plan always packs the same way.
function packSpans(sections, columns, spanOf) {
  const spans = sections.map((section, index) => Math.min(columns, Math.max(1, spanOf(section, index))));
  let row = [], used = 0;
  const close = () => {
    let free = columns - used;
    for (let k = row.length - 1; free > 0 && k >= 0; k -= 1) {
      const grow = Math.min(free, columns - spans[row[k]]);
      spans[row[k]] += grow; free -= grow;
    }
    row = []; used = 0;
  };
  spans.forEach((span, index) => {
    if (used + span > columns) close();
    row.push(index); used += span;
    if (used === columns) { row = []; used = 0; }
  });
  if (row.length) close();
  return spans;
}

function numericSpan(section, columns, fallback = 1) {
  const width = resolvedWidth(section, "third");
  const proportional = { third: Math.ceil(columns / 3), half: Math.ceil(columns / 2), "two-thirds": Math.ceil(columns * 2 / 3), full: columns }[width];
  const semanticMinimum = ["table", "queue", "form"].includes(section.kind) ? Math.min(2, columns) : 1;
  return Math.max(fallback, proportional, semanticMinimum);
}

// `variant: "board"` is a board even when the plan never names the component — the earlier check saw
// only `component`, so a plan that said `{kind: "queue", variant: "board"}` got a two-thirds track
// and its right-hand stages fell off into a scroll.
const isBoard = (section) => section?.component === "KanbanBoard"
  || (section?.kind === "queue" && section?.variant === "board");

function minimumWidth(section) {
  // A board is columns-of-columns: a stage it cannot show is a stage nobody can compare. It takes
  // the whole row, whatever width the plan asked for.
  if (isBoard(section) || section.component === "WipStrip") return "full";
  if (["table", "queue", "form"].includes(section.kind)) return "two-thirds";
  if (section.component === "Calendar") return "full";   // a schedule surface, never a squeezed picker
  if (["ActivityFeed", "Stepper", "Heatmap"].includes(section.component)) return "half";
  return "third";
}

function resolvedWidth(section, fallback = "half") {
  const requested = WIDTH_ORDER.includes(section.width) ? section.width : fallback;
  const minimum = minimumWidth(section);
  return WIDTH_ORDER[Math.max(WIDTH_ORDER.indexOf(requested), WIDTH_ORDER.indexOf(minimum))];
}

function gridSpan(section, columns, fallback = 1) {
  const width = resolvedWidth(section, "third");
  const proportional = { third: Math.ceil(columns / 3), half: Math.ceil(columns / 2), "two-thirds": Math.ceil(columns * 2 / 3), full: columns }[width];
  const semanticMinimum = ["table", "queue", "form"].includes(section.kind) ? Math.min(2, columns) : 1;
  const span = Math.max(fallback, proportional, semanticMinimum);
  return GRID_SPAN[columns]?.[Math.min(columns, span)] || "";
}

function visualHeight(section) {
  const explicit = String(section.heightClass || section.visualHeight || "").trim().toLowerCase();
  if (HEIGHT_CLASSES.has(explicit)) return explicit;
  if (["table", "queue", "form", "decision", "record-detail", "detail-pane"].includes(section.kind)
    || ["KanbanBoard", "Calendar", "ApprovalQueue", "Table"].includes(section.component)) return "workbench";
  if (["FunnelChart", "BarChart", "LineChart", "ActivityFeed", "Timeline"].includes(section.component)) return "tall";
  if (["StatTile", "SegmentBar", "ProgressBar", "ProgressList", "WipStrip", "Stepper"].includes(section.component)
    || ["progress", "callout"].includes(section.kind)) return "compact";
  return "standard";
}

// Two-column grids are the common source of accidental dead space. Pair like-height cards; widen an
// incompatible or orphan card instead of forcing a compact card to impersonate a tall visualization.
function balancedGridSpans(sections, columns) {
  const ordinary = sections.map((section) => gridSpan(section, columns));
  if (columns !== 2) {
    // The height-pairing below is 2-column-specific, but ROWS MUST FILL everywhere: pack the
    // numeric spans so a short final row expands its members instead of leaving dead columns
    // (VendorGate: a two-thirds form beside a page-wide hole).
    const packed = packSpans(sections, columns, (section, i) => numericSpan(section, columns));
    return packed.map((span) => GRID_SPAN[columns]?.[Math.min(columns, span)] || "");
  }
  const spans = Array(sections.length).fill("");
  for (let i = 0; i < sections.length; i += 1) {
    if (ordinary[i].includes("col-span-2")) {
      spans[i] = ordinary[i];
      continue;
    }
    const next = sections[i + 1];
    const nextIsHalf = next && !ordinary[i + 1].includes("col-span-2");
    if (nextIsHalf && visualHeight(sections[i]) === visualHeight(next)) {
      spans[i] = ordinary[i];
      spans[i + 1] = ordinary[i + 1];
      i += 1;
    } else {
      spans[i] = "lg:col-span-2";
    }
  }
  return spans;
}

// GROUP CARDS — one card per distinct value of `groupBy`, each carrying its own headline number.
// The nearest existing kinds both lie about this shape: a donut aggregates the groups into one ring
// (so "how much Casual Leave do I have" is a legend entry, not a figure), and a table makes the
// reader do the arithmetic. A balance, an allowance, a per-category budget — anything a person
// thinks of as "one of these per type" — is a row of cards, and there was no way to say so.
function GroupCards({ rows, section, fields, onOpen }) {
  const groupField = byRef(fields, section.groupBy);
  const valueField = byRef(fields, section.value);
  const maxField = byRef(fields, section.max);
  const statFields = (section.stats || []).map((ref) => byRef(fields, ref)).filter(Boolean);
  const groups = [];
  const index = new Map();
  for (const row of rows) {
    // Test the RAW value, not the display one: displayCell renders an empty cell as "—", so a
    // blank group value would otherwise become a card of its own, and an unresolvable `groupBy`
    // would collapse every row into a single "—" card summing the whole dataset.
    const raw = rawCell(row, groupField);
    if (raw == null || raw === "") continue;
    const key = displayCell(row, groupField);
    let group = index.get(key);
    if (!group) { group = { key, rows: [], value: 0, max: 0, stats: statFields.map(() => 0) }; index.set(key, group); groups.push(group); }
    group.rows.push(row);
    group.value += Number(rawCell(row, valueField)) || 0;
    group.max += Number(rawCell(row, maxField)) || 0;
    statFields.forEach((field, i) => { group.stats[i] += Number(rawCell(row, field)) || 0; });
  }
  if (!groups.length) return <Panel title={section.title} eyebrow={section.eyebrow}><EmptyState title="Nothing to show yet" description="Cards appear here once there are records to group." /></Panel>;
  const shown = groups.slice(0, section.limit || 6);
  return <section className="grid w-full gap-4" data-express-section-kind="group-cards">
    {section.title && <header className="grid gap-0.5">
      {section.eyebrow && <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-secondary">{section.eyebrow}</p>}
      <h2 className="m-0 font-display text-[15px] font-semibold leading-tight tracking-tight text-text">{section.title}</h2>
      {section.subtitle && <p className="m-0 text-[12.5px] text-text-muted">{section.subtitle}</p>}
    </header>}
    <div className={`grid gap-3.5 ${shown.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : shown.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
      {shown.map((group) => {
        const pct = group.max > 0 ? Math.max(0, Math.min(100, Math.round((group.value / group.max) * 100))) : null;
        const clickable = Boolean(onOpen) && group.rows.length === 1;
        return <article key={group.key} onClick={clickable ? () => onOpen(group.rows[0]) : undefined}
          className={`flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm ${clickable ? "cursor-pointer" : ""}`}>
          <p className="m-0 text-[13px] font-semibold leading-tight text-text">{group.key}</p>
          <p className="m-0 flex items-baseline gap-1.5">
            <span className="text-[26px] font-semibold leading-none tracking-tight text-text tabular-nums">{formatValue(group.value, section.format)}</span>
            {section.valueLabel && <span className="text-[12px] text-text-muted">{section.valueLabel}</span>}
          </p>
          {statFields.length > 0 && <p className="m-0 text-[11.5px] text-text-muted tabular-nums">
            {statFields.map((field, i) => `${formatValue(group.stats[i], section.format)} ${field.label.toLowerCase()}`).join(" · ")}
          </p>}
          {pct !== null && <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </span>}
        </article>;
      })}
    </div>
  </section>;
}

function CreativeSection({ section, rows, fields, onOpen, onCreate, compact, workflowSteps, sectionRenderers }) {
  const localFields = (section.fields || []).map((ref) => fieldFor(null, ref)).map((f) => byRef(fields, f.id) || f);
  const scoped = scopedRows(rows, section.where, fields);
  const CustomSection = sectionRenderers?.[section.id];
  if (CustomSection) return <CustomSection rows={scoped} allRows={rows} fields={fields} section={section} onOpen={onOpen} onCreate={onCreate} />;
  if (section.kind === "form") return <FormPanel section={section} fields={fields} onCreate={onCreate} />;
  if (section.kind === "queue" && section.component === "KanbanBoard") return <BoardPanel rows={rows} section={section} fields={fields} onOpen={onOpen} onCreate={onCreate} workflowSteps={workflowSteps} />;
  if (section.kind === "queue" && section.component === "WipStrip") return <StagesPanel rows={rows} section={section} fields={fields} workflowSteps={workflowSteps} />;
  if (section.kind === "queue") {
    // A LIST ROW IS NOT A TABLE. "Willow Creek morning run / Greenline Landscapes · Call Maya on
    // arrival · 84" puts a customer, an instruction and a count into one sentence: nothing lines up
    // between rows, so two of them cannot be compared without reading both. A queue on a full row is
    // a register and renders as one, with headers and aligned columns.
    //
    // The stacked list survives exactly where it is the right shape: the SPLIT PANE, whose narrow
    // left column has no room for columns and whose rows are a picker for the detail beside them.
    // MasterDetailComposition draws that list itself. The other narrow track is a third or half
    // column, where the compiler names ApprovalQueue: aligned columns do not fit there either, so it
    // gets the stacked list. Width is checked too, so an older compile that named ApprovalQueue for
    // every queue still gets the register on a wide row.
    const queueFields = localFields.length ? localFields : fields;
    if (section.component === "ApprovalQueue" && ["third", "half"].includes(section.width)) return <Panel title={section.title} eyebrow={section.eyebrow}><Queue rows={scoped} fields={queueFields} onOpen={onOpen} /></Panel>;
    return <Panel title={section.title} eyebrow={section.eyebrow}><Register rows={scoped} fields={queueFields} onOpen={onOpen} compact={compact} /></Panel>;
  }
  if (section.kind === "table" && (section.component === "GalleryCards" || section.variant === "gallery")) return <GalleryPanel rows={scoped} fields={localFields.length ? localFields : fields} onOpen={onOpen} section={section} />;
  if (section.kind === "table" && section.component === "Accordion") {
    const groupField = byRef(fields, section.groupBy) || fields.find((f) => /select|status/i.test(f.type || "")) || SYSTEM_FIELDS._current_step;
    const grouped = new Map();
    for (const row of scoped) {
      const g = displayCell(row, groupField) || "Other";
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(row);
    }
    return <Panel title={section.title} eyebrow={section.eyebrow}>
      <Accordion defaultOpen={[0]} items={[...grouped].map(([label, groupRows], i) => ({
        id: String(i),
        label: `${label} · ${groupRows.length}`,
        content: <Register rows={groupRows} fields={localFields.length ? localFields : fields} onOpen={onOpen} compact />,
      }))} />
    </Panel>;
  }
  if (section.kind === "table") return <Panel title={section.title} eyebrow={section.eyebrow}><Register rows={scoped} fields={localFields.length ? localFields : fields} onOpen={onOpen} compact={compact} /></Panel>;
  if (section.kind === "timeline" && section.component === "Calendar") return <CalendarPanel rows={rows} section={section} fields={fields} onOpen={onOpen} />;
  if (section.kind === "timeline" && section.component === "GanttChart") return <GanttPanel rows={rows} section={section} fields={fields} onOpen={onOpen} />;
  if (section.kind === "timeline" && section.component === "ActivityFeed") return <ActivityPanel rows={rows} section={section} fields={fields} />;
  if ((section.kind === "timeline" || section.kind === "progress") && section.component === "Stepper") return <StepsPanel rows={rows} section={section} fields={fields} workflowSteps={workflowSteps} />;
  if (section.kind === "timeline") return <TimelinePanel rows={rows} section={section} fields={fields} onOpen={onOpen} />;
  if (section.kind === "group-cards") return <GroupCards rows={scoped} section={section} fields={fields} onOpen={onOpen} />;
  if (section.kind === "callout") return <Callout tone={section.tone || "info"} title={section.title}>{section.body || section.description}</Callout>;
  if (section.kind === "progress") {
    const label = byRef(fields, section.groupBy || section.titleField), value = byRef(fields, section.value), max = byRef(fields, section.max || section.planned);
    const items = scoped.slice(0, section.limit || 6).map((row) => ({ label: displayCell(row, label), value: Number(rawCell(row, value)) || 0, max: Number(rawCell(row, max)) || 100, tone: section.tone || "info" }));
    if (section.component === "GaugeRing") {
      const values = scoped.map((row) => Number(rawCell(row, value))).filter(Number.isFinite);
      const gaugeValue = section.op === "sum" ? values.reduce((a, b) => a + b, 0) : values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return <Panel title={section.title} eyebrow={section.eyebrow} className="grid place-items-center"><GaugeRing value={gaugeValue} max={Number(section.maxValue) || 100} label={section.label || section.title} sublabel={section.caption} minHeight={Number(section.minHeight) || 220} /></Panel>;
    }
    if (section.component === "SegmentBar") return <Panel title={section.title} eyebrow={section.eyebrow}><SegmentBar segments={aggregate(rows, section, fields)} /></Panel>;
    if (!value) return <Panel title={section.title} eyebrow={section.eyebrow}><EmptyState title="Progress data is not configured" description="This section needs a numeric progress field. No completion percentages have been assumed." /></Panel>;
    return <Panel title={section.title} eyebrow={section.eyebrow}><ProgressList items={items} /></Panel>;
  }
  // The compiler's legal vocabulary includes decision/detail-pane/record-detail; a plan may use
  // them, so the renderer MUST give them a surface. `decision` is the approval-desk decide queue.
  if (section.kind === "decision") {
    if (scoped.length > 1) return <Panel title={section.title} eyebrow={section.eyebrow}><Queue rows={scoped} fields={localFields.length ? localFields : fields} onOpen={onOpen} /></Panel>;
    const row = scoped[0];
    return <Panel title={section.title} eyebrow={section.eyebrow}>
      {row ? <DescriptionList items={[...(localFields.length ? localFields : fields), SYSTEM_FIELDS._current_step].map((field) => ({ label: field.label, value: displayCell(row, field) }))} />
        : <EmptyState title="No record yet" description="Records appear here as they arrive." />}
    </Panel>;
  }
  if (section.kind === "detail-pane" || section.kind === "record-detail") {
    const row = scoped[0] || rows[0];
    if (!row) return <Panel title={section.title} eyebrow={section.eyebrow}><EmptyState title="No record yet" description="Records appear here as they arrive." /></Panel>;
    const shown = (localFields.length ? localFields : fields).slice(0, 8);
    return <Panel title={section.title} eyebrow={section.eyebrow}>
      <DescriptionList columns={2} items={shown.map((field) => ({ label: field.label, value: displayCell(row, field) }))} />
    </Panel>;
  }
  const data = aggregate(rows, section, fields);
  if (section.kind === "donut-chart") return <DonutPanel data={data} section={section} />;
  if (section.kind === "trend-chart" && section.component === "Heatmap") return <Panel title={section.title} eyebrow={section.eyebrow}><Heatmap data={data} columns={section.columns || 7} /></Panel>;
  if (section.kind === "trend-chart") return <Panel title={section.title} eyebrow={section.eyebrow}><LineChart data={data} grid tooltip format={(v) => formatValue(v, section.format)} /></Panel>;
  if (section.kind === "bar-chart" && section.component === "StackedBar") {
    const groupField = byRef(fields, section.groupBy) || fields.find((f) => /select|status/i.test(f.type || ""));
    const stackField = byRef(fields, section.stackBy) || fields.find((f) => f !== groupField && (/select|status/i.test(f.type || "") || f.id === "_current_step")) || SYSTEM_FIELDS._current_step;
    const groups = new Map();
    const stackValues = [];
    for (const row of scoped) {
      const g = displayCell(row, groupField) || "Other";
      const k = displayCell(row, stackField) || "Other";
      if (!stackValues.includes(k)) stackValues.push(k);
      if (!groups.has(g)) groups.set(g, {});
      groups.get(g)[k] = (groups.get(g)[k] || 0) + 1;
    }
    const keys = stackValues.slice(0, 5).map((k, i) => ({ key: k, label: k, tone: ["info", "success", "warning", "danger", "accent"][i % 5] }));
    const stacked = [...groups].slice(0, 8).map(([label, counts]) => ({ label, ...counts }));
    return <Panel title={section.title} eyebrow={section.eyebrow}><StackedBar data={stacked} keys={keys} /></Panel>;
  }
  if (section.kind === "bar-chart") return <Panel title={section.title} eyebrow={section.eyebrow}>{section.component === "FunnelChart" ? <FunnelChart data={data} format={(v) => formatValue(v, section.format)} /> : section.component === "BarChart" ? <BarChart data={data} format={(v) => formatValue(v, section.format)} /> : <HBars data={data} format={(v) => formatValue(v, section.format)} />}</Panel>;
  // A kind this renderer does not know must NEVER render as silence — an approval desk whose
  // decide-queue vanished shipped two KPIs over a blank page. The universal work surface stands in,
  // and the empty state tells the truth when there are no rows to stand on.
  if (scoped.length) return <Panel title={section.title || "Records"} eyebrow={section.eyebrow}><Queue rows={scoped} fields={localFields.length ? localFields : fields} onOpen={onOpen} /></Panel>;
  return <Panel title={section.title || "Records"} eyebrow={section.eyebrow}><EmptyState title="Nothing here yet" description="Records will appear here when work reaches this stage." /></Panel>;
}

function SectionSlot({ section, ...props }) {
  return <SurfaceCell padded={false} className="flex" data-express-section={section.id || section.kind} data-visual-height={visualHeight(section)}><CreativeSection section={section} {...props} /></SurfaceCell>;
}

function MasterDetailComposition({ page, sections, rows, fields, ...props }) {
  const list = sections.find((section) => section.kind === "queue" || section.kind === "table");
  const details = sections.filter((section) => section !== list);
  const candidates = scopedRows(rows, list?.where, fields);
  const [selectedId, setSelectedId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const selected = resolveRecordSelection(candidates, selectedId);
  const ref = useRef(null);
  const [height, setHeight] = useState(600);
  const title = byRef(fields, list?.fields?.[0]) || fields[0];
  const meta = byRef(fields, list?.fields?.[1]);

  useLayoutEffect(() => {
    const node = ref.current;
    let scrollport = node.parentElement;
    while (scrollport && !/auto|scroll/.test(getComputedStyle(scrollport).overflowY)) scrollport = scrollport.parentElement;
    const measure = () => {
      const bottom = Math.min(window.innerHeight, scrollport?.getBoundingClientRect().bottom ?? window.innerHeight);
      setHeight(remainingPaneHeight(node.getBoundingClientRect().top, bottom));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (scrollport) observer.observe(scrollport);
    observer.observe(node.parentElement);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return <div ref={ref} data-express-composition={page.layout} data-express-workbench="" data-show-detail={showDetail} style={{ height }}>
    <SurfaceCell padded={false} data-express-workbench-pane="list" role="region" aria-label={list?.title || "Records"} tabIndex={0}>
      <Panel title={list?.title || "Records"}>
        {!candidates.length && <EmptyState title="No records yet" description="Records appear here as they arrive." />}
        <div className="grid gap-2">
          {candidates.map((row, index) => <button key={row._id || index} type="button"
            aria-pressed={selected === row}
            onClick={() => { setSelectedId(row._id); setShowDetail(true); }}
            className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border border-solid p-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${selected === row ? "border-brand-600 bg-brand-100 text-brand-text" : "border-transparent bg-transparent text-ctl-fg hover:bg-ctl-raise"}`}>
            <span className="grid min-w-0 gap-1">
              <span className="break-words font-semibold">{displayCell(row, title)}</span>
              {meta && <span className="text-xs text-ctl-fg-muted">{displayCell(row, meta)}</span>}
              <span className="text-xs text-ctl-fg-muted">{displayCell(row, SYSTEM_FIELDS._current_step)}</span>
            </span>
            <ChevronRight size={16} className="shrink-0" aria-hidden="true" />
          </button>)}
        </div>
      </Panel>
    </SurfaceCell>
    <SurfaceCell padded={false} data-express-workbench-pane="detail" role="region" aria-label="Selected record detail" tabIndex={0}>
      <Panel className="h-full" title={selected ? displayCell(selected, title) : "Record detail"}
        actions={<div className="flex flex-wrap gap-2">
          <Button data-express-back="" onClick={() => setShowDetail(false)}><ChevronLeft size={15} />Back to list</Button>
          {selected && <Button onClick={() => props.onOpen(selected)}>Open record<ArrowRight size={15} /></Button>}
        </div>}>
        {selected ? <SurfaceGroup gap="md">{details.map((section) => <SectionSlot key={section.id || section.kind} section={section} rows={[selected]} fields={fields} {...props} />)}</SurfaceGroup>
          : <EmptyState title="No record selected" description="Choose a record from the list." />}
      </Panel>
    </SurfaceCell>
  </div>;
}

function LegacyComposition({ page, sections, ...props }) {
  if (page.layout === "split" && resolvedWidth(sections[0]) === "two-thirds" && sections.slice(1).every((section) => resolvedWidth(section) === "third")) {
    return <SurfaceGroup layout="grid" gap="md" className="grid-cols-1 items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" data-express-composition="split">
      <SectionSlot section={sections[0]} {...props} />
      <SurfaceGroup gap="md">{sections.slice(1).map((section) => <SectionSlot key={section.id || section.kind} section={section} {...props} />)}</SurfaceGroup>
    </SurfaceGroup>;
  }
  const spans = packSpans(sections, 12, (section) => WIDTH_UNITS[resolvedWidth(section, page.layout === "stacked" ? "full" : "half")]);
  return <SurfaceGroup layout="grid" gap="md" className="grid-cols-1 items-start lg:grid-cols-12" data-express-composition={page.layout || "legacy"}>
    {sections.map((section, i) => (
      <SurfaceCell padded={false} key={section.id || `${section.kind}-${section.title || i}`} className={`flex ${SPAN12[spans[i]] || ""}`} data-visual-height={visualHeight(section)}>
        <CreativeSection section={section} {...props} />
      </SurfaceCell>
    ))}
  </SurfaceGroup>;
}

function AdaptiveZone({ zone, sections, ...props }) {
  const [active, setActive] = useState(0);
  if (!sections.length) return null;
  if (zone.layout === "tabs") return <Card clip={false} data-express-zone-layout="tabs">
    <SurfaceGroup gap="sm">
      <SurfaceCell padded={false}>
        <Tabs variant="pill" items={sections.map((section, i) => ({ value: String(i), label: section.title || section.kind }))} value={String(active)} onChange={(value) => setActive(Number(value))} />
      </SurfaceCell>
      <SectionSlot section={sections[Math.min(active, sections.length - 1)]} {...props} />
    </SurfaceGroup>
  </Card>;

  if (zone.layout === "stack") return <SurfaceGroup as="section" gap="md" data-express-zone-layout="stack">
    {sections.map((section) => <SectionSlot key={section.id} section={section} {...props} />)}
  </SurfaceGroup>;

  if (zone.layout === "hero") return <SurfaceGroup as="section" layout="grid" gap="md" data-express-zone-layout="hero">
    {sections.map((section) => <SectionSlot key={section.id} section={section} {...props} />)}
  </SurfaceGroup>;

  if (zone.layout === "split") {
    const spans = packSpans(sections, 3, (section, i) => numericSpan(section, 3, i === 0 ? 2 : 1));
    return <SurfaceGroup as="section" layout="grid" gap="md" className="grid-cols-1 items-stretch lg:grid-cols-3" data-express-zone-layout="split" data-express-ratio={zone.ratio || "2:1"}>
      {sections.map((section, i) => <SurfaceCell padded={false} key={section.id} className={`flex ${GRID_SPAN[3]?.[Math.min(3, spans[i])] || ""}`} data-visual-height={visualHeight(section)}><CreativeSection section={section} {...props} /></SurfaceCell>)}
    </SurfaceGroup>;
  }

  if (zone.layout === "grid") {
    const columns = Number(zone.columns) === 3 ? 3 : Number(zone.columns) === 4 ? 4 : 2;
    const cols = columns === 3 ? "lg:grid-cols-3" : columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-2";
    const spans = balancedGridSpans(sections, columns);
    return <SurfaceGroup as="section" layout="grid" gap="md" className={`grid-cols-1 items-stretch ${cols}`} data-express-zone-layout="grid">
      {sections.map((section, i) => <SurfaceCell padded={false} key={section.id} className={`flex ${spans[i]}`} data-visual-height={visualHeight(section)}><CreativeSection section={section} {...props} /></SurfaceCell>)}
    </SurfaceGroup>;
  }

  const bentoSpans = packSpans(sections, 12, (section, i) => WIDTH_UNITS[resolvedWidth(section, i === 0 && sections.length > 2 ? "two-thirds" : "half")]);
  return <SurfaceGroup as="section" layout="grid" gap="md" className="grid-cols-1 items-stretch lg:grid-cols-12" data-express-zone-layout="bento">
    {sections.map((section, i) => <SurfaceCell padded={false} key={section.id} className={`flex ${SPAN12[bentoSpans[i]] || ""}`} data-visual-height={visualHeight(section)}><CreativeSection section={section} {...props} /></SurfaceCell>)}
  </SurfaceGroup>;
}

function AdaptiveComposition({ page, sections, ...props }) {
  const byId = new Map(sections.map((section) => [section.id, section]));
  const placed = new Set();
  const zones = (page.composition?.zones || []).map((zone) => ({ ...zone, resolved: (zone.sections || []).map((id) => byId.get(id)).filter(Boolean) }));
  for (const zone of zones) for (const section of zone.resolved) placed.add(section.id);
  const unplaced = sections.filter((section) => !placed.has(section.id));
  return <SurfaceGroup gap="md" data-express-composition={page.composition?.story || page.layout}>
    {zones.map((zone) => <AdaptiveZone key={zone.id} zone={zone} sections={zone.resolved} {...props} />)}
    {unplaced.length > 0 && <AdaptiveZone zone={{ id: "unplaced", layout: "stack" }} sections={unplaced} {...props} />}
  </SurfaceGroup>;
}

const CATALOG_BY_ID = new Map(LAYOUT_TEMPLATES.map((layout) => [layout.id, layout]));
const SLOT_DEFAULT_VARIANT = Object.freeze({ queue: "list", "trend-chart": "line", progress: "list", timeline: "list" });

function slotAcceptsSection(slot, section) {
  return (slot.accepts || []).some((token) => {
    const [kind, variant] = String(token).split(":");
    if (kind !== section.kind) return false;
    if (!variant) return true;
    return (section.variant || SLOT_DEFAULT_VARIANT[kind]) === variant;
  });
}

function allocateCatalogSections(layout, sections) {
  const slots = (layout.slots || []).filter((slot) => (slot.accepts || []).length);
  const bySlot = new Map(slots.map((slot) => [slot.id, []]));
  const overflow = [];
  for (const section of sections) {
    const slot = slots.find((candidate) => {
      const placed = bySlot.get(candidate.id);
      return placed.length < (candidate.max ?? Infinity) && slotAcceptsSection(candidate, section);
    });
    if (slot) bySlot.get(slot.id).push(section);
    else overflow.push(section);
  }
  return { bySlot, overflow };
}

function statusSeries(rows, page) {
  const authored = (page.workflowSteps || []).map((step) => typeof step === "string" ? step : step?.label || step?.name).filter(Boolean);
  const values = rows.map((row) => row._current_step || row._status).filter(Boolean);
  const labels = authored.length ? authored : [...new Set(values)];
  return labels.map((label) => ({ label, value: values.filter((value) => norm(value) === norm(label)).length }));
}

function MetricHeroPanel({ page, rows, fields }) {
  const metric = page.metrics?.[0] || { label: "Total", op: "count" };
  const value = metricRaw(rows, metric, fields);
  const trend = metricTrend(rows, metric, fields).series || [];
  const series = trend.map((point, index) => ({ label: String(index + 1), value: point }));
  return <Panel eyebrow="Primary measure" title={metric.label || "Total"} className="min-h-[18rem]">
    <div className="grid min-h-[14rem] content-between gap-6">
      <strong className="font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-none tracking-tight text-ctl-fg">
        {formatValue(value, metric.format)}
      </strong>
      {series.length > 1
        ? <LineChart data={series} grid tooltip format={(point) => formatValue(point, metric.format)} />
        : <ProgressBar value={rows.length ? Math.min(100, Math.max(8, value)) : 0} />}
    </div>
  </Panel>;
}

function CapacityHeroPanel({ page, rows, fields }) {
  const metric = (page.metrics || []).find((candidate) => candidate.op === "percentWhere" || candidate.format === "percent");
  const completed = rows.filter((row) => /done|closed|complete|approved|opened|resolved/i.test(String(row._current_step || row._status || ""))).length;
  const raw = metric ? metricRaw(rows, metric, fields) : rows.length ? (completed / rows.length) * 100 : 0;
  const value = Math.max(0, Math.min(100, Number(raw) || 0));
  return <Panel eyebrow="Current ratio" title={metric?.label || "Completion"} className="min-h-[18rem]">
    <div className="grid min-h-[14rem] place-items-center gap-4 text-center">
      <GaugeRing value={value} max={100} label={metric?.label || "Completion"} sublabel={`${Math.round(value)}% across ${rows.length} records`} minHeight={220} />
      <p className="m-0 max-w-sm text-sm text-ctl-fg-muted">{Math.round(value)}% is currently complete based on live workflow records.</p>
    </div>
  </Panel>;
}

function DerivedTrendPanel({ page, rows }) {
  const dated = rows.map((row) => ({ row, date: new Date(row._created_at || row._modified_at || NaN) }))
    .filter((entry) => !Number.isNaN(entry.date.getTime()))
    .sort((a, b) => a.date - b.date);
  const buckets = new Map();
  for (const entry of dated) {
    const label = entry.date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    buckets.set(label, (buckets.get(label) || 0) + 1);
  }
  const data = [...buckets].map(([label, value]) => ({ label, value }));
  return <Panel title={`${page.flowName || "Record"} trend`}><LineChart data={data.length ? data : statusSeries(rows, page)} grid tooltip /></Panel>;
}

function DerivedBarPanel({ page, rows }) {
  return <Panel title="Current distribution"><HBars data={statusSeries(rows, page)} /></Panel>;
}

function DerivedProgressPanel({ rows, fields }) {
  const title = fields[0];
  const value = fields.find((field) => /number|decimal|currency|percent/i.test(field.type || ""));
  const values = value ? rows.map((row) => Number(rawCell(row, value))).filter(Number.isFinite) : [];
  const max = Math.max(1, ...values);
  const items = rows.slice(0, 6).map((row, index) => ({
    label: displayCell(row, title), value: value ? Number(rawCell(row, value)) || 0 : index + 1,
    max: value ? max : Math.max(1, rows.length), tone: TONES[index % TONES.length],
  }));
  return <Panel title="Progress by record"><ProgressList items={items} /></Panel>;
}

// A catalog's CARDS are its surfaces. Wrapping the grid in a Panel steps the ambient material down
// one rung (panel -> flat), which strips every card's border, radius and shadow and leaves white
// cards on a white panel — a grid of bare columns with a stray rule above each button. So the
// gallery owns a plain header and hands the grid the page's own material, exactly as GroupCards
// does; the panel it used to sit in was chrome around chrome.
function GalleryPanel({ rows, fields, onOpen, section = {} }) {
  return <section className="grid w-full gap-4" data-express-section-kind="gallery">
    <header className="grid gap-0.5">
      {section.eyebrow && <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-secondary">{section.eyebrow}</p>}
      <h2 className="m-0 font-display text-[15px] font-semibold leading-tight tracking-tight text-text">{section.title || "Browse records"}</h2>
      {section.subtitle && <p className="m-0 text-[12.5px] text-text-muted">{section.subtitle}</p>}
    </header>
    <div data-express-gallery="">
      <ExpressCatalog rows={rows} fields={fields} section={section} onOpen={onOpen} rawCell={rawCell} displayCell={displayCell} />
    </div>
    {!rows.length && <EmptyState title="No records yet" description="Records appear here as they arrive." />}
  </section>;
}

function DerivedSlot({ layoutId, slot, page, rows, fields, onOpen, onCreate, compact, workflowSteps, sectionRenderers }) {
  const token = String(slot.accepts?.[0] || "");
  const date = fields.find((field) => /date|time/i.test(field.type || ""));
  const shared = { rows, fields, onOpen, onCreate, compact, workflowSteps, sectionRenderers };

  if (layoutId === "metric-hero" && slot.id === "hero") return <MetricHeroPanel page={page} rows={rows} fields={fields} />;
  if (layoutId === "capacity-hero" && slot.id === "hero") return <CapacityHeroPanel page={page} rows={rows} fields={fields} />;
  if (layoutId === "pipeline-review" && slot.id === "funnel") return <StagesPanel rows={rows} fields={fields} workflowSteps={workflowSteps} section={{ id: "derived-stages", kind: "queue", variant: "stages", title: "Pipeline stages", groupBy: "_current_step" }} />;
  if (token.startsWith("queue:board")) return <BoardPanel {...shared} section={{ id: `derived-${slot.id}`, kind: "queue", variant: "board", title: "Work by stage", groupBy: "_current_step" }} />;
  if (token.startsWith("queue:stages") || token.startsWith("progress:segments")) return <StagesPanel {...shared} section={{ id: `derived-${slot.id}`, kind: "queue", variant: "stages", title: "Workflow stages", groupBy: "_current_step" }} />;
  if (token.startsWith("queue") || token.startsWith("decision")) {
    const scoped = slot.id === "week" ? rows.slice(5, 10) : slot.id === "today" ? rows.slice(0, 5) : rows.slice(0, 7);
    return <Panel title={slot.id === "priority" ? "Needs attention" : slot.id === "today" ? "Today" : "Work queue"}><Queue rows={scoped} fields={fields} onOpen={onOpen} /></Panel>;
  }
  if (token.startsWith("progress:gauge")) return <CapacityHeroPanel page={page} rows={rows} fields={fields} />;
  if (token.startsWith("progress:list")) return <DerivedProgressPanel rows={rows} fields={fields} />;
  if (token.startsWith("trend-chart")) return <DerivedTrendPanel page={page} rows={rows} />;
  if (token.startsWith("bar-chart")) return <DerivedBarPanel page={page} rows={rows} />;
  if (token.startsWith("donut-chart")) return <DonutPanel data={statusSeries(rows, page)} section={{ title: "Record mix", caption: "records" }} />;
  if (token.startsWith("table:gallery")) return <GalleryPanel rows={rows} fields={fields} onOpen={onOpen} />;
  if (token.startsWith("table")) return <Panel title="Records"><Register rows={rows} fields={fields} onOpen={onOpen} compact={compact} /></Panel>;
  if (token.startsWith("timeline:calendar")) return <CalendarPanel {...shared} section={{ id: `derived-${slot.id}`, kind: "timeline", variant: "calendar", title: "Schedule", dateField: date?.id, titleField: fields[0]?.id }} />;
  if (token.startsWith("timeline")) return <ActivityPanel rows={rows} fields={fields} section={{ id: `derived-${slot.id}`, kind: "timeline", variant: "activity", title: "Recent activity", titleField: fields[0]?.id }} />;
  if (token.startsWith("form")) return <FormPanel fields={fields} onCreate={onCreate} section={{ id: `derived-${slot.id}`, kind: "form", title: page.actionLabel || `New ${page.flowName || "record"}`, fields: fields.map((field) => field.id) }} />;
  if (token.startsWith("record-detail") || token.startsWith("detail-pane")) return <CreativeSection {...shared} section={{ id: `derived-${slot.id}`, kind: token.split(":")[0], title: slot.id === "identity" ? "Record summary" : "Details", fields: fields.map((field) => field.id) }} />;
  if (token.startsWith("progress:steps")) return <StepsPanel rows={rows} fields={fields} workflowSteps={workflowSteps} section={{ id: `derived-${slot.id}`, kind: "progress", variant: "steps", title: "Progress" }} />;
  return <Panel title="Records"><Queue rows={rows.slice(0, 7)} fields={fields} onOpen={onOpen} /></Panel>;
}

function metricAreaFor(layout) {
  return ({
    "side-top": "side", support: "support", "toolbar-right": "toolbar",
    "identity-right": "identity", "controls-right": "controls", "rail-top": "rail",
  })[layout.metrics?.placement] || null;
}

function catalogMetrics(page, layout) {
  const max = Math.max(0, Number(layout.metrics?.max) || 0);
  if (!max || !page.metrics?.length) return [];
  if (layout.id === "metric-hero") return page.metrics.slice(1, max + 1);
  if (layout.id === "capacity-hero") {
    const ratio = page.metrics.find((metric) => metric.op === "percentWhere" || metric.format === "percent");
    return page.metrics.filter((metric) => metric !== ratio).slice(0, max);
  }
  return page.metrics.slice(0, max);
}

// Split a grid-template-columns string into its tracks without breaking `minmax(0, 1fr)` apart.
function splitTracks(columns) {
  const tracks = [];
  let depth = 0, current = "";
  for (const char of String(columns)) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (/\s/.test(char) && depth === 0) { if (current) { tracks.push(current); current = ""; } continue; }
    current += char;
  }
  if (current) tracks.push(current);
  return tracks;
}

// A TEMPLATE IS A MAXIMUM, NOT A PROMISE. form-focus is "48px 3fr 2fr — nav | form | context", and a
// page that has an intake form but no nav and no context rail still paid for all three: 48px of dead
// gutter on the left and two fifths of the page empty on the right, with the section below starting
// at a different left edge because it was not in the template at all. An area nothing renders into
// is dropped from the areas AND its track is dropped from the columns, so the page is laid out for
// what it actually has.
function pruneGrid(layout, filled) {
  const rows = layout.grid?.areas || [];
  const tracks = splitTracks(catalogColumns(layout));
  const width = Math.max(0, ...rows.map((row) => row.length));
  if (!rows.length || tracks.length !== width) return { areas: rows.map((row) => `"${row.join(" ")}"`).join(" "), columns: catalogColumns(layout) };
  const masked = rows.map((row) => row.map((area) => (area && area !== "." && filled.has(area) ? area : ".")));
  const keptColumns = [];
  for (let i = 0; i < width; i += 1) if (masked.some((row) => row[i] && row[i] !== ".")) keptColumns.push(i);
  const keptRows = masked.filter((row) => row.some((area) => area !== "."));
  if (!keptColumns.length || !keptRows.length) return { areas: undefined, columns: "minmax(0, 1fr)" };
  return {
    areas: keptRows.map((row) => `"${keptColumns.map((i) => row[i]).join(" ")}"`).join(" "),
    columns: keptColumns.map((i) => tracks[i]).join(" "),
  };
}

function catalogColumns(layout) {
  const columns = String(layout.grid?.columns || "1fr");
  // Repeated columns belong to GalleryCards/Board, not the single section wrapper.
  return layout.id === "card-gallery" || columns.includes("status-count") ? "minmax(0, 1fr)" : columns;
}

function CatalogComposition({ page, layout, sections, ...props }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = resolveRecordSelection(props.rows, selectedId);
  if (layout.id === "split-master-detail") return <MasterDetailComposition key={page.id} page={page} sections={sections} {...props} />;
  const recordHub = layout.id === "record-hub";
  const recordFocused = recordHub || layout.id === "approval-desk";
  const { bySlot, overflow } = allocateCatalogSections(layout, sections);
  const uniqueAreas = [...new Set((layout.grid?.areas || []).flat().filter((area) => area && area !== "."))];
  const slotByArea = new Map((layout.slots || []).map((slot) => [slot.area, slot]));
  const metricArea = metricAreaFor(layout);
  const metrics = catalogMetrics(page, layout);
  const topMetrics = metrics.length > 0 && (!metricArea || !uniqueAreas.includes(metricArea));
  const gap = Number(layout.grid?.gap) === 0 ? "none" : Number(layout.grid?.gap) <= 3 ? "sm" : "md";
  const rendered = uniqueAreas.map((area) => {
    const slot = slotByArea.get(area);
    const assigned = [...(slot ? bySlot.get(slot.id) || [] : [])];
    if (layout.id === "approval-desk" && area === "checks") assigned.sort((a, b) => Number(b.kind === "progress") - Number(a.kind === "progress"));
    const pieces = [];
    if (metrics.length > 0 && metricArea === area) pieces.push(<Metrics key="metrics" rows={props.rows} metrics={metrics} fields={props.fields} emphasis={page.design?.emphasis} />);
    for (const section of assigned) pieces.push(<SectionSlot key={section.id || `${section.kind}-${section.title}`} section={section} {...props}
      rows={recordFocused && ["record-detail", "decision", "progress"].includes(section.kind) ? selected ? [selected] : [] : props.rows}
      onOpen={recordHub && section.kind === "timeline" ? (row) => setSelectedId(row._id) : props.onOpen} />);
    if (slot && !assigned.length && (slot.min || 0) > 0) pieces.push(<DerivedSlot key="derived" layoutId={layout.id} slot={slot} page={page} {...props} />);
    return { area, pieces };
  }).filter((entry) => entry.pieces.length > 0);
  const grid = pruneGrid(layout, new Set(rendered.map((entry) => entry.area)));

  return <SurfaceGroup gap="md" data-express-composition={layout.id} data-express-layout-family={layout.family}>
    {recordFocused && selected && <div className="flex flex-wrap items-end gap-3">
      <div className="w-full min-w-0 max-w-lg"><Select label="Selected record" value={selected._id} onChange={setSelectedId}
        options={props.rows.map((row, index) => ({ value: row._id, label: `${displayCell(row, props.fields[0])} · ${displayCell(row, props.fields[1])} · ${index + 1}` }))} /></div>
      <Button onClick={() => props.onOpen(selected)}>Open record<ArrowRight size={15} /></Button>
    </div>}
    {topMetrics && <Metrics rows={props.rows} metrics={metrics} fields={props.fields} emphasis={page.design?.emphasis} />}
    <SurfaceGroup
      layout="grid"
      gap={gap}
      data-express-catalog-grid=""
      style={{ "--express-layout-columns": grid.columns, "--express-layout-areas": grid.areas }}
    >
      {rendered.map(({ area, pieces }) => (
        <SurfaceCell key={area} padded={false} data-express-layout-area={area} style={{ "--express-layout-area": area }} className="min-w-0">
          {pieces.length === 1 ? pieces[0] : <SurfaceGroup gap="md">{pieces}</SurfaceGroup>}
        </SurfaceCell>
      ))}
    </SurfaceGroup>
    {/* One leftover section is a row of its own, not half a row beside nothing: a two-column overflow
        grid left the loan inbox at 666px with an empty 680px beside it. */}
    {overflow.length > 0 && <SurfaceGroup layout="grid" gap="md" className={overflow.length > 1 ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"} data-express-overflow="">
      {overflow.map((section) => <SectionSlot key={section.id || `${section.kind}-${section.title}`} section={section} {...props} />)}
    </SurfaceGroup>}
  </SurfaceGroup>;
}

// VIEWER IDENTITY — a page whose title claims the reader ("My …") must show only the reader's rows.
// Metrics aggregate whatever rows they are handed, and nothing in the section grammar could say
// "these rows are mine", so such a page totalled the whole table under a personal heading.
// `page.identity` names the field that carries a person; every metric, section and table on the
// page then sees only that person's rows.
//
// Resolution is deliberately honest rather than clever. It matches the signed-in user against the
// field first. When there is no match the behaviour splits on whether we know who is looking:
// with a signed-in user we scope to THEM anyway — an empty page is the truth for someone with no
// records yet, and the only safe answer once deployed — and only the anonymous offline preview,
// which has no user to be wrong about, pins to the first identity in the data. The disclosure is
// the page SUBTITLE, which names whose figures these are in every context — a personal page
// quietly showing a stranger's numbers is the bug this exists to kill, and the subtitle kills it.
// A banner explaining the pin was tried and removed: its condition is true in essentially every
// offline preview and false in every deployed one, so it only ever cost the fold to explain the
// harness.
// The accounts an offline preview (u_mock) and the dev-key shim (u_live) sign in as. They are
// synthetic by construction and can never appear in a seeded flow.
const SYNTHETIC_USER_IDS = new Set(["u_mock", "u_live"]);

function resolveViewer(spec, rows, fields, kf) {
  if (!spec?.field) return null;
  const field = byRef(fields, spec.field);
  if (!field) return null;
  const values = [];
  for (const row of rows) {
    // Reject on the RAW cell: displayCell renders an empty one as "—", which would otherwise
    // enter the candidate list as a person and let a page pin to "rows with no owner".
    const raw = rawCell(row, field);
    if (raw == null || raw === "") continue;
    const v = displayCell(row, field);
    if (!values.includes(v)) values.push(v);
  }
  const me = [kf?.user?._id, kf?.user?.Email, kf?.user?.Name].filter(Boolean).map((v) => String(v).toLowerCase());
  const mine = values.find((v) => me.includes(String(v).toLowerCase()));
  if (mine) return { field, value: mine, matched: true, total: values.length };
  // NO MATCH — and the two no-match cases are not the same thing.
  //
  // A REAL signed-in account with no records keeps its own name: "you have nothing here" is true,
  // and showing someone else's rows under "My Leave" would be a lie.
  //
  // A SYNTHETIC account cannot be true either way. Offline preview signs in as u_mock ("Dev User")
  // and the dev-key shim as u_live; neither can ever appear in seeded data, so pinning to it filters
  // every row away and a personal page renders as zeros — the feature looks broken in the one place
  // it is judged. Pin to a real identity instead; the subtitle names whose figures these are, so it
  // is labelled rather than impersonated.
  if (SYNTHETIC_USER_IDS.has(String(kf?.user?._id || "")) && values.length)
    return { field, value: values[0], matched: false, total: values.length };
  const self = [kf?.user?.Name, kf?.user?.Email, kf?.user?._id].find(Boolean);
  if (self) return { field, value: cellText(self), matched: false, total: values.length };
  if (!values.length) return null;
  return { field, value: values[0], matched: false, total: values.length };
}

export function ExpressPage({ page, sectionRenderers = {} }) {
  usePageTitle(page.title);
  const pageLayout = page.layout || "stacked";
  // TWO layout systems can claim one page, and the page's own declaration used to lose silently.
  // A compiled page carries composition.zones — what THIS page decided its rows are — and also a
  // `layout` name. When that name happens to match a catalog template id, the catalog took over and
  // the zones were never read. On the Bus Fleet intake page that meant the declared split at 2:1 was
  // discarded for the template's `48px 3fr 2fr`: the form landed in the 3fr track at 605px, offset by
  // the 48px nav column it has no nav for, while the table missed the context slot and rendered full
  // width. Two cards, two different left edges, on a page that had asked for neither.
  //
  // An explicit declaration beats a lookup by name. A catalog template is the fallback for a page
  // that did not decide for itself.
  const declaresOwnZones = Array.isArray(page.composition?.zones) && page.composition.zones.length > 0;
  const catalogLayout = declaresOwnZones ? null : (CATALOG_BY_ID.get(pageLayout) || null);
  const kf = useKf();
  const model = modelFor(page);
  const flowType = page.flowType || model?.type || "Form";
  const flowId = page.flowId || model?.id;
  const data = useFlow(flowType, flowId);
  const [query, setQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(false);

  const fields = useMemo(() => {
    const requested = (page.fields || []).map((f) => fieldFor(model, f)).filter(Boolean);
    if (requested.length) return requested;
    return (model?.fields || []).slice(0, 5).map((f) => ({ id: f.id, label: f.name, type: f.type }));
  }, [model, page.fields]);

  // Section bindings may reference fields outside the register's visible columns.
  const sectionFields = useMemo(() => [...new Map([
    ...fields,
    ...(model?.fields || []).map((field) => fieldFor(model, field.name)),
    ...Object.values(SYSTEM_FIELDS),
  ].map((field) => [field.id, field])).values()], [fields, model]);

  const viewer = useMemo(() => resolveViewer(page.identity, data.rows, fields, kf), [page.identity, data.rows, fields, kf]);
  const ownRows = useMemo(() => (
    viewer ? data.rows.filter((row) => displayCell(row, viewer.field) === viewer.value) : data.rows
  ), [data.rows, viewer]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ownRows;
    return ownRows.filter((row) => fields.some((f) => displayCell(row, f).toLowerCase().includes(q)));
  }, [ownRows, fields, query]);

  const modalFields = useMemo(() => {
    const wanted = new Set(fields.map((field) => norm(field.id)));
    return (model?.fields || []).filter((field) => wanted.has(norm(field.id)) && !/^_/.test(field.id || "")).slice(0, 8);
  }, [model, fields]);
  const canEditInModal = modalFields.length > 0 && modalFields.length <= 8 && !modalFields.some((field) => /attachment|file|table|model|richtext/i.test(field.type || ""));

  const handle = flowId ? flowHandle(kf, flowType, flowId) : null;
  const closeRecord = () => { setSelectedRow(null); setEditingRow(false); };
  const open = (row) => { setEditingRow(false); setSelectedRow(row || null); };
  const openFull = (row) => handle?.openForm({ itemId: row?._id, instanceId: row?._id, _id: row?._id });
  const create = () => handle?.openForm({});
  const canCreate = (page.actions || []).includes("create");
  const compact = page.design?.density === "compact" || page.archetype === "operations";
  const emphasis = page.design?.emphasis || "balanced";
  const dashboard = (page.layout || "auto") === "auto"
    ? page.archetype === "overview"
    : DASHBOARD_LAYOUTS.has(page.layout);
  const showMetrics = dashboard && Boolean(page.metrics?.length);
  const creative = Array.isArray(page.sections) && page.sections.length > 0;
  const action = canCreate ? (
    <Button variant="primary" onClick={create}><Plus size={15} />{page.actionLabel || `New ${model?.name || "record"}`}</Button>
  ) : null;
  const breadcrumb = [
    { label: appSchema?.app?.name || "App", href: "#" },
    { label: page.title },
  ];

  if (!model || !flowId) {
    return <PageBody><SurfaceGroup><Callout tone="danger" title="This page is not connected">The page plan does not resolve to an app flow.</Callout></SurfaceGroup></PageBody>;
  }

  return (
    <div className="flex min-h-full w-full flex-col" data-express-page="" data-express-archetype={page.archetype} data-express-layout={pageLayout}>
      <PageHeader title={page.title} description={page.subtitle} breadcrumb={breadcrumb} actions={action} />

      <PageBody className="flex-1" data-express-page-body="">
      <SurfaceGroup gap="md" className="w-full flex-1">
      {data.blocked ? <SurfaceCell padded={false}><NoAccess what={model.name} /></SurfaceCell> : data.error ? (
        <SurfaceCell padded={false}><Callout tone="danger" title={`Couldn't load ${model.name}`}>{data.error}</Callout></SurfaceCell>
      ) : data.loading ? (
        <>{showMetrics && <Metrics rows={[]} metrics={page.metrics} fields={fields} emphasis={emphasis} />}<Card role="list"><SkeletonText lines={6} /></Card></>
      ) : (
        <>
          {/* ownRows, not data.rows: on a personal page the KPIs are the reader's figures, the same
              rows every section below them shows. Counting the whole flow put "20 awaiting" above
              a list of the reader's one request. */}
          {!catalogLayout && showMetrics &&
            <Metrics rows={ownRows} metrics={page.metrics} fields={fields} emphasis={emphasis} />}

          {catalogLayout ? (
            <CatalogComposition page={page} key={page.id} layout={catalogLayout} sections={page.sections || []} rows={ownRows} fields={sectionFields} onOpen={open} onCreate={canCreate ? create : undefined} compact={compact} workflowSteps={page.workflowSteps || []} sectionRenderers={sectionRenderers} />
          ) : creative ? (
            page.adaptive ?
              <AdaptiveComposition page={page} sections={page.sections} rows={ownRows} fields={sectionFields} onOpen={open} onCreate={canCreate ? create : undefined} compact={compact} workflowSteps={page.workflowSteps || []} sectionRenderers={sectionRenderers} /> :
              <LegacyComposition page={page} sections={page.sections} rows={ownRows} fields={sectionFields} onOpen={open} onCreate={canCreate ? create : undefined} compact={compact} workflowSteps={page.workflowSteps || []} sectionRenderers={sectionRenderers} />
          ) : page.archetype === "intake" ? (
            <Card
              tone="info"
              title={page.actionLabel || `Create ${model.name}`}
              subtitle={page.prompt || page.subtitle || `Start a new ${model.name.toLowerCase()} and track it here.`}
              actions={<Button variant="primary" onClick={create}><Plus size={15} />{page.actionLabel || "Get started"}</Button>}
            />
          ) : null}

          {!creative && <Card
            role="list"
            title={page.sectionTitle || (page.archetype === "queue" ? "Waiting for attention" : model.name)}
            actions={<span className="inline-flex items-center gap-1 text-xs text-ctl-fg-muted"><Inbox size={14} />{rows.length} record{rows.length === 1 ? "" : "s"}</span>}
          >
            {ownRows.length > 4 && page.archetype !== "queue" && (
              <SearchBar value={query} onChange={setQuery} placeholder={`Search ${model.name.toLowerCase()}…`} count={`${rows.length} of ${ownRows.length}`} className="mb-4" />
            )}
            {!ownRows.length ? (
              <EmptyState
                icon={page.archetype === "intake" ? <Plus size={26} /> : <Search size={26} />}
                title={page.emptyTitle || `No ${model.name.toLowerCase()} yet`}
                description={page.emptyMessage || (canCreate ? "Create the first record to get this workspace moving." : "Records will appear here when work reaches this stage.")}
              >
                {canCreate ? <Button variant="primary" onClick={create}>{page.actionLabel || "Create one"}<ArrowRight size={14} /></Button> : null}
              </EmptyState>
            ) : page.archetype === "queue" ? (
              <Queue rows={rows} fields={fields} onOpen={open} />
            ) : (
              <Register rows={rows} fields={fields} onOpen={open} compact={compact} />
            )}
          </Card>}
        </>
      )}
      </SurfaceGroup>
      </PageBody>

      {page.recordSurface === "drawer" && !editingRow ? (
        <Drawer
          open={Boolean(selectedRow)}
          onClose={closeRecord}
          title={selectedRow ? displayCell(selectedRow, fields[0]) : "Record details"}
          footer={<>
            <Button variant="secondary" onClick={closeRecord}>Close</Button>
            {canEditInModal && <Button variant="secondary" onClick={() => setEditingRow(true)}>Edit here</Button>}
            {(page.actions || []).includes("open") && <Button variant="primary" onClick={() => { const row = selectedRow; closeRecord(); openFull(row); }}>Open full record</Button>}
          </>}
        >
          {selectedRow && <DescriptionList columns={1} items={fields.slice(0, 10).map((field) => ({ label: field.label, value: displayCell(selectedRow, field) }))} />}
        </Drawer>
      ) : (
      <Modal
        open={Boolean(selectedRow)}
        onClose={closeRecord}
        title={selectedRow ? `${editingRow ? "Edit " : ""}${displayCell(selectedRow, fields[0])}` : "Record details"}
        size={editingRow ? "lg" : "md"}
        footer={editingRow ? null : <>
          <Button variant="secondary" onClick={closeRecord}>Close</Button>
          {canEditInModal && <Button variant="secondary" onClick={() => setEditingRow(true)}>Edit here</Button>}
          {(page.actions || []).includes("open") && <Button variant="primary" onClick={() => { const row = selectedRow; closeRecord(); openFull(row); }}>Open full record</Button>}
        </>}
      >
        {selectedRow && (editingRow ? <ItemForm
          key={selectedRow._id}
          flowType={flowType}
          flowId={flowId}
          item={selectedRow}
          fields={modalFields}
          required={modalFields.filter((field) => field.required).map((field) => field.id)}
          onSaved={data.reload}
          onClose={closeRecord}
          embedded
        /> : <DescriptionList columns={2} items={fields.slice(0, 8).map((field) => ({ label: field.label, value: displayCell(selectedRow, field) }))} />)}
      </Modal>
      )}
    </div>
  );
}
