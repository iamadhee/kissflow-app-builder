import { LAYOUT_TEMPLATES } from "./layout-catalog.generated.js";

const FAMILY_ORDER = ["overview", "working", "records", "intake", "analysis"];
const FAMILY_LABELS = {
  overview: "Overview & monitoring",
  working: "Focused work",
  records: "Records & schedules",
  intake: "Intake & guidance",
  analysis: "Analysis & history",
};

const titleCase = (value = "") => value
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

function MiniRows({ count = 3 }) {
  return (
    <div className="grid w-full gap-1">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="grid grid-cols-[1fr_0.35fr] gap-1">
          <span className="h-1.5 rounded-full bg-current opacity-20" />
          <span className="h-1.5 rounded-full bg-current opacity-10" />
        </div>
      ))}
    </div>
  );
}

function ZoneGlyph({ slot }) {
  const kinds = slot.accepts.join(" ");

  if (kinds.includes("queue:board")) {
    return (
      <div className="grid w-full grid-cols-3 gap-1">
        {[2, 3, 2].map((count, column) => (
          <div key={column} className="grid content-start gap-1 rounded border border-solid border-current p-1 opacity-60">
            {Array.from({ length: count }, (_, row) => <span key={row} className="h-2 rounded-sm bg-current opacity-25" />)}
          </div>
        ))}
      </div>
    );
  }

  if (kinds.includes("timeline:calendar")) {
    return (
      <div className="grid w-full grid-cols-7 gap-0.5">
        {Array.from({ length: 28 }, (_, index) => (
          <span key={index} className={`aspect-square rounded-[2px] border border-solid border-current ${index === 17 ? "bg-current opacity-45" : "opacity-15"}`} />
        ))}
      </div>
    );
  }

  if (kinds.includes("table:gallery")) {
    return (
      <div className="grid w-full grid-cols-3 gap-1">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="aspect-[4/3] rounded border border-solid border-current bg-current opacity-15" />
        ))}
      </div>
    );
  }

  if (kinds.includes("form")) {
    return (
      <div className="grid w-full grid-cols-2 gap-1">
        <span className="col-span-2 h-2 rounded border border-solid border-current opacity-25" />
        <span className="h-2 rounded border border-solid border-current opacity-25" />
        <span className="h-2 rounded border border-solid border-current opacity-25" />
        <span className="col-span-2 h-4 rounded border border-solid border-current opacity-25" />
      </div>
    );
  }

  if (kinds.includes("progress:gauge")) {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full border-[5px] border-solid border-current text-[9px] font-semibold opacity-60">
        72%
      </div>
    );
  }

  if (kinds.includes("trend-chart") || kinds.includes("bar-chart") || kinds.includes("donut-chart")) {
    return (
      <div className="flex h-10 w-full items-end gap-1 border-0 border-b border-l border-solid border-current px-1 pb-0.5 opacity-45">
        {[35, 70, 48, 88, 58, 78].map((height, index) => (
          <span key={index} className="min-w-0 flex-1 rounded-t-sm bg-current" style={{ height: `${height}%` }} />
        ))}
      </div>
    );
  }

  if (kinds.includes("timeline")) {
    return (
      <div className="relative grid w-full gap-1.5 pl-3 before:absolute before:bottom-1 before:left-1 before:top-1 before:w-px before:bg-current before:opacity-20">
        {[0, 1, 2].map((index) => (
          <span key={index} className="relative h-1.5 rounded-full bg-current opacity-20 before:absolute before:-left-3 before:top-0 before:h-1.5 before:w-1.5 before:rounded-full before:bg-current" />
        ))}
      </div>
    );
  }

  if (kinds.includes("record-detail") || kinds.includes("detail-pane") || kinds.includes("decision")) {
    return (
      <div className="grid w-full grid-cols-2 gap-1">
        <span className="col-span-2 h-2 w-1/2 rounded-full bg-current opacity-25" />
        <span className="h-1.5 rounded-full bg-current opacity-15" />
        <span className="h-1.5 rounded-full bg-current opacity-15" />
        <span className="h-1.5 rounded-full bg-current opacity-15" />
        <span className="h-1.5 rounded-full bg-current opacity-15" />
      </div>
    );
  }

  if (kinds.includes("queue") || kinds.includes("table") || kinds.includes("progress:list")) {
    return <MiniRows count={3} />;
  }

  if (slot.id === "stepper") {
    return (
      <div className="flex w-full items-center">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex min-w-0 flex-1 items-center last:flex-none">
            <span className={`h-2 w-2 shrink-0 rounded-full border border-solid border-current ${index === 0 ? "bg-current opacity-60" : "opacity-25"}`} />
            {index < 3 ? <span className="h-px min-w-2 flex-1 bg-current opacity-20" /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (["submit", "navbar", "decide"].includes(slot.id)) {
    return (
      <div className="flex w-full justify-end gap-1">
        <span className="h-3 w-8 rounded-full border border-solid border-current opacity-25" />
        <span className="h-3 w-10 rounded-full bg-current opacity-35" />
      </div>
    );
  }

  if (["filters", "controls", "toolbar"].includes(slot.id)) {
    return (
      <div className="flex w-full gap-1">
        {[8, 12, 10].map((width, index) => <span key={index} className="h-3 rounded-full border border-solid border-current opacity-25" style={{ width: `${width * 4}px` }} />)}
      </div>
    );
  }

  return <MiniRows count={2} />;
}

function previewColumns(layout) {
  const count = Math.max(...layout.grid.areas.map((row) => row.length));
  if (count === 1) return "minmax(0, 1fr)";
  if (layout.grid.columns.startsWith("340px")) return "1.15fr 2fr";
  if (layout.grid.columns.startsWith("48px")) return "0.35fr 3fr 2fr";
  if (layout.grid.columns.startsWith("1fr minmax")) return "0.6fr 3fr 1.25fr";
  if (layout.grid.columns.startsWith("minmax")) return "3fr 1fr";
  return layout.grid.columns;
}

function LayoutZone({ slot, index }) {
  const structural = slot.accepts.length === 0;
  const toneClass = structural
    ? "border-layer-border bg-ctl-track text-ctl-fg-muted"
    : slot.min > 0 && index === 0
      ? "border-brand-border bg-brand-soft text-brand-strong"
      : "border-layer-border bg-layer-surface text-ctl-fg";

  return (
    <div
      className={`grid min-h-0 overflow-hidden rounded-lg border border-solid p-2 ${toneClass}`}
      style={{ gridArea: slot.area }}
    >
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5">
        <div className="flex min-w-0 items-center justify-between gap-1 text-[10px] font-semibold leading-none">
          <span className="truncate">{titleCase(slot.id)}</span>
          <span className="shrink-0 font-mono text-[8px] opacity-60">{slot.min > 0 ? "required" : "optional"}</span>
        </div>
        <div className="grid min-h-0 place-items-center overflow-hidden">
          <ZoneGlyph slot={slot} />
        </div>
      </div>
    </div>
  );
}

function LayoutDiagram({ layout }) {
  const uniqueAreas = [...new Set(layout.grid.areas.flat().filter((area) => area !== "."))];
  const slotsByArea = new Map(layout.slots.map((slot) => [slot.area, slot]));
  const rows = layout.grid.areas.length;

  return (
    <div
      className="grid h-full gap-2"
      style={{
        gridTemplateAreas: layout.grid.areas.map((row) => `"${row.join(" ")}"`).join(" "),
        gridTemplateColumns: previewColumns(layout),
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {uniqueAreas.map((area, index) => {
        const slot = slotsByArea.get(area) || { id: area, area, accepts: [], min: 0, max: 0 };
        return <LayoutZone key={area} slot={slot} index={index} />;
      })}
    </div>
  );
}

function metricRange(metrics) {
  if (metrics.max === 0) return "None";
  if (metrics.min === metrics.max) return `${metrics.min} · ${titleCase(metrics.placement)}`;
  return `${metrics.min}–${metrics.max} · ${titleCase(metrics.placement)}`;
}

function LayoutCard({ layout }) {
  const requiredSlots = layout.slots.filter((slot) => slot.min > 0).length;

  return (
    <article data-layout-template={layout.id} className="grid min-w-0 gap-4 border-0 border-b border-solid border-layer-border pb-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="m-0 font-display text-lg font-semibold text-ctl-fg">{layout.name}</h4>
            <span className="rounded-full bg-ctl-track px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ctl-fg-muted">{layout.family}</span>
          </div>
          <p className="m-0 mt-1 text-sm leading-5 text-ctl-fg-muted">{layout.description}</p>
        </div>
        <code className="rounded-md bg-ctl-track px-2 py-1 text-xs text-ctl-fg-muted">{layout.id}</code>
      </header>

      <div className="h-64 overflow-hidden rounded-xl border border-solid border-layer-border bg-ctl-offset p-3" aria-label={`${layout.name} layout preview`}>
        <LayoutDiagram layout={layout} />
      </div>

      <p className="m-0 border-0 border-l-2 border-solid border-brand-border pl-3 text-xs leading-5 text-ctl-fg-muted">
        {layout.signature}
      </p>

      <dl className="m-0 grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wider text-ctl-fg-muted">Grid</dt>
          <dd className="m-0 mt-1 font-mono text-ctl-fg">{layout.grid.columns}</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-ctl-fg-muted">Slots</dt>
          <dd className="m-0 mt-1 text-ctl-fg">{requiredSlots} required · {layout.slots.length} total</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-ctl-fg-muted">Metrics</dt>
          <dd className="m-0 mt-1 text-ctl-fg">{metricRange(layout.metrics)}</dd>
        </div>
      </dl>
    </article>
  );
}

function LayoutTemplatesSection() {
  return (
    <section aria-labelledby="layout-templates-heading" className="grid gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-medium uppercase tracking-wider text-ctl-fg-muted">Express template catalog</p>
          <h2 id="layout-templates-heading" className="m-0 mt-1 font-display text-xl font-semibold text-ctl-fg">Layouts</h2>
          <p className="m-0 mt-1 max-w-3xl text-sm text-ctl-fg-muted">
            All compiler-ready page structures from the canonical registry. Each map shows its real grid areas, required slots, optional regions and metric placement.
          </p>
        </div>
        <span className="rounded-full border border-solid border-brand-border bg-brand-soft px-3 py-1.5 font-mono text-sm font-semibold text-brand-strong">
          {LAYOUT_TEMPLATES.length} ready layouts
        </span>
      </header>

      {FAMILY_ORDER.map((family) => {
        const layouts = LAYOUT_TEMPLATES.filter((layout) => layout.family === family);
        if (!layouts.length) return null;
        return (
          <section key={family} aria-labelledby={`layout-family-${family}`} className="grid gap-5">
            <header className="flex items-baseline justify-between gap-3 border-0 border-b border-solid border-layer-border pb-3">
              <h3 id={`layout-family-${family}`} className="m-0 font-display text-base font-semibold text-ctl-fg">{FAMILY_LABELS[family]}</h3>
              <span className="text-xs text-ctl-fg-muted">{layouts.length} {layouts.length === 1 ? "layout" : "layouts"}</span>
            </header>
            <div className="grid gap-x-8 gap-y-10 xl:grid-cols-2">
              {layouts.map((layout) => <LayoutCard key={layout.id} layout={layout} />)}
            </div>
          </section>
        );
      })}
    </section>
  );
}

export { LAYOUT_TEMPLATES, LayoutTemplatesSection };
export default LayoutTemplatesSection;
