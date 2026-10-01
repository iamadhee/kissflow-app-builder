# Kissflow App Builder

A Claude Code plugin that turns an idea or a requirements document into a running Kissflow app:
data models, roles, workflows, permissions and pages in your Kissflow account, with an optional
custom React UI.

## Install

```
/plugin marketplace add iamadhee/kissflow-app-builder
/plugin install app-builder@kissflow
```

Then, once per project folder:

```
/author-setup
```

The first run downloads the build engine for your platform (about 100 MB, once per version) and
opens a browser sign-in to connect the folder to your Kissflow App Builder project.

## Requirements

- Claude Code with Node.js 18 or newer
- `python3` on your PATH (used when publishing native Kissflow pages)
- macOS (Apple silicon or Intel), Linux x64, or Windows x64
- An invitation to Kissflow App Builder for your work email

## Use

```
/build-app "<a one-line idea, or the path to a BRD>"
```

Or step by step: `/author-brief` → `/author-plan` → `/author-review` → `/author-refine` →
`/author-preview` → `/author-generate`. `/author-status` and `/author-runs` show where a build stands.

Everything targets your development environment. Nothing publishes to production.

## Releases

Each release carries the engine binaries the plugin downloads. The plugin version and the release
tag always match; `/plugin update app-builder` moves you to the newest one.
