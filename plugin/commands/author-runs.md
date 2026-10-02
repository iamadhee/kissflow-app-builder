---
description: List all authoring runs (one per BRD) with their version counts, and switch the active run. Each BRD lives in its own runs/<slug>/ directory with versioned snapshots.
argument-hint: "[<run-slug> to switch to it | blank to list]"
---

Manage the runs under `runs/` — each is one BRD's authoring session, versioned independently.

## Do
- **No argument** → `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" runs list` (shows every run, `*` = current,
  version count each).
- **A run slug given** in `$ARGUMENTS` → `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" runs use <slug>` to
  make it the current run, then `node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" runs status` to show what you
  switched to.

## Output
The run list (or the switch confirmation + status). Remind the user that all stage commands
(`/author-plan`, `/author-review`, `/author-refine`, `/author-preview`, `/author-generate`) act on the
**current** run, and that `/author-brief <brd>` starts a fresh one.

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
