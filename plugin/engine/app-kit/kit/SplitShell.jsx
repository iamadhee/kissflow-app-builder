// GENERATED from starter/src/components/kit/SplitShell.jsx (sha256:8b5a24d2b2e7887c). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * SplitShell — list on one side, detail on the other. The archetype for triage:
 * inbox, queue, review pile.
 *
 * Two independent scroll containers, which is the point. A single scroll means
 * paging through the list loses your place in the record you were reading.
 *
 * `emptyDetail` covers the state that a split view spends most of its time in —
 * nothing selected yet. Building this without it produces a blank half-screen,
 * and every product then bolts on its own version.
 *
 * By default the shell responds to its own container and stacks at narrow widths.
 * `stacked={true}` preserves explicit drill-in/back navigation. `itemCount={1}`
 * stacks context and detail without creating an unnecessary selection column.
 *
 * THE SHELL IS ONE OBJECT. It used to be two panes bled flush to the page edge
 * with a hairline between them, which is why every master-detail page read as a
 * table that had been cut in half: the list ran to the pane boundary and simply
 * stopped, the detail floated beside it, and the whole composition ended
 * mid-page above a field of dead ground. It now draws as a single framed
 * surface — one radius, one border, one shadow, a floor it always fills — so
 * the two panes read as two halves of the same object instead of two things
 * that happen to be adjacent.
 *
 * THE GROUNDS ARE INVERTED from the original: the LIST sits on --ctl-offset and
 * the DETAIL on --ctl-surface. It used to be the other way round, which put the
 * brighter surface on the supporting half — the pane you read was grey and the
 * index you scan was white. Brightness should follow attention.
 *
 * That inversion is also what makes a selected row expressible at all, and this
 * is the recipe the shell EXPECTS its caller to follow, because SplitShell does
 * not render rows — `list` is entirely yours and `selected` here only decides
 * detail-vs-empty. A selected row should:
 *
 *   · take bg-ctl-surface — it lifts out of the offset list to MATCH the detail
 *     pane, so the row and the record it opens read as one continuous surface.
 *     Selection is the absence of the ground, not a tint added on top of it.
 *   · carry a 2px border-l-brand-600 and NO right border — leaving the right
 *     edge open is what lets the row open into the record rather than closing
 *     itself off from it.
 *   · drop its left padding by the border's width (px-4 -> pl-[14px]) so the
 *     text does not jog sideways the moment a row is picked.
 *
 * <SplitShell list={…} detail={…} selected={id} emptyDetail={<EmptyState …/>} />
 */

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

const WIDTHS = { sm: 'w-72', md: 'w-80', lg: 'w-96' };
/* listWidth is a preset (sm | md | lg) or a CSS length an author writes — "480px", "40%", 420. A
   value the presets do not know used to fall silently to md (320px), which is too narrow for a
   list with more than two columns; a CSS length is now applied as the pane's width.

   The ceiling is 48%, not 60%. A four-column queue handed "760px" on a 1440 viewport took 53% of
   the shell, which left the record it opens into narrower than the index that opens it — the
   detail is the half you read, and it must stay the larger half. The floor is 260px: below that a
   list pane cannot show a row identity and a status side by side, and every row wraps to three
   lines. */
function listWidthStyle(value) {
  if (value == null || WIDTHS[value]) return null;
  const clamp = { minWidth: 260, maxWidth: '48%' };
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return { width: value, ...clamp };
  if (typeof value === 'string' && /^\d+(\.\d+)?(px|%|rem|vw|ch)$/.test(value.trim())) return { width: value.trim(), ...clamp };
  return null;
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SplitShell({
  list,
  detail,
  listHeader,
  detailHeader,
  selected,
  emptyDetail,
  onBack,
  listWidth = 'md',
  stacked,
  itemCount,
  side = 'left',
  children,
  className,
}) {
  const slot = useSlots(children, ['list', 'detail', 'listHeader', 'detailHeader', 'emptyDetail']);
  const listNode = list || slot.list;
  const detailNode = detail || slot.detail;
  const listHeadNode = listHeader || slot.listHeader;
  const detailHeadNode = detailHeader || slot.detailHeader;
  const emptyNode = emptyDetail || slot.emptyDetail;
  const hasSelection = selected != null && selected !== false;
  const frameRef = React.useRef(null);
  const [narrow, setNarrow] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setNarrow(el.getBoundingClientRect().width < 760);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // itemCount is the FILTERED list count. A singleton needs context and detail, not
  // an empty selection column. Auto mode stacks both panes; explicit stacked retains
  // the original drill-in/back interaction for existing mobile callers.
  const single = itemCount === 1;
  const vertical = single || (stacked == null && narrow);
  const onePane = stacked === true && !single;
  const paneStyle = vertical ? { width: '100%', maxWidth: '100%' } : undefined;
  const scrollStyle = { maxHeight: vertical ? (single ? 'none' : 'min(24rem, 50dvh)') : 'min(44rem, 72dvh)', overflow: 'auto', overscrollBehavior: 'auto' };

  const customListWidth = vertical || onePane ? null : listWidthStyle(listWidth);
  const listPane = (
    <div
      data-kf-pane="list"
      style={paneStyle || customListWidth || undefined}
      className={cx(
        'flex flex-col min-h-0 shrink-0 bg-ctl-offset',
        vertical || onePane ? 'w-full' : customListWidth ? null : WIDTHS[listWidth] || WIDTHS.md,
        vertical ? 'border-0 border-b' : side === 'left' ? 'border-0 border-r' : 'border-0 border-l',
        'border-solid border-layer-border'
      )}
    >
      {listHeadNode ? (
        // The header sits ON the list's own ground and stays put while the rows move under it.
        // It used to scroll away with them, which is how a queue loses its column names two rows in.
        // Both headers are 52px bars so the two panes share one baseline; a string becomes the pane's
        // title rather than a bare word floating at the top of a column.
        <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 px-4 bg-ctl-offset border-0 border-b border-solid border-layer-border">
          {typeof listHeadNode === "string" ? <h2 className="m-0 text-[13px] font-semibold text-ctl-fg">{listHeadNode}</h2> : listHeadNode}
        </div>
      ) : null}
      {/* overflow-auto, not overflow-y-auto: a list wider than its pane is a fact of any queue with
          four columns, and the pane is the right place to absorb it. Left on the y axis alone, the
          x axis resolved to auto anyway but the intent was invisible, so callers kept wrapping the
          table in a second scroller and the page grew a scrollbar of its own. overscroll-contain
          keeps a flick inside the list from scrolling the page behind it. */}
      <div data-kf-pane-scroll="list" style={scrollStyle} className="flex-1 min-h-0 overflow-auto">{listNode}</div>
    </div>
  );

  const detailPane = (
    <div data-kf-pane="detail" className="flex flex-col flex-1 min-w-0 min-h-0 bg-ctl-surface">
      {stacked && hasSelection && onBack ? (
        <div className="flex items-center shrink-0 px-4 py-2 bg-ctl-surface border-0 border-b border-solid border-layer-border">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 h-8 px-2 -ml-2 rounded-md bg-transparent border-0 text-sm text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
          >
            <BackIcon />
            Back to list
          </button>
        </div>
      ) : null}
      {detailHeadNode && hasSelection ? (
        // The detail opens with a HEADER BAR — eyebrow, title, chip, actions on one line — never a bare
        // word above the record. A string is the title; a node is laid out by its author.
        <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 px-5 bg-ctl-surface border-0 border-b border-solid border-layer-border">
          {typeof detailHeadNode === "string" ? <h2 className="m-0 text-[15px] font-semibold text-ctl-fg">{detailHeadNode}</h2> : detailHeadNode}
        </div>
      ) : null}
      <div
        data-kf-pane-scroll="detail"
        style={vertical ? { overflow: 'visible' } : scrollStyle}
        className={cx(
          'flex-1 min-h-0 overflow-auto',
          // Nothing selected is a resting state, not a hole: centre it and let it breathe. With a
          // selection the pane carries a record, and a record is read — it gets real padding and a
          // measure, so a description list does not run 1100px wide on a large screen.
          hasSelection ? 'px-6 py-5' : 'grid place-items-center p-8 text-center'
        )}
      >
        {hasSelection ? <div className="max-w-[72ch] w-full">{detailNode}</div> : emptyNode}
      </div>
    </div>
  );

  // One object: a single radius, a single border and a single shadow around both panes, with
  // overflow-hidden so each pane's ground is clipped to the shared corner instead of squaring it
  // off. min-h keeps the shell from collapsing to the height of two short panes and leaving the
  // page to end in dead ground below it — the complaint that opened this rewrite.
  const frame = cx(
    'flex w-full min-h-0 overflow-hidden bg-ctl-surface',
    'rounded-xl border border-solid border-layer-border shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.10)]',
    vertical ? 'flex-col' : 'min-h-80',
    className
  );

  if (onePane) return <div ref={frameRef} data-kf-component="split-shell" data-layout="drill-in" className={frame}>{hasSelection ? detailPane : listPane}</div>;

  return (
    <div ref={frameRef} data-kf-component="split-shell" data-item-count={itemCount} data-layout={vertical ? 'stack' : 'split'} className={cx(frame, !vertical && side === 'right' && 'flex-row-reverse')}>
      {listPane}
      {detailPane}
    </div>
  );
}

/**
 * SplitRow — the list row the shell expects, so nobody hand-draws it. Three columns that ALWAYS fit:
 * identity with a second line beneath it, a chip, a compact date. A four-column table in a 380px
 * pane clips its last column mid-word ("Sep 15, 2"); the second line carries what the fourth column
 * would have lost. Every row draws a 2px left border, transparent until selected, so the text never
 * jogs when a row is picked — no padding trick, nothing off the spacing grid.
 *
 * <SplitRow title="Consent-log gap" meta="Pinecrest audit · Sep" badge={<Badge tone="danger">Critical</Badge>}
 *           date="15 Sep" selected={id === selectedId} onClick={() => select(id)} />
 */
function SplitRow({ title, meta, badge, date, selected = false, onClick, className, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={cx(
        "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-0 border-b border-solid border-layer-border bg-transparent px-4 py-3 text-left font-[inherit] text-ctl-fg",
        "border-l-2 border-l-transparent hover:bg-ctl-surface",
        selected && "bg-ctl-surface border-l-brand-600",
        className
      )}
      data-kf-component="split-row"
      {...rest}
    >
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold tracking-[-0.005em]">{title}</span>
        {meta ? <span className="mt-1 block truncate text-xs text-ctl-fg-muted">{meta}</span> : null}
      </span>
      {badge ? <span className="shrink-0">{badge}</span> : <span />}
      {date ? <span className="shrink-0 whitespace-nowrap font-mono text-[11.5px] text-ctl-fg-muted">{date}</span> : <span />}
    </button>
  );
}

export { SplitShell, SplitRow };
export default SplitShell;
