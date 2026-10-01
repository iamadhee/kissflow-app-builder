# Comprehensive research-to-render evidence

This contract applies to every provider.
The comprehensive path uses `prototype/research.json`, `ui-contract.json`, `thumbs/manifest.json` and
`qa/visual-verdict.json`.
Express is unchanged.

## Research decisions

New research declares `version:1, fidelityVersion:2`. Existing valid research can be
reused, but URLs alone, two renamed patterns, or compiler markers are not proof of research fidelity.

Every page's `representation` must contain:

- `comparisonCriteria:[{id,question}]`: at least two questions specific to the role's job, records,
  workload or decision. Do not reduce this to generic aesthetics or component popularity.
- At least two distinct `candidates:[{id,sourceUrl,pattern,observedEvidence,fit,tradeoff,
  assessment:{criterionId:"reasoned assessment"},decision:"selected|rejected"}]`. Cite retrieved
  sources, describe observed behavior, give BOTH strengths and limitations for each option, assess
  every criterion, and select exactly one. Do not manufacture weak alternatives to justify a default.
- `selectionReason`: why that comparison favors this choice for this page.
- `adaptation`: how its structure/interaction fits this app's actual records, permissions and actions.
- `researchGaps:[]`: explicitly record unresolved evidence questions. Resolve known gaps before
  claiming complete research fidelity; do not empty this list merely to satisfy a validator.
- `visualAnatomy:[{id,description,purpose}]`: at least three visible structural behaviors to preserve.
  Retain the page's existing hierarchy, source, density, interaction, and avoid constraints too.

Reuse a credible source when it answers multiple jobs; do not force redundant searches or source
quotas. Each page still needs an independent, defensible comparison. Research may select a bespoke
React composition or rich-library adapter; it is not confined to a catalog template. Schema checks
cannot establish that an option is globally best or that a citation was interpreted correctly.

## Implementation and visible proof

Carry the selected candidate, anatomy, placement, zones and capabilities into the page design and
builder brief. Render the selected native component INSIDE its binding/primary-surface subtree.
An unused import, comment, hidden token, or component on another part of the page is not compliance.
Use theme component recipes, not a token-only recoloring. Preserve custom composition responsibility.

Review actual screenshots for EVERY page at desktop, including routine/reference pages; signature
landings also require tablet. Each per-screen review records its captured `evidenceDigest` and:

```json
{"researchFidelity":{"selectedCandidate":"selected-id","matchedAnatomy":["anatomy-id"],
"observations":[{"anatomy":"anatomy-id","observed":"what is visibly implemented",
"location":"where it is visible","jobSupported":"how it supports this page's job"}],
"adaptationAssessment":"whether the visible implementation preserves the researched intent",
"missingAnatomy":[],"violatedAvoid":[]}}
```

One observation is required per anatomy element. Marker counts prove source structure only, never
exact pixels, useful interaction or research quality. State uncertainty instead of inventing evidence.

## Capture infrastructure versus app defects

Use named viewports. Claude's collector defaults to desktop and tablet:
`node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" capture-screens runs/current/prototype/index.html --viewports desktop:1440x1000,tablet:1024x1200`.
Re-run it after a repair; it captures every role and route.
Collectors use isolated Chrome profiles, real-time browser control and one transport-only retry.

Capture exit 2 / `captureUnavailable` / `infrastructureErrors` means **visual verification pending**,
not a page design failure. Preserve the compiled preview. Do not ask the user to send “continue”,
restart foundation, rewrite pages, spend design repair rounds, or fabricate a visual PASS. Complete
the generation handoff as “Preview built · visual verification pending”; do not freeze a version or
deploy until current evidence has been reviewed. Keep genuine runtime and interaction FAIL findings.

Capture exit 1 or an explicit page/runtime/interaction defect remains actionable against the exact
page. Repair only demonstrated defects. Never infer a code defect from a transport timeout alone.
Missing browser proof and subjective quality refinements are not the same status.

Same-build targeted retries retain unchanged screens and their reviews. New screenshots get immutable
names and per-screen digests; review only current pixels. A changed assembled bundle invalidates prior
capture evidence conservatively. Never restamp an old screenshot/verdict with a new build digest.
After a successful recapture, complete visual review and terminal verification before publishing.
