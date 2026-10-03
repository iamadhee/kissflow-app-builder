import { useMemo, useState } from "react";
import { LayoutDashboard, Zap } from "lucide-react";
import { Accordion } from "./kit/Accordion.jsx";
import { Alert } from "./kit/Alert.jsx";
import { Avatar, AvatarGroup } from "./kit/Avatar.jsx";
import { Badge, Tag } from "./kit/Badge.jsx";
import { BarChart } from "./kit/BarChart.jsx";
import { KanbanBoard } from "./kit/Board.jsx";
import { Breadcrumb } from "./kit/Breadcrumb.jsx";
import { Button } from "./kit/Button.jsx";
import { Calendar } from "./kit/Calendar.jsx";
import { Card } from "./kit/Card.jsx";
import { Checkbox, RadioGroup } from "./kit/Checkbox.jsx";
import { Combobox } from "./kit/Combobox.jsx";
import { CommandPalette } from "./kit/CommandPalette.jsx";
import { DateField } from "./kit/DateField.jsx";
import { DatePicker } from "./kit/DatePicker.jsx";
import { DescriptionList } from "./kit/DescriptionList.jsx";
import { DonutLegend, Legend } from "./kit/DonutLegend.jsx";
import { Drawer } from "./kit/Drawer.jsx";
import { EmptyState } from "./kit/EmptyState.jsx";
import { FileDrop } from "./kit/FileDrop.jsx";
import { Gate } from "./kit/FlowViews.jsx";
import { FieldInput } from "./kit/Forms.jsx";
import { FunnelChart } from "./kit/FunnelChart.jsx";
import { CountUp, FilterBar, SearchBar, StoresMap, toast } from "./kit/Fx.jsx";
import { GaugeRing } from "./kit/GaugeRing.jsx";
import { HBars } from "./kit/HBars.jsx";
import { Heatmap } from "./kit/Heatmap.jsx";
import { HeaderIdentity } from "./kit/HeaderIdentity.jsx";
import { Icon } from "./kit/Icon.jsx";
import { Input } from "./kit/Input.jsx";
import { LineChart } from "./kit/LineChart.jsx";
import { Menu } from "./kit/Menu.jsx";
import { Modal } from "./kit/Modal.jsx";
import { MultiCombobox } from "./kit/MultiCombobox.jsx";
import { NavItem } from "./kit/NavItem.jsx";
import { NumberInput } from "./kit/NumberInput.jsx";
import { PageHeader } from "./kit/PageHeader.jsx";
import { Pagination } from "./kit/Pagination.jsx";
import { Popover, PopoverItem, PopoverSeparator } from "./kit/Popover.jsx";
import { ProgressBar } from "./kit/ProgressBar.jsx";
import { ProgressList } from "./kit/ProgressList.jsx";
import { ApprovalQueue, WipStrip } from "./kit/Queue.jsx";
import { SegmentBar } from "./kit/SegmentBar.jsx";
import { Select } from "./kit/Select.jsx";
import { SidebarWordmark } from "./kit/SidebarWordmark.jsx";
import { Skeleton, SkeletonRow, SkeletonText } from "./kit/Skeleton.jsx";
import { RangeSlider, Slider } from "./kit/Slider.jsx";
import { StackedBar } from "./kit/StackedBar.jsx";
import { StatTile } from "./kit/StatTile.jsx";
import { Stepper } from "./kit/Stepper.jsx";
import { Table } from "./kit/Table.jsx";
import { Tabs } from "./kit/Tabs.jsx";
import { Textarea } from "./kit/Textarea.jsx";
import { ThemeToggle } from "./kit/ThemeProvider.jsx";
import { Timeline } from "./kit/Timeline.jsx";
import { Toast } from "./kit/Toast.jsx";
import { Toggle } from "./kit/Toggle.jsx";
import { FilterChip, Toolbar, ViewSwitch } from "./kit/Toolbar.jsx";
import { Tooltip } from "./kit/Tooltip.jsx";
import { Tree } from "./kit/Tree.jsx";
import { componentFile, componentOrder } from "./component-review-files.js";

const OPTIONS = [
  { value: "triage", label: "Triage" },
  { value: "inspection", label: "Inspection" },
  { value: "approval", label: "Approval" },
  { value: "closed", label: "Closed", disabled: true },
];

const CHART_DATA = [
  { label: "Mon", value: 18 },
  { label: "Tue", value: 26 },
  { label: "Wed", value: 22 },
  { label: "Thu", value: 34 },
  { label: "Fri", value: 29 },
  { label: "Sat", value: 16 },
  { label: "Sun", value: 21 },
];

const LINE_CHART_DATA = [
  { label: "Jul 14", value: 18 },
  { label: "Jul 21", value: 32 },
  { label: "Jul 28", value: 25 },
  { label: "Aug 4", value: 40 },
  { label: "Aug 11", value: 56 },
  { label: "Aug 18", value: 50 },
  { label: "Aug 25", value: 70 },
  { label: "Sep 1", value: 78 },
];

const LINE_CHART_COMPARE_DATA = [
  { label: "Jul 14", value: 17 },
  { label: "Jul 21", value: 30 },
  { label: "Jul 28", value: 27 },
  { label: "Aug 4", value: 42 },
  { label: "Aug 11", value: 54 },
  { label: "Aug 18", value: 52 },
  { label: "Aug 25", value: 68 },
  { label: "Sep 1", value: 77 },
];

const LINE_CHART_PERCENT_DATA = [58, 59, 58.5, 60, 61.5, 61, 63, 64].map((value, index) => ({
  label: LINE_CHART_DATA[index].label,
  value,
}));

const CAPACITY_DATA = [
  { label: "Raw materials", value: 62, color: "var(--success-600)" },
  { label: "Packaging", value: 108, color: "var(--danger-600)" },
  { label: "Finished goods", value: 50, color: "var(--success-600)" },
  { label: "Cold storage", value: 50, color: "var(--success-600)" },
  { label: "General storage", value: 95, color: "var(--warning-700)" },
  { label: "Bulk storage", value: 17, color: "var(--success-600)" },
];

const BAR_CHART_VARIANTS = ["capacity-tracks", "stem-and-cap", "threshold-grid", "segmented-bricks", "continuous-silhouette"];
const LINE_CHART_VARIANTS = ["area-points", "reference-grid", "step-line", "curve-compare"];
const GAUGE_VARIANTS = ["closed-ring", "open-ring", "semicircle"];

const WIP_STRIP_STAGES = [
  { label: "Draft", count: 1, tone: "neutral" },
  { label: "Submitted", count: 4, cap: 3, tone: "danger" },
  { label: "Approved", count: 3, tone: "success" },
  { label: "In progress", count: 2, tone: "accent" },
  { label: "Completed", count: 1, tone: "neutral" },
  { label: "Sent back", count: 1, tone: "danger" },
];

const DONUT_DATA = [
  { label: "Approved", value: 54 },
  { label: "Review", value: 28 },
  { label: "Blocked", value: 18 },
];

const SHIPMENT_STATUS_DATA = [
  { label: "Scheduled", value: 2, color: "var(--chart-1)" },
  { label: "In transit", value: 3, color: "var(--warning-600)" },
  { label: "Delayed / exception", value: 2, color: "var(--danger-600)" },
  { label: "Delivered", value: 5, color: "var(--success-600)" },
];

const DONUT_LEGEND_VARIANTS = ["simple-rows", "column-ledger", "progress-rails", "inline-summary"];

const FLOW_TIMELINE_ITEMS = [
  { id: "shipment-delivered", title: "SHP-2026-0184 delivered", description: "Reno Distribution Center · Packaging film · 1,200 units", date: "2026-09-03T10:12:00", tone: "success" },
  { id: "plan-submitted", title: "Q4 Packaging Refresh submitted", description: "Plan · $28,400 · awaiting approval", date: "2026-09-03T08:40:00", tone: "info" },
  { id: "capacity-exceeded", title: "Zone occupancy exceeded", description: "High · Capacity · investigating · Packaging Overflow at 108%", date: "2026-09-01T16:26:00", tone: "warning" },
  { id: "vendor-submitted", title: "Northwind Components submitted", description: "Vendor · Packaging · awaiting approval", date: "2026-08-27T11:05:00", tone: "info" },
  { id: "temperature-alarm", title: "Refrigeration unit temperature alarm", description: "High · Equipment · investigating", date: "2026-08-19T09:18:00", tone: "warning" },
  { id: "fire-panel", title: "Dock Door 7 fire panel fault", description: "Critical · Safety · investigating · open 26 days", date: "2026-08-10T06:02:00", tone: "danger" },
];

const TABLE_ROWS = [
  { id: "CL-1042", owner: "Ava Shah", stage: "Inspection", value: "₹1.8L" },
  { id: "CL-1043", owner: "Diego Iyer", stage: "Review", value: "₹84K" },
  { id: "CL-1044", owner: "Kim Rao", stage: "Approved", value: "₹2.4L" },
  { id: "CL-1045", owner: "Sam Lee", stage: "Blocked", value: "₹62K" },
];

const APPROVAL_QUEUE_ITEMS = [
  {
    id: "INC-003",
    title: "Critical Cold Chain Breach",
    description: "Cold Storage zone temperature exceeded threshold for 6 hours overnight due to a refrigeration unit fault.",
    meta: "Reno Fulfillment Hub",
    state: "Investigating",
    status: "Critical",
    severity: "Critical",
    tone: "danger",
    age: "21 days open",
    ageValue: "21d",
  },
  {
    id: "INC-002",
    title: "Forklift Near-Miss Safety Incident",
    description: "Forklift operator narrowly avoided a collision with a picker in the General Storage aisle due to a blind corner.",
    meta: "Reno Fulfillment Hub",
    state: "Investigating",
    status: "High",
    severity: "High",
    tone: "warning",
    age: "16 days open",
    ageValue: "16d",
  },
  {
    id: "INC-001",
    title: "Shortage on Inbound Steel Shipment",
    description: "Received quantity is short by an estimated 15 units against the manifest; count under verification.",
    meta: "SHP-2026-0026",
    state: "Reported",
    status: "High",
    severity: "High",
    tone: "warning",
    age: "4 days open",
    ageValue: "4d",
  },
];

const APPROVAL_QUEUE_SUMMARY = [
  { label: "Critical", value: 1, tone: "danger" },
  { label: "High", value: 2, tone: "warning" },
  { label: "Days, oldest", value: 21, tone: "info" },
];

const TABLE_COLUMNS = [
  { key: "id", label: "Claim", width: 120 },
  { key: "owner", label: "Owner", width: 160 },
  { key: "stage", label: "Stage", width: 140 },
  { key: "value", label: "Value", width: 100, align: "right" },
];

const TABLE_CHIP_ROWS = [
  { id: "WO-201", category: "HVAC", categorySeries: 1, priority: "High", priorityTone: "danger" },
  { id: "WO-202", category: "Electrical", categorySeries: 2, priority: "Medium", priorityTone: "warning" },
  { id: "WO-203", category: "Plumbing", categorySeries: 3, priority: "Low", priorityTone: "neutral" },
];

const TABLE_CHIP_COLUMNS = [
  { key: "id", label: "Work order", width: 140 },
  { key: "category", label: "Category", width: 180, render: (row) => <Badge series={row.categorySeries}>{row.category}</Badge> },
  { key: "priority", label: "Priority", width: 140, render: (row) => <Badge tone={row.priorityTone}>{row.priority}</Badge> },
];

const TABLE_LONG_CONTENT_ROWS = [
  {
    id: "VR-2048",
    vendor: "Cascade Consulting Partners",
    category: "Consulting",
    reason: "Sent back from Procurement Review: Missing signed tax attestation and the business justification does not specify the engagement duration — please add both and resubmit.",
    submitted: "18 Aug 2026",
  },
  {
    id: "VR-2049",
    vendor: "Nova Freight & Customs Brokers",
    category: "Logistics & Freight",
    reason: "Sent back from Finance/Compliance Review: Routing/SWIFT code on file does not match the attached bank confirmation letter — please correct the banking section and resubmit.",
    submitted: "10 Aug 2026",
  },
];

const TABLE_LONG_CONTENT_COLUMNS = [
  { key: "vendor", label: "Vendor", sizing: "balanced" },
  { key: "category", label: "Category", sizing: "compact" },
  { key: "reason", label: "Why it needs you", sizing: "fluid", grow: 3 },
  { key: "submitted", label: "Last submitted", sizing: "compact" },
];

const TREE_NODES = [
  {
    id: "workspace",
    label: "Workspace",
    meta: 4,
    children: [
      { id: "claims", label: "Claims", meta: 128 },
      { id: "approvals", label: "Approvals", meta: 14 },
      { id: "centers", label: "Service centers", meta: 9 },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    children: [
      { id: "analytics", label: "Analytics" },
      { id: "sla", label: "SLA monitor", meta: 3 },
    ],
  },
];

const ACCORDION_ITEMS = [
  { key: "summary", label: "Claim summary", meta: "Ready", content: "The inspection is complete and the evidence package is ready." },
  { key: "coverage", label: "Coverage details", content: "Battery, labor and transport are included in this warranty." },
  { key: "history", label: "Decision history", content: "Two reviewers have approved the current recommendation." },
];

const STEPPER_STEPS = [
  { label: "Submitted", hint: "Evidence received" },
  { label: "Inspection", hint: "Checks completed" },
  { label: "Review", hint: "Current step" },
  { label: "Decision", hint: "Awaiting approval" },
];

const DESCRIPTION_ITEMS = [
  { label: "Owner", value: "Ava Shah" },
  { label: "Region", value: "South" },
  { label: "Created", value: "27 Aug 2026" },
  { label: "Value", value: "₹1.8L" },
];

const FUNNEL_DATA = [
  { label: "Created", value: 7, detail: 182000 },
  { label: "Submitted", value: 6, detail: 162000 },
  { label: "Approved", value: 3, detail: 107000 },
  { label: "In progress", value: 2, detail: 55000 },
  { label: "Completed", value: 1, detail: 20000 },
];

const COMPARE_DATA = CHART_DATA.map((item) => ({ ...item, value: Math.max(4, item.value - 6) }));
const HEATMAP_DATA = Array.from({ length: 42 }, (_, index) => ({ label: `Day ${index + 1}`, value: (index * 17 + 9) % 38 }));

const HIDDEN_COMBINED_GROUPS = new Set([
  "Alert",
  "Avatar",
  "Badge and Tag",
  "Selection controls",
  "Menu, Popover and Tooltip",
  "Input and Textarea",
  "Select and Combobox",
  "Date and number fields",
  "Slider and RangeSlider",
  "Tabs and Pagination",
  "Progress",
  "SegmentBar and StackedBar",
  "Overlays",
  "ThemeToggle and Icon",
  "SidebarWordmark and NavItem",
  "SearchBar and FilterBar",
  "CountUp and StoresMap",
]);

function ReviewCard({ title, children, variant = "Default · Interactive", className = "" }) {
  if (HIDDEN_COMBINED_GROUPS.has(title)) return null;
  return (
    <section
      className={`grid gap-4 border-0 border-b border-solid border-layer-border pb-8 last:border-b-0 last:pb-0 ${className}`.trim()}
      data-component-review={title}
      style={{ order: componentOrder(title) }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 font-display text-lg font-semibold text-ctl-fg">{title}</h3>
        <code className="rounded-md bg-ctl-track px-2 py-1 text-xs text-ctl-fg-muted">{componentFile(title)}</code>
      </div>
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
        <span className="pt-1 text-xs font-medium uppercase tracking-wider text-ctl-fg-muted">{variant}</span>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function ReviewSection({ title, children }) {
  return (
    <section className="contents" aria-labelledby={`review-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
      <h2
        id={`review-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className="sr-only font-display"
      >
        {title}
      </h2>
      <div className="contents">{children}</div>
    </section>
  );
}

function StateSample({ name, children }) {
  return (
    <div className="grid gap-3 border-0 border-b border-solid border-layer-border pb-6 last:border-b-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wider text-ctl-fg-muted">{name}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ComponentReviewGallery() {
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState("inspection");
  const [enabled, setEnabled] = useState(true);
  const [selectValue, setSelectValue] = useState("inspection");
  const [comboValue, setComboValue] = useState("triage");
  const [multiValue, setMultiValue] = useState(["triage", "inspection"]);
  const [date, setDate] = useState("2026-08-27");
  const [calendarDate, setCalendarDate] = useState("2026-08-27");
  const [calendarRange, setCalendarRange] = useState({ start: "2026-08-24", end: "2026-08-29" });
  const [calendarMonth, setCalendarMonth] = useState("2026-09-01");
  const [number, setNumber] = useState(42);
  const [notes, setNotes] = useState("Inspection notes are ready for review.");
  const [slider, setSlider] = useState(68);
  const [range, setRange] = useState({ start: 24, end: 78 });
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(3);
  const [selectedRows, setSelectedRows] = useState(new Set(["CL-1043"]));
  const [sort, setSort] = useState({ key: "id", dir: "asc" });
  const [treeSelection, setTreeSelection] = useState("claims");
  const [treeExpanded, setTreeExpanded] = useState(["workspace", "insights"]);
  const [stepIndex, setStepIndex] = useState(2);
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([{ name: "inspection-report.pdf", size: 248000 }]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [accordionValue, setAccordionValue] = useState(["coverage"]);
  const [fieldValues, setFieldValues] = useState({
    subject: "Battery replacement",
    email: "reviewer@example.com",
    estimate: "86000",
    due: "2026-08-29",
    urgent: true,
    stage: "Inspection",
    notes: "Evidence received from the service center.",
    owner: { Name: "Ava Shah" },
  });

  const sortedRows = useMemo(() => {
    const rows = [...TABLE_ROWS];
    rows.sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * (sort.dir === "asc" ? 1 : -1));
    return rows;
  }, [sort]);

  const toggleSort = (key) => {
    setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));
  };

  const updateField = (id, value) => {
    setFieldValues((current) => ({ ...current, [id]: value }));
  };

  return (
    <div data-kf-component-review-gallery="" className="contents">
      <ReviewSection title="Actions and status">
        <ReviewCard title="Button" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="link">Link</Button>
              </div>
            </StateSample>
            <StateSample name="Sizes">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </StateSample>
            <StateSample name="Icons">
              <div className="flex flex-wrap items-center gap-3">
                <Button icon>Leading</Button>
                <Button variant="secondary" iconRight>Trailing</Button>
                <Button variant="ghost" icon aria-label="Icon only" />
              </div>
            </StateSample>
            <StateSample name="Busy and disabled">
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Loading</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button as="a" href="#button-disabled-link" variant="link" disabled>Disabled link</Button>
              </div>
            </StateSample>
            <StateSample name="Full width">
              <Button fullWidth>Full-width action</Button>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Badge and Tag">
          <div className="flex flex-wrap items-center gap-2">
            {['neutral', 'accent', 'success', 'warning', 'info', 'danger'].map((tone) => (
              <Badge key={tone} tone={tone}>{tone}</Badge>
            ))}
            <Tag tone="accent" onRemove={() => {}}>Review filter</Tag>
            <Badge status="complete">Complete</Badge>
          </div>
        </ReviewCard>

        <ReviewCard title="Avatar">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name="Ava Shah" status="online" />
            <Avatar name="Diego Iyer" status="busy" size="lg" />
            <Avatar name="Kim Rao" square />
            <AvatarGroup people={[{ name: 'Ava Shah' }, { name: 'Diego Iyer' }, { name: 'Kim Rao' }, { name: 'Sam Lee' }, { name: 'Mia Chen' }]} max={4} />
          </div>
        </ReviewCard>

        <ReviewCard title="Selection controls">
          <div className="grid gap-4">
            <Checkbox checked={checked} onChange={setChecked} label="Include archived claims" />
            <Toggle checked={enabled} onChange={setEnabled} label="Live notifications" />
            <RadioGroup
              name="review-stage"
              value={radio}
              onChange={setRadio}
              legend="Next stage"
              options={OPTIONS.slice(0, 3)}
            />
          </div>
        </ReviewCard>

        <ReviewCard title="Menu, Popover and Tooltip" wide>
          <div className="flex flex-wrap items-center gap-3">
            <Menu
              trigger={<Button variant="secondary">Open menu</Button>}
              items={[
                { type: 'group', label: 'Actions' },
                { label: 'Edit claim', shortcut: '⌘E' },
                { label: 'Duplicate' },
                { type: 'separator' },
                { label: 'Delete', danger: true },
              ]}
            />
            <Popover trigger={<Button variant="secondary">Open popover</Button>}>
              <div className="grid min-w-48 gap-1">
                <PopoverItem icon>Assign owner</PopoverItem>
                <PopoverItem>Change status</PopoverItem>
                <PopoverSeparator />
                <PopoverItem danger>Archive claim</PopoverItem>
              </div>
            </Popover>
            <Tooltip label="This tooltip follows the active theme">
              <Button variant="ghost">Hover for tooltip</Button>
            </Tooltip>
            <Button variant="secondary" onClick={() => toast('Component toast is working', 'success')}>Show toast</Button>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Fields and inputs">
        <ReviewCard title="Input and Textarea">
          <div className="grid gap-4">
            <Input label="Claim title" defaultValue="Battery warranty claim" hint="Standard text input" />
            <Input label="Invalid field" defaultValue="CL" error="Use at least 4 characters" invalid />
            <Textarea label="Review notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </div>
        </ReviewCard>

        <ReviewCard title="Select and Combobox">
          <div className="grid gap-4">
            <Select label="Stage" options={OPTIONS} value={selectValue} onChange={setSelectValue} />
            <Combobox label="Search stage" options={OPTIONS} value={comboValue} onChange={setComboValue} />
            <MultiCombobox label="Visible stages" options={OPTIONS} value={multiValue} onChange={setMultiValue} max={3} />
          </div>
        </ReviewCard>

        <ReviewCard title="Date and number fields">
          <div className="grid gap-4">
            <DateField label="Inspection date" value={date} onChange={setDate} />
            <DatePicker label="Decision date" value={date} onChange={setDate} />
            <NumberInput label="Claim priority" value={number} onChange={setNumber} min={0} max={100} unit="pts" />
          </div>
        </ReviewCard>

        <ReviewCard title="Calendar" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Single · Interactive">
              <div className="overflow-x-auto"><Calendar value={calendarDate} onChange={setCalendarDate} /></div>
            </StateSample>
            <StateSample name="Single · Unselected">
              <div className="overflow-x-auto"><Calendar month="2026-08-01" onChange={setCalendarDate} /></div>
            </StateSample>
            <StateSample name="Range · Selected">
              <div className="overflow-x-auto"><Calendar mode="range" value={calendarRange} onChange={setCalendarRange} /></div>
            </StateSample>
            <StateSample name="Month · Controlled navigation">
              <div className="overflow-x-auto"><Calendar month={calendarMonth} onMonthChange={setCalendarMonth} value={calendarDate} onChange={setCalendarDate} /></div>
            </StateSample>
            <StateSample name="Bounds · Disabled days">
              <div className="overflow-x-auto"><Calendar value="2026-08-27" min="2026-08-20" max="2026-08-29" /></div>
            </StateSample>
            <StateSample name="Week start · Sunday">
              <div className="overflow-x-auto"><Calendar value="2026-08-27" weekStart="sunday" bordered={false} /></div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Slider and RangeSlider">
          <div className="grid gap-6">
            <Slider label="Confidence" value={slider} onChange={setSlider} unit="%" marks={[0, 25, 50, 75, 100]} />
            <RangeSlider label="Approved range" value={range} onChange={setRange} unit="%" />
          </div>
        </ReviewCard>

        <ReviewCard title="FileDrop" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Empty · Single file">
              <FileDrop accept="image/*" onFiles={() => {}} hint="PNG or JPG up to 10 MB" />
            </StateSample>
            <StateSample name="Populated · Multiple files">
              <FileDrop
                multiple
                files={files}
                onFiles={(next) => setFiles((current) => current.concat(next))}
                onRemove={(_, index) => setFiles((current) => current.filter((file, at) => at !== index))}
                hint="PDF, PNG or JPG up to 10 MB"
              />
            </StateSample>
            <StateSample name="Invalid">
              <FileDrop invalid files={[]} onFiles={() => {}} label="Choose a supported document" hint="This file type is not accepted." />
            </StateSample>
            <StateSample name="Disabled">
              <FileDrop disabled files={[{ name: "locked-report.pdf", size: 84200 }]} label="Uploads are disabled" hint="Complete the review before replacing evidence." />
            </StateSample>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Navigation and structure">
        <ReviewCard title="PageHeader" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Theme selected · Complete composition">
              <PageHeader
                density="comfortable"
                title="Claim CL-1042"
                description="Review component rhythm, hierarchy and responsive wrapping."
                breadcrumb={[{ label: 'Claims', href: '#' }, { label: 'CL-1042' }]}
                meta={<Badge tone="success">Active</Badge>}
                actions={<><Button variant="secondary">Export</Button><Button>Approve</Button></>}
                tabs={<Tabs items={[{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity', count: 8 }, { value: 'files', label: 'Files', count: 3 }]} value={tab} onChange={setTab} />}
              />
            </StateSample>
            <StateSample name="Existing · Comfortable · Complete composition">
              <PageHeader
                variant="standard"
                density="comfortable"
                title="Claim CL-1042"
                description="Review component rhythm, hierarchy and responsive wrapping."
                breadcrumb={[{ label: 'Claims', href: '#' }, { label: 'CL-1042' }]}
                meta={<Badge tone="success">Active</Badge>}
                actions={<><Button variant="secondary">Export</Button><Button>Approve</Button></>}
                tabs={<Tabs items={[{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity', count: 8 }, { value: 'files', label: 'Files', count: 3 }]} value={tab} onChange={setTab} />}
              />
            </StateSample>
            <StateSample name="Four explicit recipes">
              <div className="grid gap-4">
                {['standard', 'lede', 'kicker-caption', 'inline-divider'].map((variant) => (
                  <div key={variant} className="overflow-hidden rounded-xl border border-solid border-layer-border bg-material-surface">
                    <div className="border-0 border-b border-solid border-layer-border px-4 py-2 font-mono text-[length:var(--text-2xs)] font-semibold uppercase tracking-[.12em] text-ctl-fg-subtle">
                      {variant}
                    </div>
                    <PageHeader
                      variant={variant}
                      eyebrow="Overview"
                      title="Executive Dashboard"
                      description="Vendor, procurement, shipment, occupancy and incident health across the network."
                      meta="Supply Chain Executive · as of 9:42 AM"
                    />
                  </div>
                ))}
              </div>
            </StateSample>
            <StateSample name="Title · Description">
              <PageHeader variant="standard" title="Claims" description="Review every open warranty request." />
            </StateSample>
            <StateSample name="Eyebrow · Status register">
              <PageHeader
                variant="standard"
                eyebrow="Live · Production"
                title="Everything is running"
                description="248 active users · 3 alerts · all jobs healthy"
                actions={<><Button variant="secondary">Last 24h</Button><Button>New job</Button></>}
              />
            </StateSample>
            <StateSample name="Actions · Borderless">
              <PageHeader
                variant="standard"
                title="Inspection queue"
                bordered={false}
                actions={<Button size="sm">Assign reviewer</Button>}
              />
            </StateSample>
            <StateSample name="Sticky · Scroll container">
              <div className="max-h-48 overflow-y-auto rounded-xl border border-solid border-layer-border">
                <PageHeader variant="standard" sticky title="Sticky claim header" description="Scroll this sample to verify the pinned state." />
                <div className="grid min-h-72 place-items-center bg-ctl-offset text-sm text-ctl-fg-muted">Scrollable page content</div>
              </div>
            </StateSample>
            <StateSample name="Child slots">
              <PageHeader variant="standard" title="Slot composition">
                <Breadcrumb data-slot="breadcrumb" items={[{ label: 'Workspace', href: '#' }, { label: 'Queue' }]} />
                <Badge data-slot="meta" tone="info">8 pending</Badge>
                <Button data-slot="actions" variant="secondary">Refresh</Button>
                <p className="m-0 text-sm text-ctl-fg-muted">Unslotted child content remains below the heading.</p>
              </PageHeader>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Tabs and Pagination">
          <div className="grid gap-5">
            <Tabs
              variant="pill"
              items={[{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity' }, { value: 'files', label: 'Files' }]}
              value={tab}
              onChange={setTab}
            />
            <Pagination page={page} pageCount={12} onChange={setPage} totalLabel="128 claims" />
          </div>
        </ReviewCard>

        <ReviewCard title="Accordion" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Single · Collapsed">
              <Accordion items={ACCORDION_ITEMS} />
            </StateSample>

            <StateSample name="Single · Default open">
              <Accordion defaultOpen={["summary"]} items={ACCORDION_ITEMS} />
            </StateSample>

            <StateSample name="Multiple · Two open">
              <Accordion multiple defaultOpen={["summary", "coverage"]} items={ACCORDION_ITEMS} />
            </StateSample>

            <StateSample name="Controlled · Interactive">
              <Accordion value={accordionValue} onChange={setAccordionValue} items={ACCORDION_ITEMS} />
            </StateSample>

            <StateSample name="Item · Disabled">
              <Accordion
                defaultOpen={["summary"]}
                items={ACCORDION_ITEMS.map((item) => item.key === "coverage" ? { ...item, disabled: true, meta: "Unavailable" } : item)}
              />
            </StateSample>

            <StateSample name="Container · Borderless">
              <Accordion bordered={false} defaultOpen={["history"]} items={ACCORDION_ITEMS} />
            </StateSample>

            <StateSample name="Empty">
              <div className="grid gap-2"><Accordion items={[]} /><span className="text-sm text-ctl-fg-muted">No accordion rows are rendered when items are absent.</span></div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Tree" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Expanded · Bordered">
              <Tree nodes={TREE_NODES} selected={treeSelection} onSelect={setTreeSelection} defaultExpanded={['workspace', 'insights']} bordered />
            </StateSample>
            <StateSample name="Collapsed · Borderless">
              <Tree nodes={TREE_NODES} selected="workspace" />
            </StateSample>
            <StateSample name="Controlled expansion">
              <Tree nodes={TREE_NODES} selected="analytics" expanded={treeExpanded} onExpandedChange={setTreeExpanded} onSelect={setTreeSelection} bordered />
            </StateSample>
            <StateSample name="Guides · Hidden">
              <Tree nodes={TREE_NODES} selected="sla" defaultExpanded={['insights']} guides={false} bordered />
            </StateSample>
            <StateSample name="Empty"><div className="grid gap-2"><Tree nodes={[]} bordered /><span className="text-sm text-ctl-fg-muted">The empty tree preserves its optional container without inventing nodes.</span></div></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Stepper" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Horizontal · Active">
              <Stepper current={2} steps={STEPPER_STEPS} />
            </StateSample>
            <StateSample name="Horizontal · Complete">
              <Stepper current={STEPPER_STEPS.length} steps={STEPPER_STEPS} />
            </StateSample>
            <StateSample name="Horizontal · Error override">
              <Stepper current={2} steps={STEPPER_STEPS.map((step, index) => index === 2 ? { ...step, state: 'error' } : step)} />
            </StateSample>
            <StateSample name="Vertical · Hints">
              <div className="max-w-md"><Stepper orientation="vertical" current={1} steps={STEPPER_STEPS} /></div>
            </StateSample>
            <StateSample name="Horizontal · Forced hints">
              <Stepper current={1} hints steps={STEPPER_STEPS} />
            </StateSample>
            <StateSample name="Vertical · Hints hidden">
              <div className="max-w-md"><Stepper orientation="vertical" hints={false} current={1} steps={STEPPER_STEPS} /></div>
            </StateSample>
            <StateSample name="Small · Interactive">
              <Stepper size="sm" current={stepIndex} onStepClick={setStepIndex} steps={STEPPER_STEPS} />
            </StateSample>
            <StateSample name="Empty"><div className="grid gap-2"><Stepper steps={[]} /><span className="text-sm text-ctl-fg-muted">No steps are rendered for an empty sequence.</span></div></StateSample>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Data display">
        <ReviewCard title="StatTile" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Sparkline · Theme selected">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile label="Avg occupancy" value="63.6%" delta="+5.5 pts · 8 wk" series={[44, 52, 48, 59, 72, 66, 84, 90]} />
                <StatTile label="Delayed shipments" value="2" delta="+2 · 8 wk" tone="danger" series={[1, 3, 3, 1, 3, 5, 5]} />
              </div>
            </StateSample>
            <StateSample name="Sparkline · Explicit recipes">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['bars-bottom', 'split', 'line-overlay', 'edge-bars', 'bars-trailing', 'classic-curve'].map((variant, index) => (
                  <StatTile
                    key={variant}
                    label={index % 2 ? 'Delayed shipments' : 'Avg occupancy'}
                    value={index % 2 ? '2' : '63.6%'}
                    delta={index % 2 ? '+2 · 8 wk' : '+5.5 pts · 8 wk'}
                    tone={index % 2 ? 'danger' : 'accent'}
                    series={index % 2 ? [1, 3, 3, 1, 3, 5, 5] : [44, 52, 48, 59, 72, 66, 84, 90]}
                    sparklineVariant={variant}
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Existing · Classic smooth curve">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile label="Open claims" value="128" unit="active" delta="+8.4%" series={[12, 16, 15, 22, 24, 31]} sparklineVariant="classic-curve" />
                <StatTile label="Within SLA" value="94.2%" delta="+2.1%" tone="success" series={[72, 78, 83, 79, 91, 88, 94]} sparklineVariant="classic-curve" />
              </div>
            </StateSample>
            <StateSample name="Existing · Default · Sparkline">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile icon="file" label="Open claims" value="128" unit="active" delta="+8.4%" series={[12, 16, 15, 22, 24, 31]} sparklineVariant="classic-curve" />
                <StatTile icon="check" label="Within SLA" value="94.2%" delta="+2.1%" tone="success" series={[72, 78, 83, 79, 91, 88, 94]} sparklineVariant="classic-curve" />
              </div>
            </StateSample>
            <StateSample name="Existing · Semantic tones">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile key={tone} icon="star" label={tone} value={`${82 + index}%`} delta={index % 2 ? '-1.2%' : '+2.4%'} tone={tone} series={[4, 7, 6, 9, 8, 12]} sparklineVariant="classic-curve" />
                ))}
              </div>
            </StateSample>
            <StateSample name="Alarm · Theme selected">
              <StatTile
                icon="alert"
                label="Open high-severity incidents"
                value="3"
                unit="1 critical · oldest open 26 days"
                tone="danger"
                alarm
              />
            </StateSample>
            <StateSample name="Existing · Alarm · Semantic tones">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile
                    key={tone}
                    icon="alert"
                    label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} alarm`}
                    value={index + 1}
                    tone={tone}
                    alarm
                    alarmVariant="outline"
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Alarm · Solid">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile
                    key={tone}
                    icon="alert"
                    label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} alarm`}
                    value={index + 1}
                    tone={tone}
                    alarm
                    alarmVariant="solid"
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Alarm · Accented">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile
                    key={tone}
                    icon="alert"
                    label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} alarm`}
                    value={index + 1}
                    tone={tone}
                    alarm
                    alarmVariant="accented"
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Sparkline · Inset">
              <StatTile icon="check" label="Approved value" value="₹8.6L" bleed={false} series={[5, 7, 6, 11, 13, 16]} sparklineVariant="classic-curve" />
            </StateSample>
            <StateSample name="Compact · Theme selected">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile
                    key={tone}
                    label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} state`}
                    value={index + 1}
                    tone={tone}
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Existing · Compact · Semantic tones">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['accent', 'success', 'warning', 'info', 'danger', 'neutral'].map((tone, index) => (
                  <StatTile
                    key={tone}
                    label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} state`}
                    value={index + 1}
                    tone={tone}
                    compactVariant="stacked-solid"
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Compact · Explicit recipes">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['stacked-solid', 'stacked-soft', 'inline-solid', 'split', 'band', 'badge', 'minimal', 'corner-accent'].map((variant, index) => (
                  <StatTile
                    key={variant}
                    label={variant.replaceAll('-', ' ')}
                    value={index + 1}
                    tone={['accent', 'success', 'warning', 'info', 'danger', 'neutral', 'accent', 'info'][index]}
                    supportingText={variant === 'corner-accent' ? 'Optional supporting line' : undefined}
                    compactVariant={variant}
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Icon · Theme selected">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatTile icon="user" label="Active customers" value="20,000+" />
                <StatTile icon="check" iconTone="success" label="Resolved requests" value="1,284" />
                <StatTile icon="calendar" iconTone="info" label="Plans in flight" value="4" />
              </div>
            </StateSample>
            <StateSample name="Existing · Icon · Label · Value">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile icon="user" label="Active customers" value="20,000+" iconVariant="trailing" />
                <StatTile icon="check" iconTone="success" label="Resolved requests" value="1,284" iconVariant="trailing" />
              </div>
            </StateSample>
            <StateSample name="Icon · Explicit recipes">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {['trailing', 'heading', 'leading'].map((variant, index) => (
                  <StatTile
                    key={variant}
                    icon={['check', 'calendar', 'money'][index]}
                    iconTone={['success', 'info', 'warning'][index]}
                    label={['Vendors approved', 'Plans in flight', 'Planned spend'][index]}
                    value={['3', '4', '$71,300'][index]}
                    iconVariant={variant}
                  />
                ))}
              </div>
            </StateSample>
            <StateSample name="Unified · Reference anatomy">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Qualified leads" value="12.80k" unit="this month" delta="+8.4%" />
                <StatTile label="Escalations" value="3" unit="today" tone="danger" delta="-1" />
                <StatTile label="Approved value" value="₹8.6L" tone="success" series={[5, 7, 6, 11, 13, 16]} sparklineVariant="classic-curve" />
                <StatTile label="Closed" value="311" unit="ytd" />
              </div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="DescriptionList" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Rows · Dividers"><DescriptionList dividers items={DESCRIPTION_ITEMS} /></StateSample>
            <StateSample name="Rows · Small"><DescriptionList size="sm" labelWidth="7rem" items={DESCRIPTION_ITEMS} /></StateSample>
            <StateSample name="Stacked"><DescriptionList layout="stacked" dividers items={DESCRIPTION_ITEMS} /></StateSample>
            <StateSample name="Grid · Large"><DescriptionList layout="grid" size="lg" items={DESCRIPTION_ITEMS} /></StateSample>
            <StateSample name="Empty"><DescriptionList items={[]} /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Table" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Selectable · Sortable · Pinned">
              <Table
                columns={TABLE_COLUMNS}
                rows={sortedRows}
                rowKey={(row) => row.id}
                selected={selectedRows}
                onSelect={setSelectedRows}
                sort={sort}
                onSort={toggleSort}
                stickyColumns={1}
                selectionBar={<Button size="sm">Assign</Button>}
              />
            </StateSample>
            <StateSample name="Row tones · Clickable">
              <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} rowKey={(row) => row.id} rowTone={(row) => row.stage === 'Blocked' ? 'danger' : row.stage === 'Approved' ? 'success' : null} onRowClick={() => {}} />
            </StateSample>
            <StateSample name="Sticky header · Scrolling">
              <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS.concat(TABLE_ROWS.map((row) => ({ ...row, id: `${row.id}-B` })))} rowKey={(row) => row.id} stickyHeader maxHeight={190} />
            </StateSample>
            <StateSample name="Long content · Full wrapping">
              <Table columns={TABLE_LONG_CONTENT_COLUMNS} rows={TABLE_LONG_CONTENT_ROWS} rowKey={(row) => row.id} />
            </StateSample>
            <StateSample name="Custom cell · Non-sortable column">
              <Table
                columns={TABLE_COLUMNS.map((column) => column.key === 'stage'
                  ? { ...column, sortable: false, render: (row) => <Badge tone={row.stage === 'Approved' ? 'success' : row.stage === 'Blocked' ? 'danger' : 'info'}>{row.stage}</Badge> }
                  : column)}
                rows={TABLE_ROWS}
                sort={sort}
                onSort={toggleSort}
              />
            </StateSample>
            <StateSample name="Category palette · Priority semantics">
              <Table columns={TABLE_CHIP_COLUMNS} rows={TABLE_CHIP_ROWS} rowKey={(row) => row.id} />
            </StateSample>
            <StateSample name="Empty">
              <Table columns={TABLE_COLUMNS} rows={[]} empty="No claims match this view." />
            </StateSample>
            <StateSample name="No columns · Null output">
              <div className="min-h-12 rounded-lg border border-dashed border-ctl-border p-3 text-sm text-ctl-fg-muted"><Table columns={[]} rows={TABLE_ROWS} />No table is rendered when columns are absent.</div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="FlowTimeline" variant="Theme-owned recipes">
          <div className="grid gap-6">
            <StateSample name="Theme owned"><Timeline items={FLOW_TIMELINE_ITEMS} /></StateSample>
            <StateSample name="Continuous rail"><Timeline variant="continuous-rail" items={FLOW_TIMELINE_ITEMS} /></StateSample>
            <StateSample name="Date rail"><Timeline variant="date-rail" items={FLOW_TIMELINE_ITEMS} /></StateSample>
            <StateSample name="Grouped dates"><Timeline variant="grouped-dates" items={FLOW_TIMELINE_ITEMS} /></StateSample>
            <StateSample name="Ledger rows"><Timeline variant="ledger-rows" items={FLOW_TIMELINE_ITEMS} /></StateSample>
            <StateSample name="Existing · Default · Semantic tones">
              <Timeline variant="continuous-rail" items={[
                { id: 1, title: 'Claim submitted', meta: '09:18', description: 'Customer evidence received.', tone: 'info' },
                { id: 2, title: 'Inspection complete', meta: '11:42', description: 'No additional damage found.', tone: 'success' },
                { id: 3, title: 'SLA at risk', meta: '12:00', description: 'A reviewer is required today.', tone: 'warning' },
                { id: 4, title: 'Payment blocked', meta: '12:10', description: 'Resolve the approval exception.', tone: 'danger' },
              ]} />
            </StateSample>
            <StateSample name="Small · Icons · Children">
              <Timeline variant="continuous-rail" size="sm" items={[
                { id: 1, title: 'Automation started', meta: 'Now', tone: 'accent', icon: <Zap className="h-3.5 w-3.5" />, children: <Badge tone="accent">Running</Badge> },
                { id: 2, title: 'Awaiting reviewer', tone: 'neutral' },
              ]} />
            </StateSample>
            <StateSample name="Empty"><Timeline items={[]} /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Progress">
          <div className="grid gap-5">
            <ProgressBar label="Evidence quality" value={82} showValue tone="success" />
            <ProgressBar label="Decision readiness" value={64} showValue />
            <ProgressList items={[{ label: 'Initial review', value: 96, tone: 'success' }, { label: 'Inspection', value: 88, tone: 'info' }, { label: 'Parts approval', value: 71, tone: 'warning' }]} />
          </div>
        </ReviewCard>

        <ReviewCard title="SegmentBar and StackedBar" wide>
          <div className="grid gap-7 lg:grid-cols-2">
            <SegmentBar segments={DONUT_DATA} />
            <StackedBar
              data={[{ label: 'North', approved: 64, review: 24, blocked: 12 }, { label: 'South', approved: 52, review: 31, blocked: 17 }, { label: 'West', approved: 72, review: 18, blocked: 10 }]}
              keys={[{ key: 'approved', label: 'Approved' }, { key: 'review', label: 'Review' }, { key: 'blocked', label: 'Blocked' }]}
            />
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Charts">
        <ReviewCard title="BarChart" variant="Shared theme recipes · Vertical">
          <div className="grid gap-6">
            <StateSample name="Theme owned"><BarChart data={CAPACITY_DATA} height={150} reference={100} scaleMax={120} format={(value) => `${value}%`} /></StateSample>
            {BAR_CHART_VARIANTS.map((variant) => (
              <StateSample key={variant} name={variant.replaceAll("-", " ")}>
                <BarChart variant={variant} data={CAPACITY_DATA} height={150} reference={100} scaleMax={120} format={(value) => `${value}%`} />
              </StateSample>
            ))}
            <StateSample name="Existing · Single series · Values and axis"><BarChart variant="capacity-tracks" data={CHART_DATA} height={150} /></StateSample>
            <StateSample name="Grouped series">
              <BarChart
                data={CHART_DATA.slice(0, 5).map((item, index) => ({ label: item.label, received: item.value, resolved: Math.max(4, item.value - (index % 2 ? 5 : 2)) }))}
                series={[{ key: 'received', label: 'Received' }, { key: 'resolved', label: 'Resolved' }]}
                height={150}
              />
            </StateSample>
            <StateSample name="Compact · No labels"><BarChart variant="capacity-tracks" data={CHART_DATA} color="var(--success-600)" height={72} axis={false} values={false} /></StateSample>
            <StateSample name="Formatted · Highlight threshold"><BarChart variant="capacity-tracks" data={CHART_DATA} height={120} highlightAt={0.75} format={(value) => `${value}k`} /></StateSample>
            <StateSample name="Empty"><BarChart data={[]} height={110} /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="LineChart" variant="Theme recipes · LineChart.jsx">
          <div className="grid gap-6">
            <StateSample name="Theme owned"><LineChart data={LINE_CHART_DATA} height={180} /></StateSample>
            {LINE_CHART_VARIANTS.map((variant) => (
              <StateSample key={variant} name={variant.replaceAll("-", " ")}>
                <LineChart
                  variant={variant}
                  data={variant === "reference-grid" ? LINE_CHART_PERCENT_DATA : LINE_CHART_DATA}
                  compare={variant === "curve-compare" ? LINE_CHART_COMPARE_DATA : []}
                  height={180}
                  scaleMin={variant === "reference-grid" ? 0 : undefined}
                  scaleMax={variant === "reference-grid" ? 100 : undefined}
                  axisFormat={variant === "reference-grid" ? (value) => `${value}%` : undefined}
                  seriesLabel="Clamped curve"
                  compareLabel="The straight reading underneath"
                />
              </StateSample>
            ))}
            <StateSample name="Existing · Area · Compare · Interactive"><LineChart variant="area-points" data={CHART_DATA} compare={COMPARE_DATA} height={170} grid tooltip /></StateSample>
            <StateSample name="Existing · Compare · Custom legend and color"><LineChart variant="area-points" data={CHART_DATA} compare={COMPARE_DATA} height={150} compareColor="var(--chart-5)" seriesLabel="Received" compareLabel="Resolved" tooltip /></StateSample>
            <StateSample name="Existing · Line only · No dots"><LineChart variant="area-points" data={CHART_DATA} color="var(--success-600)" height={140} area={false} dots={false} /></StateSample>
            <StateSample name="Existing · Minimal · No axis"><LineChart variant="area-points" data={CHART_DATA} height={100} axis={false} dots={false} area /></StateSample>
            <StateSample name="Existing · Formatted tooltip"><LineChart variant="area-points" data={CHART_DATA} height={150} tooltip format={(value) => `${value} claims`} seriesLabel="Claims" /></StateSample>
            <StateSample name="Existing · Insufficient data"><LineChart variant="area-points" data={[{ label: 'Mon', value: 18 }]} height={110} /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="HBars" variant="Shared theme recipes · Horizontal">
          <div className="grid gap-6">
            <StateSample name="Theme owned"><HBars data={CAPACITY_DATA} sort={false} height={228} reference={100} scaleMax={120} format={(value) => `${value}%`} /></StateSample>
            {BAR_CHART_VARIANTS.map((variant) => (
              <StateSample key={variant} name={variant.replaceAll("-", " ")}>
                <HBars variant={variant} data={CAPACITY_DATA} sort={false} height={228} reference={100} scaleMax={120} format={(value) => `${value}%`} />
              </StateSample>
            ))}
            <StateSample name="Existing · Sorted · Top five"><HBars variant="capacity-tracks" data={CHART_DATA} height={170} max={5} /></StateSample>
            <StateSample name="Input order · Formatted"><HBars variant="capacity-tracks" data={CHART_DATA.slice(0, 5)} sort={false} height={170} format={(value) => `${value}%`} color="var(--info-600)" /></StateSample>
            <StateSample name="Empty"><HBars data={[]} height={110} /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="DonutLegend" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Theme owned"><DonutLegend data={DONUT_DATA} size="auto" label="128" sublabel="claims" /></StateSample>
            <StateSample name="Legend ledger"><DonutLegend variant="legend-ledger" data={DONUT_DATA} size="auto" label="128" sublabel="claims" /></StateSample>
            <StateSample name="Orbit labels"><DonutLegend variant="orbit-labels" data={DONUT_DATA} size="lg" label="128" sublabel="claims" /></StateSample>
            <StateSample name="Segmented strip"><DonutLegend variant="segmented-strip" data={DONUT_DATA} label="128" sublabel="claims" /></StateSample>
            <StateSample name="Existing · Row · Values and percent"><DonutLegend variant="legend-ledger" legendVariant="simple-rows" data={DONUT_DATA} label="128" sublabel="claims" /></StateSample>
            <StateSample name="Column · Large"><DonutLegend variant="legend-ledger" legendVariant="simple-rows" data={DONUT_DATA} size="lg" layout="column" caption="portfolio" /></StateSample>
            <StateSample name="Legend · Percent only"><DonutLegend variant="legend-ledger" legendVariant="simple-rows" data={DONUT_DATA} size="sm" showValue={false} /></StateSample>
            <StateSample name="Legend · Values only"><DonutLegend variant="legend-ledger" legendVariant="simple-rows" data={DONUT_DATA} size="sm" showPercent={false} format={(value) => `${value}%`} /></StateSample>
            <StateSample name="Segments · Custom colors"><DonutLegend variant="legend-ledger" legendVariant="simple-rows" data={DONUT_DATA.map((item, index) => ({ ...item, color: ['var(--success-600)', 'var(--warning-600)', 'var(--danger-600)'][index] }))} label="100%" sublabel="portfolio" /></StateSample>
            <StateSample name="Empty"><DonutLegend data={[]} label="—" sublabel="no data" /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="Legend" variant="Theme recipes · DonutLegend.jsx">
          <div className="grid gap-6">
            <StateSample name="Theme selected"><Legend items={SHIPMENT_STATUS_DATA} title="Shipments by status" /></StateSample>
            {DONUT_LEGEND_VARIANTS.map((variant) => (
              <StateSample key={variant} name={variant.replaceAll("-", " ")}>
                <Legend
                  items={SHIPMENT_STATUS_DATA}
                  variant={variant}
                  title={variant === "inline-summary" ? "Shipments by status" : undefined}
                />
              </StateSample>
            ))}
            <StateSample name="Percent only"><Legend variant="simple-rows" items={SHIPMENT_STATUS_DATA} showValue={false} /></StateSample>
            <StateSample name="Values only"><Legend variant="simple-rows" items={SHIPMENT_STATUS_DATA} showPercent={false} /></StateSample>
            <StateSample name="Empty"><Legend items={[]} /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="GaugeRing" variant="Theme recipes">
          <div className="grid gap-6">
            <StateSample name="Theme selected">
              <div className="flex flex-wrap items-start justify-around gap-10">
                <GaugeRing value={64} label="Occupied" sublabel="Average across 6 zones" size={190} />
                <GaugeRing value={100} label="Packaging Overflow" sublabel="Reno Distribution Center" tone="danger" size={190} />
              </div>
            </StateSample>
            <StateSample name="Three explicit recipes">
              <div className="grid gap-5 md:grid-cols-3">
                {GAUGE_VARIANTS.map((variant) => (
                  <div key={variant} className="flex min-h-72 flex-col items-center rounded-xl border border-solid border-layer-border p-5">
                    <div className="mb-3 font-mono text-[length:var(--text-2xs)] font-semibold uppercase tracking-[.12em] text-ctl-fg-subtle">{variant}</div>
                    <GaugeRing variant={variant} value={64} label="Occupied" sublabel="Average across 6 zones" size={180} />
                  </div>
                ))}
              </div>
            </StateSample>
            <StateSample name="Existing · Semantic tones">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <GaugeRing variant="closed-ring" value={94} label="Success" tone="success" size={130} />
                <GaugeRing variant="closed-ring" value={68} label="Warning" tone="warning" size={130} />
                <GaugeRing variant="closed-ring" value={32} label="Danger" tone="danger" size={130} />
              </div>
            </StateSample>
            <StateSample name="Compact frame · Custom scale and color"><div className="flex justify-center"><GaugeRing variant="closed-ring" value={7} max={10} label="Quality" sublabel="7 of 10 checks" color="var(--chart-4)" size={170} minHeight={220} /></div></StateSample>
            <StateSample name="Minimum · Zero"><div className="flex justify-center"><GaugeRing variant="closed-ring" value={0} label="Not started" size={110} /></div></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="FunnelChart" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Theme selected"><FunnelChart data={FUNNEL_DATA} formatDetail={(value) => `$${value.toLocaleString()}`} /></StateSample>
            <StateSample name="Four explicit recipes">
              <div className="grid gap-6">
                {['silhouette', 'centered-bars', 'conversion-steps', 'nested-capacity'].map((variant) => (
                  <div key={variant} className="rounded-xl border border-solid border-layer-border p-5">
                    <div className="mb-4 font-mono text-[length:var(--text-2xs)] font-semibold uppercase tracking-[.12em] text-ctl-fg-subtle">{variant}</div>
                    <FunnelChart variant={variant} data={FUNNEL_DATA} formatDetail={(value) => `$${value.toLocaleString()}`} />
                  </div>
                ))}
              </div>
            </StateSample>
            <StateSample name="Existing · Default"><FunnelChart variant="silhouette" data={FUNNEL_DATA} /></StateSample>
            <StateSample name="Custom color · Formatted"><FunnelChart variant="silhouette" data={FUNNEL_DATA} color="var(--info-600)" format={(value) => `${value} claims`} /></StateSample>
            <StateSample name="Empty"><FunnelChart data={[]} /></StateSample>
          </div>
        </ReviewCard>
        <ReviewCard title="Heatmap" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Fourteen columns"><Heatmap data={HEATMAP_DATA} columns={14} /></StateSample>
            <StateSample name="Weekday axis"><Heatmap data={HEATMAP_DATA} columns={14} weekdays /></StateSample>
            <StateSample name="Seven columns"><div className="max-w-md"><Heatmap data={HEATMAP_DATA.slice(0, 21)} columns={7} weekdays /></div></StateSample>
            <StateSample name="Empty"><Heatmap data={[]} /></StateSample>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Feedback and loading">
        <ReviewCard title="Alert" wide variant="Theme and explicit layouts">
          <div className="grid gap-6">
            <StateSample name="Theme owned">
              <Alert
                tone="warning"
                title="Two plans started before approval"
                action={<Button variant="link" size="sm">Open approvals</Button>}
                onDismiss={() => {}}
              >
                Cold Chain Retrofit and Q4 Packaging Refresh are running without sign-off.
              </Alert>
            </StateSample>
            <StateSample name="Stacked">
              <Alert
                layoutVariant="stacked"
                tone="danger"
                title="Dock Door 7 fire panel fault"
                action={<Button variant="link" size="sm">Open incident</Button>}
                onDismiss={() => {}}
              >
                Critical for 26 days at Reno Distribution Center. Escalate to the site lead today.
              </Alert>
            </StateSample>
            <StateSample name="Compact inline">
              <Alert
                layoutVariant="inline"
                tone="warning"
                title="Two plans started before approval"
                action={<Button variant="link" size="sm">Open approvals</Button>}
                onDismiss={() => {}}
              >
                Cold Chain Retrofit and Q4 Packaging Refresh are running without sign-off.
              </Alert>
            </StateSample>
            <StateSample name="Icon rail">
              <Alert
                layoutVariant="icon-rail"
                tone="danger"
                title="Dock Door 7 fire panel fault"
                action={<Button variant="link" size="sm">Open incident</Button>}
                onDismiss={() => {}}
              >
                Critical for 26 days at Reno Distribution Center. Escalate to the site lead today.
              </Alert>
            </StateSample>
            <StateSample name="Existing · Semantic tones and treatments">
              <div className="grid gap-3 md:grid-cols-2">
                <Alert layoutVariant="stacked" tone="info" title="Inspection scheduled">The service center has confirmed the slot.</Alert>
                <Alert layoutVariant="stacked" tone="success" title="Evidence complete">All required files are available.</Alert>
                <Alert layoutVariant="stacked" tone="warning" title="SLA approaching">This claim needs a decision today.</Alert>
                <Alert layoutVariant="stacked" tone="danger" variant="outline" title="Payment blocked">Resolve the approval exception.</Alert>
              </div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="EmptyState" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Neutral · First run">
              <EmptyState title="No claims yet" description="Create the first claim to start this workspace."><Button>Create claim</Button></EmptyState>
            </StateSample>
            <StateSample name="Accent · Filtered">
              <EmptyState tone="accent" title="No matching claims" description="Adjust the current filters to see more results."><Button variant="secondary">Clear filters</Button></EmptyState>
            </StateSample>
            <StateSample name="Warning · Small">
              <EmptyState tone="warning" size="sm" title="Evidence incomplete" description="Add the missing inspection files before review." />
            </StateSample>
            <StateSample name="Danger · Borderless">
              <EmptyState tone="danger" bordered={false} title="Could not load claims" description="Try the request again."><Button variant="danger">Retry</Button></EmptyState>
            </StateSample>
            <StateSample name="Custom icon">
              <EmptyState icon={<Zap className="h-5 w-5" />} title="Automation ready" description="Run the workflow when the evidence is complete." />
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Skeleton" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Shapes">
              <div className="flex items-center gap-3"><Skeleton variant="circle" size={44} /><Skeleton width="65%" height={44} /><Skeleton width={72} height={44} /></div>
            </StateSample>
            <StateSample name="Text · Three lines"><SkeletonText lines={3} /></StateSample>
            <StateSample name="Row"><SkeletonRow /></StateSample>
            <StateSample name="Animation · Off"><Skeleton animate={false} width="100%" height={72} /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Toast" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Semantic tones">
              <div className="grid gap-3 lg:grid-cols-2">
                {['neutral', 'accent', 'success', 'warning', 'info', 'danger'].map((tone) => (
                  <Toast key={tone} tone={tone} title={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} toast`} description="A persistent status message." />
                ))}
              </div>
            </StateSample>
            <StateSample name="Dismissible"><Toast tone="success" title="Claim approved" description="The customer has been notified." onDismiss={() => {}} /></StateSample>
            <StateSample name="With action"><Toast tone="info" title="Draft saved" description="Review it before submission." action={<Button size="sm" variant="secondary">Open draft</Button>} /></StateSample>
            <StateSample name="Title only"><Toast tone="neutral" title="Changes synchronized" /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            <Button variant="secondary" onClick={() => setPaletteOpen(true)}>Open command palette</Button>
          </div>
        </ReviewCard>

        <ReviewCard title="ThemeToggle and Icon">
          <div className="grid gap-5">
            <ThemeToggle labels />
            <div className="flex flex-wrap gap-4 text-brand-text">
              {['search', 'calendar', 'settings', 'check', 'warning', 'user', 'download', 'plus'].map((name) => (
                <span key={name} className="grid place-items-center gap-1 text-sm text-ctl-fg-muted">
                  <Icon name={name} size="lg" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Shell, forms and flow states">
        <ReviewCard title="SidebarWordmark and NavItem">
          <div className="max-w-sm overflow-hidden rounded-xl border border-solid border-layer-border bg-sidebar">
            <SidebarWordmark variant="sidebar" icon={Zap} name="Warranty Claims" />
            <div className="grid gap-2 p-3">
              <NavItem to="/" end icon={LayoutDashboard} label="Active navigation item" />
              <NavItem to="/component-review-secondary" icon={LayoutDashboard} label="Inactive navigation item" />
            </div>
          </div>
        </ReviewCard>

        <ReviewCard title="HeaderIdentity" variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Name · Subtitle">
              <div className="flex min-h-20 items-center justify-end rounded-xl bg-layer-surface px-4"><HeaderIdentity name="Dev User" subtitle="Claims administrator" /></div>
            </StateSample>
            <StateSample name="Name only">
              <div className="flex min-h-20 items-center justify-end rounded-xl bg-layer-surface px-4"><HeaderIdentity name="Ava Shah" /></div>
            </StateSample>
            <StateSample name="Brand avatar">
              <div className="flex min-h-20 items-center justify-end rounded-xl bg-layer-surface px-4"><HeaderIdentity name="Dev User" subtitle="Claims administrator" brand /></div>
            </StateSample>
            <StateSample name="Divider hidden">
              <div className="flex min-h-20 items-center justify-end rounded-xl bg-layer-surface px-4"><HeaderIdentity name="Mia Chen" subtitle="Warranty manager" divider={false} /></div>
            </StateSample>
            <StateSample name="Long identity">
              <div className="flex min-h-20 items-center justify-end rounded-xl bg-layer-surface px-4"><HeaderIdentity name="Alexandria Montgomery" subtitle="Regional warranty operations administrator" /></div>
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="FieldInput" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Text · Email · Number · Date">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldInput field={{ Id: "subject", Name: "Claim subject", Type: "Text" }} value={fieldValues.subject} onChange={updateField} required />
                <FieldInput field={{ Id: "email", Name: "Reviewer email", Type: "Email" }} value={fieldValues.email} onChange={updateField} />
                <FieldInput field={{ Id: "estimate", Name: "Estimate", Type: "Currency" }} value={fieldValues.estimate} onChange={updateField} />
                <FieldInput field={{ Id: "due", Name: "Due date", Type: "Date" }} value={fieldValues.due} onChange={updateField} />
              </div>
            </StateSample>
            <StateSample name="Choice · Boolean · Long text">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldInput field={{ Id: "stage", Name: "Stage", Type: "Choice", Options: ["Triage", "Inspection", "Review"] }} value={fieldValues.stage} onChange={updateField} />
                <FieldInput field={{ Id: "urgent", Name: "Urgent claim", Type: "Boolean" }} value={fieldValues.urgent} onChange={updateField} />
                <div className="sm:col-span-2"><FieldInput field={{ Id: "notes", Name: "Inspection notes", Type: "Textarea" }} value={fieldValues.notes} onChange={updateField} /></div>
              </div>
            </StateSample>
            <StateSample name="Reference · User · Lists">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldInput field={{ Id: "owner", Name: "Owner", Type: "User" }} value={fieldValues.owner} onChange={updateField} />
                <FieldInput field={{ Id: "reviewers", Name: "Reviewers", Type: "UserList" }} value={[{ Name: 'Ava Shah' }, { Name: 'Diego Iyer' }, { Name: 'Kim Rao' }]} onChange={updateField} />
              </div>
            </StateSample>
            <StateSample name="Required · Invalid">
              <FieldInput field={{ Id: "required", Name: "Required error", Type: "Text" }} value="" onChange={updateField} required invalid />
            </StateSample>
            <StateSample name="Fallback · Unknown type">
              <FieldInput field={{ Id: "custom", Name: "Custom field", Type: "Unmapped" }} value="Fallback text control" onChange={updateField} />
            </StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="Gate" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Blocked"><Gate state={{ blocked: true, loading: false, error: null, rows: [], reload: () => {} }} empty={{ title: "No records", message: "No records are available." }} resourceId="claims" /></StateSample>
            <StateSample name="Loading"><Gate state={{ blocked: false, loading: true, error: null, rows: [], reload: () => {} }} empty={{ title: "No records", message: "No records are available." }} resourceId="claims" /></StateSample>
            <StateSample name="Error"><Gate state={{ blocked: false, loading: false, error: "The sample request could not be completed.", rows: [], reload: () => toast("Retry requested") }} empty={{ title: "No records", message: "No records are available." }} resourceId="claims" /></StateSample>
            <StateSample name="Empty"><Gate state={{ blocked: false, loading: false, error: null, rows: [], reload: () => {} }} empty={{ title: "No claims yet", message: "New claims will appear here." }} resourceId="claims" /></StateSample>
            <StateSample name="Ready"><Gate state={{ blocked: false, loading: false, error: null, rows: TABLE_ROWS, reload: () => {} }} empty={{ title: "No records", message: "No records are available." }} resourceId="claims"><Alert tone="success" title="Data ready">Four claim records are available.</Alert></Gate></StateSample>
          </div>
        </ReviewCard>
      </ReviewSection>

      <ReviewSection title="Toolbars and composites">
        <ReviewCard title="Toolbar" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="All slots · Bordered">
              <Toolbar
                search={<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims" />}
                filters={<><FilterChip label="Stage" value="Review" onClear={() => {}} /><FilterChip label="Mine" active /></>}
                actions={<><ViewSwitch options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]} value={view} onChange={setView} /><Button size="sm">New claim</Button></>}
                count="128 results"
              />
            </StateSample>
            <StateSample name="Child slots · Borderless">
              <Toolbar bordered={false} count="3 selected">
                <Input data-slot="search" placeholder="Search selected claims" />
                <FilterChip data-slot="filters" label="At risk" active />
                <Button data-slot="actions" size="sm" variant="secondary">Export</Button>
              </Toolbar>
            </StateSample>
            <StateSample name="Search only"><Toolbar search={<Input placeholder="Search" />} /></StateSample>
            <StateSample name="Actions only"><Toolbar actions={<><Button size="sm" variant="secondary">Cancel</Button><Button size="sm">Save</Button></>} /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="SearchBar and FilterBar" wide>
          <div className="grid gap-4">
            <SearchBar value={search} onChange={setSearch} count="128 results" placeholder="Search by claim or owner" />
            <FilterBar filters={[{ value: 'all', label: 'All', count: 128 }, { value: 'mine', label: 'Mine', count: 18 }, { value: 'risk', label: 'At risk', count: 3 }]} value={filter} onChange={setFilter} />
          </div>
        </ReviewCard>

        <ReviewCard title="CountUp and StoresMap">
          <div className="grid gap-5">
            <div className="text-3xl font-semibold text-ctl-fg"><CountUp value={128} /></div>
            <StoresMap locations={[{ id: 1, name: 'Bengaluru Service Center', address: 'Indiranagar, Bengaluru' }, { id: 2, name: 'Chennai Service Center', address: 'Guindy, Chennai' }]} onSelect={() => {}} />
          </div>
        </ReviewCard>

        <ReviewCard title="WipStrip" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Theme selected"><WipStrip stages={WIP_STRIP_STAGES} variant="theme" /></StateSample>
            <StateSample name="Capacity rails">
              <WipStrip stages={WIP_STRIP_STAGES.slice(0, 5).map((stage) => ({ ...stage, cap: stage.cap ?? stage.count }))} variant="capacity-rails" />
            </StateSample>
            <StateSample name="Limit ledger"><WipStrip stages={WIP_STRIP_STAGES} variant="limit-ledger" /></StateSample>
            <StateSample name="Existing · Capacity states">
              <WipStrip variant="capacity-rails" stages={[{ label: 'Submitted', count: 18, cap: 20, tone: 'info' }, { label: 'At capacity', count: 16, cap: 16, tone: 'warning' }, { label: 'Over capacity', count: 9, cap: 8, tone: 'danger' }, { label: 'Decision', count: 5, cap: 12, tone: 'success' }]} />
            </StateSample>
            <StateSample name="Existing · No capacity limit"><WipStrip variant="capacity-rails" stages={[{ label: 'Backlog', count: 48, tone: 'neutral' }, { label: 'In progress', count: 12, tone: 'accent' }, { label: 'Done', count: 91, tone: 'success' }]} /></StateSample>
            <StateSample name="Existing · Single stage"><WipStrip variant="capacity-rails" stages={[{ label: 'Review', count: 7, cap: 10, tone: 'info' }]} /></StateSample>
            <StateSample name="Empty · Null output"><div className="min-h-12 rounded-lg border border-dashed border-ctl-border p-3 text-sm text-ctl-fg-muted"><WipStrip stages={[]} />No strip is rendered when stages are absent.</div></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="ApprovalQueue" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Theme selected">
              <ApprovalQueue
                title="Needs escalation"
                description="Open high-severity incidents"
                countLabel="3 open"
                items={APPROVAL_QUEUE_ITEMS}
                summary={APPROVAL_QUEUE_SUMMARY}
                onOpen={() => {}}
              />
            </StateSample>
            <StateSample name="Five explicit recipes">
              <div className="grid gap-8">
                {['status-row', 'age-ledger', 'narrative', 'column-ledger', 'summary-first'].map((variant) => (
                  <div key={variant} className="rounded-xl border border-solid border-ctl-border p-5">
                    <p className="m-0 mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-ctl-fg-muted">{variant}</p>
                    <ApprovalQueue
                      title="Needs escalation"
                      description="Open high-severity incidents"
                      countLabel="3 open"
                      items={APPROVAL_QUEUE_ITEMS}
                      summary={APPROVAL_QUEUE_SUMMARY}
                      variant={variant}
                      onOpen={() => {}}
                    />
                  </div>
                ))}
              </div>
            </StateSample>
            <StateSample name="Existing · Pending · Actions">
              <ApprovalQueue variant="status-row" items={[
                { id: 1, title: 'Approve battery replacement', meta: 'CL-1042', status: 'Due today', tone: 'warning', age: '3h' },
                { id: 2, title: 'Approve transport reimbursement', meta: 'CL-1043', status: 'Within SLA', tone: 'success', age: '1d' },
              ]} onApprove={() => {}} onReject={() => {}} />
            </StateSample>
            <StateSample name="Decisions and terminal states">
              <ApprovalQueue variant="status-row" items={[
                { id: 3, title: 'Approve battery replacement', meta: 'CL-1042', status: 'Due today', tone: 'warning', age: '3h' },
                { id: 4, title: 'Replacement approved', meta: 'CL-1047', status: 'Complete', tone: 'success', decided: 'approved' },
                { id: 5, title: 'Claim rejected', meta: 'CL-1048', status: 'Complete', tone: 'danger', decided: 'rejected' },
              ]} onApprove={() => {}} onReject={() => {}} />
            </StateSample>
            <StateSample name="Existing · Mixed · Decided">
              <ApprovalQueue items={[
                { id: 3, title: 'Battery replacement', status: 'Complete', tone: 'success', decided: 'approved' },
                { id: 4, title: 'Out-of-policy transport', status: 'Declined', tone: 'danger', decided: 'rejected' },
              ]} variant="status-row" />
            </StateSample>
            <StateSample name="Existing · Title action · Custom labels"><ApprovalQueue variant="status-row" items={[{ id: 5, title: 'Review exception', meta: 'EX-100', tone: 'info' }]} onOpen={() => {}} onApprove={() => {}} onReject={() => {}} actionLabels={{ approve: 'Accept', reject: 'Return' }} /></StateSample>
            <StateSample name="Empty"><ApprovalQueue items={[]} empty="No approvals need your attention." /></StateSample>
          </div>
        </ReviewCard>

        <ReviewCard title="KanbanBoard" wide variant="State matrix">
          <div className="grid gap-6">
            <StateSample name="Populated · Card states">
              <KanbanBoard columns={[
                { key: 'review', label: 'Review', tone: 'sky', items: [{ id: 1, title: 'Validate inspection evidence', note: 'CL-1042', owner: 'Ava Shah', priority: 'High', progress: 68, files: 3, comments: 4 }, { id: 2, title: 'Confirm parts estimate', owner: 'Diego Iyer', priority: 'Medium', progress: 0 }] },
                { key: 'decision', label: 'Decision', tone: 'emerald', items: [{ id: 3, title: 'Approve replacement', note: 'Customer waiting', owner: 'Kim Rao', priority: 'Low', progress: 100, files: 2 }] },
                { key: 'done', label: 'Complete', tone: 'slate', items: [] },
              ]} />
            </StateSample>
            <StateSample name="Interactive cards"><KanbanBoard columns={[{ key: 'triage', label: 'Triage', tone: 'violet', items: [{ id: 4, title: 'Open the selected claim', owner: 'Mia Chen', priority: 'High', comments: 2 }] }]} onCardClick={() => {}} /></StateSample>
            <StateSample name="No columns"><KanbanBoard columns={[]} /></StateSample>
          </div>
        </ReviewCard>
      </ReviewSection>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Review modal"
        description="This modal is rendered from the new component kit."
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={() => setModalOpen(false)}>Confirm</Button></>}
      >
        Check spacing, focus handling, scrim color and elevation in every theme.
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Review drawer"
        description="Check the edge, header and footer treatments."
        footer={<Button onClick={() => setDrawerOpen(false)}>Done</Button>}
      >
        <DescriptionList items={[{ label: 'Owner', value: 'Ava Shah' }, { label: 'Stage', value: 'Review' }, { label: 'Value', value: '₹1.8L' }]} />
      </Drawer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        groups={[
          { label: 'Navigation', items: [{ id: 'claims', label: 'Open claims', hint: 'Go to the claims workspace', shortcut: 'G C' }, { id: 'approvals', label: 'Open approvals', hint: 'Review pending decisions', shortcut: 'G A' }] },
          { label: 'Actions', items: [{ id: 'new', label: 'Create claim', shortcut: 'N' }, { id: 'export', label: 'Export report', shortcut: 'E' }] },
        ]}
      />
    </div>
  );
}

export { ComponentReviewGallery };
export default ComponentReviewGallery;
