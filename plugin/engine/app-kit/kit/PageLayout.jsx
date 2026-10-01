// GENERATED from starter/src/components/kit/PageLayout.jsx (sha256:f8f1fa98bc05af30). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * PageLayout / Region — the page's layout is OWNED here, not negotiated per page.
 *
 * Every generated page used to hand-compose its own grid: `grid-cols-1 sm:grid-cols-2 gap-4` on one
 * row, a padded wrapper on the next, `mt-4` between two others. Each choice is defensible alone and
 * together they produce what a depot dashboard shipped — row two inset sixteen pixels from rows one
 * and three because it sat inside an extra padded cell, sibling cards spaced differently because one
 * caller's `gap-4` raced this kit's `gap-5` in the stylesheet, and a calendar stranded in a
 * full-width band with two thirds of it empty. Nobody made those decisions. They fell out of three
 * independent choices meeting.
 *
 * So the contract is: a page says WHAT sits in a row and how the row is emphasised. It never says
 * how wide, how far apart, or how it collapses. Those belong to one owner, which is this file.
 *
 *   <PageLayout>
 *     <Region cols={2}><StatTile/><StatTile/></Region>
 *     <Region cols={2} emphasis="alert"><StatTile/><StatTile/></Region>
 *     <Region cols="main-side"><Card>registry</Card><Card>chart</Card></Region>
 *     <Region><Table/></Region>
 *   </PageLayout>
 *
 * Three properties follow, and each one kills a defect class we actually shipped:
 *
 *  · ONE gutter and ONE track definition for the whole page. Regions cannot override either, so
 *    every row's left edge lands on the same pixel. Alignment stops being something a builder has
 *    to get right four times.
 *  · EMPHASIS DOES NOT INSET. A highlighted row is drawn with a rule and a tint that sit on the page
 *    grid, never with a padded wrapper around the row, because padding a row moves it off the grid —
 *    which is exactly how the write-off row came to be narrower than the two around it.
 *  · RHYTHM IS VERTICAL AND SINGLE. Regions are spaced by this component. A page adding `mt-*`
 *    between sections is adding a second opinion to a question that already has an owner, and
 *    `UI_LAYOUT_FREEHAND` refuses it.
 *
 * A Region does NOT paint a surface. Its children bring their own (Card, StatTile, Table). That
 * keeps one card per card, which is the other half of the nested-border bug.
 */

/**
 * Named track shapes. A page picks a SHAPE, never pixel widths, so a wide child (a Gantt with its
 * own minimum, a table with many columns) cannot silently force the row to wrap and strand its
 * neighbour on a line of its own: `min-w-0` on every track is what lets the track shrink instead.
 */
const TRACKS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  // asymmetric shapes, by role rather than by ratio: the reading half and the supporting half
  "main-side": "grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
  "side-main": "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
  // a narrow control beside something that wants the rest: a date picker next to a time grid
  "rail-main": "grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)]",
};

// Emphasis is a rule and a wash ON the grid. No padding, no border box, nothing that changes where
// the row's content starts — see the header.
const EMPHASIS = {
  none: "",
  alert: "border-0 border-l-2 border-solid border-warning-600 bg-warning-50/40 dark:bg-warning-950/20",
  primary: "border-0 border-l-2 border-solid border-brand-600 bg-brand-50/40 dark:bg-brand-950/20",
  quiet: "opacity-90",
};

function Region({ cols = 1, emphasis = "none", title, description, as: Tag = "section", children, className, ...rest }) {
  const tracks = TRACKS[cols] || TRACKS[String(cols)] || TRACKS[1];
  const lifted = emphasis !== "none" && emphasis in EMPHASIS;
  return (
    <Tag
      {...rest}
      data-kf-component="region"
      data-cols={String(cols)}
      data-emphasis={emphasis}
      // pl-4 -ml-4 keeps the emphasis rule OUTSIDE the content column: the rule hangs in the page
      // gutter and the children still start exactly where every other row's children start.
      className={cx("min-w-0", lifted && "pl-4 -ml-4 rounded-r-md", lifted && EMPHASIS[emphasis], className)}
    >
      {title ? (
        <header className="mb-3 min-w-0">
          <h2 className="m-0 text-base font-semibold leading-tight text-ctl-fg text-balance">{title}</h2>
          {description ? <p className="m-0 mt-1 text-sm leading-snug text-ctl-fg-muted">{description}</p> : null}
        </header>
      ) : null}
      {/* every track is min-w-0: a child with its own minimum width scrolls inside its track rather
          than pushing the track wider and wrapping the row */}
      <div className={cx("grid min-w-0 gap-[var(--page-gutter)]", tracks, "[&>*]:min-w-0")}>{children}</div>
    </Tag>
  );
}

/**
 * The page's outer frame. It sets the gutter every Region reads and the single vertical rhythm
 * between them, and it is the only element on the page that carries side padding.
 */
function PageLayout({ gutter = "md", as: Tag = "div", children, className, ...rest }) {
  const GUTTER = { sm: "0.75rem", md: "1.25rem", lg: "1.75rem" };
  return (
    <Tag
      {...rest}
      data-kf-component="page-layout"
      data-gutter={gutter}
      style={{ "--page-gutter": GUTTER[gutter] || GUTTER.md, ...(rest.style || {}) }}
      className={cx("flex w-full min-w-0 flex-col gap-[var(--page-gutter)]", className)}
    >
      {children}
    </Tag>
  );
}

Region.displayName = "Region";
PageLayout.displayName = "PageLayout";

export { PageLayout, Region };
export default PageLayout;
