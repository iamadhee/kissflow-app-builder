# Kissflow App Builder

A Claude Code plugin that turns an idea or a requirements document into a running Kissflow app:
data models, roles, workflows, permissions and pages in your Kissflow account, with an optional
custom React UI. This folder carries the commands, the specialist agents, the reference documents
they read, and a small launcher for the build engine.

## Setup

Once per project folder:

```
/author-setup
```

The first run downloads the build engine for your platform (about 100 MB, once per version) and
opens a browser sign-in to connect the folder to your Kissflow App Builder project.

## Use

```
/build-app "<a one-line idea, or the path to a BRD>"
```

Or step by step: `/author-brief` → `/author-plan` → `/author-review` → `/author-refine` →
`/author-preview` → `/author-generate`. `/author-status` and `/author-runs` show where a build stands.

Everything targets your development environment. Nothing publishes to production.
