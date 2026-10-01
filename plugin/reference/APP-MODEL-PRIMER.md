# Kissflow app model primer

What a Kissflow app can express, in the vocabulary the engine accepts. Agents design in this
vocabulary and write it to the App-Spec; the engine compiles it into platform metadata. Nothing here
requires knowing how the platform stores metadata. `CONCEPTS.md` says what each object means;
this file says what shapes are valid and which rules the platform enforces.

## 1. An app, top to bottom

| Level | App-Spec key | What it is |
|---|---|---|
| App | `app` | Name, id, description. |
| Personas and journeys | `personas[]`, `journeys[]` | Who uses the app and what they set out to do. Every persona maps to a role and a landing page. |
| Roles | `roles[]` | The access-control units. Everything below is gated by role name. |
| Lists | `lists[]` | Named option sets (`{name, items[]}`) that Select fields draw from. |
| Flows | `forms[]` | Every record type. `flowType` is `Form`, `Process`, `Case` or `Dataset` (defaults to Form). |
| Child tables | `childTables[]` | A repeating table inside a parent record (`{parent, child, field}`), where `child` is a flow tagged `childOf`. |
| Workflow | `forms[].workflow.steps[]` or a top-level `workflow{flow, steps}` | The steps a Process routes a record through. |
| Statuses | `forms[].statuses[]` | The columns of a Case board. |
| Permissions | `permissions[]` | Which role can do what on which flow or list, and with which data scope. |
| Automations | `automations[]` | Cross-flow stitches: when something happens on one flow, create, update or notify on another. |
| Pages and nav | `pages[]`, `nav` | Role-specific landings composed of cards and widgets bound to flows. |

Build in this order: roles, lists and masters, forms, processes and cases, permissions, pages. A
referenced flow must be defined before the flow that references it.

## 2. Choosing a flow type

- **Form** holds one record type with no routing. Masters (vendors, assets, catalogues) are forms.
- **Process** routes a record between roles through named steps: submit, approve, fulfil. Work that
  is handed from one role to another is a Process. A Process with no steps is an error; if the domain
  talks about approvals, reviews or sign-off and nothing is a Process, the gate fails.
- **Case** tracks a record through statuses that someone sets on their own record: a board. A Case
  has no steps; its statuses are its workflow. It needs at least two statuses, none duplicated.
- **Dataset** is a richer table used as a master for lookups when a simple list is not enough.

Rule of thumb: status transitions a person performs on their own item is a Case; work moving
between roles is a Process. `PROCESS-VS-BOARD.md` has the decision tree.

## 3. Fields

A field is `{name, type, required?, section?, width?, ...}`. Types the engine accepts:

`Text`, `Textarea`, `Number`, `Currency`, `Date`, `DateTime`, `Select`, `Multiselect`, `Boolean`,
`Checkbox`, `Checklist`, `Reference`, `User`, `Attachment`, `Image`, `Email`, `Signature`, `Slider`,
`StarRating`, `SequenceNumber`, `Geolocation`, `Table`.

Rules the platform enforces, and the engine checks before anything is built:

- **System fields are never authored.** Every record already has `Name`, `_id`, created and
  modified stamps, status and current step. Do not add fields with those names.
- **Select needs a list.** `{type: "Select", referredList: "<list name>"}` where the list exists in
  `lists[]`, or the field carries its own `options[]`. A Select with neither binds to an empty list
  and can never be set.
- **Reference needs a target that exists.** `{type: "Reference", ref: "<flow or list>", lookup: [{name, type}]}`.
  `lookup` names the target's fields shown alongside the reference. The target must be defined
  earlier in the spec.
- **Currency carries a currency.** `{type: "Currency", currency: "USD"}`.
- **Width is an integer 1 to 6.** Six is a full row. Strings such as "half" break the layout.
- **Field names must slug uniquely.** Two names that reduce to the same id replace each other.
- **SequenceNumber belongs on a Form or Process, never on a Case.** Cases already carry an id, and
  a SequenceNumber on a Case strips every custom field at publish time on many plans.
- **Sections group fields.** `section` on a field, or `section` on the flow as the default. A step
  permission keyed on a section cascades to every field in it, so never give a section a field's name.

## 4. Formulas

A field with `formula` is computed. Formulas are arithmetic and functions over fields on the same
record, with two extensions:

- `Other_Flow.Field` reads a field through a Reference on this record, for example `Item.Unit_Price`.
- `sum(Child_Table.Field)` aggregates a child table into the parent, for example
  `sum(Line_Items.Line_Total)`. `count`, `avg`, `min` and `max` work the same way.

Functions include `IF`, `AND`, `OR`, `NOT`, `CONCATENATE`, `ROUND`, `DATEDIFF`, `TODAY`, `NOW`.
Field names inside formulas use underscores for spaces. A Text field whose formula is a comparison
is an error: use a Boolean field, or wrap the comparison in an `IF` that returns text.

Formulas are the right tool for math inside one record. Values derived across flows are automations.

## 5. Process steps

```json
"workflow": { "flow": "Purchase Order", "steps": [
  { "name": "Submit", "actor": "Requester" },
  { "name": "Manager Approval", "actor": "Approving Manager", "decision": ["Approve", "Reject"],
    "field_permissions": { "Amount": "ReadOnly", "Approval Notes": "Mandatory" } },
  { "name": "Finance Processing", "actor": "Finance", "condition": "Amount > 5000" },
  { "name": "Issued", "actor": "system" }
]}
```

- `actor` is a role name, or `system` for an automatic step.
- `decision[]` names the outcomes a step offers. Reject and send-back with a mandatory comment are
  built into every step; do not model them as extra steps or terminals.
- `field_permissions` sets a level per field, section or child table for that step:
  `Editable`, `ReadOnly`, `Hidden` or `Mandatory`. Keys must name something on the flow.
- `condition` is a formula that gates a middle step. A false condition skips the step.
- `branches: [{name, steps: [...]}, ...]` forks a middle step into two or more parallel arms that
  rejoin at the next step. Write the arms as structure; a step whose name says "parallel" but has no
  branches is an error.
- First and last steps take neither a condition nor branches.

**Published Processes and Cases cannot be edited afterwards.** Forms can. This is why the plan is
reviewed before anything is generated.

## 6. Case statuses

```json
"statuses": [
  { "name": "Open", "category": "NotStarted" },
  { "name": "In Progress", "category": "InProgress" },
  { "name": "Resolved", "category": "Done" }
]
```

Statuses are the board's columns. Moving a card is a transition. `category` is one of
`NotStarted`, `InProgress`, `Done`, `Closed` or `ReOpened`; it tells the board which columns count as
open work. Per-status field visibility is expressed through permissions (section 7) keyed by status.

## 7. Permissions and data scope

```json
"permissions": [
  { "role": "Requester", "model": "Purchase Order", "level": "Editable", "scope": "my-items" },
  { "role": "Finance",   "model": "Purchase Order", "level": "ReadOnly", "scope": "all" },
  { "role": "Admin",     "model": "Vendor",         "level": "Editable", "scope": "all" }
]
```

- `model` is a flow or a list. A role with no permission on a flow cannot see it at all, and a flow
  no role can reach is flagged.
- `level` is `Editable` or `ReadOnly` for a flow permission. `Hidden` exists at field, step and status
  level.
- `scope` narrows what the role sees: `my-items` (records they raised), `my-team` (records raised by
  people they manage), or `all`.
- A process step's `actor` gets the step's work automatically. A role that only views a Process
  needs a `ReadOnly` permission; a role that raises items needs `Editable`.
- Field-level, step-level and status-level visibility all reduce to the same four levels. `Hidden`
  wins where levels overlap.

## 8. Automations

```json
"automations": [{
  "id": "po-issued-creates-receipt",
  "source": { "flow": "Purchase Order", "event": "completed" },
  "action": { "type": "create", "target_flow": "Goods Receipt",
              "field_map": { "PO": "_id", "Vendor": "Vendor", "Expected": "Required_By" } }
}]
```

- `action.type` is `create`, `update` or `notify`.
- `field_map` keys are target fields; values are source fields, quoted literals, or expressions.
- Mark an automation `manual: true` when a person does it in-app, or `external: true` when an
  outside system does. Neither is compiled.
- A flow should not stitch to itself, and every source and target flow must exist.

## 9. Pages

```json
"pages": [{
  "name": "Manager Home", "role": "Approving Manager",
  "cards": [
    { "label": "Awaiting My Approval", "view": "list", "flow": "Purchase Order", "scope": "my-team" },
    { "label": "Team Spend This Month", "view": "kpi", "flow": "Purchase Order", "metric": "sum:Total_Amount", "scope": "my-team" }
  ]
}]
```

A page belongs to one role and composes cards bound to that role's flows. A card has a `view`
(`kpi`, `list` or `chart`), a `flow`, a `scope` the role is permitted, and for a KPI a `metric`
(`count` or `sum:<Field>`). A card bound to a flow the role cannot see is inert, and the gate says so.
Every persona needs a landing page. Native pages are compiled by the engine from this shape;
custom React pages are designed separately from the Experience Spec (`EXPERIENCE-SPEC.md`).

## 10. Things that look valid and are not

- An app where every entity is a Form and nothing routes work, while the requirement talks about
  approvals.
- A Case with one status, or none.
- A Select with no list. A Reference to a flow defined later in the spec.
- A permission naming a role or model that does not exist.
- A page card for a role that has no permission on the underlying flow.
- Field permissions keyed on a name that is both a field and a section.
