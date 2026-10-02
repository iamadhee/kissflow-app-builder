---
description: Switch the Kissflow app this folder builds in — pick from the apps you can edit, or start a new one.
argument-hint: ""
---

Switch the app this folder builds in.

1. The folder must already be signed in (`.kf-env` exists). If it isn't, run `/author-setup` instead and stop.
2. Run:
   ```bash
   node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" connect --app
   source .kf-env
   ```
   A page opens listing the apps the user can edit in this account, with search and each app's
   custom-UI status. They pick one, or **Start a new app**. Show the printed link in case the
   browser didn't open.
3. Confirm with `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" connect --status` and tell the user which app
   they're building in (`$KF_APP_NAME`) and whether custom UI is on (`$KF_APP_CUSTOM_UI` = 1).
4. If connect warns that `runs/current` belongs to the previous app, start a new run with
   `/author-brief` before building — never apply an old run to a different app.

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
