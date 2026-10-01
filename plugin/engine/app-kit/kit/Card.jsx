// GENERATED from starter/src/components/kit/Card.jsx (sha256:03c7a67fcdffc699). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import { ContentHeader } from "./ContentHeader.jsx";
import { semanticToneToken } from "./semanticTone.js";
import {
  MaterialContext,
  SurfaceContext,
  elevationClass,
  materialRadiusClass,
  materialStyle,
  nextMaterial,
  normalizeSurfaceContext,
  resolveElevation,
} from "./Surface.js";

/**
 * Card — the surface every page has been writing inline.
 *
 * Slots rather than a body prop, because the parts have different structural
 * roles. Spacing deliberately has one contract: the content shell applies a
 * five spacing units horizontally and four vertically, while the media slot
 * remains full-bleed so it can meet the card edges.
 *
 * `interactive` is not a variant of appearance, it is a promise about behaviour:
 * it renders the card as a button or a link, so a clickable card is actually
 * focusable and announces itself. A card with an onClick and no `interactive` is
 * a bug this makes hard to write.
 *
 * The surrounding SurfaceContext supplies surface, edge and elevation.
 * Material selects a standard Tailwind radius utility.
 * Cards do not expose those implementation details as per-instance props.
 *
 * <Card title="Claim #1042" footer={…}>…</Card>
 */

/* Slots take either node props or children carrying data-slot="name" — the same
   contract Toolbar, PageHeader and the shells use, because a JSX caller and a
   template caller cannot pass nodes the same way. Unslotted children are the
   card body. */
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

/* Ambient material steps down as cards nest: panel → flat → bare. Spacing
   is a parallel borderless track and stays spacing as cards nest, so a child
   cannot accidentally reintroduce an edge or shadow. */

function Card({
  eyebrow,
  title,
  subtitle,
  actions,
  media,
  footer,
  children,
  tone,
  interactive = false,
  href,
  onClick,
  clip = true,
  className,
  style,
  ...rest
}) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const material = ambient.material;
  const resolvedElevation = resolveElevation({ geometry: ambient.geometry, material });
  const Tag = interactive ? (href ? 'a' : 'button') : 'div';
  const bare = material === 'bare';
  const spacing = material === 'spacing';
  const unframed = bare || spacing;
  const mat = materialStyle(material, ambient.geometry);

  const slot = useSlots(children, ['actions', 'media', 'footer']);
  const actionNode = actions || slot.actions;
  const mediaNode = media || slot.media;
  const footerNode = footer || slot.footer;
  const body = slot.rest;

  const hasHeader = eyebrow != null || title != null || subtitle != null || actionNode != null;
  const hasBody = Boolean(body && body.length);
  const hasContent = Boolean(hasHeader || hasBody || footerNode);
  const hasBeforeFooter = Boolean(hasHeader || hasBody);

  return (
    <SurfaceContext.Provider value={{ geometry: ambient.geometry, material: nextMaterial(material) }}>
      <Tag
        href={href}
        type={interactive && !href ? 'button' : undefined}
        onClick={onClick}
        {...rest}
        data-kf-component="card"
        className={cx(
          'flex flex-col w-full min-w-0 text-left',
          bare && 'relative',
        /* Clipping is what keeps media and full-bleed rows inside the rounded
           corners — but it also cuts off any absolutely-positioned overlay a
           child opens (a Menu, a Select listbox, a DatePicker calendar), since
           the overlay escapes the card's box by design. clip={false} for a card
           whose content owns overlays; it has no media to hold in. */
          !bare && clip && 'overflow-hidden',
          'bg-material-surface [background-image:var(--material-image)]',
          material === 'panel'
            ? 'border border-solid border-material-border'
            : 'border-0',
          materialRadiusClass(material),
          elevationClass(resolvedElevation),
          interactive &&
            (unframed ? cx(
              'cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)]',
              'hover:bg-ctl-raise',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-surface'
            ) : cx(
              'cursor-pointer transition-[border-color,box-shadow,transform] ease-ctl duration-[var(--default-transition-duration)]',
              'hover:border-ctl-border hover:shadow-lg hover:[transform:translateY(var(--interactive-hover-lift))] active:[transform:translateY(0)] motion-reduce:transform-none',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset'
            )),
          className
        )}
        style={Object.assign(
          {},
          mat,
          tone && !bare ? { background: semanticToneToken(tone, 'bg') } : null,
          style
        )}
        data-tone={tone}
        data-tone-localized={tone && bare ? 'true' : undefined}
        data-material={material}
        data-elevation={resolvedElevation}
        data-padding={bare ? 'bare-cell' : 'md'}
        data-interactive={interactive ? 'true' : undefined}
      >
      {tone && bare ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0"
          style={{
            top: 'var(--material-bare-cell-padding-block)',
            bottom: 'var(--material-bare-cell-padding-block)',
            width: '3px',
            background: semanticToneToken(tone, 'base'),
          }}
        />
      ) : null}
      {mediaNode ? (
        <div className="shrink-0 w-full overflow-hidden bg-ctl-track">
          {mediaNode}
        </div>
      ) : null}

      {hasContent ? (
        /* The inset is the MATERIAL's, not the card's: bare pads its cells wider
           than panel and floating wider again, and every one of those numbers is
           decided once in tokens.css. The card only says "this is my content". */
        <div className="flex min-h-0 flex-1 flex-col" data-card-slot="content">
          {hasHeader ? (
            /* wrap, not clip: an actions slot wider than the space left over
               drops to its own line instead of disappearing off the edge. */
            <ContentHeader
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              actions={actionNode}
              hasFollowingContent={hasBody}
            />
          ) : null}

          {hasBody ? (
            <div className="flex-1 min-w-0 text-base leading-relaxed text-ctl-fg">
              {body}
            </div>
          ) : null}

          {footerNode ? (
            <div
              className={cx(
                'flex items-center shrink-0 border-0 border-t border-solid border-material-rule',
                hasBeforeFooter ? 'kf-card-footer-divided' : ''
              )}
              data-card-slot="footer"
            >
              {footerNode}
            </div>
          ) : null}
        </div>
      ) : null}
      </Tag>
    </SurfaceContext.Provider>
  );
}

/**
 * CardStack — the container the bare material needs.
 *
 * A card cannot know it has a preceding sibling, so the between-siblings rule
 * that bare depends on is painted by the stack. Panel, flat, and spacing keep
 * their ordinary caller-selected gap. Bare paints one rule-coloured pixel between
 * direct surface children, with no margin or separator padding. New page
 * layouts should use SurfaceGroup; CardStack remains as the compatible vertical
 * shorthand for existing callers.
 *
 * <CardStack><Card …/>…</CardStack>
 */
function CardStack({ gap, children, className }) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const mat = ambient.material;
  const bare = mat === 'bare';

  return (
    <SurfaceContext.Provider value={{ geometry: ambient.geometry, material: mat }}>
      <div
        className={cx('flex flex-col w-full min-w-0', !bare && !gap && 'kf-stack-gap', !bare && gap, className)}
        style={bare ? Object.assign({}, materialStyle(mat, ambient.geometry), { backgroundColor: 'var(--material-rule)', gap: '1px' }) : undefined}
        data-kf-component="card-stack"
        data-stack={mat}
        data-gap={bare ? 'rule' : 'space'}
      >
        {children}
      </div>
    </SurfaceContext.Provider>
  );
}

export { Card, CardStack, MaterialContext };
export default Card;
