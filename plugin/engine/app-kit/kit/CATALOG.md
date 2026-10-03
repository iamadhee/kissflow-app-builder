# The component library

`src/components/kit/` is the **one** component folder. Until 15 Sep 2026 there were two — a general
`kit/` and a specialised `kf/` — and the split was not a taxonomy, it was a visibility bug: the
contract scanner read `kit/` only, so every specialised component was shipped, importable, and
invisible to the agents that build pages. A builder that cannot see a component does not skip it; it
hand-draws a substitute. Two calendar pages of the Pressroom benchmark burned eight design-review
rounds hand-drawing a month grid while `CalendarView` — a working scheduling calendar — sat unused in
the same build.

## This file is not the catalogue

The catalogue is **derived from the source**, by `component-contract.mjs`, and handed to every agent
as part of the UI boundary: module path, exported names, props, whether the component forwards extra
props, and worked examples. It cannot go stale because nobody maintains it. Read a component's own
header comment for its prop reference.

What follows is orientation only — what to reach for, and when.

## Reaching for the right surface

| Need | Component |
|---|---|
| Pick a date | `Calendar` (a date picker), `DatePicker`, `DateField` |
| **Show events on their dates** | **`CalendarView`** — a scheduling calendar: events per day, overflow, day/agenda views. A date picker cannot do this. |
| A short list on a dashboard | `Table`, `DataGrid` |
| A screen whose job IS the table | `AdvancedDataGrid` — search, sort, sticky header, large record sets |
| A plan, read-only | `GanttChart` — themed, no dependencies |
| A plan the user reschedules | `InteractiveGantt` — dependencies, drag-to-reschedule |
| Work by state | `KanbanBoard`, `ApprovalQueue` |
| A process or node diagram | `FlowDiagram` |
| Import a spreadsheet | `CsvImport` |
| A settings or utility form (not a record) | `SmartForm` |
| Reorder by pointer or keyboard | `SortableList` |
| A very large list | `VirtualList` |
| Isolate one widget's failure | `WidgetBoundary` |
| Shared query and cache helpers | `KfQuery` |
| Entrance motion that respects `prefers-reduced-motion` | `Motion` |
| Spatial data that genuinely needs a 3D canvas | `Scene3D` — **import it lazily**, so Three.js stays in its own chunk |

## Two names that moved

`AdvancedDataGrid` and `InteractiveGantt` were `kf/DataGrid` and `kf/GanttChart`. Both names already
existed in the kit with *different* APIs, so each moved module exports its canonical name and its
legacy one, and the build maps the old paths here rather than to the kit components that share the
old names. Generated applications keep working; new pages use the canonical names.
