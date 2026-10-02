---
description: "STAGE 6 (build) — apply the current run's plan to the target Kissflow account, creating the real apps, flows, forms, fields, workflows, permissions and pages. Gated on a VALID IR (not on review). Supports --dry-run and --yes. This is the only stage that mutates Kissflow."
argument-hint: "[--dry-run] [--yes] (operates on runs/current)"
---

**Stage 6: build.** Turn the plan into a real Kissflow app. This is the destructive/irreversible step
(published Processes/Cases can't be un-published over REST), so treat it with care.

**Narrate progress**: emit a warm, plain line as you start building
(*"🚀 kf-author is building it live in Kissflow — creating and publishing every flow, page and role…"*)
and when acceptance runs (*"✅ kf-acceptance is test-driving each journey…"*), then a plain result
(*"✓ Live — 1 process, 3 dashboards; every journey passed."*). No jargon. See `author-app.md` (USER PROGRESS).
**End with the time taken** — close on the total wall-clock (*"⏱ Built in 1m57s."*) from
`node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" timeline report runs/current`; it's the demo headline.

Pre-req: a current run with a **verified** `runs/current/app-spec.json`, and a connected folder
(`source .kf-env`). Gate is *valid spec*, not "review was done" — so the express/demo path can reach
here directly.

## Do
1. **Drive the build contract** — `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" orchestrate drive runs/current --mode <quick|comprehensive>`.
   This is the ONE executable contract: it runs every deterministic gate and RECORDS its verdict
   atomically — you never manually "pass" a stage. Then
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" orchestrate clear runs/current apply` — if it prints
   `❌ blocked`, the named stages are agent gates (adversarial verifier) or human sign-off that still
   need doing; do them (or the caller waives with `--force` on apply) before step 4. `verify` and
   `apply` both record their own verdicts too, so the guard stays consistent however you reach it.
2. **If review was skipped**, print exactly one line: *"⚠ No review taken — applying to dev directly."*
   (Check: no `runs/current/review.html` / no snapshots ⇒ skipped.) Don't block on it.
3. **Handle flags** in `$ARGUMENTS`:
   - `--dry-run` → `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" build runs/current/app-spec.json --out runs/current/preview`,
     show the manifest and STOP (build nothing).
   - No `--yes` and this is a full/non-express invocation → show the one-line build summary (N flows,
     forms, permissions) and ask for confirmation before applying.
   - `--yes` → apply without the extra prompt.
4. **Apply** — `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" apply runs/current/app-spec.json --mode <express|comprehensive>`
   (add `--no-pages` for a React Custom UI run; targets the account in your `KISSFLOW_*` env — keep
   this pointed at **dev**). If re-running a run that was already partly built, the engine's reuse
   mode maps to the existing gen→server ids (from the prior apply log in `generated/`) instead of
   duplicating — don't re-create from scratch. Apply is **resumable**: a re-run continues from its
   checkpoint and re-publishes only changed flows. It auto-handles **account name collisions**
   (reuses the existing flow or creates an app-prefixed copy) — don't stop to rename + re-plan.
5. **Record the build** — write `runs/current/generated/` with the apply log (gen→server id map,
   created flow/form/page ids, timestamps). Update `RUN.md`: stage=generated, generated=yes, target.
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" runs snapshot "generated → dev"`.
6. **Deploy the reviewed React UI (React runs only)** — do not ask another page agent to recreate it:
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" deploy-react runs/current --mode <express|comprehensive>`.
   This is the complete shared release path: real-id port, exact production build, durable zip, upload,
   publish, enable and remote-result verification. It refuses incomplete mode-specific gates. Use
   `--prepare-only` to validate/package without changing Kissflow.
7. **Acceptance** — spawn `kf-acceptance` to smoke-check the built app against the journeys; report
   pass/fail per journey.
8. **Save the version — ALWAYS run this** (it keeps the app spec, prototype and review page of this build):
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" publish runs/current --label "<short build label>"
   ```
   It saves this run's artifacts (spec, prototype, review page, apply logs with the real Kissflow ids)
   under `runs/current/published/<stamp>/` and lists the version in `runs/current/published/versions.json`.
   Nothing leaves this machine. If it refuses because the prototype isn't publishable, fix that and
   re-run; no version is saved until it passes.

## Output
What was created (with real Kissflow ids), the acceptance result, and where the log lives
(`runs/current/generated/`). Next: *"Open it in Kissflow, or `/author-refine` and generate again —
the run's Experience Spec (`runs/current/prototype/`) is what `/deploy` turns into the live custom UI."*

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
