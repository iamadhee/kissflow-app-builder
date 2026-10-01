# Comprehensive Page Design Framework

This is the provider-neutral design contract for Detailed/Comprehensive builds. Every provider uses
the same reasoning sequence, artifacts and rendered gate. Express does not use this framework as its
page compiler; it remains the speed-optimized path.

## Inputs

For each page, use the smallest complete slice of:

- the role, journey and page job from `app-spec.json`;
- the page-specific evidence in `prototype/research.json#pageFindings`;
- the frozen bindings, scope, actions and `researchBrief` in `prototype/ui-contract.json`;
- the selected design language and theme tokens;
- the shared kit's widget guide and component contracts;
- the compiler-derived rich-library catalog and themed adapter imports;
- the coherent records in `seed.json`.

Research supplies product judgment. The contract supplies deterministic data and action boundaries.
The builder supplies custom React composition. None of those layers may silently replace another.

The comprehensive path freezes these decisions in `prototype/page-designs.json`.

## Executable Claude page contract

For each frozen binding, `page-designs.json` records the selected capability, a declared composition
zone and one placement (`inline`, `modal`, `drawer`, `page`, `row-action` or `popover`). Generated
React repeats those decisions as literal `data-kf-zone`, `data-kf-capability` and
`data-kf-placement` markers on the visible binding surface. Static verification checks the markers
and the selected React capability; rendered review judges whether the resulting composition works.
Runtime/data repair must re-run this contract and cannot replace a missing page with a generic shell.

Research is a comparative contract, not inspiration prose. Each page compares at least two retrieved
representation candidates, selects exactly one and extracts at least three visible anatomy elements.
`page-designs.json#researchFidelity` places every anatomy id into an explicit zone and optional
binding. React repeats it with `data-kf-anatomy`; runtime smoke proves it is visible and attached to
the declared binding; visual QA confirms the selected representation is recognizable in the pixels.
Custom capabilities additionally carry `data-kf-custom` on their binding surface.

## Seven decisions for every page

1. **Need and moment** — name who arrived, what just happened and the decision or task they must finish.
2. **Primary object** — identify the record or entity and keep its identity and current state visible.
3. **Primary surface** — choose the domain representation that best answers the need, not a generic
   component family.
4. **Reading hierarchy** — define the first signal, the main work/decision and the supporting context.
5. **Density and response** — choose focused, comfortable or operational-dense, then state what spans
   full width and what collapses at tablet.
6. **Action model** — place the next action at the decision point; deliberately choose inline action,
   modal, sheet, selected-record detail or a full record.
7. **Restraint** — remove anything that does not answer the page need. Decorative KPIs and repeated
   charts are not coverage.

## Rich library selection

Comprehensive pages may use every visual/interaction library directly owned by the starter through
its themed adapters: Three.js/React Three Fiber/Drei (`Scene3D`, `Bars3D`), React Flow
(`FlowDiagram`), Frappe Gantt, React Big Calendar, TanStack table/virtual, dnd-kit, Framer Motion,
PapaParse and the form/error-boundary helpers. The compiler publishes the live catalog and exact
imports in `prototype/capabilities.json`; builder packs carry the same compact catalog.

Choose by the user's question and the research anatomy. Do not hand-build a weaker copy of an
available specialized surface. Do not use a heavyweight library merely to make a page look rich:
Three.js is for spatial data, Gantt is for duration/dependencies, React Flow is for topology, and
motion must communicate hierarchy or state while respecting reduced-motion preferences.

## Representation guide

| Page need | Primary representation | Do not default to |
|---|---|---|
| Catalogue, garage, inventory | Search/filter plus image-backed domain card grid | KPI band followed by a plain table |
| Detail, trust, inspection | One selected-record image, facts, evidence and next action | Multi-image gallery or unrelated stock subjects |
| Quote, order, payment | Milestone/ledger surface with exceptions and action state | Three totals floating above empty space |
| Approval or exception queue | Actionable rows with age, reason, owner and row decisions | Read-only list |
| Analytics | The visual that answers the named question, with interpretable axes/legend | Repeated status donuts |
| Schedule or dependencies | Calendar, timeline or Gantt selected by the user's question | Generic recent-items cards |
| Intake or edit | Focused form in a page or modal according to interruption cost | Always-open form on every landing |
| Board or pipeline | Full-width kanban/workbench with state actions | Narrow cards squeezed beside filler widgets |

## Composition rules

- Use a twelve-column mental grid without hard-coded pixel positioning.
- A table, kanban, timeline, calendar, map or comparison canvas normally spans 8–12 columns.
- Secondary context may use four columns only when it improves the primary decision.
- Sibling cards in one row have equal height and aligned baselines.
- Before placing cards, classify each surface by expected rendered height: `compact` (metric/progress
  strip), `standard` (donut, gauge, short bars), `tall` (funnel, heatmap, large chart) or `workbench`
  (table, board, calendar, decision queue). An ordinary row contains compatible height classes only.
- Never pair one tall/workbench surface with one compact card. Give the primary surface the full row,
  or use an intentional bento in which two compact cards stack beside the tall surface.
- Never leave an orphan half-width card or avoidable empty desktop column. Widen the final card or
  move it into a compatible row. Do not manufacture alignment with arbitrary fixed pixel heights.
- Equal-height rows use grid stretching and flex-growing card shells. Do not put `h-full` on a Card
  inside an auto-sized grid wrapper; asynchronously rendered content can freeze and overflow that row.
- The primary surface receives the page's width and height; supporting facts cannot visually dominate it.
- Do not leave avoidable dead space while meaningful workflow, evidence or next-action content is hidden.
- Different jobs require different structural fingerprints. Reuse primitives, not whole page skeletons.

## Media rules

- Media must be useful evidence or product context, not decoration.
- A detail page uses one record-specific contextual image by default.
- A catalogue uses a coherent image per card and keeps entity facts and actions adjacent.
- A compact strip uses two images; a real grid/gallery needs at least three and a page job that requires it.
- The visible subject must agree with the seed record. A vehicle make/model, property type or product
  category cannot contradict its image.
- Text over imagery requires a reliable scrim or equivalent contrast treatment.
- Prefer locally persisted approved assets; remote availability must not determine whether a page renders.

## Interaction rules

- Queues expose actions on the row or at the selected decision surface.
- Detail inspection may use a sheet; focused create/edit work may use a modal; complex records use the
  platform's full record form.
- Every declared interaction has a stable capture hook and rendered proof.
- A control that looks actionable but cannot open or complete its target is a release blocker.

## Quality rubric and gates

Rendered visual QA scores domain fit, composition, craft, actionability and research fidelity from 1–5. All must reach 4,
and no blocker may remain.

Hard errors include runtime failure, missing primary surface, broken interaction, unreadable media,
wrong role/page capture, KPI-only signature pages, non-interpretable charts and contract violations.
Warnings include optional polish, a truthful low metric count or a density improvement that does not
block the user's job. Never manufacture filler to clear a warning.

Static rules catch known failure shapes. Only rendered multi-role, multi-viewport review can judge the
finished composition. Passing compilation is not visual sign-off.
