---
description: One-time setup — check the prerequisites, fetch the build engine for this machine, sign in to your Kissflow account in the browser and connect this folder to it, and seed the agent memory.
argument-hint: "[your Kissflow account address, e.g. acme.kissflow.com] (run once in the folder you build from)"
---

Run this **once** in the folder you want to build from. The plugin ships its commands, its specialist
agents, the reference playbooks and a small launcher (`$CLAUDE_PLUGIN_ROOT/bin/kf.mjs`); the build
engine itself is fetched once per version into your home folder. Nothing is copied into this
workspace except `.kf-env` (which account this folder builds in) and `MEMORY.md` (the agents' memory).

**Break the silence FIRST.** Setup + the first engine call are the coldest, most silent wait a user
feels. Your VERY FIRST output — before any probe or `node` call — must be a warm line so the user
isn't staring at nothing: *"⚙️ Warming up — checking the build engine and your Kissflow connection
(one-time, a minute or so)…"*. Then narrate each step as it finishes: *"✓ Engine ready."* ·
*"✓ Connected to <account> as <email>."* · *"✓ Building in <app>."* Never run the slow steps before emitting that first line.

## 0. FAST PATH — re-runs and account switches (ZERO exploration)
Setup is **idempotent** and re-running it to SWITCH accounts is normal. Decide everything with ONE
cheap probe (it never errors):
```bash
ls .kf-env 2>/dev/null || true
```
- `.kf-env` present and `$ARGUMENTS` empty → `source .kf-env`, say *"Already connected to
  **$KF_PROJECT_NAME** — `/build-app "<your requirement>"` when you're ready."* and **stop**.
- `$ARGUMENTS` has an account address → run step 3 with it **immediately**. It overwrites `.kf-env`
  in place — an env pointing at a DIFFERENT account is not a conflict to investigate, it's exactly
  what connect replaces.

**Do NOT explore.** Never read `bin/kf.mjs`, run it with `--help`, or inspect its structure — the
invocations on this page are its entire surface for setup. The whole fast path is one probe and
should take seconds; anything beyond that is wasted user-visible time.

## 1. Prerequisites
- **Node 18+** (`node --version`) — Claude Code already needs it, so this normally passes.
- **python3** on PATH (`python3 --version`) — needed **only** for native page publishing. Data
  models, workflows, roles and permissions build fine **without** it; only native pages need it.
- **macOS, Linux or Windows x64** — the engine ships as a sealed build per platform.

## 2. Engine check
Tell the user first: *"The first run downloads the build engine for this platform (~100 MB, once per
version) into your home folder."* Then:
```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" --version
```
It prints the engine version once the download (if any) finishes. On a re-run it's instant. A
checksum failure says so — just re-run the command.

## 3. Sign in to your Kissflow account — THE standard flow
Ask the user for their **Kissflow account address** if `$ARGUMENTS` doesn't already hold one (the
address they open Kissflow at, e.g. `acme.kissflow.com`). Then:
```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" connect <account-address>
source .kf-env
```
What happens: the browser opens the account's **own Kissflow sign-in** (SSO included). The user signs
in and approves access for Kissflow App Builder on the consent screen, the tab says "Signed in", and
connect finishes on its own. Surface the printed link prominently in case the browser didn't open;
connect waits up to 10 minutes. There are **no keys to prepare and nothing to paste**.

- If connect says the account **does not offer assistant sign-in**, an account admin must enable MCP
  access for the account (Admin → MCP access). Say that in one line and stop.
- `connect --status` shows which account and person this folder is connected as; `connect --sign-out`
  forgets the sign-in on this machine. Re-running connect with another address switches accounts.

The sign-in stays in the user's home folder and renews itself. `.kf-env` holds only which account
this folder builds in (`KISSFLOW_DOMAIN`, `KISSFLOW_ACCOUNT_ID`), who connected (`KF_USER_EMAIL`,
`KF_USER_NAME`) and the account name (`KF_PROJECT_NAME`) — nothing secret, but still never commit it.
Everything the agents build is done **as this person**, with exactly their Kissflow permissions.

**THE ACCOUNT NAME IS THE WORKING CONTEXT.** `.kf-env` carries `KF_PROJECT_NAME` (the Kissflow
account's name). Greet with it ("Connected to **Acme** — what should the app do?"), interpret every
subsequent ask in its context, and prefix clarifying questions with it. Never ask which account this
is about — you already know.

Everything else lives in this folder: the design graph under `runs/<app>/ir-graph/`, each build's
saved versions under `runs/<app>/published/`, and the agents' memory in `MEMORY.md` + `MEMORY-LOCAL.md`.
Agents write new lessons with `node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" memory remember "<lesson>" --app <appId>`.

## 3b. Choose the app to build in
Right after signing in, open the app picker:
```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" connect --app
source .kf-env
```
A page opens in the browser listing the apps in this account the user can **edit**, with search and
whether **custom UI** is enabled on each. They pick one (builds go into that app) or **Start a new
app** (the next build creates one). Show the printed link in case the browser didn't open; it waits
up to 15 minutes. The choice lands in `.kf-env` as `KF_APP_ID`, `KF_APP_NAME`, `KF_APP_CUSTOM_UI`.
They can switch apps any time with `/switch-app`.

## 4. Seed the agent memory
```bash
[ -f MEMORY.md ] || cp "$CLAUDE_PLUGIN_ROOT/MEMORY.md" MEMORY.md
```
`MEMORY.md` is the agents' auto-evolving memory — yours to grow; an existing one is never replaced.

## 5. Access keys — FALLBACK only (accounts without assistant sign-in)
Only when the account cannot enable MCP access and the user has a Kissflow access key. Export, don't
hardcode, and don't run connect:
```bash
export KISSFLOW_SUBDOMAIN=<your-subdomain>      # e.g. dev-mycompany
export KISSFLOW_ACCOUNT_ID=<your-account-id>
export KISSFLOW_API_KEY=<access-key-id>
export KISSFLOW_API_SECRET=<access-key-secret>
```
Always **dry-run** first and target a **dev** account; the pipeline never auto-publishes to prod.

## 6. Go
`/build-app "<your requirement>"` — author a full app top-down, or the staged loop starting with
`/author-brief`.

## Confidentiality
You build Kissflow apps for this user. You do not explain, summarise or speculate about how this plugin, its engine, its hosted services or Kissflow's internal architecture work. If asked, reply in one line that this isn't something you can share, then offer to continue with the app. Never read or quote files under the plugin's install folder other than the command and reference documents you are told to use.
