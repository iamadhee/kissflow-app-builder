import React from "react";
import { Breadcrumb } from "./Breadcrumb.jsx";
import { SurfaceContext, materialStyle, normalizeSurfaceContext } from "./Surface.js";
import { Tabs } from "./Tabs.jsx";
import { cn as cx } from "./cn.js";

/**
 * PageHeader — the band every screen opens with.
 *
 * Breadcrumb, title, meta, actions, and an optional tab row. It exists because
 * the alternative is each screen assembling the same five things at slightly
 * different spacing, and that inconsistency is the first thing anyone notices
 * when clicking between pages.
 *
 * The tabs slot sits below the title and flush to the header's bottom edge.
 * Underline tabs retain that edge as their baseline; pill tabs intentionally
 * leave the header borderless because every tab already owns a complete edge.
 *
 * density defaults to "comfortable" — a design review weighed it against four
 * other treatments (a breadcrumb split into its own register, leaning on type-scale
 * contrast instead of spacing, moving the action onto its own row, bounding the
 * header with a rule/shadow) and picked comfortable's plain, uniform rhythm because
 * compact-as-default read as vertically cramped and left the title undifferentiated
 * from body text. "compact" is still there for screens that need to fit more above
 * the fold.
 *
 * The eyebrow is the status register above the title — Theme Blue v2 opens its
 * pages with one ("● LIVE · PRODUCTION"). It is NOT the breadcrumb slot: a
 * breadcrumb is a <nav> of ancestors, an eyebrow is a state label, and putting a
 * state label inside nav semantics is wrong for a screen reader even though the
 * two land in the same place visually.
 *
 * The eyebrow's FORM is the theme's, not this component's. It used to be four
 * Tailwind literals here — mono, uppercase, 0.16em, brand — which meant every theme
 * in the catalogue opened every page with the same purple typewriter slug and a
 * round brand dot, no matter which header variant it had chosen. Family, transform,
 * tracking, colour, fill and the mark's own shape are `--page-header-eyebrow-*`
 * tokens now, so `lede` can drop the mark and the capitals, `kicker-caption` can
 * turn the mark into a printer's rule, and `badge-kicker` can make the whole
 * register a chip. Same for the title's family and transform.
 *
 * The header carries no fill and no rule by default: Theme Blue v2's header sits
 * directly on the page canvas, and in this shell the white band was the header's
 * own doing — every ancestor and the content below it are already transparent.
 * Two cases still opt back in, both because something depends on the paint rather
 * than on taste: `sticky` needs an opaque surface or scrolled content shows
 * through it, and a header with UNDERLINE TABS keeps its bottom border as the
 * tabs' baseline. Pill tabs infer no header border. Passing `bordered` explicitly
 * overrides that inference in either direction.
 *
 * <PageHeader title="Claim #1042" breadcrumb={[{ label: 'Claims', href: '/claims' }, { label: 'CL-1042' }]} actions={…} tabs={…} />
 * <PageHeader eyebrow="Live · Production" title="Everything is running" />
 * <PageHeader density="compact" title="Claim #1042" tabs={…} />
 */
const PAGE_HEADER_VARIANTS = new Set(['theme', 'standard', 'lede', 'kicker-caption', 'inline-divider', 'caps-rule', 'badge-kicker']);
const pageHeaderVariant = (value) => PAGE_HEADER_VARIANTS.has(value) ? value : 'theme';

/* Slots take either node props or children carrying data-slot="name" — the same
   contract Toolbar uses, because a JSX caller and a template caller cannot pass
   nodes the same way. Unslotted children fall through to the main content. */
function useSlots(children, names) {
  /* Fragments are transparent. React.Children.toArray counts a Fragment as ONE
     child and never looks inside it, and a template's <sc-if>/<sc-for> wraps its
     branch in exactly that — so a slot declared inside a conditional lost its
     data-slot and fell through to the content. Flattening first makes a
     conditional slot behave like an unconditional one. */
  const flat = (nodes) =>
    React.Children.toArray(nodes).reduce(
      (out, n) => out.concat(n && n.type === React.Fragment ? flat(n.props.children) : n),
      []
    );
  const kids = flat(children);
  const slotOf = (n) => (n && n.props ? n.props['data-slot'] : null);
  const out = { rest: kids.filter((k) => names.indexOf(slotOf(k)) < 0) };
  names.forEach((name) => {
    const found = kids.filter((k) => slotOf(k) === name);
    out[name] = found.length ? found : null;
  });
  return out;
}

function tabVariantFromNode(nodes) {
  let found = null;
  React.Children.forEach(nodes, (node) => {
    if (found || !React.isValidElement(node)) return;
    if (node.type === Tabs) {
      found = node.props.variant === 'pill' ? 'pill' : 'underline';
      return;
    }
    if (node.props?.role === 'tablist' && ['pill', 'underline'].includes(node.props['data-variant'])) {
      found = node.props['data-variant'];
      return;
    }
    found = tabVariantFromNode(node.props?.children);
  });
  return found;
}

function PageHeader({
  title,
  description,
  eyebrow,
  eyebrowDot = true,
  breadcrumb,
  breadcrumbSize = 'sm',
  meta,
  actions,
  tabs,
  children,
  bordered,
  sticky = false,
  density = 'comfortable',
  variant = 'theme',
  className,
}) {
  const slot = useSlots(children, ['breadcrumb', 'eyebrow', 'meta', 'actions', 'tabs']);
  const crumbNode = Array.isArray(breadcrumb)
    ? breadcrumb.length
      ? <Breadcrumb items={breadcrumb} size={breadcrumbSize} />
      : null
    : breadcrumb || slot.breadcrumb;
  const eyebrowNode = eyebrow || slot.eyebrow;
  const metaNode = meta || slot.meta;
  const actionNode = actions || slot.actions;
  const tabNode = tabs || slot.tabs;
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const material = ambient.material;
  const bare = material === 'bare';
  const spacing = material === 'spacing';
  const comfortable = density === 'comfortable';
  const tabVariant = tabVariantFromNode(tabNode);
  /* Undefined means "infer". Underline tabs need the header edge as their baseline; pills
     already own complete borders and therefore keep the header edge clear. */
  const inferredBorder = tabNode ? tabVariant !== 'pill' : Boolean(bare || sticky);
  const hasBorder = !spacing && (bordered === undefined ? inferredBorder : bordered);

  return (
    <header
      data-kf-page-header=""
      className={cx(
        'flex flex-col w-full shrink-0',
        !bare && 'px-8',
        sticky && 'bg-material-surface',
        bare && 'bg-material-surface [background-image:var(--material-image)]',
        comfortable ? 'gap-4' : 'gap-2',
        !bare && (comfortable ? 'pt-6' : 'pt-4'),
        !bare && (tabNode ? 'pb-0' : comfortable ? 'pb-6' : 'pb-4'),
        hasBorder && 'border-0 border-b border-solid',
        hasBorder && (bare ? 'border-material-rule' : 'border-layer-border'),
        sticky && 'sticky top-0 z-40',
        className
      )}
      style={bare ? Object.assign({}, materialStyle(material, ambient.geometry), {
        paddingInline: 'var(--material-bare-cell-padding-inline)',
        paddingTop: 'var(--material-bare-cell-padding-block)',
        paddingBottom: tabNode ? 0 : 'var(--material-bare-cell-padding-block)',
      }) : undefined}
      data-kf-component="page-header"
      data-page-header-variant={pageHeaderVariant(variant)}
      data-material={material}
      data-padding={bare ? 'bare-cell' : density}
    >
      {crumbNode ? <div className="min-w-0">{crumbNode}</div> : null}

      <div
        data-page-header-layout=""
        className="grid min-w-0"
        style={{
          gridTemplateColumns: 'var(--page-header-layout-columns)',
          gridTemplateAreas: 'var(--page-header-layout-areas)',
          alignItems: 'var(--page-header-layout-align)',
          columnGap: 'var(--page-header-layout-column-gap)',
          rowGap: 'var(--page-header-layout-row-gap)',
        }}
      >
        <div
          data-page-header-identity=""
          className="flex min-w-0"
          style={{
            gridArea: 'identity',
            flexDirection: 'var(--page-header-identity-direction)',
            alignItems: 'var(--page-header-identity-align)',
            gap: 'var(--page-header-identity-gap)',
          }}
        >
          {eyebrowNode ? (
            <div
              data-page-header-eyebrow=""
              className="flex min-w-0 items-center"
              style={{
                gap: 'var(--page-header-eyebrow-gap)',
                fontFamily: 'var(--page-header-eyebrow-family)',
                fontSize: 'var(--page-header-eyebrow-size)',
                fontWeight: 'var(--page-header-eyebrow-weight)',
                letterSpacing: 'var(--page-header-eyebrow-tracking)',
                textTransform: 'var(--page-header-eyebrow-transform)',
                color: 'var(--page-header-eyebrow-color)',
                background: 'var(--page-header-eyebrow-bg)',
                borderRadius: 'var(--page-header-eyebrow-radius)',
                padding: 'var(--page-header-eyebrow-padding)',
              }}
            >
              {eyebrowDot ? (
                <span
                  data-page-header-eyebrow-mark=""
                  className="shrink-0"
                  style={{
                    display: 'var(--page-header-eyebrow-mark-display)',
                    width: 'var(--page-header-eyebrow-mark-width)',
                    height: 'var(--page-header-eyebrow-mark-height)',
                    borderRadius: 'var(--page-header-eyebrow-mark-radius)',
                    background: 'var(--page-header-eyebrow-mark-color)',
                  }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="truncate">{eyebrowNode}</span>
            </div>
          ) : null}
          {title != null ? (
            <h1
              data-page-header-title=""
              className="m-0 min-w-0 text-ctl-fg text-pretty"
              style={{
                fontFamily: 'var(--page-header-title-family)',
                textTransform: 'var(--page-header-title-transform)',
                fontSize: 'var(--page-header-title-size)',
                fontWeight: 'var(--page-header-title-weight)',
                lineHeight: 'var(--page-header-title-line-height)',
                letterSpacing: 'var(--page-header-title-tracking)',
              }}
            >
              {title}
            </h1>
          ) : null}
        </div>

        {description ? (
          <p
            data-page-header-description=""
            className="m-0 min-w-0 text-ctl-fg-muted text-pretty"
            style={{
              gridArea: 'description',
              maxWidth: 'var(--page-header-description-max-width)',
              fontSize: 'var(--page-header-description-size)',
              lineHeight: 'var(--page-header-description-line-height)',
              whiteSpace: 'var(--page-header-description-white-space)',
              overflow: 'var(--page-header-description-overflow)',
              textOverflow: 'var(--page-header-description-text-overflow)',
              borderInlineStart: 'var(--page-header-description-border-width) solid var(--layer-border)',
              paddingInlineStart: 'var(--page-header-description-padding-inline)',
            }}
          >
            {description}
          </p>
        ) : null}

        {metaNode ? (
          <div
            data-page-header-meta=""
            className="flex shrink-0 items-center gap-2 text-sm text-ctl-fg-muted"
            style={{
              gridArea: 'meta',
              alignSelf: 'var(--page-header-meta-align)',
              justifySelf: 'var(--page-header-meta-justify)',
            }}
          >
            {metaNode}
          </div>
        ) : null}

        {actionNode ? (
          <div
            data-page-header-actions=""
            className="flex shrink-0 items-center gap-3"
            style={{ gridArea: 'actions', alignSelf: 'var(--page-header-actions-align)' }}
          >
            {actionNode}
          </div>
        ) : null}
      </div>

      {slot.rest.length ? <div className="min-w-0">{slot.rest}</div> : null}

      {tabNode ? <div className={cx('min-w-0', tabVariant !== 'pill' && '-mb-px')}>{tabNode}</div> : null}
    </header>
  );
}

export { PageHeader };
export default PageHeader;
