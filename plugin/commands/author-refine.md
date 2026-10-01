---
description: "STAGE 4 (iterate) — apply the user's changes to the current plan, re-verify, regenerate the review page + prototype, and snapshot a NEW version with a change-diff. Repeat as many times as needed. Nothing is applied to Kissflow."
argument-hint: "[\"<change requests>\" — free text, or the change-list pasted from the review page]"
---

**Stage 4: iterate.** This is the loop that makes big specs safe — cheap changes to the *plan*, not
the built app. Run it as many times as you like.

Pre-req: a current run with `runs/current/app-spec.json` (from `/author-plan`).

## Do
1. **Parse the change requests** in `$ARGUMENTS` — free text ("make Payment a Process"; "add a
   Compliance role"; "Vendor needs an IBAN field") or the exported change-list (`[CHANGE] <label>
   (#id): note`). The `#id` tells you exactly which item to edit.
2. **Apply each change** by re-running the RIGHT specialist on the affected slice (architect for
   flow-type/role/structure; data-architect for fields/formulas/refs; workflow-designer for steps;
   security-designer for permissions; experience-designer for pages/nav). Each commits its own graph
   slice; then materialize
   (`node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" ir-graph-cli materialize --out runs/current/app-spec.json`).
   Edit surgically — don't rebuild the whole plan.
3. **Re-verify + re-cohere** — `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" verify runs/current/app-spec.json`,
   then `kf-coherence-critic`. Fix knock-on effects (e.g. Form→Process adds a workflow; a new role
   needs permissions + a landing).
4. **Log it** — append to `runs/current/decisions.md`: the change, who asked, and the new decision
   (`Status: changed-by-user`).
5. **Regenerate + snapshot** — re-render the review page
   (`node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" review runs/current/app-spec.json runs/current/decisions.md runs/current/open-questions.md > runs/current/review.html`),
   and rebuild only the prototype pages the change touched: `kf-prototype-builder` edits the affected
   `prototype/pages/*.jsx`, then `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" proto-react runs/current`.
   A refine edits what moved; regenerating every role loses work the user has already accepted.
   Finish with `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" runs snapshot "<one-line summary of the changes>"`
   (new version vN+1).

## Output
**What changed** (added / removed / modified) and any **consequences** you had to handle, plus the new
version number. Show a short before→after for the touched items. Next: *"Review again (`/author-review`
or open the new `review.html`), refine more, or `/author-preview` when confident."*

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
