import { Alert } from "./kit/Alert.jsx";
import { Avatar } from "./kit/Avatar.jsx";
import { ComponentReviewGallery } from "./component-review-gallery.jsx";
import { CompositeComponentGroups } from "./component-review-composites.jsx";
import { KfComponentGroups } from "./component-review-kf.jsx";
import { PrimitiveComponentGroups } from "./component-review-primitives.jsx";
import { ShellComponentGroups } from "./component-review-shells.jsx";
import { componentFile, componentOrder } from "./component-review-files.js";
import { LayoutTemplatesSection } from "./layout-templates-section.jsx";
import { ThemeTokensSection } from "./theme-tokens-section.jsx";

// The layout review route is intentionally separate from the component catalog: it visualizes the
// canonical Express page structures without making every component-review page carry the gallery.
const SHOW_LAYOUTS_CATALOG = true;

const ALERT_TONES = ["neutral", "accent", "success", "warning", "info", "danger"];
const ALERT_VARIANTS = ["soft", "outline"];
const ALERT_LAYOUT_VARIANTS = ["stacked", "inline", "icon-rail"];
const AVATAR_SIZES = ["xs", "sm", "md", "lg"];
const AVATAR_STATUSES = ["online", "busy", "away", "offline"];

const SAMPLE_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%236d5efc'/%3E%3Ccircle cx='32' cy='23' r='12' fill='%23fff'/%3E%3Cpath d='M11 64c2-16 12-24 21-24s19 8 21 24' fill='%23fff'/%3E%3C/svg%3E";

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function CustomAlertIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0">
      <path d="M8 1.75 10 6l4.25 2L10 10l-2 4.25L6 10 1.75 8 6 6 8 1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
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

function ComponentGroup({ name, description, children }) {
  return (
    <section data-component-review={name} aria-labelledby={`${name.toLowerCase()}-component-review`} className="grid gap-6 border-0 border-b border-solid border-layer-border pb-10" style={{ order: componentOrder(name) }}>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`${name.toLowerCase()}-component-review`} className="m-0 font-display text-xl font-semibold text-ctl-fg">{name}</h2>
          <code className="rounded-md bg-ctl-track px-2 py-1 text-xs text-ctl-fg-muted">{componentFile(name)}</code>
        </div>
        <p className="m-0 mt-1 text-sm text-ctl-fg-muted">{description}</p>
      </header>
      <div>
        {children}
      </div>
    </section>
  );
}

function ShellPreviewContent({ section }) {
  const layoutsOnly = SHOW_LAYOUTS_CATALOG && section === "preview-layouts";

  return (
    <main aria-label="Shell content preview" className="min-h-full p-6 lg:p-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10">
        {layoutsOnly ? <LayoutTemplatesSection /> : (
          <>
            <ThemeTokensSection />

            <div aria-hidden="true" className="h-px w-full bg-layer-border" />

            <ComponentGroup
              name="Alert"
              description="Theme-owned composition with three explicit layout recipes, plus all semantic tones and treatments."
            >
              {ALERT_LAYOUT_VARIANTS.map((layoutVariant) => (
                <VariantRow key={layoutVariant} name={`Layout · ${titleCase(layoutVariant)}`}>
                  <Alert
                    layoutVariant={layoutVariant}
                    tone={layoutVariant === "inline" ? "warning" : "danger"}
                    title="Persistent operational alert"
                    action={<button type="button" className="border-0 bg-transparent p-0 text-sm font-medium text-brand-text cursor-pointer">Open details</button>}
                    onDismiss={() => {}}
                  >
                    The same message contract adapts its composition without changing the underlying content.
                  </Alert>
                </VariantRow>
              ))}

              {ALERT_TONES.flatMap((tone) => ALERT_VARIANTS.map((variant) => (
                <VariantRow key={`${tone}-${variant}`} name={`${titleCase(tone)} · ${titleCase(variant)}`}>
                  <Alert layoutVariant="stacked" tone={tone} variant={variant} title={`${titleCase(tone)} alert`}>
                    This is the {variant} treatment for the {tone} tone.
                  </Alert>
                </VariantRow>
              )))}

              <VariantRow name="Icon · Hidden">
                <Alert layoutVariant="stacked" tone="neutral" icon={false} title="Alert without an icon">
                  Use this state when the message should remain visually quiet.
                </Alert>
              </VariantRow>

              <VariantRow name="Icon · Custom">
                <Alert layoutVariant="stacked" tone="accent" variant="outline" icon={<CustomAlertIcon />} title="Custom alert icon">
                  The icon prop also accepts a caller-provided React node.
                </Alert>
              </VariantRow>

              <VariantRow name="Dismissible">
                <Alert layoutVariant="stacked" tone="warning" title="Dismissible warning" onDismiss={() => {}}>
                  The close control is keyboard accessible and remains aligned to the top.
                </Alert>
              </VariantRow>

              <VariantRow name="With action">
                <Alert
                  layoutVariant="stacked"
                  tone="info"
                  title="Alert with an action"
                  action={(
                    <button type="button" className="border-0 bg-transparent p-0 text-sm font-medium text-info-text underline underline-offset-2 cursor-pointer">
                      Review details
                    </button>
                  )}
                >
                  An action appears below the persistent message.
                </Alert>
              </VariantRow>
            </ComponentGroup>

            <ComponentGroup
              name="Avatar"
              description="All supported sizes, presence states, shapes and source treatments."
            >
              {AVATAR_SIZES.map((size, index) => (
                <VariantRow key={`size-${size}`} name={`Size · ${size.toUpperCase()}`}>
                  <Avatar name={["Ada Okafor", "Ravi Menon", "Lin Wei", "Marta Silva"][index]} size={size} />
                </VariantRow>
              ))}

              {AVATAR_STATUSES.map((status, index) => (
                <VariantRow key={`status-${status}`} name={`Status · ${titleCase(status)}`}>
                  <Avatar name={["Ada Okafor", "Ravi Menon", "Lin Wei", "Jon Park"][index]} status={status} />
                </VariantRow>
              ))}

              <VariantRow name="Shape · Circle">
                <Avatar name="Ava Shah" />
              </VariantRow>

              <VariantRow name="Shape · Square">
                <Avatar name="Queue Bot" square />
              </VariantRow>

              <VariantRow name="Source · Initials">
                <Avatar name="Diego Iyer" />
              </VariantRow>

              <VariantRow name="Source · Image">
                <Avatar name="Sample profile" src={SAMPLE_AVATAR} />
              </VariantRow>
            </ComponentGroup>

            <PrimitiveComponentGroups />

            <ShellComponentGroups />

            <CompositeComponentGroups />

            <KfComponentGroups />

            <ComponentReviewGallery />
          </>
        )}
      </div>
    </main>
  );
}

export { SHOW_LAYOUTS_CATALOG, ShellPreviewContent };
export default ShellPreviewContent;
