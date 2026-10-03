import { useState } from "react";
import { AvatarGroup } from "./kit/Avatar.jsx";
import { Badge, Tag } from "./kit/Badge.jsx";
import { Breadcrumb } from "./kit/Breadcrumb.jsx";
import { Button } from "./kit/Button.jsx";
import { Calendar } from "./kit/Calendar.jsx";
import { Card, CardStack } from "./kit/Card.jsx";
import { Checkbox, Radio, RadioGroup } from "./kit/Checkbox.jsx";
import { Combobox } from "./kit/Combobox.jsx";
import { DateField } from "./kit/DateField.jsx";
import { DatePicker } from "./kit/DatePicker.jsx";
import { Donut, Legend } from "./kit/DonutLegend.jsx";
import { Icon } from "./kit/Icon.jsx";
import { Input } from "./kit/Input.jsx";
import { MultiCombobox } from "./kit/MultiCombobox.jsx";
import { NumberInput } from "./kit/NumberInput.jsx";
import { Pagination } from "./kit/Pagination.jsx";
import { Popover, PopoverItem, PopoverSeparator } from "./kit/Popover.jsx";
import { ProgressBar } from "./kit/ProgressBar.jsx";
import { ProgressList } from "./kit/ProgressList.jsx";
import { SegmentBar } from "./kit/SegmentBar.jsx";
import { Select } from "./kit/Select.jsx";
import { SkeletonRow, SkeletonText } from "./kit/Skeleton.jsx";
import { RangeSlider, Slider } from "./kit/Slider.jsx";
import { StackedBar } from "./kit/StackedBar.jsx";
import { PageBody, SurfaceCell, SurfaceGroup } from "./kit/SurfaceGroup.jsx";
import { Tabs } from "./kit/Tabs.jsx";
import { Textarea } from "./kit/Textarea.jsx";
import { Toggle } from "./kit/Toggle.jsx";
import { FilterChip, ViewSwitch } from "./kit/Toolbar.jsx";
import { Tooltip } from "./kit/Tooltip.jsx";
import { ComponentGroup, VariantRow } from "./component-review-layout.jsx";

const TONES = ["neutral", "accent", "success", "warning", "info", "danger"];
const BADGE_VARIANTS = ["soft", "solid", "outline"];
const LEGEND_VARIANTS = [
  { value: "simple-rows", label: "Simple rows" },
  { value: "column-ledger", label: "Column ledger" },
  { value: "progress-rails", label: "Progress rails" },
  { value: "inline-summary", label: "Inline summary" },
];
const SIZES = ["sm", "md", "lg"];
const OPTIONS = [
  { value: "triage", label: "Triage" },
  { value: "inspection", label: "Inspection" },
  { value: "approval", label: "Approval" },
  { value: "closed", label: "Closed", disabled: true },
];
const PEOPLE = [
  { id: 1, name: "Ada Okafor" },
  { id: 2, name: "Ravi Menon" },
  { id: 3, name: "Lin Wei" },
  { id: 4, name: "Marta Silva" },
  { id: 5, name: "Jon Park" },
  { id: 6, name: "Ava Shah" },
  { id: 7, name: "Diego Iyer" },
];
const DONUT_DATA = [
  { label: "Approved", value: 54 },
  { label: "Review", value: 28 },
  { label: "Blocked", value: 18 },
];
const SEGMENT_BAR_DATA = [
  { label: "Scheduled", value: 2, color: "var(--chart-1)" },
  { label: "In transit", value: 3, tone: "warning" },
  { label: "Delayed / exception", shortLabel: "Delayed", value: 2, tone: "danger" },
  { label: "Delivered", value: 5, tone: "success" },
];
const STACKED_BAR_KEYS = [
  { key: "scheduled", label: "Scheduled", shortLabel: "Sched.", color: "var(--chart-1)" },
  { key: "transit", label: "In transit", shortLabel: "Transit", tone: "warning" },
  { key: "delayed", label: "Delayed / exception", shortLabel: "Delayed", tone: "danger" },
  { key: "delivered", label: "Delivered", tone: "success" },
];
const STACKED_BAR_DATA = [
  { label: "Reno Distribution Center", scheduled: 1, transit: 2, delayed: 2, delivered: 1 },
  { label: "Ohio Fulfillment Hub", scheduled: 1, transit: 1, delayed: 0, delivered: 2 },
  { label: "Columbus Regional Warehouse", scheduled: 0, transit: 0, delayed: 0, delivered: 2 },
];
const PROGRESS_ITEMS = [
  { label: "Packaging Overflow", value: 1296, max: 1200, tone: "danger" },
  { label: "General Storage", value: 2850, max: 3000, tone: "warning" },
  { label: "Raw Materials Bay", value: 1860, max: 3000, color: "var(--chart-1)" },
  { label: "Finished Goods", value: 900, max: 1800, color: "var(--chart-1)" },
  { label: "Cold Storage", value: 400, max: 800, color: "var(--chart-1)" },
  { label: "Bulk Storage", value: 646, max: 3800, color: "var(--chart-1)" },
];
const PROGRESS_LIST_ITEMS = [
  { label: "Northwind Components", value: 3, max: 5 },
  { label: "Cascade Freight", value: 5, max: 5 },
  { label: "Ridgeline Supply", value: 2, max: 4 },
  { label: "Harbor Plastics", value: 4, max: 6 },
  { label: "Summit Materials", value: 1, max: 3 },
  { label: "Delta Cartons", value: 3, max: 3 },
];
function PrimitiveComponentGroups() {
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState("inspection");
  const [toggle, setToggle] = useState(true);
  const [select, setSelect] = useState("inspection");
  const [combo, setCombo] = useState("triage");
  const [multi, setMulti] = useState(["triage", "inspection"]);
  const [date, setDate] = useState("2026-08-27");
  const [number, setNumber] = useState(42);
  const [page, setPage] = useState(3);
  const [slider, setSlider] = useState(68);
  const [range, setRange] = useState({ start: 24, end: 78 });
  const [dateRange, setDateRange] = useState({ start: "2026-08-22", end: "2026-08-29" });
  const [donutActive, setDonutActive] = useState(null);
  const [notes, setNotes] = useState("Evidence received from the service center.");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [view, setView] = useState("grid");
  const [viewDensity, setViewDensity] = useState("comfortable");

  return (
    <div className="contents">
      <ComponentGroup name="AvatarGroup" description="All sizes, maximum counts, remainder and empty states.">
        <VariantRow name="Sizes · XS / SM / MD / LG">
          <div className="flex flex-wrap items-end gap-6">
            {["xs", "sm", "md", "lg"].map((size) => <AvatarGroup key={size} people={PEOPLE.slice(0, 3)} max={3} size={size} />)}
          </div>
        </VariantRow>
        <VariantRow name="Remainder · Max 3"><AvatarGroup people={PEOPLE} max={3} /></VariantRow>
        <VariantRow name="No remainder · Exact max"><AvatarGroup people={PEOPLE.slice(0, 4)} max={4} /></VariantRow>
        <VariantRow name="Empty"><AvatarGroup people={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Tag" description="Tone, surface treatment, size and removable states.">
        <VariantRow name="Tone · Soft">
          <div className="flex flex-wrap gap-3">{TONES.map((tone) => <Tag key={tone} tone={tone}>{tone}</Tag>)}</div>
        </VariantRow>
        <VariantRow name="Variants · Soft / Solid / Outline">
          <div className="flex flex-wrap gap-3">{BADGE_VARIANTS.map((variant) => <Tag key={variant} tone="accent" variant={variant}>{variant}</Tag>)}</div>
        </VariantRow>
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap items-center gap-3">{SIZES.map((size) => <Tag key={size} tone="info" size={size}>{size.toUpperCase()}</Tag>)}</div>
        </VariantRow>
        <VariantRow name="Removable">
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone="accent" onRemove={() => {}}>Region: South</Tag>
            <Tag tone="danger" variant="outline" onRemove={() => {}}>Blocked</Tag>
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Badge" description="Every tone and surface treatment, plus sizes and workflow status glyphs. Table badges always use the medium size.">
        <VariantRow name="Tone matrix">
          <div className="grid min-w-[520px] grid-cols-[100px_repeat(3,minmax(100px,1fr))] items-center gap-4 overflow-x-auto">
            <span className="text-xs uppercase text-ctl-fg-muted">Tone</span>
            {BADGE_VARIANTS.map((variant) => <span key={variant} className="text-xs uppercase text-ctl-fg-muted">{variant}</span>)}
            {TONES.flatMap((tone) => [
              <span key={tone} className="text-sm font-medium capitalize text-ctl-fg">{tone}</span>,
              ...BADGE_VARIANTS.map((variant) => <span key={`${tone}-${variant}`}><Badge tone={tone} variant={variant}>Label</Badge></span>),
            ])}
          </div>
        </VariantRow>
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap items-center gap-3">
            {SIZES.map((size) => <Badge key={size} tone="accent" size={size}>{size.toUpperCase()}</Badge>)}
          </div>
        </VariantRow>
        <VariantRow name="Table treatment · Medium severity / Dot status">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral" size="md">Low</Badge>
            <Badge tone="warning" size="md">Medium</Badge>
            <Badge tone="danger" size="md">High</Badge>
            <Badge tone="success" size="md">Active</Badge>
            <Badge tone="warning" size="md">Review</Badge>
            <Badge tone="neutral" size="md">Draft</Badge>
          </div>
        </VariantRow>
        <VariantRow name="Semantic tones · Soft">
          <div className="flex flex-wrap items-center gap-3">
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>{tone}</Badge>
            ))}
          </div>
        </VariantRow>
        <VariantRow name="Status · Icon and label">
          <div className="flex flex-wrap gap-4">
            {["draft", "in-progress", "in-review", "completed"].map((status) => (
              <span key={status} className="inline-flex items-center gap-2">
                <Badge status={status} aria-label={`${status} icon`} />
                <Badge status={status}>{status}</Badge>
              </span>
            ))}
          </div>
        </VariantRow>
        <VariantRow name="Status · Explicit tone override">
          <Badge status="in-progress" tone="danger">Escalated progress</Badge>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Breadcrumb" description="Small, medium, single-page, collapsed and empty trails.">
        <VariantRow name="Size · SM"><Breadcrumb size="sm" items={[{ label: "Workspace", href: "#" }, { label: "Claims" }]} /></VariantRow>
        <VariantRow name="Size · MD"><Breadcrumb items={[{ label: "Workspace", href: "#" }, { label: "Claims", href: "#" }, { label: "CL-1042" }]} /></VariantRow>
        <VariantRow name="Single current page"><Breadcrumb items={[{ label: "Overview" }]} /></VariantRow>
        <VariantRow name="Collapsed · Over max"><Breadcrumb max={4} items={[{ label: "Workspace", href: "#" }, { label: "Region", href: "#" }, { label: "South", href: "#" }, { label: "Claims", href: "#" }, { label: "CL-1042" }]} /></VariantRow>
        <VariantRow name="Empty"><Breadcrumb items={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Card" description="Context-derived surface, one common medium inset, slots, interactive semantics and tones.">
        <VariantRow name="Regular">
          <Card title="Warranty review" subtitle="Standard card with a title, subtitle and body.">
            The inspection evidence is ready for review.
          </Card>
        </VariantRow>
        <VariantRow name="Slots · Media / Header / Actions / Footer">
          <Card
            title="Inspection evidence"
            subtitle="All composition slots populated"
            actions={<Button size="sm" variant="secondary">Review</Button>}
            media={<div className="grid h-20 place-items-center text-sm text-ctl-fg-muted">Media slot</div>}
            footer={<span className="text-sm text-ctl-fg-muted">Updated just now</span>}
          >
            Body content
          </Card>
        </VariantRow>
        <VariantRow name="Header · Eyebrow / Title / Subtitle">
          <Card eyebrow="Operations" title="Claims overview" subtitle="The shared header owns its spacing from every kind of body content.">
            Any child component starts 16px below this header.
          </Card>
        </VariantRow>
        <VariantRow name="Interactive · Button / Link">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card interactive onClick={() => {}} title="Button card">Keyboard-focusable action</Card>
            <Card interactive href="#component-card" title="Link card">Navigates to a destination</Card>
          </div>
        </VariantRow>
        <VariantRow name="Tone">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card tone="success" title="Success tone">Positive surface</Card>
            <Card tone="warning" title="Tone">Warning surface</Card>
          </div>
        </VariantRow>
        <VariantRow name="Overlay-safe · Clip off">
          <Card clip={false} title="Card with overlay control">
            <Popover trigger={<Button size="sm" variant="secondary">Open layer</Button>}><span className="text-sm">This layer can escape the card.</span></Popover>
          </Card>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="CardStack" description="Context-aware gaps, separators, custom spacing and nested material steps.">
        <VariantRow name="Custom gap">
          <CardStack gap="gap-3">
            <Card title="First">Compact inter-card gap</Card>
            <Card title="Second">Compact inter-card gap</Card>
          </CardStack>
        </VariantRow>
        <VariantRow name="Nested material · Panel to flat">
          <Card title="Outer panel">
            <Card title="Nested card">Inherits the next material rung.</Card>
          </Card>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SurfaceGroup" description="Page-level composition that keeps Panel and Flat spacing while turning Bare into a continuous, rule-divided surface.">
        <VariantRow name="Stack · Raw surface cells">
          <SurfaceGroup>
            <SurfaceCell>
              <div className="font-display text-base font-medium text-ctl-fg">Overview</div>
              <p className="mb-0 mt-1 text-sm text-ctl-fg-muted">Raw sections receive the material's shared content inset.</p>
            </SurfaceCell>
            <SurfaceCell>
              <div className="font-display text-base font-medium text-ctl-fg">Recent activity</div>
              <p className="mb-0 mt-1 text-sm text-ctl-fg-muted">Bare uses the one-pixel group rule instead of card spacing.</p>
            </SurfaceCell>
          </SurfaceGroup>
        </VariantRow>
        <VariantRow name="Grid · Cards stay direct children">
          <SurfaceGroup layout="grid" className="sm:grid-cols-2">
            <Card title="Open claims">18 records need review.</Card>
            <Card tone="success" title="Resolved today">Seven claims have completed.</Card>
          </SurfaceGroup>
        </VariantRow>
        <VariantRow name="PageBody · Material-aware outer gutter">
          <div className="overflow-hidden rounded-lg border border-solid border-layer-border">
            <PageBody>
              <SurfaceGroup>
                <SurfaceCell>
                  <div className="font-display text-base font-medium text-ctl-fg">Workspace section</div>
                  <p className="mb-0 mt-1 text-sm text-ctl-fg-muted">Bare reaches the body edge; Panel and Flat keep the standard page gutter.</p>
                </SurfaceCell>
              </SurfaceGroup>
            </PageBody>
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Checkbox" description="All sizes and native selection, indeterminate, invalid, hint and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap gap-5">{SIZES.map((size) => <Checkbox key={size} size={size} label={size.toUpperCase()} defaultChecked />)}</div>
        </VariantRow>
        <VariantRow name="Unchecked · Default"><Checkbox label="Receive notifications" hint="Nothing selected yet" /></VariantRow>
        <VariantRow name="Checked · Controlled"><Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} label="Include resolved claims" /></VariantRow>
        <VariantRow name="Indeterminate"><Checkbox indeterminate label="Some claims selected" /></VariantRow>
        <VariantRow name="Invalid"><Checkbox invalid label="Terms required" hint="Select this before continuing" /></VariantRow>
        <VariantRow name="Disabled · Off / On"><div className="flex flex-wrap gap-5"><Checkbox disabled label="Unavailable" /><Checkbox disabled defaultChecked label="Locked on" /></div></VariantRow>
        <VariantRow name="Read-only · Off / On / Mixed"><div className="flex flex-wrap gap-5"><Checkbox readOnly label="Notifications" /><Checkbox readOnly defaultChecked label="Include resolved" /><Checkbox readOnly indeterminate label="Some selected" /></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Radio" description="Sizes, selected, unselected, hint, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="flex flex-wrap gap-5">{SIZES.map((size) => <Radio key={size} name={`radio-${size}`} size={size} label={size.toUpperCase()} defaultChecked />)}</div></VariantRow>
        <VariantRow name="Unchecked · Checked"><div className="flex flex-wrap gap-5"><Radio name="radio-preview" label="Unchecked" /><Radio name="radio-preview" label="Checked" defaultChecked /></div></VariantRow>
        <VariantRow name="Hint · Invalid"><div className="grid gap-2 sm:grid-cols-2"><Radio name="radio-hint" label="With hint" hint="Additional context" /><Radio name="radio-invalid" label="Invalid choice" hint="Choose another option" invalid /></div></VariantRow>
        <VariantRow name="Disabled · Off / On"><div className="flex flex-wrap gap-5"><Radio name="radio-disabled-off" label="Unavailable" disabled /><Radio name="radio-disabled-on" label="Locked on" disabled defaultChecked /></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="RadioGroup" description="Controlled groups, legend, sizes, hints and disabled options.">
        <VariantRow name="Controlled · Legend"><RadioGroup name="stage-preview" value={radio} onChange={setRadio} legend="Next stage" options={OPTIONS.slice(0, 3)} /></VariantRow>
        <VariantRow name="Size · SM"><RadioGroup name="stage-preview-sm" size="sm" value="triage" onChange={() => {}} legend="Compact stages" options={OPTIONS.slice(0, 3)} /></VariantRow>
        <VariantRow name="Size · LG"><RadioGroup name="stage-preview-lg" size="lg" value="inspection" onChange={() => {}} legend="Large stages" options={OPTIONS.slice(0, 3)} /></VariantRow>
        <VariantRow name="Option hints · Disabled"><RadioGroup name="stage-preview-hints" value="inspection" onChange={() => {}} legend="Routing" options={[{ value: "triage", label: "Triage", hint: "New submissions" }, { value: "inspection", label: "Inspection", hint: "Evidence review" }, { value: "closed", label: "Closed", disabled: true }]} /></VariantRow>
        <VariantRow name="Empty options"><RadioGroup name="stage-preview-empty" value="" onChange={() => {}} legend="No stages available" options={[]} /></VariantRow>
        <VariantRow name="Read-only"><RadioGroup name="stage-preview-ro" value="inspection" onChange={() => {}} legend="Next stage" readOnly options={OPTIONS.slice(0, 3)} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Combobox" description="Sizes, controlled selection, free entry, loading, empty, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <Combobox key={size} size={size} label={size.toUpperCase()} options={OPTIONS} value="inspection" onChange={() => {}} />)}</div>
        </VariantRow>
        <VariantRow name="Selected · Controlled"><Combobox label="Search stage" hint="Type to filter stages" options={OPTIONS} value={combo} onChange={setCombo} /></VariantRow>
        <VariantRow name="Free entry"><Combobox label="Custom owner" allowFree options={OPTIONS.slice(0, 2)} value="External reviewer" onChange={() => {}} /></VariantRow>
        <VariantRow name="Loading"><Combobox label="Async owner search" loading options={[]} placeholder="Searching people…" /></VariantRow>
        <VariantRow name="Empty results"><Combobox label="No available stages" options={[]} emptyLabel="No stages available" /></VariantRow>
        <VariantRow name="Invalid"><Combobox label="Required stage" options={OPTIONS} value="" invalid error="Choose a stage" /></VariantRow>
        <VariantRow name="Disabled"><Combobox label="Locked stage" options={OPTIONS} value="triage" disabled /></VariantRow>
        <VariantRow name="Read-only"><Combobox label="Stage" options={OPTIONS} value="triage" readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="DateField" description="Sizes, ISO/DMY/MDY display orders, hint, suffix, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <DateField key={size} size={size} label={size.toUpperCase()} value={date} onChange={setDate} />)}</div></VariantRow>
        <VariantRow name="Display · ISO / DMY / MDY"><div className="grid gap-3 sm:grid-cols-3">{["iso", "dmy", "mdy"].map((display) => <DateField key={display} display={display} label={display.toUpperCase()} value="2026-08-27" onChange={() => {}} />)}</div></VariantRow>
        <VariantRow name="Hint · Suffix"><DateField label="Inspection date" hint="Use the local site date" value={date} onChange={setDate} suffix={<Badge tone="info">UTC+5:30</Badge>} /></VariantRow>
        <VariantRow name="Invalid"><DateField label="Invalid date" value="" invalid error="Enter a valid date" /></VariantRow>
        <VariantRow name="Disabled"><DateField label="Locked date" value={date} disabled /></VariantRow>
        <VariantRow name="Read-only"><DateField label="Date" value={date} readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="DatePicker" description="Single/range modes, display and size variants, constraints, error and disabled states.">
        <VariantRow name="Single · Controlled"><DatePicker label="Decision date" value={date} onChange={setDate} /></VariantRow>
        <VariantRow name="Range · Controlled"><DatePicker label="Inspection window" mode="range" value={dateRange} onChange={setDateRange} /></VariantRow>
        <VariantRow name="Display · DMY / Size · SM"><DatePicker label="Local date" display="dmy" size="sm" value={date} onChange={setDate} /></VariantRow>
        <VariantRow name="Display · MDY"><DatePicker label="US date" display="mdy" value={date} onChange={setDate} /></VariantRow>
        <VariantRow name="Size · LG"><DatePicker label="Large date picker" size="lg" value={date} onChange={setDate} /></VariantRow>
        <VariantRow name="Constrained · Min / Max"><DatePicker label="Scheduling window" value={date} onChange={setDate} min="2026-08-20" max="2026-09-10" hint="20 Aug – 10 Sep 2026" /></VariantRow>
        <VariantRow name="Custom field">
          <DatePicker
            value={date}
            onChange={setDate}
            field={<DateField label="Custom trigger field" value={date} onChange={setDate} suffix={<Badge tone="accent">Custom</Badge>} />}
          />
        </VariantRow>
        <VariantRow name="Custom Calendar child">
          <DatePicker label="Sunday-first calendar" value={date} onChange={setDate}>
            <Calendar value={date} onChange={setDate} weekStart="sunday" bordered={false} />
          </DatePicker>
        </VariantRow>
        <VariantRow name="Close on select · Off"><DatePicker label="Keep calendar open" value={date} onChange={setDate} closeOnSelect={false} /></VariantRow>
        <VariantRow name="Invalid"><DatePicker label="Required decision date" value="" error="Choose a date" /></VariantRow>
        <VariantRow name="Disabled"><DatePicker label="Locked picker" value={date} disabled /></VariantRow>
        <VariantRow name="Read-only"><DatePicker label="Picker" value={date} readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Donut" description="Sizes, calculated/formatted totals, caller labels, active segments, custom colors and empty data.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="flex flex-wrap items-end gap-6">{["sm", "md", "lg"].map((size) => <Donut key={size} segments={DONUT_DATA} size={size} label="100" sublabel={size.toUpperCase()} />)}</div></VariantRow>
        <VariantRow name="Calculated total · Formatted"><Donut segments={DONUT_DATA} caption="claims" format={(value) => `${value}%`} /></VariantRow>
        <VariantRow name="Custom label · Sublabel"><Donut segments={DONUT_DATA} label="₹8.6L" sublabel="approved" /></VariantRow>
        <VariantRow name="Active segment"><Donut segments={DONUT_DATA} activeIndex={1} label="28" sublabel="review" /></VariantRow>
        <VariantRow name="Custom colors"><Donut segments={[{ label: "Primary", value: 70, color: "var(--info-600)" }, { label: "Other", value: 30, color: "var(--ctl-fg-muted)" }]} /></VariantRow>
        <VariantRow name="Empty"><Donut segments={[]} sublabel="No data" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Legend" description="Four theme-owned layouts plus the original value, percentage, interaction and empty states.">
        <VariantRow name="Theme selected"><Legend items={DONUT_DATA} title="Claims by status" /></VariantRow>
        {LEGEND_VARIANTS.map(({ value, label }) => (
          <VariantRow key={value} name={`Layout · ${label}`}><Legend variant={value} items={DONUT_DATA} title="Claims by status" /></VariantRow>
        ))}
        <VariantRow name="Existing · Values · Percentages"><Legend variant="simple-rows" items={DONUT_DATA} /></VariantRow>
        <VariantRow name="Existing · Values only"><Legend variant="simple-rows" items={DONUT_DATA} showPercent={false} /></VariantRow>
        <VariantRow name="Existing · Labels only"><Legend variant="simple-rows" items={DONUT_DATA} showValue={false} showPercent={false} /></VariantRow>
        <VariantRow name="Existing · Custom segment colors"><Legend variant="simple-rows" items={[{ label: "Covered", value: 72, color: "var(--success-600)" }, { label: "At risk", value: 18, color: "var(--warning-600)" }, { label: "Blocked", value: 10, color: "var(--danger-600)" }]} /></VariantRow>
        <VariantRow name="Existing · Active · Controlled hover"><Legend variant="simple-rows" items={DONUT_DATA} activeIndex={donutActive} onActiveChange={setDonutActive} /></VariantRow>
        <VariantRow name="Existing · Empty"><Legend variant="simple-rows" items={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Icon" description="Named glyphs, five preset sizes, custom CSS size, accessible labels and missing-icon fallback.">
        <VariantRow name="Sizes · XS / SM / MD / LG / XL"><div className="flex flex-wrap items-end gap-6">{["xs", "sm", "md", "lg", "xl"].map((size) => <span key={size} className="grid justify-items-center gap-1 text-xs text-ctl-fg-muted"><Icon name="settings" size={size} label={`Settings ${size}`} />{size.toUpperCase()}</span>)}</div></VariantRow>
        <VariantRow name="Named glyphs"><div className="flex flex-wrap gap-5">{["search", "calendar", "settings", "check", "warning", "user", "download", "plus"].map((name) => <span key={name} className="grid justify-items-center gap-1 text-xs text-ctl-fg-muted"><Icon name={name} />{name}</span>)}</div></VariantRow>
        <VariantRow name="Custom size · Accessible label"><Icon name="info" size="2rem" label="Information" /></VariantRow>
        <VariantRow name="Unknown name · Fallback"><Icon name="not-in-the-set" label="Missing icon" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Input" description="Sizes, empty/filled values, adornments, hint, required, type, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <Input key={size} size={size} label={size.toUpperCase()} defaultValue="Claim" />)}</div></VariantRow>
        <VariantRow name="Empty · Placeholder"><Input label="Claim reference" placeholder="CL-0000" /></VariantRow>
        <VariantRow name="Prefix · Suffix"><div className="grid gap-3 sm:grid-cols-2"><Input label="Search" prefix defaultValue="Evidence" /><Input label="Amount" suffix={<span>INR</span>} defaultValue="860000" /></div></VariantRow>
        <VariantRow name="Hint · Required"><Input label="Contact email" type="email" hint="Used for review notifications" required defaultValue="owner@example.com" /></VariantRow>
        <VariantRow name="Invalid"><Input label="Company name" error="Company name is required" invalid /></VariantRow>
        <VariantRow name="Disabled"><Input label="Locked reference" disabled defaultValue="CL-1042" /></VariantRow>
        <VariantRow name="Read-only"><Input label="Claim title" readOnly defaultValue="Battery warranty claim" hint="Value on display — focusable and copyable, no mutation path" /></VariantRow>
        <VariantRow name="Read-only · Empty"><Input label="Claim title" readOnly hint="An absent value stays legible instead of collapsing" /></VariantRow>
        <VariantRow name="Read-only + Disabled · Disabled wins"><Input label="Claim title" readOnly disabled defaultValue="Battery warranty claim" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="MultiCombobox" description="Sizes, selected/empty values, maximum, free entry, hint, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <MultiCombobox key={size} size={size} label={size.toUpperCase()} options={OPTIONS} value={["triage"]} onChange={() => {}} />)}</div></VariantRow>
        <VariantRow name="Selected · Controlled"><MultiCombobox label="Visible stages" hint="Remove tags or search for more" options={OPTIONS} value={multi} onChange={setMulti} /></VariantRow>
        <VariantRow name="Maximum reached"><MultiCombobox label="Reviewer stages" options={OPTIONS} value={["triage", "inspection"]} onChange={() => {}} max={2} /></VariantRow>
        <VariantRow name="Free entry"><MultiCombobox label="Custom labels" options={OPTIONS.slice(0, 2)} value={["Priority account"]} onChange={() => {}} allowFree /></VariantRow>
        <VariantRow name="Empty"><MultiCombobox label="No selections" options={OPTIONS} value={[]} onChange={() => {}} placeholder="Search stages…" /></VariantRow>
        <VariantRow name="No options · Custom empty label"><MultiCombobox label="Unavailable reviewers" options={[]} value={[]} onChange={() => {}} emptyLabel="No reviewers found" /></VariantRow>
        <VariantRow name="Invalid"><MultiCombobox label="Required owners" options={OPTIONS} value={[]} onChange={() => {}} invalid error="Choose at least one owner" /></VariantRow>
        <VariantRow name="Disabled"><MultiCombobox label="Locked stages" options={OPTIONS} value={["triage"]} disabled /></VariantRow>
        <VariantRow name="Read-only"><MultiCombobox label="Stages" options={OPTIONS} value={["triage", "review"]} readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="NumberInput" description="Sizes, controlled stepping, unit, decimal step, bounds, empty, scrub, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <NumberInput key={size} size={size} label={size.toUpperCase()} value={42} onChange={() => {}} />)}</div></VariantRow>
        <VariantRow name="Controlled · Unit"><NumberInput label="Priority" hint="Drag the label or use the steppers" value={number} onChange={setNumber} min={0} max={100} unit="pts" /></VariantRow>
        <VariantRow name="Decimal step · No scrub"><NumberInput label="Resolution time" value={2.5} onChange={() => {}} min={0} max={24} step={0.5} unit="days" scrub={false} /></VariantRow>
        <VariantRow name="Bounds · Minimum / Maximum"><div className="grid gap-3 sm:grid-cols-2"><NumberInput label="At minimum" value={0} onChange={() => {}} min={0} max={10} /><NumberInput label="At maximum" value={10} onChange={() => {}} min={0} max={10} /></div></VariantRow>
        <VariantRow name="Empty"><NumberInput label="Optional quantity" value="" onChange={() => {}} /></VariantRow>
        <VariantRow name="Invalid"><NumberInput label="Seats" value={-2} onChange={() => {}} invalid error="Enter zero or more" /></VariantRow>
        <VariantRow name="Disabled"><NumberInput label="Locked score" value={42} disabled /></VariantRow>
        <VariantRow name="Read-only"><NumberInput label="Score" value={42} unit="pts" readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Pagination" description="Sizes, full/compact windows, totals, first/last boundaries, span and short ranges.">
        <VariantRow name="Default · Controlled"><Pagination page={page} pageCount={12} onChange={setPage} totalLabel="128 claims" /></VariantRow>
        <VariantRow name="Size · SM"><Pagination size="sm" page={6} pageCount={12} onChange={() => {}} /></VariantRow>
        <VariantRow name="Compact"><Pagination compact page={3} pageCount={12} onChange={() => {}} totalLabel="Page navigation" /></VariantRow>
        <VariantRow name="Custom span"><Pagination page={10} pageCount={24} span={3} onChange={() => {}} /></VariantRow>
        <VariantRow name="Boundary · First page"><Pagination page={1} pageCount={12} onChange={() => {}} /></VariantRow>
        <VariantRow name="Boundary · Last page"><Pagination page={12} pageCount={12} onChange={() => {}} /></VariantRow>
        <VariantRow name="Short range"><Pagination page={2} pageCount={3} onChange={() => {}} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Popover" description="Uncontrolled/controlled use, six placements, padding and dismiss-on-content-click behavior.">
        <VariantRow name="Uncontrolled · Bottom start"><Popover trigger={<Button variant="secondary">Open popover</Button>}><div className="min-w-48 text-sm text-ctl-fg">Popover content</div></Popover></VariantRow>
        <VariantRow name="Declarative trigger · First child">
          <Popover>
            <Button variant="secondary">Open declarative popover</Button>
            <div className="min-w-48 text-sm text-ctl-fg">The first child is the trigger.</div>
          </Popover>
        </VariantRow>
        <VariantRow name="Controlled">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen} trigger={<Button variant="secondary">{popoverOpen ? "Close" : "Open"} controlled</Button>}>
            <div className="min-w-48 text-sm text-ctl-fg">Controlled panel</div>
          </Popover>
        </VariantRow>
        <VariantRow name="Placements">
          <div className="flex flex-wrap gap-3">
            {["bottom-start", "bottom-end", "top-start", "top-end", "right-start", "left-start"].map((placement) => (
              <Popover key={placement} placement={placement} trigger={<Button size="sm" variant="secondary">{placement}</Button>}>
                <span className="text-sm">{placement}</span>
              </Popover>
            ))}
          </div>
        </VariantRow>
        <VariantRow name="Unpadded · Dismiss inside"><Popover padded={false} dismissOnClickInside trigger={<Button variant="secondary">Open action panel</Button>}><div className="min-w-48 p-2 text-sm">Clicking this panel dismisses it.</div></Popover></VariantRow>
      </ComponentGroup>
      <ComponentGroup name="PopoverItem" description="Default, icon, danger and disabled menu-row states.">
        <VariantRow name="Default"><div className="max-w-64"><PopoverItem>Open claim</PopoverItem></div></VariantRow>
        <VariantRow name="Icon"><div className="max-w-64"><PopoverItem icon>View details</PopoverItem></div></VariantRow>
        <VariantRow name="Danger"><div className="max-w-64"><PopoverItem danger>Delete claim</PopoverItem></div></VariantRow>
        <VariantRow name="Disabled"><div className="max-w-64"><PopoverItem disabled>Unavailable action</PopoverItem></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="PopoverSeparator" description="The menu rule between related action groups.">
        <VariantRow name="Default"><div className="grid max-w-64 gap-1"><PopoverItem>Above</PopoverItem><PopoverSeparator /><PopoverItem>Below</PopoverItem></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ProgressBar" description="The preserved single progress rail plus five theme-owned collection treatments for capacity and utilization data.">
        <VariantRow name="Theme selected"><ProgressBar items={PROGRESS_ITEMS} /></VariantRow>
        <VariantRow name="Linear rows"><ProgressBar items={PROGRESS_ITEMS} variant="linear" /></VariantRow>
        <VariantRow name="Countable cells"><ProgressBar items={PROGRESS_ITEMS} variant="cell-grid" /></VariantRow>
        <VariantRow name="Intensity cards"><ProgressBar items={PROGRESS_ITEMS} variant="intensity-cards" /></VariantRow>
        <VariantRow name="Free capacity"><ProgressBar items={PROGRESS_ITEMS} variant="free-capacity" /></VariantRow>
        <VariantRow name="Bullet rows"><ProgressBar items={PROGRESS_ITEMS} variant="bullet-rows" /></VariantRow>
        <VariantRow name="Existing · Default · No label"><ProgressBar value={64} /></VariantRow>
        <VariantRow name="Existing · Label · Value"><ProgressBar label="Completion" value={64} showValue /></VariantRow>
        <VariantRow name="Existing · Tones"><div className="grid gap-4">{TONES.map((tone, index) => <ProgressBar key={tone} label={tone} value={35 + index * 10} tone={tone} showValue />)}</div></VariantRow>
        <VariantRow name="Existing · Custom max"><ProgressBar label="42 of 60" value={42} max={60} showValue /></VariantRow>
        <VariantRow name="Existing · Custom color"><ProgressBar label="Chart series" value={72} color="var(--chart-4)" showValue /></VariantRow>
        <VariantRow name="Existing · Boundaries · 0 / 100"><div className="grid gap-4"><ProgressBar label="Empty" value={0} showValue /><ProgressBar label="Complete" value={100} showValue /></div></VariantRow>
        <VariantRow name="Existing · Indeterminate"><ProgressBar label="Loading" indeterminate /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ProgressList" description="The preserved per-row progress list plus grouped-status and discrete requirement-cell treatments.">
        <VariantRow name="Theme selected"><ProgressList items={PROGRESS_LIST_ITEMS} variant="theme" noun="vendors" /></VariantRow>
        <VariantRow name="Status groups"><ProgressList items={PROGRESS_LIST_ITEMS} variant="status-groups" noun="vendors" /></VariantRow>
        <VariantRow name="Document cells"><ProgressList items={PROGRESS_LIST_ITEMS} variant="document-cells" /></VariantRow>
        <VariantRow name="Existing · Default tones"><ProgressList variant="linear" items={[{ label: "Initial review", value: 96 }, { label: "Inspection", value: 88 }, { label: "Parts approval", value: 71 }]} /></VariantRow>
        <VariantRow name="Existing · Semantic tones"><ProgressList variant="linear" items={[{ label: "Initial review", value: 96, tone: "success" }, { label: "Inspection", value: 88, tone: "info" }, { label: "Parts approval", value: 71, tone: "warning" }]} /></VariantRow>
        <VariantRow name="Existing · Per-row max"><ProgressList variant="linear" items={[{ label: "Evidence", value: 8, max: 10, tone: "success" }, { label: "Approvals", value: 3, max: 12, tone: "warning" }]} /></VariantRow>
        <VariantRow name="Existing · Empty"><ProgressList variant="linear" items={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SegmentBar" description="The preserved rail and legend plus two theme-owned proportional status summaries.">
        <VariantRow name="Theme selected"><SegmentBar segments={SEGMENT_BAR_DATA} variant="theme" title="Shipments by status" /></VariantRow>
        <VariantRow name="Contained labels"><SegmentBar segments={SEGMENT_BAR_DATA} variant="contained-labels" title="Shipments by status" /></VariantRow>
        <VariantRow name="Split summary"><SegmentBar segments={SEGMENT_BAR_DATA} variant="split-summary" /></VariantRow>
        <VariantRow name="Existing · Legend · On"><SegmentBar segments={DONUT_DATA} variant="rail-legend" /></VariantRow>
        <VariantRow name="Existing · Legend · Off"><SegmentBar segments={DONUT_DATA} variant="rail-legend" legend={false} /></VariantRow>
        <VariantRow name="Existing · Custom colors"><SegmentBar variant="rail-legend" segments={[{ label: "Covered", value: 75, color: "var(--success-600)" }, { label: "At risk", value: 25, color: "var(--warning-600)" }]} /></VariantRow>
        <VariantRow name="Existing · Zero values · Skipped"><SegmentBar variant="rail-legend" segments={[{ label: "Approved", value: 100 }, { label: "Blocked", value: 0 }]} /></VariantRow>
        <VariantRow name="Existing · Empty"><SegmentBar variant="rail-legend" segments={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Select" description="Sizes, placeholder/selected values, hint, disabled options, placement, inline width, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <Select key={size} size={size} label={size.toUpperCase()} options={OPTIONS} value={select} onChange={setSelect} />)}</div></VariantRow>
        <VariantRow name="Placeholder · Empty"><Select label="Unselected stage" options={OPTIONS} value="" placeholder="Choose a stage…" /></VariantRow>
        <VariantRow name="Selected · Controlled"><Select label="Workflow stage" hint="Closed is unavailable" options={OPTIONS} value={select} onChange={setSelect} /></VariantRow>
        <VariantRow name="Placement · Up"><Select label="Opens upward" placement="up" options={OPTIONS} value="triage" onChange={() => {}} /></VariantRow>
        <VariantRow name="Width · Inline"><Select label="Compact selector" fullWidth={false} options={OPTIONS} value="inspection" onChange={() => {}} /></VariantRow>
        <VariantRow name="No options"><Select label="Empty option set" options={[]} value="" /></VariantRow>
        <VariantRow name="Invalid"><Select label="Required stage" options={OPTIONS} value="" invalid error="Choose a stage" /></VariantRow>
        <VariantRow name="Disabled"><Select label="Locked stage" options={OPTIONS} value="triage" disabled /></VariantRow>
        <VariantRow name="Read-only"><Select label="Stage" options={OPTIONS} value="triage" readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SkeletonText" description="One/multiple-line and animated/static loading placeholders.">
        <VariantRow name="Single line · Animated"><SkeletonText lines={1} /></VariantRow>
        <VariantRow name="Four lines · Animated"><SkeletonText lines={4} /></VariantRow>
        <VariantRow name="Static"><SkeletonText lines={3} animate={false} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SkeletonRow" description="The standard avatar/text/meta row in animated and reduced-motion forms.">
        <VariantRow name="Animated"><SkeletonRow /></VariantRow>
        <VariantRow name="Static"><SkeletonRow animate={false} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Slider" description="Controlled values, custom bounds/step, marks, unit, hint, hidden value and disabled states.">
        <VariantRow name="Default · Controlled"><Slider label="Confidence" value={slider} onChange={setSlider} /></VariantRow>
        <VariantRow name="Marks · Unit"><Slider label="Confidence" value={slider} onChange={setSlider} unit="%" marks={[0, 25, 50, 75, 100]} /></VariantRow>
        <VariantRow name="Bounds · Step"><Slider label="Days" value={3.5} onChange={() => {}} min={1} max={7} step={0.5} unit="days" /></VariantRow>
        <VariantRow name="Hint · Value hidden"><Slider label="Priority" hint="Higher values route sooner" value={60} onChange={() => {}} showValue={false} /></VariantRow>
        <VariantRow name="Disabled"><Slider label="Locked threshold" value={40} disabled /></VariantRow>
        <VariantRow name="Read-only"><Slider label="Threshold" value={40} unit="%" readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="RangeSlider" description="Controlled range, custom bounds/step, marks, unit, hint, hidden value and disabled states.">
        <VariantRow name="Default · Controlled"><RangeSlider label="Approved range" value={range} onChange={setRange} /></VariantRow>
        <VariantRow name="Marks · Unit"><RangeSlider label="Approved range" value={range} onChange={setRange} unit="%" marks={[0, 25, 50, 75, 100]} /></VariantRow>
        <VariantRow name="Bounds · Step"><RangeSlider label="Resolution window" value={{ start: 1.5, end: 4.5 }} onChange={() => {}} min={0} max={7} step={0.5} unit="days" /></VariantRow>
        <VariantRow name="Hint · Value hidden"><RangeSlider label="Score band" hint="Select the acceptable interval" value={{ start: 30, end: 70 }} onChange={() => {}} showValue={false} /></VariantRow>
        <VariantRow name="Disabled"><RangeSlider label="Locked range" value={{ start: 20, end: 70 }} disabled /></VariantRow>
        <VariantRow name="Read-only"><RangeSlider label="Range" value={{ start: 20, end: 70 }} readOnly /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="StackedBar" description="The preserved normalized composition plus network-scale, matrix, and countable-cell comparisons.">
        <VariantRow name="Theme selected"><StackedBar data={STACKED_BAR_DATA} keys={STACKED_BAR_KEYS} variant="theme" noun="shipments" /></VariantRow>
        <VariantRow name="Network scale"><StackedBar data={STACKED_BAR_DATA} keys={STACKED_BAR_KEYS} variant="network-scale" noun="shipments" /></VariantRow>
        <VariantRow name="Status matrix"><StackedBar data={STACKED_BAR_DATA} keys={STACKED_BAR_KEYS} variant="status-matrix" /></VariantRow>
        <VariantRow name="Shipment cells"><StackedBar data={STACKED_BAR_DATA} keys={STACKED_BAR_KEYS} variant="shipment-cells" noun="shipments" /></VariantRow>
        <VariantRow name="Existing · Multi-row · Multi-series"><StackedBar variant="normalized" data={[{ label: "North", approved: 64, review: 24, blocked: 12 }, { label: "South", approved: 52, review: 31, blocked: 17 }]} keys={[{ key: "approved", label: "Approved" }, { key: "review", label: "Review" }, { key: "blocked", label: "Blocked" }]} /></VariantRow>
        <VariantRow name="Existing · Custom colors"><StackedBar variant="normalized" data={[{ label: "Portfolio", approved: 72, blocked: 28 }]} keys={[{ key: "approved", label: "Approved", color: "var(--success-600)" }, { key: "blocked", label: "Blocked", color: "var(--danger-600)" }]} /></VariantRow>
        <VariantRow name="Existing · Zero segment"><StackedBar variant="normalized" data={[{ label: "Current", approved: 100, blocked: 0 }]} keys={[{ key: "approved", label: "Approved" }, { key: "blocked", label: "Blocked" }]} /></VariantRow>
        <VariantRow name="Existing · Empty"><StackedBar variant="normalized" data={[]} keys={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Tabs" description="Underline/pill variants, all sizes, counts, disabled tabs, full-width distribution and empty data.">
        <VariantRow name="Variant · Underline"><Tabs items={[{ value: "overview", label: "Overview" }, { value: "activity", label: "Activity", count: 8 }, { value: "files", label: "Files", count: 3 }]} value={tab} onChange={setTab} /></VariantRow>
        <VariantRow name="Variant · Pill"><Tabs variant="pill" items={[{ value: "overview", label: "Overview", count: 9 }, { value: "activity", label: "Activity", count: 7 }, { value: "files", label: "Files", count: 15 }]} value={tab} onChange={setTab} /></VariantRow>
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3">{SIZES.map((size) => <Tabs key={size} size={size} items={[{ value: "overview", label: "Overview" }, { value: "activity", label: "Activity" }]} value="overview" onChange={() => {}} />)}</div></VariantRow>
        <VariantRow name="Counts · Disabled"><Tabs items={[{ value: "overview", label: "Overview", count: 12 }, { value: "activity", label: "Activity", count: 8 }, { value: "archive", label: "Archive", disabled: true }]} value="overview" onChange={() => {}} /></VariantRow>
        <VariantRow name="Full width"><Tabs fullWidth variant="pill" items={[{ value: "overview", label: "Overview" }, { value: "activity", label: "Activity" }, { value: "files", label: "Files" }]} value="activity" onChange={() => {}} /></VariantRow>
        <VariantRow name="Empty"><Tabs items={[]} value="" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Textarea" description="Sizes, empty/filled values, rows, hint, required, auto-grow, counter, invalid and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="grid gap-3 sm:grid-cols-3">{SIZES.map((size) => <Textarea key={size} size={size} label={size.toUpperCase()} defaultValue="Review note" />)}</div></VariantRow>
        <VariantRow name="Empty · Placeholder"><Textarea label="Reviewer note" placeholder="Add a note…" /></VariantRow>
        <VariantRow name="Rows · Hint · Required"><Textarea label="Decision rationale" rows={5} hint="Describe the evidence used" required defaultValue="The submitted evidence supports approval." /></VariantRow>
        <VariantRow name="Auto-grow · Controlled"><Textarea label="Evidence" autoGrow value={notes} onChange={(event) => setNotes(event.target.value)} /></VariantRow>
        <VariantRow name="Character counter"><Textarea label="Summary" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={80} /></VariantRow>
        <VariantRow name="Invalid"><Textarea label="Required note" error="A note is required" invalid /></VariantRow>
        <VariantRow name="Disabled"><Textarea label="Locked note" disabled defaultValue="This note cannot be edited." /></VariantRow>
        <VariantRow name="Read-only"><Textarea label="Note" readOnly defaultValue={"Inspection completed.\nAwaiting parts."} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Toggle" description="Sizes, controlled on/off, hint, left/right labels and disabled states.">
        <VariantRow name="Sizes · SM / MD / LG"><div className="flex flex-wrap gap-5">{SIZES.map((size) => <Toggle key={size} size={size} label={size.toUpperCase()} defaultChecked />)}</div></VariantRow>
        <VariantRow name="Off · Default"><Toggle label="Auto-assign" /></VariantRow>
        <VariantRow name="On · Controlled"><Toggle checked={toggle} onChange={(event) => setToggle(event.target.checked)} label="Live updates" /></VariantRow>
        <VariantRow name="Hint"><Toggle label="Notify reviewer" hint="Sends an email immediately" defaultChecked /></VariantRow>
        <VariantRow name="Label position · Left"><div className="max-w-lg"><Toggle labelPosition="left" label="Show archived claims" defaultChecked /></div></VariantRow>
        <VariantRow name="Disabled · Off / On"><div className="flex flex-wrap gap-5"><Toggle label="Unavailable" disabled /><Toggle label="Locked on" disabled defaultChecked /></div></VariantRow>
        <VariantRow name="Read-only · Off / On"><div className="flex flex-wrap gap-5"><Toggle label="Email alerts" readOnly /><Toggle label="SMS alerts" readOnly defaultChecked /></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Tooltip" description="Four placements, default/immediate delays, keyboard focus and disabled behavior.">
        <VariantRow name="Placements · Top / Right / Bottom / Left"><div className="flex flex-wrap gap-4">{["top", "right", "bottom", "left"].map((placement) => <Tooltip key={placement} label={`${placement} tooltip`} placement={placement} delay={0}><Button variant="secondary">{placement}</Button></Tooltip>)}</div></VariantRow>
        <VariantRow name="Delay · Default"><Tooltip label="Appears after 250ms"><Button variant="secondary">Hover or focus</Button></Tooltip></VariantRow>
        <VariantRow name="Delay · Immediate"><Tooltip label="Immediate tooltip" delay={0}><Button variant="secondary">Immediate</Button></Tooltip></VariantRow>
        <VariantRow name="Disabled"><Tooltip label="Hidden" disabled><Button variant="secondary">No tooltip</Button></Tooltip></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FilterChip" description="Inactive, active, valued, clearable and disabled filter states.">
        <VariantRow name="Inactive"><FilterChip label="Stage" onClick={() => {}} /></VariantRow>
        <VariantRow name="Active"><FilterChip label="Mine" active onClick={() => {}} /></VariantRow>
        <VariantRow name="Value"><FilterChip label="Region" value="South" onClick={() => {}} /></VariantRow>
        <VariantRow name="Clearable"><FilterChip label="Owner" value="Ada" onClick={() => {}} onClear={() => {}} /></VariantRow>
        <VariantRow name="Disabled"><div className="flex flex-wrap gap-3"><FilterChip label="Locked" disabled /><FilterChip label="Region" value="South" disabled onClear={() => {}} /></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ViewSwitch" description="Two/three-option controlled switches, labels and icon content.">
        <VariantRow name="Two options · Controlled"><ViewSwitch options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} value={view} onChange={setView} /></VariantRow>
        <VariantRow name="Three options · Controlled"><ViewSwitch options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious" }]} value={viewDensity} onChange={setViewDensity} /></VariantRow>
        <VariantRow name="Icons"><ViewSwitch options={[{ value: "grid", label: "Grid", icon: <Icon name="menu" label="Grid" /> }, { value: "list", label: "List", icon: <Icon name="filter" label="List" /> }]} value={view} onChange={setView} /></VariantRow>
        <VariantRow name="Empty"><ViewSwitch options={[]} value="" /></VariantRow>
      </ComponentGroup>
    </div>
  );
}

export { PrimitiveComponentGroups };
export default PrimitiveComponentGroups;
