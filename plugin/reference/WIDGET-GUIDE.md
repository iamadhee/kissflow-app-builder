<!-- GENERATED mirror of the React kit's widget guide. Edit the source in the repository, never this copy. -->

# Choosing widgets

The kit has more in it than most pages use, and the failure mode is not picking the wrong widget —
it is not knowing a widget exists and hand-rolling a worse version of it. Every component below is
installed and built. This file is about **which one, and when**; each `.jsx` file's own header
comment is the prop reference. `src/components/kit/CATALOG.md` orients you; the derived catalogue in
the UI boundary is the authority on what exists.

There is ONE component folder. `src/components/kf/` was merged into `src/components/kit/` on
15 Sep 2026, because a split library is not a taxonomy — it is a visibility bug. Import the heavier
dependency-backed components by path so optional dependencies stay isolated:

```jsx
import { AdvancedDataGrid } from "../components/kit/AdvancedDataGrid.jsx";
```

The one exception is 3D — see the bottom.

---

## Start from the question the page answers

| The user is asking | Reach for |
|---|---|
| "What is the state of things?" | kit `StatTile`, `BarChart`, `LineChart`, or `Donut` |
| "What is on the 14th?" | **`CalendarView`** |
| "What overlaps with what?" | **`GanttChart`** |
| "What happened, roughly when?" | kit `Timeline` |
| "What does this process look like?" | **`FlowDiagram`** |
| "Show me the records" — short list on a dashboard | kit `Table` |
| "Show me the records" — the screen's whole job | **`DataGrid`** |
| "Show me all 40,000 of them" | **`VirtualList`** |
| "Which order should these be in?" | **`SortableList`** |
| "Where is it, physically?" | `StoresMap`, or **`Scene3D`** when the space is the data |
| "Let me enter something that is not a record" | **`SmartForm`** |
| "Let me enter/edit a record" | kit `ItemForm`/dynamic `Form` — **not** `SmartForm` |
| "Here is a spreadsheet of them" | **`CsvImport`** / `downloadCsv` |

## The distinctions that actually get confused

**`Table` vs `DataGrid`.** The kit `Table` renders a compact record set — right for a card on a
dashboard. `DataGrid` is for the page whose entire job is the table: sorting on every column, a
filter across all of them, and a sticky header over hundreds of rows. Putting `DataGrid` in a
dashboard card wastes it; putting a compact `Table` on a records page frustrates people.

**kit `Timeline` vs `GanttChart` vs `CalendarView`.** Three different questions. `Timeline` = dated items
across a strip, for a glance. `GanttChart` = dependencies and durations, for planning. `CalendarView`
= a grid of days, for "what is on that day". Choose by the question, not by which looks richest.

**`SmartForm` vs `ItemForm`/dynamic `Form`.** If it writes to a Kissflow model, use the Form subsystem —
it loads the real field config, permissions and validation, and hand-rolling that is always wrong.
`SmartForm` is for everything else: filter panels, bulk-action dialogs, settings, wizard steps.

**`.slice(0, 50)` is not pagination.** It silently hides the rest, and nothing on screen says so. If
the count is unbounded, use `VirtualList`.

## Three rules that apply to every page

**Wrap widgets in `WidgetBoundary`.** A widget that throws unmounts the entire page — a blank white
screen with eleven working cards on it, and nothing naming the one that failed. This is the cheapest
reliability win available; use it per widget, with a `label`.

```jsx
<WidgetBoundary label="Open requisitions"><DataGrid …/></WidgetBoundary>
```

**Fetch through `useKfItems`, not `useEffect`.** Six widgets each with their own
`useEffect`+`useState`+`loading` means six overlapping fetches, six missing error branches, and a
refetch of everything whenever the tab regains focus. `KfQueryProvider` once at the root, then
`useKfItems` — two widgets asking for the same flow fetch once. Call `useKfInvalidate()` after a
write, or the screen keeps showing what used to be true.

**Motion is `FadeIn`/`Stagger` or nothing.** Both honour `prefers-reduced-motion` and become no-ops.
Keep `stagger` small — 0.04s across ten rows is texture, 0.2s is a wait. Do not animate a dashboard
that updates on its own; the movement reads as a change in the data.

## 3D — the one that has to earn its place

`Scene3D.jsx` is **not** exported from the barrel, deliberately. three.js is ~900KB, and it stays out
of the main bundle only when imported dynamically:

```jsx
const Bars3D = lazy(() => import("../components/kit/Scene3D.jsx").then(m => ({ default: m.Bars3D })));
```

(Verified: it lands in its own ~929KB chunk rather than the ~604KB entry.)

Use it when the **space is the data** — bin occupancy across warehouse racks, tank or silo levels, a
deck or floor layout, equipment position on a plan. A rotating cube behind a KPI is 900KB of
decoration; that is a `BarChart`.

## Anti-patterns

- A hand-built table with `onClick` sort handlers → `DataGrid`
- A `<div>` grid of days computed with `new Date()` arithmetic → `CalendarView`
- `useState` per input plus an `alert()` of the first error → `SmartForm`
- `str.split(",")` over an uploaded file → `CsvImport` (the first address field with a comma in it
  silently shifts every column right, for that row only)
- Mouse-only drag handlers → `SortableList` (its keyboard sensor is the point)
- A list of step names where a diagram belongs → `FlowDiagram`
