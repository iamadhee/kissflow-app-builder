---
description: STAGE 3 (review) — render the current plan as an INTERACTIVE review page (data models, logic, workflows, roles, permissions, pages, decisions) + a per-role clickable PROTOTYPE of the intended UI. The team reviews and flags changes. Changes nothing.
argument-hint: "[optional focus — a flow / role / area | blank = the whole plan]"
---

**Stage 3: review.** Make the proposed design something the team can *see and judge* before anything
is built. Read-only — never edits the spec.

Pre-req: `/author-plan` produced `runs/current/app-spec.json` + `decisions.md`.

## Do
1. **Render the interactive review page:**
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" review runs/current/app-spec.json runs/current/decisions.md runs/current/open-questions.md > runs/current/review.html`
   (the third arg is optional — `open-questions.md` is auto-detected next to `decisions.md`).
   It has every entity / field / workflow / permission / page / decision as an item with a stable
   `#id` and **✓ ok / ✎ change / ? ask** + a comment; a panel tallies flags and **Copy change-list**
   exports them. The **Decisions** step has two sub-tabs: *Your decisions* — each open question as an
   answerable card (accept the proposed default / decide differently / discuss; answers export as
   `[DECIDED]` lines) — and *Decision log* — the design log as reference cards (plain-language stage
   names, one-line why, folded rationale, Q-code chips linking back to the question cards).
   **Automations** render as Kissflow-style trigger→action canvases; the **BRD** step opens with a
   masthead + colorful stat tiles and reads as a sign-off-ready document.
   Tell the user to open `runs/current/review.html` (share it with the team).
2. **Catalog theme FIRST — `kf-design-director` runs on EVERY build, comprehensive included.**
   An app that skips this ships with an unreviewed default theme. Before either prototype agent
   spawns, choose the best-fit id from `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" language-catalog list`:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" language-catalog design <theme-id> --app-id <slug> --app-name "<name>" \
     --rationale "<one line: why this theme/archetype fits THIS domain>" \
     --record runs/current \
     [--archetype rail-left|rail-dark|top-bar|rail-right] [--density compact|comfortable|airy]
   ```
   `--record` appends the layout + theme choice to `decisions.md` as the next `D<n>` — the nav
   position is a design decision the customer signs off on, not a CLI flag; the design check fails
   a run whose decision log has no design entry. `--rationale` is REQUIRED — the command refuses to
   print without it, and a placeholder-length one is rejected. Ground it in the domain from
   `/author-brief`. The printed `design` slice records the selected catalog theme and shell and goes
   into `prototype/experience-spec.json` VERBATIM — `kf-ux-architect` designs structure on top of it
   and must not fight it. No per-app color mutation or identity stylesheet is generated. No `design`
   slice in the spec = the prototype build's theme check fails.
3. **Build the per-role PROTOTYPE (React). Comprehensive optimizes for quality and coverage; only
   Express optimizes for speed.**
   - Run **`kf-design-director`** and a **research-only `kf-ux-architect` pass in parallel** after the
     complete App-Spec is verified. Research writes `prototype/research.json` with at least two
     compared candidates and three visible anatomy markers per page. The same UX architect then
     combines the selected candidate with the frozen design direction and writes the Experience Spec
     (`prototype/experience-spec.json`). The kit's rich adapters are listed in
     `reference/WIDGET-GUIDE.md` (React Flow, Frappe Gantt, React Big Calendar, TanStack
     table/virtual, dnd-kit, Framer Motion, PapaParse and the lazy Three.js stack); agents choose the
     best researched representation from that catalog — they do not hand-build weaker substitutes or
     use 3D when the data is not spatial.
   - Run **`kf-seed`** before React generation. It writes seed-plan version 2, bound to the research
     and page-design digests, with page coverage naming the exact records and states visible on cold
     load. Then the same UX architect writes `prototype/page-designs.json`; every researched anatomy
     item is placed exactly once and every binding has a selected capability, zone and placement.
   - Fan out bounded **`kf-prototype-builder`** groups per role, each limited to its role's pages from
     `page-designs.json`. Each writes its pages to `prototype/pages/*.jsx` (and shared widgets to
     `prototype/widgets/`) and the navigation + seed to `prototype/proto.json`, builds and smokes once,
     and may make one compiler-directed repair. Assembly waits for every receipt. The engine continues
     to own schema/SDK bindings, scopes, loading/error/empty states and allowed actions; builders own
     faithful custom React composition and interactions.
   - Build/assemble: `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" proto-react runs/current` → stages the
     pages into the React kit, builds, smoke-tests every role and route in a real browser, and writes
     `runs/current/prototype/index.html`. A failed build never replaces a working prototype; fix what
     the log names and re-run. Do not route comprehensive through the Express page compiler. A
     data/runtime repair may not invent or replace a page without rechecking the original page-design
     contract.
   This shows the intended UX per role and is the same React source that ports to the live UI.
4. **Capture the REAL signature screens at desktop and tablet** (a comprehensive build is not visually
   verified without rendered evidence):
   `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" capture-screens runs/current/prototype/index.html --viewports desktop:1440x1000,tablet:1024x1200`
   → `prototype/thumbs/*.png` + `manifest.json`. React prototypes discover roles from sibling
   `proto.json`. Re-run the review render from step 1 so the Pages & Nav step embeds real screens.
5. **Run `kf-prototype-visual-qa` as a judgment gate.** It reads `page-designs.json` + every captured
   signature screen, compares role landings for repetition and scores domain fit, composition, craft,
   actionability and research fidelity. It must prove that the selected candidate and every required
   anatomy marker survived into rendered pixels, then writes `prototype/qa/visual-verdict.json`.
   - On BLOCK, send only `repairBrief` to `kf-prototype-builder`, rebuild the failing pages
     (`node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" proto-react runs/current`), recapture both viewports and
     re-run visual QA.
   - Cap the loop at three repair rounds. More tokens in one monolithic pass are not a substitute for
     rendered feedback. If blockers remain after round three, report them and stop; never mark ready.
   - On PASS, run the atomic gate/ledger step:
     `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" orchestrator gate runs/current visual-qa`. It validates
     both the judgment artifact and deterministic source checks, then records the truthful PASS/BLOCK
     verdict.
6. **Snapshot + save the version** — `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" runs snapshot "review"`,
   then `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" publish runs/current --label "review"`. It saves the
   review page + prototype under `runs/current/published/<stamp>/`. Report the saved file paths; the
   user opens them in a browser directly.
7. **Narrate the highlights** in chat: what will be built, the key decisions (choice · why · rejected
   alternative), and the **risks/gaps** worth scrutinising (thin entities, single-step processes,
   unresolved open questions, dashboards with weak data).

## Output
Point to `review.html` + the prototype, summarise the highlights + a short "decisions I'd double-check"
list. Next: *"Flag items in the page, Copy the change-list, and run `/author-refine \"<paste it>\"` —
repeat until it's right, then `/author-preview`."*

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
