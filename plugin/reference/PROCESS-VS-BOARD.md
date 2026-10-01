# Process vs Board vs Form vs Dataset — how to decide, and the build flow for each

The FIRST decision the architect (`kf-architect`) makes for every entity is **which flow type**. It's a
data-modeling decision (not a UX one), driven by the entity's *workflow shape*.

## The decision (ask in this order)
1. **Does it just hold data / feed a dropdown?**
   - Reference option list (Country, Category, Status list) → **Dataset / List** (`buildList`).
2. **Does it have a workflow (does the record move through stages)?** — If NO → **Dataform / Form**
   (`FlowType:"Form"`, `buildForm`). A plain record with fields, no routing (a master, a config, a log).
3. **If it HAS a workflow — is the workflow STRUCTURED or UNSTRUCTURED?**
   - **STRUCTURED** — the system routes it through a fixed sequence of steps, each owned by a role, with
     approvals / send-backs / SLAs. The path is deterministic ("submitted → manager approval → finance →
     done"). → **PROCESS** (`FlowType:"Process"`, `buildForm` + `addWorkflow`).
   - **UNSTRUCTURED** — a person moves each item between statuses freely; there's no enforced routing, the
     columns are just states of work. Todos, tasks, projects, pipelines, AND case management (service
     requests, support tickets, onboarding, complaints). → **BOARD** (Kissflow Case, `FlowType:"Case"`,
     `buildBoard`).

Signals for BOARD over PROCESS: "kanban", "pipeline", "track", "tickets", "requests", "backlog",
"drag between columns", "assign and pick up", "no fixed approval chain". Signals for PROCESS: "approve",
"review then", "route to", "sign-off", "SLA", "step 1 … step 2".

| | Dataset/List | Form/Dataform | **Process** | **Board (Case)** |
|---|---|---|---|---|
| workflow | none | none | **structured** (routed steps) | **unstructured** (user-moved statuses) |
| FlowType | List | `Form` | `Process` | `Case` |
| routing owner | — | — | the system (routed steps) | the user (statuses) |
| surfaced as | select/reference source | table / form | My Items / My Tasks queues | Kanban board |

## Build flow — PROCESS (what the engine does from the spec)
1. Creates the process shell.
2. Builds the model — fields + layout (+ child tables, references, computed) — and the workflow: start →
   the steps you declared, each with its actor role and per-field permissions → end. Publishes.
3. Permissions (per role × model), pages (worklist / dashboard), automations.

## Build flow — BOARD (Case) — the 7 live steps
1. **Case shell** with its name, description, prefix and item type.
2. **Form**: the fields onto the case model (keeping the default Summary/Description/Attachment) → publish.
3. **Board steps**: your statuses become the columns (each may move to any other) over the four system
   swimlanes → publish.
4. **Kanban view** on the case.
5. **Grant case members** for the app roles
   — WITHOUT THIS the board's views are hidden from the runtime ("board view not found").
6. **Page** shell + graft the Kanban component (+ optional New-item button + create-form popup).
7. Publish. Seed items through `/author-seed` (`Summary` is required on every case item).

Flow-type classification is also in `reference/CONCEPTS.md`. The engine builds the board and its Kanban
page from the spec's `statuses` and page cards.
