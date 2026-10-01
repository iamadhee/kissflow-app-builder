# Typed foundation acceptance, version 1

The same compiler serves every provider. It does not replace a provider's research, theme
selection, custom React, business-intent review or visual certification. Express's composition path
is unchanged. New `reserve` output is version 2 with `acceptanceRequired: true`; older reservation
contracts remain readable and are not silently migrated/reset.

## Boundaries

1. Agents author isolated drafts. `validate` checks their syntax/types and currently available
   dependencies. Missing owners are pending, not guessed identities. Receipts are caches, not authority.
2. The conductor persists drafts in the graph with separate graph receipts. Persistence never means
   foundation acceptance. Reviewers receive the same canonical owner model in `review-input.json`.
3. The existing seed specialist writes `foundation-patches/journeys.json`. The conductor commits that
   payload as the `journeys` slice after the worker finishes. No extra agent is needed.
4. `ir-graph-cli.mjs accept-foundation --base-revision N` recompiles and replays under the graph store's
   lock/transaction. Any failure leaves the head unchanged. Metadata cannot self-assert acceptance.
5. `ir-graph-cli.mjs materialize --accepted --out "$KF_RUN_DIR/app-spec.json"` fetches the exact accepted
   revision and its proof. Both new-contract Comprehensive UI entry points require this proof.
   A changed foundation (including domain intent) creates a draft; the historical accepted revision
   is preserved. Progress-only writes retain proof when both input and compiler digests are identical.

## Executable journeys

### Author and test together (both providers)

Creation authority is compiler-enforced at the owner handoff, independently of automation failures.
For processes the shared emitter/replay contract treats the first ordered step as StartEvent and
requires `security.roles[roleId].flows[flowId].initiator === true`; `Act`, `Create`, `Manage`, and
`satisfiability.initiators` do not grant it. If creation and the first operational task have different
owners, author a separate creator-owned start followed by that task, preserving both authorities.
An informational initiator summary must match executable grants and start ownership. Only the
adapter's declared `recordScopes` can be proved; a narrower unsupported scope remains a capability
blocker, never an invitation to broaden access. These checks run before seed and UI generation.

Starter tests are checked at authoring time: use `steps[]` with role/step/input and exact
`expect.error` codes for denials, never prose `actions[]` or `denied:true`. Later replay is still
mandatory; an accepted envelope is not execution evidence.

Workflow writes executable starter tests in `workflow.journey_scenarios` with its actions, using
the scenario shape below. Security validates against these exact steps, actors and inputs as soon
as dependencies arrive. Seed preserves the starter tests in the canonical journey suite and extends
positive/negative, decision-branch, missing-evidence and multi-record coverage. Final acceptance
rejects omitted or silently changed starter tests. Existing contracts without starter tests remain
compatible, but still require the full canonical execution suite.

On decision tasks, `outcome_field` names the enumerated data field whose values need successful
asserted journeys. `evidence_fields` names supporting fields that must be Mandatory on that action;
each needs a negative test reaching the action with an authorized role but without that evidence.
These markers assert intent against real permissions and execution; they do not synthesize routing.

`foundation-patches.mjs validate` writes `foundation-patches/preflight.json` and embeds it in the
receipt. Missing dependency owners are waiting, not a false PASS. Executable action failures are
returned to Workflow/Security before handoff. Preflight never accepts a graph or spends repair budget.
The same source-derived report is shown in the progress panel, with exact codes, paths, owners and
expected/actual execution results. It updates in place, not as another agent.

Diagnostics separate invalid business logic, missing execution evidence, unsupported capabilities,
and host-contract failures. Unsupported adapters do not consume business repair waves. Retain original
controls and implement the adapter; do not repeat model rewrites to satisfy an incapable verifier.
Passing scenario evidence is cached only in the host process, keyed by compiler bytes and connected
data/workflow/security/handoff dependencies. Changed neighborhoods replay; global coverage and joins
always recheck. Authored receipts are never trusted as cached execution proof.

The minimal shape is:

```json
{
  "version": 1,
  "scenarios": [{
    "id": "approved-expense",
    "flow": "expense",
    "steps": [
      {"step": "submit", "role": "employee", "input": {"amount": 42}},
      {"step": "review", "role": "manager", "input": {"decision": "Approved"}}
    ],
    "expect": {"terminal": true, "record": {"total": 84}}
  }]
}
```

IDs must join the actual application. The native sequence must also contain a final automatic end
event after `review`; it is not an editable approval task. Add a negative scenario for each process,
for example the employee attempting the manager step and expecting `SCENARIO_ROLE_DENIED`.
Each step must be reached, each guarded step must exercise true/false, and each automation must be
exercised including its false condition where applicable. Assertions are executed, not agent verdicts.

`references` may supply non-process fixture rows as `{flowId:[{id,fields:{fieldId:value}}]}`. Process
records are created by scenario execution, not injected with completed statuses. Passing positive
scenarios return their resulting seed records and traces; negative scenarios do not emit seed.
This is evidence for reachable records, **not** automatic replacement of the existing prototype
seed dataset. Its separate relevance, binding-coverage and visual checks still apply.

### Multi-record journeys

Human-owned handoffs use an explicit process creation attempt in the **same** scenario:

```json
{"action":"create","flow":"custody","recordId":"custody-001","step":"release-start","role":"coordinator","input":{"booking":"booking-approved"}}
```

`booking-approved` must already exist from executed actions. `recordId` is a new exact identity,
not an existing fixture or a guessed automation identity. This operation executes the actual
StartEvent, checks its owner, explicit initiator grant, editable/mandatory fields and references,
then leaves the new instance at its next executable task. Scoped flows also require `user` and
`scenario.users` membership. Subsequent actions select this `flow` + `recordId`; assert its outcome
in `expect.records[]`. Duplicate IDs, skipping the start and uncreated references fail. This
operation supports Process records, not arbitrary Case or reference-data creation. Do not replace
a human-owned handoff with automation merely to make the runner accept it.

References to an executed parent's child row use the deterministic replay identity
`<parentRecordId>:<childTableId>:<zeroBasedRowIndex>`. The row must have been supplied through an
authorized parent action; it cannot be seeded independently. These are local replay selectors,
not native server IDs. Deleting a child row removes its lookup target.

Completion-triggered creates can hand off into another process or case. Each instance has its own
workflow state, grants, fields and event history. A create supplies data; it does **not** automatically
submit the process, grant the initiator permission, or prove a live connector deployment. Explicitly
exercise the next workflow's start/create action using its authorized role, then its downstream tasks.

Use `flow` and `recordId` on a step to select a created instance. Without those selectors, a step
targets the root `scenario.flow` / `scenario.id`. Created IDs are exactly
`<sourceRecordId>:<automationId>`; chained creates extend that identity. `_id` in a handoff expression
is the current source instance ID, not always the root. Do not guess IDs or inject workflow fixtures.

For example, after `booking-approved` reaches the end event and automation `open-custody` creates
the custody record, continue the **same** scenario with:

```json
{
  "steps": [
    {"flow": "custody", "recordId": "booking-approved:open-custody", "step": "release-start", "role": "technician"},
    {"flow": "custody", "recordId": "booking-approved:open-custody", "step": "receive-return", "role": "technician"}
  ],
  "expect": {
    "terminal": true,
    "records": [{"flow": "custody", "recordId": "booking-approved:open-custody", "terminal": true, "record": {"booking": "booking-approved"}}]
  }
}
```

These steps extend the root booking actions; they are not a standalone fixture. `expect.terminal`,
`expect.status` and `expect.record` still assert the root. Every created workflow instance must also
have an executed, explicit outcome in `expect.records[]`; data creation alone cannot pass handoff
verification. Partial states may be asserted, but all existing step/guard/automation coverage gates
still apply. The replay is bounded to 100 attempts and 100 workflow instances per scenario.

For downstream negative scenarios, set `expect.errorFlow` to the denied flow and optionally
`expect.errorRecordId` to its exact instance. Otherwise the expected denial applies only to the root.
A downstream permission failure must not satisfy a missing root permission test (or vice versa).
Negative scenarios never emit seed. Unknown selectors and missing assertions are verifier failures,
not acceptable business denials. Automation updates of active workflow records remain unsupported.
Repeated creates fail as unproven idempotency; successful handoff replay does **not** certify
duplicate-event protection. Integrations remain deferred build artifacts until separately published
and verified against the live adapter.

## Capability limits and extension discipline

Always read `foundation-patches/capabilities.json`.
The manifest distinguishes legacy parser functions, verified type signatures, and replay functions.
The replay adapter supports ordered sequences, guarded user tasks, one-level parallel fork/all-join,
explicit all-record initiate/Act grants, field permissions, typed child-table inputs/aggregates,
reference fixtures/GETVALUE, deterministic scalar expressions and completion-triggered create/update data
handoffs, plus multi-record workflow creates with explicit human initiation and continuation.
EndEvent completion and whole-process completion (`source.on` absent) execute automatically.
Missing referenced records are failures, not null-looking successful lookups. It does not prove real
external service behavior or connector publication fidelity.

For parallel tasks, author each actual branch task in `steps` (either interleaving is permitted).
Do not submit the fork or end event as a user task. Both arms must finish before the next parent task.
Guard conditions are evaluated when a task becomes eligible, once per activation.

Case scenarios use `{action:"create",role,input}` followed by `{status:"exact-status-id",role,input}`;
assert `expect.status` and/or `expect.terminal`. Closed is a status category, not an irreversible lock.
Explicit `transitions` are a closed allowlist, including an empty array; absent transitions retain
the unstructured board behavior. Exercise every authored status and explicit edge, plus a denied
role or edge. Current proof covers flow-wide case edit/view grants, not status-specific field or
actor policies which still need their native publisher.

`steps[].input` may contain `{childTableId:[{fieldId:value}]}`. Calculated child fields are read-only;
replay derives them before rollups. Reference fixtures may not pre-insert process or case records.
`TODAY()`, `NOW()` and `_completed_at` require an explicit ISO `clock` on the scenario, for example
`"2026-09-07T10:00:00Z"`; acceptance never depends on the server's current wall clock.

Native reference access is `GETVALUE(reference, "field-id")`. `GET` is a list-index operation,
not a reference alias. Legacy-parsable names such as POWER, SQRT, LEFT and RIGHT do not have a
verified native/replay adapter here and cannot pass acceptance. Native arithmetic comparison dispatch
uses the operand type, not Boolean (the result type); NOT uses Boolean and ISBLANK uses its operand
type. AND/OR are emitted as binary trees. Numeric rounding follows native ties-to-even without
precision and decimal half-up with explicit precision. Zero-only MIN/MAX/AVERAGE and empty-string
LENGTH/case conversion return null, as the native functions do. Invalid numeric domains are rejected
conservatively, rather than converted into apparently valid business values.

For opt-in scalar source conformance (no live publish or service calls):

```bash
KF_TEST_KISSFLOW_SOURCE=<platform source checkout> node --test plugins/app-agents/engine/test/native-expression-conformance.test.mjs
```

This compares 18 scalar cases to actual native Python definitions. It does not certify all native
runtime coercions, timezone settings, Currency objects, or external connector behavior.

Nested parallel execution, tenant/team predicate evaluation, scheduled/external triggers, automation
updates of active workflows, duplicate-event protection, status-specific case policies and some native functions still need adapters.
The native process adapter supports `scope: "participating"`: authenticated creator, current assignee,
or prior actor. Security must explicitly choose that union and provide `initiator: true|false`.
Non-initiators receive access from native AppRole task resources, not process Member (which implicitly
grants initiation). No report-wide grants are emitted. Existing broader process/report access causes a
deployment conflict, rather than silently preserving it or revoking unrelated access. Grant/report
read-back is mandatory; the receipt explicitly distinguishes this from a live authenticated-user probe.
The SDK reader unions paginated created/assigned/acted lists and never falls back to admin on empty/error.
Replays require explicit scenario user/role identities and both read allow/deny coverage per scoped
role/flow; writes still require the current executable assignment and field grants. Native role grants
are additive: a user also holding an unrestricted role is not isolated by switching the navigation role.
Preview seed rows need native identity metadata; absent ownership is not treated as "mine". The simple
offline step-name simulator clears assignment after an action because it cannot invent the next native
assignee; it is not the source of foundation security proof. Dev API-key proxy use cannot prove end-user
isolation. A deployed-app non-admin identity probe is still required to certify its effective access.
Legacy `my` is deliberately not auto-rewritten: creator-only, assigned-only, team and tenant predicates
are not equivalent to participation. These produce explicit unsupported findings;
do not widen permissions, simplify policy, mark PASS, or remove business scope to get past them.
The combined repair command refuses to consume the business repair wave on explicit missing-adapter,
unsupported-scope or unproven-idempotency findings. Implement that engine capability and re-review first.
Outcome labels never create routing; arbitrary loops/outcome edges need an implemented native adapter.
Keep research drafts while blocked, but do not present the candidate as accepted.

To extend: add the typed signature and bounded evaluator/scheduler, compare against actual emitted
Kissflow metadata, add successful/negative/cross-role fixtures, then update the capability manifest.
Do not add prose exceptions to bypass a failed compiler/scenario check.

## Offline replay and performance

Run `pnpm test:foundation` from the repository root for the isolated compiler, acceptance, API and
provider-boundary regressions. No app generation or external provider is started by this command.

```bash
node "$CLAUDE_PLUGIN_ROOT/bin/kf.mjs" foundation-patches review runs/current
```

This reads snapshots only. It makes no provider calls, graph writes, budget resets or live API calls.
It reports cold/warm compiler timings, fresh/reused units, exact findings and scenario evidence.
Cache entries are bounded, host-owned, and bound to compiler/emitter bytes and dependency inputs.
Global security joins are always checked. Data dependencies are intentionally conservative; a model
change can invalidate several units. Do not claim every neighborhood is independently cached yet.

These timings are deterministic-check latency, not LLM generation time. The semantic reviewers still
check business policy and intent. A fresh full app benchmark is required before claiming a reduction
in end-to-end generation time.
