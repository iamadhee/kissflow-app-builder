// GENERATED from starter/src/components/kit/Board.jsx (sha256:3113f82d4bce14b8). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { MoreHorizontal, Plus, Paperclip, MessageCircle } from "lucide-react";
import { cn as cx } from "./cn.js";

/**
 * KanbanBoard — columns of cards.
 * <KanbanBoard columns={[{key:'ready',label:'Ready',items:[{id:'record-1',title:'Record',note:'Context'}]}]} onCardClick={openRecord} />
 *
 * REDESIGNED 2026-08-13 from Board.dc.html (Claude Design project "Mobile app style guide
 * sheet", 2b8a920b-a786-4430-bd63-b0bc0dbe6229): "Columns of cards. Each stage is a tinted well
 * in its own tone, so the board reads as stages at a glance — and the cards inside are the only
 * objects that lift." That is the one real change from the previous pass: the column used to be
 * a bare region; now it is a tinted well (`bg-<tone>-50`), and the cards inside it are white on
 * that tint — "the strongest card treatment available and it costs nothing." The layout law that
 * made the column bare in the first place still holds — see NEVER A CARD IN A CARD below, it is
 * just satisfied a different way now (tint vs. shadow separates the well from its cards, instead
 * of the column having no fill at all).
 *
 * TONE VOCABULARY COMES FROM THE ACTIVE DESIGN LANGUAGE. Stage columns and owner avatars cycle
 * through its eight chart/category tokens. Priority badges use its semantic danger/warning/info
 * pairs. Names such as `rose` or `sky` remain accepted as stable category hints, but never resolve
 * to Tailwind's stock palette.
 *
 * The token colours are applied as inline CSS values because the stage is selected at runtime;
 * all component geometry still comes from the kit utilities.
 *
 * NEVER A CARD IN A CARD. [SOURCE] "White on a tint is the strongest card treatment available and
 * it costs nothing… Card in a card — wrong: a shadow inside a shadow, white on white, every edge
 * competes." The card below is drawn inline rather than composed from this kit's own `Card`
 * (Cards.jsx) for exactly that reason plus a geometry mismatch: Cards.jsx uses one 20px medium
 * inset, while Board.dc.html's item uses a compact 16px
 * inset. Expanding Card's two spacing contracts to fit one board-only caller would be wrong, so
 * the item here reproduces the same semantic visual
 * contract (`bg-ctl-surface` / `rounded-lg` / `shadow-sm→shadow-md`) without nesting Card.
 *
 * The COLUMN is still not a card itself — only the items inside it are.
 *
 * The board still SCROLLS HORIZONTALLY rather than wrapping — "a wrapped column changes which
 * column a card is in depending on viewport width, which is the one thing a board must never
 * do" — and is still presentational: no drag, no drop, no reordering, no grab cursor. "A board
 * that looks draggable and is not is worse than one that plainly is not." Wire it to a DnD
 * library when it goes on a real screen. The column's "…" menu and "Add task" row are the same
 * kind of affordance — visually present, not wired to a prop, because the API this page
 * describes names only `columns`, `items` and `onCardClick`.
 *
 * Owner tone is derived from the name so the same person reads as the same theme category across
 * every card. Priority is semantic: high=danger, medium=warning, low=info.
 */


const SERIES = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
];

const SERIES_INK = [
  "var(--chart-1-ink)", "var(--chart-2-ink)", "var(--chart-3-ink)", "var(--chart-4-ink)",
  "var(--chart-5-ink)", "var(--chart-6-ink)", "var(--chart-7-ink)", "var(--chart-8-ink)",
];

function toneVars(tone, index) {
  const custom = typeof tone === "string" && (tone.startsWith("var(") || tone.startsWith("#"));
  const seriesIndex = typeof tone === "number" ? Math.abs(tone) % SERIES.length : custom ? null : index % SERIES.length;
  const base = seriesIndex == null ? tone : SERIES[seriesIndex];
  const ink = seriesIndex == null ? "var(--ctl-fg)" : SERIES_INK[seriesIndex];
  return {
    well: `color-mix(in oklab, ${base} 8%, var(--ctl-surface))`,
    ink,
    dot: ink,
  };
}

const PRIORITY = {
  high: { bg: "var(--danger-100)", ink: "var(--danger-text)" },
  medium: { bg: "var(--warning-100)", ink: "var(--warning-text)" },
  low: { bg: "var(--info-100)", ink: "var(--info-text)" },
};
const PRIORITY_NEUTRAL = { bg: "var(--ctl-track)", ink: "var(--ctl-fg)" };
const priorityVars = (priority) => PRIORITY[String(priority || "").trim().toLowerCase()] || PRIORITY_NEUTRAL;

function ownerVars(name) {
  let hash = 0;
  const value = String(name || "");
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  const index = hash % SERIES.length;
  return {
    bg: `color-mix(in oklab, ${SERIES[index]} 18%, var(--ctl-surface))`,
    ink: SERIES_INK[index],
  };
}

// "R. Iyer" -> RI, "Mary" -> MA.
function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * columns: [{ key, label, tone, empty?, items: [{ id, title, eyebrow?, facts?: [{label, value}], note?, owner?, priority?, progress?, files?, comments? }] }]
 * tone drives the well fill, the heading ink+dot, and is the fallback priority colour source.
 * onCardClick(item, column) — when passed, cards get the hover lift + pointer cursor; without
 * it every card stays fully inert, per Board.dc.html's own "a panel that is not a target does
 * not respond at all."
 */
export function KanbanBoard({ columns = [], onCardClick, onAdd, minHeight, className = "" }) {
  if (!columns.length) return <p className={cx("m-0 py-10 text-center text-sm text-ctl-fg-muted", className)}>No columns.</p>;
  // A board owns its row, so a handful of lanes should USE it rather than huddling at the left with
  // dead space beside them. Past six lanes the fixed width plus a sideways scroll is the honest
  // shape — a lane squeezed under ~16rem stops being readable.
  const stretch = columns.length <= 6;

  return (
    <div className={cx("w-full min-h-60", className)} style={minHeight != null ? { minHeight } : undefined}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col, i) => {
          const t = toneVars(col.tone, i);
          const items = col.items ?? [];
          return (
            <section
              key={col.key ?? col.label}
              className={cx("flex flex-col gap-3 rounded-xl p-4", stretch ? "flex-1 min-w-64" : "w-64 flex-none")}
              style={{ background: t.well }}
            >
              <header className="flex items-center justify-between gap-1 px-1">
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium" style={{ color: t.ink }}>
                  <span className="w-1.5 h-1.5 flex-none rounded-full" style={{ background: t.dot }} aria-hidden="true" />
                  {/* a lane is named by `label`; `title`/`name` (other libraries' words) are accepted, and a lane
                      with no name shows its key spelled out — a header of dot and count names nothing */}
                  <span className="truncate">{col.label ?? col.title ?? col.name ?? String(col.key ?? "").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </span>
                <span className="flex flex-none items-center gap-2 text-2xs tabular-nums" style={{ color: t.ink }}>
                  {items.length}
                  <MoreHorizontal size={12} aria-hidden="true" />
                </span>
              </header>

              {items.length ? (
                <div className="flex flex-col gap-3">
                  {items.map((it) => (
                    <BoardCard key={it.id} item={it} column={col} onCardClick={onCardClick} />
                  ))}
                </div>
              ) : (
                /* A DASHED outline, not a filled block, and it says why. A solid panel reading
                   "Nothing here" is indistinguishable from a lane that failed to load, and it
                   claims the same visual weight as a lane holding real work. Dashed reads as
                   "a place for something", which is what an empty lane is. The reason is the
                   column's to give — it knows whether the lane is empty because nothing has
                   reached this stage or because a filter excluded it. */
                <p
                  className="m-0 rounded-lg border border-dashed px-4 py-6 text-center text-xs"
                  style={{ borderColor: "var(--ctl-border)", background: "var(--ctl-surface)", color: "var(--ctl-fg-subtle)" }}
                >
                  {col.empty ?? `Nothing in ${col.label ?? "this stage"} yet`}
                </p>
              )}

              {typeof onAdd === "function" && <button type="button" onClick={() => onAdd(col)} className="flex items-center justify-center gap-2 rounded-md border-0 bg-transparent py-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-brand-ring" style={{ color: t.ink }}>
                <Plus size={13} aria-hidden="true" />
                Add task
              </button>}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function BoardCard({ item, column, onCardClick }) {
  const clickable = typeof onCardClick === "function";
  const priority = item.priority ? priorityVars(item.priority) : null;
  const owner = item.owner ? ownerVars(item.owner) : null;
  const hasProgress = item.progress != null;
  const progress = hasProgress ? Math.max(0, Math.min(100, Number(item.progress))) : 0;
  const complete = hasProgress && progress >= 100;
  const facts = (Array.isArray(item.facts) ? item.facts : [])
    .filter((fact) => fact && fact.label && fact.value != null && fact.value !== "" && fact.value !== "—")
    .slice(0, 4);
  const files = Number(item.files) > 0 ? Number(item.files) : null;
  const comments = Number(item.comments) > 0 ? Number(item.comments) : null;
  const hasFooter = item.owner != null || files != null || comments != null;

  return (
    <article
      data-cx-row={item.id}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? item.title : undefined}
      className={cx(
        "flex flex-col gap-3 rounded-lg bg-ctl-surface p-4 shadow-sm",
        clickable && "cursor-pointer transition-[box-shadow,transform] ease-ctl duration-[var(--default-transition-duration)] hover:[transform:translateY(var(--interactive-hover-lift))] hover:shadow-md active:[transform:translateY(0)] motion-reduce:transform-none"
      )}
      onClick={clickable ? () => onCardClick(item, column) : undefined}
      onKeyDown={clickable ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCardClick(item, column);
        }
      } : undefined}
    >
      {(item.eyebrow || item.priority) && (
        <div className="flex items-center justify-between gap-2">
          {item.eyebrow
            ? <span className="font-data-emphasis text-2xs uppercase tracking-wider text-ctl-fg-muted tabular-nums">{item.eyebrow}</span>
            : <span aria-hidden="true" />}
          {item.priority && (
            <span
              className="inline-flex h-5 flex-none items-center rounded-sm px-2 text-2xs font-medium"
              style={{ background: priority.bg, color: priority.ink }}
            >
              {item.priority}
            </span>
          )}
        </div>
      )}

      <p className="m-0 text-sm font-semibold leading-snug text-ctl-fg">{item.title}</p>
      {/* A card's supporting values are a LIST, not a sentence. Joining them with middle dots —
          "Sep 25, 2026 · 1180 Innovation Way Atrium, Denver, CO · 45" — wraps to three lines and
          gives the reader no way to tell a date from an address from a count. Labelled rows scan. */}
      {facts.length > 0 && (
        <dl className="m-0 grid gap-1">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-2">
              <dt className="min-w-0 flex-none text-2xs text-ctl-fg-muted">{fact.label}</dt>
              <dd className="m-0 min-w-0 truncate text-right text-2xs font-medium text-ctl-fg tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {item.note && !facts.length && <p className="m-0 text-2xs leading-relaxed text-ctl-fg-muted">{item.note}</p>}

      {hasProgress && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs text-ctl-fg-muted">Progress</span>
            <span
              className="text-2xs font-medium tabular-nums"
              style={{ color: progress <= 0 ? "var(--ctl-fg-muted)" : complete ? "var(--success-text)" : "var(--ctl-fg)" }}
            >
              {progress}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-ctl-track">
            <div
              className="h-full rounded-full transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
              style={{ width: progress + "%", background: complete ? "var(--success-600)" : "var(--chart-1)" }}
            />
          </div>
        </div>
      )}

      {hasFooter && (
        <div className="flex items-center justify-between gap-2 border-0 border-t border-solid border-ctl-border pt-3">
          {item.owner ? (
            <span
              className="inline-flex w-6 h-6 flex-none items-center justify-center rounded-full text-2xs font-bold leading-none"
              style={{ background: owner.bg, color: owner.ink }}
              title={item.owner}
              aria-label={item.owner}
            >
              {initials(item.owner)}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="flex flex-none items-center gap-2">
            {files != null && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-ctl-track px-2 text-2xs tabular-nums text-ctl-fg-muted">
                <Paperclip size={10} aria-hidden="true" />
                {files}
              </span>
            )}
            {comments != null && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-ctl-track px-2 text-2xs tabular-nums text-ctl-fg-muted">
                <MessageCircle size={10} aria-hidden="true" />
                {comments}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
