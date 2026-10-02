---
description: Runtime QA with a 100% coverage gate — enumerate every testable obligation from the IR (steps×outcomes, permissions, implied denials, scopes, automations, field rules), have kf-runtime-qa write mapped test cases, execute them against the live dev app per role, and report pass/fail with evidence. Failures export as a change-list for /author-refine.
argument-hint: "[optional focus — a flow / role / journey | blank = the whole app]"
---

**Runtime QA.** Prove the built app behaves as designed — per role, at runtime, with countable
coverage. Requires a generated app (`runs/current/generated/` apply log) and a connected dev env.

## Do
1. `mkdir -p runs/current/qa` and enumerate the coverage universe:
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" qa-universe runs/current/app-spec.json > runs/current/qa/universe.json`
   Tell the user the item counts by class — this is what "100%" means for this app.
2. Spawn **kf-runtime-qa**. It reads every artifact, writes `qa/test-plan.json` with each test
   claiming universe ids, and iterates until the coverage gate passes:
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" qa-universe runs/current/app-spec.json --check runs/current/qa/test-plan.json`
   (exit 1 = not done; the gate lists uncovered ids).
3. The agent executes the plan against dev as each role (sandbox users; approve seeding them if
   missing), writing `qa/results.json`. Denial tests that PASS access are security findings.
4. Snapshot: `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" runs snapshot "runtime QA"`, then save the QA run:
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" publish-qa runs/current --label "<short label>" [--version <stamp>]`
   — it keeps universe/plan/results/report under `runs/current/published/qa/` and adds the run to
   `runs/current/published/qa-runs.json`.
5. Report in chat: the plain-English use-case verdicts FIRST (one line per user journey: works /
   broken / not provable — a BA should understand the whole report from these), then coverage
   (must be 100%), pass/fail by class, security findings, weak-evidence items, and the `[QA-FAIL]`
   change-list block ready for `/author-refine`.

A focus argument scopes the UNIVERSE (that flow/role/journey only) — coverage is still gated at
100% of the scoped universe, and the report must say it was scoped.

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
