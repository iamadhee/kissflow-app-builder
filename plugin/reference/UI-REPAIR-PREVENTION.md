# Comprehensive: creative design, reliable implementation

Applies to the comprehensive pipeline. Do not route it through the
Express composer. Do not add planning agents or lower research, accessibility, data or visual gates.

## Before writing pages

1. Research owns the visual decision: compare alternatives for the actual user task, explain the
   selection and preserve the approved anatomy. Custom compositions and rich adapters remain valid.
2. Read compiler-produced `capabilities.json`: each component includes the actual import, parsed
   signature, source digest and source examples. Do not guess props from another library's API.
   A signature is not a data schema: inspect the selected module's nested row/column shape once and
   reuse that mapping. Never alter business fields to satisfy presentation props.
3. Use the shared data adapter/form registry and already-checked cold-load selection. Reuse the
   selected theme's complete Card, SurfaceGroup, controls and charts rather than restyling them.
4. Complete shared adapters before fan-out. Each builder writes only its isolated page group.
5. For record dates, import `formatDate`, `validDate`, or `dateInputValue` from
   `@/components/kit/format`. Missing/malformed display values become an em dash; date inputs become
   an empty string. `dateInputValue` returns the UTC calendar date; choose an explicit locale/timezone
   for display when the business contract requires it. Never chain `new Date(recordValue).toISOString()`.
6. Preserve exact role gates from the contract. A role with no completed page is pending, not entitled
   to another role's landing. Never use `roles: []` to make a partial build pass navigation checks.

## Feedback and repair

The seed-to-builder handoff freezes schema, seed and executable page-design/binding contracts in
`prototype/claude-build-inputs.json`. The `shards` command
requires the entire semantic seed check, not only non-empty bindings. Never repair data by silently changing the inputs underneath completed builders. An authorized
seed/design repair must restage inputs, rerun the seed gate, and regenerate affected build packs.
The host restages the inputs with the shared repair ticket.

The conductor and host terminal fallback share `prototype/repair-coordinator/` tickets and one budget
for the build scope. A host repair turn or resume does not replenish it. Several builders in one wave
are not several rounds. An exhausted budget retains findings and the last verified preview; it cannot
be replaced by a second host-owned repair allowance. Research fidelity and final visual QA remain required.

The host updates `prototype/qa/source-preflight.json` for both providers. It checks syntax, existing
source rules and real component imports, reusing unchanged files. It is static feedback, not a build,
worker completion or visual verdict. It does not publish anything or consume a rendered repair round.

Read all findings for your owned files and correct them together before emitting your receipt.
An unknown export/module is a proven error. `COMPONENT_PROP_UNCONSUMED` is advisory: inspect it; do
not replace a creative/custom design to appease an uncertain static inference. Dynamic props and
custom modules remain legal and require runtime evidence. Never edit the host's report.

After the batch is written, run its existing build/smoke gate once. Repair the exact failing files
and shared dependency, not all pages. Keep successful source and digest-bound evidence. Repeat a
browser capture for infrastructure failure without asking a page builder to regenerate good code.
Keep the existing bounded repair budgets and final visual/interaction QA; do not declare zero repair
or a time saving until measured on a fresh generation.

## Product and catalog browsing

Product lists and catalogs are image-led card layouts by default, not bare tables. Use the live
theme's `CatalogCards` (`@/components/kit/CatalogCards.jsx`), or a researched custom card composition
using its Card/media/SurfaceGroup primitives. Grid, editorial collection, comparison and detail
arrangements remain creative choices. Tables may be a secondary bulk-edit/comparison mode.
Do not turn unrelated operational queues into product galleries or add KPI cards outside dashboards.

Resolve relevant photos ONCE. On the express path that pass is the HOST's — `fillPlanMedia` runs
before the compile and resolves every sample that names a subject and carries no URL, so an agent
that searches as well pays for the same answer twice (measured: 65s and no photographs, because both
passes asked a stock library for plant cultivars it has never heard of). Search here only on the
comprehensive path, or when the express host's pass has already run and left a subject unresolved:

the host's catalog-media step (a specific subject search)

With server-side `PEXELS_API_KEY` this performs a bounded Pexels search; without one it falls back to
a keyless provider. Either way it writes a reusable asset manifest under `prototype/media/`. Read it and map selected assets to existing entity IDs. Copy the
chosen URLs/attribution into the provider's existing media/seed contract; the returned asset uses
`src`, `sourceUrl`, `photographer`, `alt`. Claude's `media-assets.json` uses `imageUrl`/`creator`:
map those names explicitly and include the Pexels license URL. Never expose the key to React.
Prefer actual product/entity photos; a stock image must be identified as illustrative, not asserted
to show the exact product or museum object. Keep each entity's chosen image stable across pages.

No guessed CDN paths, random-image endpoints, unrelated repeated images or network calls per card.
Retain a visible source/photographer credit. Image loads have a stable aspect ratio, lazy decoding,
and an accessible failure placeholder without collapsing the layout. A fallback is resilience, not
evidence that required photography was delivered: missing assets remain a media finding. On provider
timeout or missing credentials, preserve page code and retry/source media independently.

Sources: https://www.pexels.com/api/documentation/ and https://www.pexels.com/license/
