# Claude specialist playbook

This is the common operating contract for every root `kf-*` specialist. Individual agent files
define specialist judgment; this file defines how the fleet works. When the two disagree, the
agent's narrower domain rule wins, but never its broader scope.

## 1. Task envelope

Do not start until the task names:

- the exact absolute `KF_RUN_DIR`;
- the build epoch/revision and generation mode;
- the stage, owned IR slice or owned artifact paths;
- the prerequisite artifacts and the expected handoff.

Use only that run directory. Never infer `runs/current`, another session, or an app from a slug.
Missing or conflicting scope is a blocker; report it before writing.

## 2. Read the minimum authoritative context

Read in this order:

1. this playbook and the specialist's own agent file;
2. `reference/LESSONS.md` plus only the role-specific references named by the agent;
3. the task's graph slices or artifact inputs;
4. relevant memory, using recall for workers and the complete memory only for judgment gates.

Do not replay the chat transcript or read a complete materialized App-Spec when a graph/slice command
exists. If a required fact is absent from a slice, report a slice-contract defect rather than silently
expanding the read set.

## 3. One owner, one bounded write set

- IR specialists read the mandatory graph and commit only their declared slice with the supplied
  base revision. `app-spec.json` is a read-only gate snapshot, never a shared authoring surface.
- Artifact specialists write only the paths their task assigns under `KF_RUN_DIR`.
- Never rewrite another specialist's output to make your own validation pass. Return a precise repair
  request to the owner.
- Never publish, deploy, mutate a live app, or write production data unless the task explicitly grants
  that authority. Prototype seed work is offline.

Parallel work is safe only when write sets do not overlap and all declared dependencies are complete.
At a barrier, wait for the prerequisite revision; do not invent its likely result.

## 4. Judgment and failure policy

Deterministic checks own syntax, schema, references, compilation and known invariants. Run them before
spending judgment on semantics. Specialist judgment owns intent, coherence, usability and novelty.

Hard blockers are limited to conditions that make the result unsafe or unusable: invalid structure,
missing required dependency, data loss, permission/role failure, build/runtime failure, or a required
interaction that cannot work. Quality shortcomings are evidence-backed warnings or bounded repairs;
they must not become an unbounded rebuild loop. Preserve the last verified artifact on any failure.

Never manufacture policy, permissions, actions, data, research evidence or a passing result. State a
bounded assumption only when the source is silent and the choice is reversible; record it in the
owned decision artifact.

Once a Detailed build has a usable initial requirement, internal prerequisites and bounded repairs
are fleet work, not user questions. Specialists return missing slices to their owning specialist and
the conductor continues through the declared barriers. Do not ask the user to add a stage, select a
theme, approve a repair or resolve an implementation detail. Only an unusable original requirement,
an external credential, or irreversible external authority may require user intervention.

## 5. Evidence and completion

An agent is done only when:

- every declared output exists and parses;
- the relevant deterministic check ran and its result is cited;
- coverage is measured against the task contract, not against what happened to be generated;
- warnings distinguish quality from correctness;
- the handoff identifies the next owner and exact remaining work.

Return one compact handoff:

```json
{
  "status": "pass | repair | blocked",
  "revision": "graph/build revision",
  "ownedOutputs": ["exact slice or path"],
  "evidence": ["check or observed result"],
  "blockers": [{"owner": "kf-*", "issue": "specific repair"}],
  "warnings": ["non-blocking quality risk"],
  "next": "next specialist or gate"
}
```

Progress events describe real work (`started`, `working`, `passed`, `repair`, `blocked`) and a useful
domain action. Do not emit generic filler, duplicate completion events, provider/model names, tokens,
commands or internal file mechanics to the user-facing status stream.

## 6. Memory

Workers recall only the task-relevant entries:

```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" memory recall "<one-line task brief>"
```

Judgment gates explicitly marked in their own playbook read the complete memory. Record only a new,
verified and reusable lesson:

```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" memory remember "<one actionable sentence>" --scope agent --agent <agent-name>
```

Use app scope for app-only facts and global scope only for a confirmed platform invariant. Never
hand-edit memory logs, repeat existing lessons, or store transient failures.

## 7. Theme and component authority

There is one design system with one additive capability pack:

- `src/components/kit/*` is the public component system and the only general page-design source.
- The heavier, dependency-backed components (CalendarView, AdvancedDataGrid, InteractiveGantt,
  FlowDiagram, Scene3D, SmartForm, SortableList, VirtualList, CsvImport) live in `src/components/kit/*`
  with everything else; `src/components/kf/*` was merged into it on 15 Sep 2026.
  Import one named module directly only when the widget guide selects it; it still consumes the
  shared semantic tokens.
- `src/components/ui/*` is private record-form infrastructure. Page agents do not compose screens
  from it or import it directly.
- `engine/app-kit/*` and `engine/proto-kit/*` are generated delivery/rendering mirrors of the public
  kit, not additional sources to mix with it.

`kf-design-director` is the sole writer of the catalog-derived `design` slice. Every other
specialist treats that slice as immutable and owns only structure, content, bindings or verification.
Do not emit literal colours, named Tailwind palettes, typeface stacks, spacing scales, radii,
shadows, gradients, shell geometry or page-local theme objects. Use semantic tokens and the public
kit contract. A numeric value required by data visualization or accessibility is not a design token;
record why it is semantically necessary.

When an app-specific theme conflicts with a component default, the selected catalog theme and
generated identity win. Do not repair the conflict with a higher-specificity page rule; report the
component/token defect to the kit owner. Preserve `data-theme` and let `ThemeProvider` vary only
Light/Dark/System mode.

## 8. Fleet ownership map

| Specialist | Owns | Completion test |
|---|---|---|
| `kf-ba` | domain evidence, personas, journeys, entities, business rules | every claim is sourced and every entity/rule serves a journey |
| `kf-comprehension` | semantics of an existing app | claims are derived, observed or stated; unresolved residue is explicit |
| `kf-architect` | cross-cutting structure, roles, ER map and build order | every journey has a lowerable dependency path |
| `kf-data-architect` | fields, references, child tables and computed values | references resolve and derived values are expressions, not manual inputs |
| `kf-workflow-designer` | process/case lifecycles, routing, SLA and notifications | every journey can finish; no dead state or fake parallelism |
| `kf-security-designer` | capability matrix and reusable data scope | each role can do its job without lockout or excess access |
| `kf-integration-analyst` | external system seams, contracts and failure handling | internal links are not mislabeled integrations; retries are safe |
| `kf-experience-designer` | role journeys, page/nav/report structure | every role/job has a reachable and permitted home |
| `kf-coherence-critic` | cross-slice semantic completeness | each persona goal is satisfiable end to end |
| `kf-verifier` | deterministic and adversarial gate verdicts | every blocker has evidence and an owning specialist |
| `kf-acceptance` | observed sandbox journey proof | positive and negative paths run against the real runtime |
| `kf-seed` | coherent prototype scenarios or approved idempotent live loads | version-2 seed lineage matches the frozen research/UI contract and every page names meaningful above-fold records in the exact visible state |
| `kf-design-director` | catalog theme, shell and visual direction | the complete theme is domain-appropriate and used unchanged |
| `kf-ux-architect` | comparative product research and executable per-page composition | every page selects one researched candidate, places every researched anatomy marker exactly once, and gives each binding a supported capability, zone and placement |
| `kf-ui-architect` | data-backed page/widget specification | every binding exists and every page has a justified composition |
| `kf-ui-designer` | bounded page-contract repair and `/add-page` design | affected layouts fit page intent without replacing the UX-owned contract |
| `kf-prototype-builder` | bounded comprehensive React page groups, integration and interactions | every required group completes; supported rich libraries use their themed adapters; all routes, forms, bindings, anatomy, roles and declared interactions work |
| `kf-prototype-visual-qa` | rendered visual, research-fidelity and interaction verdict | required role/route captures prove the selected candidate and anatomy in pixels, and findings are bounded |
| `kf-ui-builder` | live custom-UI React pages | real SDK bindings compile and preserve the approved design contract |
| `kf-ui-qa` | live UI source/build review | build and contract checks have line-level evidence |
| `kf-author` | approved live metadata authoring | created metadata is re-read and verified after publish |
| `kf-builder` | legacy path adapter to `kf-ui-builder` | exactly one source tree is selected and canonical builder checks pass |
| `kf-runtime-qa` | live runtime smoke and failure localization | observed runtime paths pass without mutating production state |
| `kf-reconciler` | minimal safe convergence of IR and live state | drift is classified and destructive operations require approval |

The fleet is the comprehensive/live-authoring pipeline. It must not read, invoke or repair another
provider's pipeline or its artifacts.
