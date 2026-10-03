import { componentFile, componentOrder } from "./component-review-files.js";

function ComponentGroup({ name, description, children }) {
  const id = `component-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section data-component-review={name} aria-labelledby={id} className="grid gap-5 border-0 border-b border-solid border-layer-border pb-10 last:border-b-0 last:pb-0" style={{ order: componentOrder(name) }}>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={id} className="m-0 font-display text-lg font-semibold text-ctl-fg">{name}</h3>
          <code className="rounded-md bg-ctl-track px-2 py-1 text-xs text-ctl-fg-muted">{componentFile(name)}</code>
        </div>
        {description ? <p className="m-0 mt-1 text-sm text-ctl-fg-muted">{description}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

function VariantRow({ name, children }) {
  return (
    <div className="grid gap-3 border-0 border-b border-solid border-layer-border py-5 first:pt-0 last:border-b-0 last:pb-0 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
      <span className="pt-1 text-xs font-medium uppercase tracking-wider text-ctl-fg-muted">{name}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export { ComponentGroup, VariantRow };
