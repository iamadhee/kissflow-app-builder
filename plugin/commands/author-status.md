---
description: "Show the current run's state — stage, target, whether it's been generated, and the version ladder (v1, v2, …) with each snapshot's change note. Read-only."
argument-hint: (operates on runs/current)
---

Show where the current authoring run stands.

## Do
1. `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" runs status` — prints `RUN.md` (stage, target, generated?,
   version list with notes).
2. Read `runs/current/open-questions.md` (if present) and surface any still-unresolved questions.
3. Glance at `runs/current/decisions.md` and report the count + how many are `proposed` vs
   `changed-by-user`.

## Output
A compact status card: **run name · stage · target · generated? · N versions** (latest note),
unresolved-question count, decision count. Then the single most useful next command for this stage
(`/author-plan`, `/author-review`, `/author-refine`, `/author-preview`, or `/author-generate`).

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
