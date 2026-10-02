---
description: "Build and package the app UI for upload to Kissflow's Custom UI."
---

Build and deploy the app UI to Kissflow. A generated React run uses the shared, fail-closed release
command; do not manually copy its pages into a scaffold or run a page agent again.

Workflow — ask the target first:

0. Ask the user (AskUserQuestion) where to deploy:
   - **Dev** — point the app's Custom UI at the running dev server URL (fast iteration;
     live data via the proxy). No upload needed — they paste the dev URL in Kissflow.
   - **Prod** — build + zip the static bundle and upload it to the app's Custom UI
     (self-contained, no dev server). Use this for a real release.
   Carry the choice through the steps below.

Steps:

1. **Generated React run (`prototype/proto.json` + `prototype/pages/*.jsx`)** — use one command for
   both Express and Comprehensive. Pick the same mode that generated the run:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" deploy-react runs/current --mode <express|comprehensive> --open
   ```
   This requires the successful apply's `id-map.json`; substitutes only those real ids in every approved
   page/widget; builds the exact route set in an isolated workspace; creates a durable source+zip release;
   uploads, publishes and enables the Application component; then verifies those remote steps. Any failed
   source check, build, upload, publish or enable exits non-zero. To prove/package without remote writes:
   add `--prepare-only`.

   For an intentional local-development URL, start the run workspace's dev server and pass
   `--url https://localhost:3000`; the command still performs the production build first. The default zip
   mode is the self-contained release.

2. **Standalone scaffold (no generated React run)** — retain the low-level mechanism:
   ```bash
   npm run zip
   node "${CLAUDE_PLUGIN_ROOT}/bin/kf.mjs" deploy-ui <path/to/ui.zip> --app <appId>
   ```
   This is an escape hatch, not the generated-app pipeline. Manual upload remains a fallback when remote
   credentials or the upload API are unavailable.

3. Open the real app and smoke-check every role's landing route. Anything that was a preview mock (native forms,
   stage-changing drag-drop) becomes fully functional once running inside Kissflow.

Re-run `/deploy` after each change to repackage; the Custom UI just stores the bundle.

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
