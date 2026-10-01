// GENERATED from starter/src/components/kit/SurfaceGroup.jsx (sha256:45a3d933d490079c). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import {
  SurfaceContext,
  elevationClass,
  materialRadiusClass,
  materialStyle,
  normalizeSurfaceContext,
  resolveElevation,
} from "./Surface.js";

/**
 * Material-aware page composition.
 *
 * Panel and flat keep independent surfaces separated by ordinary spacing.
 * Spacing keeps the same readable gaps on a clean surface without borders or
 * shadows, making whitespace itself the divider. Bare replaces that whitespace
 * with one exact theme-aware hairline: the
 * group paints the rule and each direct surface paints over its own cell.
 * Cards and StatTiles can therefore be direct children. SurfaceCell exists for
 * raw content; padded={false} is the explicit span/stretch wrapper for a child
 * that already owns its padding and material treatment.
 */

const GAP_CLASS = Object.freeze({
  none: 'gap-0',
  sm: 'gap-3',
  compact: 'gap-4',
  md: 'gap-5',
  lg: 'gap-6',
});

function SurfaceGroup({
  as: Tag = 'div',
  layout = 'stack',
  gap = 'md',
  children,
  className,
  style,
  ...rest
}) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const material = ambient.material;
  const bare = material === 'bare';
  const direction = layout === 'grid' ? 'grid' : 'flex flex-col';

  return (
    <SurfaceContext.Provider value={ambient}>
      <Tag
        {...rest}
        // Two gap utilities of equal specificity in one class list do not resolve by author order —
        // whichever Tailwind emitted later in the stylesheet wins, which the caller cannot see or
        // predict. This component ALWAYS emitted its own gap, so every caller that passed gap-4 in
        // className was in a coin toss with gap-5, and sibling rows on one page came out spaced
        // differently for no visible reason. If the caller brought a gap, it is theirs.
        className={cx('w-full min-w-0', direction, !bare && !/(?:^|\s)(?:gap|gap-x|gap-y)-/.test(className || '') && (GAP_CLASS[gap] || GAP_CLASS.md), className)}
        style={Object.assign(
          {},
          bare ? materialStyle(material, ambient.geometry) : null,
          bare ? { backgroundColor: 'var(--material-rule)', gap: '1px' } : null,
          style
        )}
        data-kf-component="surface-group"
        data-layout={layout === 'grid' ? 'grid' : 'stack'}
        data-gap={bare ? 'rule' : (GAP_CLASS[gap] ? gap : 'md')}
        data-material={material}
      >
        {children}
      </Tag>
    </SurfaceContext.Provider>
  );
}

function SurfaceCell({
  as: Tag = 'div',
  padded = true,
  children,
  className,
  style,
  ...rest
}) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const material = ambient.material;
  const bare = material === 'bare';
  const ownsSurface = bare || padded;
  const elevation = resolveElevation({ geometry: ambient.geometry, material });
  // "the caller already drew a surface here" — either in its own utilities, or by handing us a Card
  const drawsOwnSurface = /(?:^|\s)(?:bg-|border(?:$|[\s-])|ring-|rounded-|shadow-|p-|px-|py-)/.test(className || '');
  const hasCardChild = React.Children.toArray(children).some((c) => {
    const n = c && c.type && (c.type.displayName || c.type.name);
    return n === 'Card' || n === 'FormCard' || n === 'StatTile';
  });
  const callerOwnsSurface = drawsOwnSurface || hasCardChild;

  return (
    <SurfaceContext.Provider value={ambient}>
      <Tag
        {...rest}
        // A padded SurfaceCell IS a card: it paints a background, a border, a radius and an elevation.
        // Nothing in its prop list says so, so callers wrap a <Card> in one and get two of everything —
        // border inside border, shadow inside shadow — and the extra padding insets that row so it no
        // longer lines up with the rows above and below it. Both were visible on one depot dashboard.
        // A caller that brings its own surface (a bg-, border-, ring- or rounded- utility, or a Card
        // child) owns it; this cell then contributes layout only. padded={false} remains the explicit
        // way to ask for that.
        className={cx(
          'min-w-0',
          ownsSurface && !callerOwnsSurface && 'bg-material-surface [background-image:var(--material-image)]',
          padded && !bare && !callerOwnsSurface && 'px-5 py-4',
          padded && material === 'panel' && !callerOwnsSurface && 'border border-solid border-material-border',
          padded && !bare && !callerOwnsSurface && materialRadiusClass(material),
          padded && !bare && !callerOwnsSurface && elevationClass(elevation),
          className
        )}
        style={Object.assign(
          {},
          ownsSurface ? materialStyle(material, ambient.geometry) : null,
          padded && bare ? {
            paddingInline: 'var(--material-bare-cell-padding-inline)',
            paddingBlock: 'var(--material-bare-cell-padding-block)',
          } : null,
          style
        )}
        data-kf-component="surface-cell"
        data-material={material}
        data-padding={padded ? (bare ? 'bare-cell' : 'md') : 'none'}
      >
        {children}
      </Tag>
    </SurfaceContext.Provider>
  );
}

function PageBody({
  as: Tag = 'div',
  children,
  className,
  style,
  ...rest
}) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const material = ambient.material;
  const bare = material === 'bare';

  return (
    <SurfaceContext.Provider value={ambient}>
      <Tag
        {...rest}
        className={cx('w-full min-w-0', bare ? 'bg-material-surface' : 'px-8 pb-6', className)}
        style={Object.assign(
          {},
          bare ? materialStyle(material, ambient.geometry) : null,
          bare ? { padding: 0 } : null,
          style
        )}
        data-kf-component="page-body"
        data-kf-page-body=""
        data-material={material}
      >
        {children}
      </Tag>
    </SurfaceContext.Provider>
  );
}

export { GAP_CLASS, PageBody, SurfaceCell, SurfaceGroup };
