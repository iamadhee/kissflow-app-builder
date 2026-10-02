---
description: "STAGE 5 (confidence gate) — dry-run the current plan against the target Kissflow account WITHOUT applying: validate the IR, show exactly what would be created (apps/flows/forms/fields/workflows/permissions/pages) and flag anything risky or immutable. This is the \"are we confident?\" checkpoint before /author-generate."
argument-hint: (operates on runs/current; nothing is created)
---

**Stage 5: preview.** The last look before build. Published Kissflow processes are **immutable over
REST** — you can't change or delete them afterwards — so this stage exists to make the team
*confident* the plan is right, not just valid.

Pre-req: a current run with a verified `runs/current/app-spec.json`.

## Do
1. **Validate hard** — `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" verify runs/current/app-spec.json`.
   Any error stops here.
2. **Dry-run the build** — `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" build runs/current/app-spec.json --out runs/current/preview`
   compiles the spec into metadata WITHOUT calling Kissflow (writes the plan to `preview/`). Read it
   and print the **build manifest**: N apps, flows (by type), forms, fields (with formulas/aggregates/
   lookups), workflow steps, permission grants, pages/nav.
3. **Flag the irreversibles** — call out every Process/Case that, once generated, can't be changed via
   REST; and anything that would REUSE vs CREATE if re-run.
4. **Cross-check open questions** — if `runs/current/open-questions.md` still has unresolved items that
   affect the build, list them: "resolve or accept before generating."
5. Do NOT snapshot (preview mutates nothing) and do NOT call Kissflow.

## Output
The build manifest + an explicit **confidence checklist**: ✅ verified, the immutable items, unresolved
questions, and reuse-vs-create behaviour. End with the gate: *"If this looks right, `/author-generate`
to build it in dev. Otherwise `/author-refine \"…\"`."*

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
