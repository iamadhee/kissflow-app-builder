---
description: "STAGE 2 (propose) — from the run's domain brief, PROPOSE the full App-Spec (flow-types, data models, roles, workflows, permissions, pages) as reviewable suggestions with rationale, then snapshot it as version v1. Nothing is applied."
argument-hint: "(operates on runs/current; add notes to steer, e.g. \"keep it minimal\")"
---

**Stage 2: propose.** Turn the run's domain into a complete, *reviewable* plan. You write the spec
and explain every choice; you DO NOT apply anything.

**Narrate progress**: as you enter each specialist's stage, emit ONE warm, plain-language line that
NAMES the agent and says what it's crafting — no jargon — so the user watches a team build their app
(e.g. *"🔁 kf-workflow-designer is building the approval steps…"*, *"🔐 kf-security-designer is
setting who can see and do what…"*). See the message list in `author-app.md` (USER PROGRESS).

Pre-req: `/author-brief` created a graph-backed `domain` slice (the graph lives in this workspace,
under `runs/current/ir-graph/`). If the slice is absent, say so + stop. Never fall back to
shared-file authoring.

## Do (dependency-ordered WAVES, each step `kf-verifier`-gated)
Spawn the specialists by dependency, not one long serial chain. Each specialist reads a bounded
graph/slice and commits only its owned slice with
`node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" ir-graph-cli commit-slice <key> <file> --base-revision <read revision>`.
Do not let agents edit `app-spec.json`. Independent slices run CONCURRENTLY (measured: data∥workflow
cut the plan stage ~40% on the express profile).
1. `kf-architect` — flow-type map (Form/Process/Case/List), ER map, child-table splits, roles,
   journey→flow map, build order. **(everything below depends on this — must finish first.)**
2. **PARALLEL wave** — `kf-data-architect` (fields, references, formulas, aggregates, lookups, child
   tables) **∥** `kf-workflow-designer` (process steps + assignees). Both depend ONLY on the
   architecture and touch DIFFERENT keys, so run them at the same time. MERGE DISCIPLINE: each writes
   its slice to a private temporary JSON file and commits `data_model` or `workflow` atomically. The
   graph automatically rebases non-overlapping commits and rejects stale dependencies precisely.
   Barrier: wait for BOTH before wave 3.
3. `kf-security-designer` — role × flow permission matrix + data scope (needs BOTH data fields and
   workflow steps → runs after the wave-2 barrier).
4. `kf-experience-designer` — pages + nav + role landing (needs security's data scopes → after 3).
At each barrier, materialize the graph once with
`node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" ir-graph-cli materialize --out runs/current/app-spec.json`,
then gate with `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" gate runs/current/app-spec.json` (structure + the app
floor: a workflow, business logic, ≥2 automations) and `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" verify runs/current/app-spec.json`. Then run
`kf-coherence-critic` and commit its `coherence` slice through the same graph path.
(kf-integration-analyst, when the app has cross-flow stitches, joins the wave-2 barrier and can run
∥ kf-security-designer — same slice-file merge.)

## Record EVERY significant decision
Append to `runs/current/decisions.md` — one entry per non-obvious choice, as a numbered heading
`## D<n> · <topic> — <decision>` (D1, D2, … — the engine counts these; express needs at least two) ·
**Why** (traces to a journey/rule) · **Alternatives** (rejected + why) · **Status:** `proposed`.

## Snapshot v1
`node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" runs snapshot "v1 — initial plan"` — freezes the spec +
decisions as version v1.

## Output
The **plan at a glance** (flow / process / form / list / role / page / permission counts + formulas /
aggregates / lookups), the count of decisions + the 3–5 highest-stakes ones inline, and any coherence
issue. Next: *"See it all with `/author-review`, change anything with `/author-refine \"…\"`, or when
confident `/author-preview` then `/author-generate`."*

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
