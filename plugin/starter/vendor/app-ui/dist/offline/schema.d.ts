/**
 * Shape of `lib/kf-schema.json` as written by the `kf-sync` CLI. Used to seed the
 * offline mock so the app runs and is testable outside the Kissflow iframe.
 */
export interface KfSchemaField {
    id: string;
    name: string;
    type: string;
    required: boolean;
    /** Resolved list choices from the compiler, not a text-field fallback. */
    options?: Array<string | {
        value?: string;
        label?: string;
        Id?: string;
        Name?: string;
    }>;
    /** Target flow NAME for a Reference field — lets the mock point at a row that exists. */
    ref?: string;
    formula?: string;
    formulaAst?: any;
    aggregate?: {
        over: string;
        field?: string;
        fn?: string;
        match?: {
            field: string;
            equals?: string;
        };
    };
    readOnly?: boolean;
}
/** A role that can access a model, and its permission (Delete, InitiateItems, …). */
export interface KfSchemaRoleAccess {
    id: string;
    name: string;
    permission: string[];
    /** Authored visibility; a dev navigation persona is not an authenticated user. */
    scope?: string;
    initiator?: boolean;
}
export interface KfSchemaModel {
    id: string;
    name: string;
    description?: string;
    /** "Process" | "Form" (dataform) | "Case" (board) */
    type: string;
    fields: KfSchemaField[];
    childOf?: string;
    tableLabel?: string;
    systemFields?: string[];
    /**
     * Workflow step names (Process) or status names (Case), in order. Supplied by `schema-from-ir`
     * from the IR's own workflow so the offline mock can ADVANCE an item when the page calls
     * `submitItem`/`rejectItem`/`sendbackItem`. Without it those calls are no-ops and a reviewer
     * clicking "Approve" in the prototype sees nothing move — which is how a decorative stub handler
     * passes review and only fails once live.
     */
    steps?: string[];
    /** Opt-in, compiler-owned local action enforcement. Never a native deployment claim. */
    guardedWriteRoles?: string[];
    actionPolicy?: Array<{
        id: string;
        name: string;
        terminal: boolean;
        unsupported: boolean;
        actors: string[];
        fields: Record<string, string>;
        initiating: boolean;
        action_guards: any[];
    }>;
    /** App roles that can access this model (from the builder's member config). */
    roleAccess?: KfSchemaRoleAccess[];
}
export interface KfSchemaRole {
    id: string;
    name: string;
    aliases?: string[];
    description?: string;
    userCount?: number;
}
export interface KfSchemaPageParam {
    id: string;
    name: string;
    dataType?: string;
    required?: boolean;
}
export interface KfSchemaPage {
    id: string;
    name: string;
    type: string;
    inputParameters?: KfSchemaPageParam[];
}
export interface KfSchema {
    app: {
        id: string;
        domain?: string;
        accountId?: string;
    };
    generatedAt?: string;
    /** Frozen preview clock, shared with the rendered formula proof. */
    computationClock?: string;
    dataModels: KfSchemaModel[];
    roles: KfSchemaRole[];
    /** Fictional journey identities, used only by the offline preview; never live auth. */
    previewUsers?: Array<{
        id: string;
        name: string;
        roles: string[];
    }>;
    pages?: KfSchemaPage[];
    /**
     * Optional per-model rows for the offline mock, keyed by model id — the app's OWN domain data
     * ("Senior Backend Engineer", "Bengaluru") rather than the synthesized `Job Title 1` fallback.
     *
     * This is what lets a generated app be reviewed as a prototype before it exists in Kissflow: the
     * same React pages, the same SDK calls, the same components, only the rows are seeded. Rows are
     * keyed by FIELD ID and may include system fields (`_status`, `_request_number`, …); anything a
     * row omits receives a type-correct empty value, so a partial seed is safe without fabricating
     * domain facts (for example, an unbooked trip does not acquire a random booked cost).
     */
    seed?: Record<string, Array<Record<string, unknown>>>;
}
