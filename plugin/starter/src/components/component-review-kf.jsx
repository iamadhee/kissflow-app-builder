import { lazy, Suspense, useMemo, useState } from "react";

import { ComponentGroup, VariantRow } from "./component-review-layout.jsx";
import { Button } from "./kit/Button.jsx";
import { CalendarView } from "./kit/CalendarView.jsx";
import { CsvImport } from "./kit/CsvImport.jsx";
import { AdvancedDataGrid } from "./kit/AdvancedDataGrid.jsx";
import { FlowDiagram } from "./kit/FlowDiagram.jsx";
import { GanttChart } from "./kit/GanttChart.jsx";
import { KfQueryProvider } from "./kit/KfQuery.jsx";
import { FadeIn, Stagger } from "./kit/Motion.jsx";
import { SmartForm } from "./kit/SmartForm.jsx";
import { SortableList } from "./kit/SortableList.jsx";
import { VirtualList } from "./kit/VirtualList.jsx";
import { WidgetBoundary } from "./kit/WidgetBoundary.jsx";

const LazyBars3D = lazy(() => import("./kit/Scene3D.jsx").then((module) => ({ default: module.Bars3D })));

const now = new Date();
const calendarDate = (day, hour = 9) => new Date(now.getFullYear(), now.getMonth(), day, hour);

const CALENDAR_EVENTS = [
  { id: 1, title: "SHP-2026-0033", start: calendarDate(6), end: calendarDate(6, 11), tone: "amber", destination: "Ohio Fulfillment Hub", vendor: "Cascade Freight", units: "800 units", status: "In transit" },
  { id: 2, title: "Northwind approval", start: calendarDate(6, 11), end: calendarDate(6, 12), tone: "amber", destination: "Packaging", vendor: "Northwind Components", status: "Awaiting approval" },
  { id: 3, title: "Overflow 108%", start: calendarDate(6, 13), end: calendarDate(6, 14), tone: "rose", destination: "Packaging Overflow", status: "Critical" },
  { id: 4, title: "Refrigeration alarm", start: calendarDate(6, 15), end: calendarDate(6, 16), tone: "amber", destination: "Cold Storage", status: "Investigating" },
  { id: 5, title: "SHP-2026-0031", start: calendarDate(8), end: calendarDate(8, 11), tone: "indigo", destination: "Reno Distribution Center", vendor: "Northwind Components", units: "1,200 units", status: "Scheduled" },
  { id: 6, title: "SHP-2026-0034", start: calendarDate(10), end: calendarDate(10, 11), tone: "indigo", destination: "Columbus", vendor: "Meridian Steel", units: "450 units", status: "Scheduled" },
  { id: 7, title: "SHP-2026-0032", start: calendarDate(12), end: calendarDate(12, 11), tone: "rose", destination: "Reno Distribution Center", vendor: "Brightline Logistics", units: "2,000 units", status: "Delayed" },
];

const GRID_COLUMNS = [
  { key: "vendor", label: "Vendor", width: 220 },
  { key: "category", label: "Category", width: 180 },
  { key: "risk", label: "Risk", width: 110 },
  { key: "openItems", label: "Open items", width: 120, align: "right" },
];

const GRID_ROWS = [
  { vendor: "Meridian Steel Fabrication", category: "Raw materials", risk: "High", openItems: 7 },
  { vendor: "Brightline Logistics", category: "Logistics", risk: "Medium", openItems: 3 },
  { vendor: "Solvent Grove IT", category: "Software", risk: "Low", openItems: 2 },
  { vendor: "Alderwood Facilities", category: "Facilities", risk: "Medium", openItems: 5 },
  { vendor: "Emberline Studio", category: "Professional services", risk: "Low", openItems: 1 },
];

const FLOW_STEPS = [
  { id: "request", label: "Request received", actor: "Requester", state: "done" },
  { id: "review", label: "Compliance review", actor: "Risk team", state: "done" },
  { id: "approval", label: "Commercial approval", actor: "Procurement", state: "current" },
  { id: "setup", label: "Vendor setup", actor: "Operations", state: "todo" },
  { id: "activation", label: "Activation", actor: "System", state: "todo" },
];

const GANTT_TASKS = [
  { id: "bulk", name: "Raw Material Bulk Order", start: "2026-08-01", end: "2026-09-05", status: "In Progress" },
  { id: "cold", name: "Cold Storage Equipment", start: "2026-09-01", end: "2026-10-10", status: "Approved" },
  { id: "packaging", name: "Packaging Restock", start: "2026-09-05", end: "2026-09-30", status: "Submitted" },
  { id: "freight", name: "Freight Expansion", start: "2026-09-08", end: "2026-11-01", status: "Submitted" },
  { id: "steel", name: "Q3 Steel Coil", start: "2026-09-10", end: "2026-10-15", status: "Draft" },
];

const FORM_FIELDS = [
  { name: "name", label: "Service centre name", required: true, placeholder: "North operations" },
  { name: "email", label: "Escalation email", type: "email", required: true, placeholder: "ops@example.com" },
  {
    name: "region", label: "Region", type: "select", required: true, placeholder: "Select a region",
    options: [
      { value: "americas", label: "Americas" },
      { value: "emea", label: "EMEA" },
      { value: "apac", label: "APAC" },
    ],
  },
];

const INITIAL_APPROVALS = [
  { id: "security", name: "Security review", owner: "Ava Okafor" },
  { id: "legal", name: "Legal review", owner: "Ravi Menon" },
  { id: "finance", name: "Finance approval", owner: "Lin Wei" },
  { id: "operations", name: "Operations sign-off", owner: "Marta Silva" },
];

const SCENE_DATA = [
  { label: "A1 · 82%", value: 82, tone: "indigo" },
  { label: "A2 · 46%", value: 46, tone: "sky" },
  { label: "B1 · 68%", value: 68, tone: "emerald" },
  { label: "B2 · 31%", value: 31, tone: "amber" },
  { label: "C1 · 91%", value: 91, tone: "rose" },
];

function MotionExample() {
  const [replay, setReplay] = useState(0);
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setReplay((value) => value + 1)}
        className="rounded-lg border border-solid border-ctl-border bg-ctl-surface px-3 py-2 text-sm font-medium text-ctl-fg shadow-sm hover:bg-ctl-raise"
      >
        Replay motion
      </button>
      <Stagger key={replay} className="grid gap-2 sm:grid-cols-3">
        {["Intake", "Review", "Approved"].map((label, index) => (
          <div key={label} className="rounded-lg border border-solid border-ctl-border bg-ctl-surface p-3">
            <span className="text-xs font-medium text-ctl-fg-muted">0{index + 1}</span>
            <p className="mt-1 text-sm font-semibold text-ctl-fg">{label}</p>
          </div>
        ))}
      </Stagger>
      <FadeIn key={`note-${replay}`} delay={0.15}>
        <p className="text-xs text-ctl-fg-muted">Motion respects the operating system’s reduced-motion preference.</p>
      </FadeIn>
    </div>
  );
}

function SortableApprovalExample() {
  const [items, setItems] = useState(INITIAL_APPROVALS);
  return (
    <SortableList
      items={items}
      onReorder={setItems}
      renderItem={(item, index) => (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ctl-fg">{item.name}</p>
            <p className="truncate text-xs text-ctl-fg-muted">{item.owner}</p>
          </div>
          <span className="text-xs tabular-nums text-ctl-fg-muted">Step {index + 1}</span>
        </div>
      )}
    />
  );
}

function SmartFormExample() {
  const [message, setMessage] = useState("");
  return (
    <div className="max-w-xl">
      <SmartForm
        fields={FORM_FIELDS}
        submitLabel="Save service centre"
        defaultValues={{ name: "North operations", email: "ops@example.com", region: "americas" }}
        onSubmit={(values) => setMessage(`${values.name} saved for ${values.region.toUpperCase()}.`)}
      />
      {message ? <p role="status" className="mt-3 text-sm font-medium text-success-600">{message}</p> : null}
    </div>
  );
}

function FailureProbe({ failed }) {
  if (failed) throw new Error("The vendor feed returned an invalid response.");
  return <div className="rounded-lg bg-ctl-raise p-4 text-sm text-ctl-fg">Vendor health widget is operating normally.</div>;
}

function BoundaryExample() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={() => setFailed(true)}
        variant="secondary"
        size="sm"
      >
        Simulate widget failure
      </Button>
      <WidgetBoundary label="Vendor health" onReset={() => setFailed(false)}>
        <FailureProbe failed={failed} />
      </WidgetBoundary>
    </div>
  );
}

function KfComponentGroups() {
  const auditRows = useMemo(() => Array.from({ length: 2000 }, (_, index) => ({
    id: index + 1,
    action: ["Request created", "Reviewer assigned", "Document added", "Status changed"][index % 4],
    actor: ["Ava Okafor", "Ravi Menon", "Lin Wei", "System"][index % 4],
  })), []);

  return (
    <>
      <ComponentGroup name="CalendarView" description="Five theme-owned calendar readings over one event, navigation and selection model.">
        <VariantRow name="Theme selected">
          <CalendarView events={CALENDAR_EVENTS} height={680} defaultSelectedDate={calendarDate(8)} onSelectEvent={() => {}} />
        </VariantRow>
        <VariantRow name="Layout · Operational grid">
          <CalendarView variant="operational-grid" events={CALENDAR_EVENTS} height={680} onSelectEvent={() => {}} />
        </VariantRow>
        <VariantRow name="Layout · Adaptive grid">
          <CalendarView variant="adaptive-grid" events={CALENDAR_EVENTS} height={680} />
        </VariantRow>
        <VariantRow name="Layout · Date focus">
          <CalendarView variant="date-focus" events={CALENDAR_EVENTS} height={680} defaultSelectedDate={calendarDate(8)} />
        </VariantRow>
        <VariantRow name="Layout · Destination cards">
          <CalendarView variant="destination-cards" events={CALENDAR_EVENTS} height={680} defaultSelectedDate={calendarDate(6)} />
        </VariantRow>
        <VariantRow name="Layout · Today and next">
          <CalendarView variant="today-reader" events={CALENDAR_EVENTS} height={680} defaultSelectedDate={calendarDate(8)} />
        </VariantRow>
        <VariantRow name="Existing · Empty">
          <CalendarView variant="operational-grid" events={[]} height={160} emptyText="No inspections scheduled this month." />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="CsvImport" description="Safe CSV intake with file validation, parsing and a review-before-import preview.">
        <VariantRow name="Vendor import · Ready">
          <CsvImport label="Drop a vendor register CSV here, or click to choose" onRows={() => {}} />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="AdvancedDataGrid" description="A searchable and sortable work surface for operational record sets.">
        <VariantRow name="Vendor register · Interactive">
          <AdvancedDataGrid columns={GRID_COLUMNS} rows={GRID_ROWS} maxHeight={320} />
        </VariantRow>
        <VariantRow name="Vendor register · Empty">
          <AdvancedDataGrid columns={GRID_COLUMNS} rows={[]} search={false} emptyText="No vendors match this workspace." />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FlowDiagram" description="A readable workflow map for ownership, progress and blocked stages.">
        <VariantRow name="Onboarding · Current path">
          <FlowDiagram steps={FLOW_STEPS} perRow={3} height={360} />
        </VariantRow>
        <VariantRow name="Workflow · Empty">
          <FlowDiagram steps={[]} height={160} />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="GanttChart" description="Theme-owned date planning for work that overlaps and may start without approval.">
        <VariantRow name="Theme owned">
          <InteractiveGantt tasks={GANTT_TASKS} today="2026-09-06" />
        </VariantRow>
        <VariantRow name="Status timeline">
          <InteractiveGantt tasks={GANTT_TASKS} variant="status-timeline" today="2026-09-06" />
        </VariantRow>
        <VariantRow name="Approval schedule">
          <InteractiveGantt tasks={GANTT_TASKS} variant="approval-schedule" today="2026-09-06" />
        </VariantRow>
        <VariantRow name="Launch plan · Empty">
          <InteractiveGantt tasks={[]} height={160} />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="KfQuery" description="The shared server-state provider that deduplicates requests and owns cache behavior.">
        <VariantRow name="Provider · Shared cache">
          <KfQueryProvider>
            <div className="rounded-xl border border-solid border-ctl-border bg-ctl-surface p-4">
              <p className="text-sm font-semibold text-ctl-fg">Kissflow query cache is available</p>
              <p className="mt-1 text-xs text-ctl-fg-muted">Place data widgets inside this provider to share loading, error and refresh state.</p>
            </div>
          </KfQueryProvider>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Motion" description="Reduced-motion-safe entrance and stagger helpers for page and widget transitions.">
        <VariantRow name="Entrance · Replayable">
          <MotionExample />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Scene3D" description="Lazy-loaded spatial data for use cases where position or volume is the information.">
        <VariantRow name="Warehouse zones · Occupancy">
          <Suspense fallback={<div className="grid h-[320px] place-items-center rounded-xl bg-ctl-raise text-sm text-ctl-fg-muted">Loading spatial view…</div>}>
            <LazyBars3D data={SCENE_DATA} height={320} autoRotate={false} />
          </Suspense>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SmartForm" description="Validated utility and settings forms with field-level errors.">
        <VariantRow name="Service centre · Settings">
          <SmartFormExample />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SortableList" description="Pointer and keyboard reordering for sequences whose order is meaningful.">
        <VariantRow name="Approval chain · Reorder">
          <SortableApprovalExample />
        </VariantRow>
        <VariantRow name="Approval chain · Empty">
          <SortableList items={[]} emptyText="No approval steps configured." />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="VirtualList" description="Large lists that preserve every record while rendering only the visible rows.">
        <VariantRow name="Audit log · 2,000 records">
          <VirtualList
            rows={auditRows}
            height={300}
            rowHeight={52}
            renderRow={(row) => (
              <div className="flex min-h-[52px] items-center justify-between gap-4 border-0 border-b border-solid border-ctl-border px-4 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ctl-fg">{row.action}</p>
                  <p className="truncate text-xs text-ctl-fg-muted">{row.actor}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-ctl-fg-muted">#{String(row.id).padStart(4, "0")}</span>
              </div>
            )}
          />
        </VariantRow>
        <VariantRow name="Audit log · Empty">
          <VirtualList rows={[]} height={160} emptyText="No audit events recorded." />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="WidgetBoundary" description="Per-widget failure isolation with an understandable recovery state.">
        <VariantRow name="Failure · Recoverable">
          <BoundaryExample />
        </VariantRow>
      </ComponentGroup>
    </>
  );
}

export { KfComponentGroups };
export default KfComponentGroups;
