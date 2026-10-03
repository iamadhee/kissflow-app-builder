export function validateActionGuards(guards: any): any;
/** readRelated(flow,id) must read from the SAME authoritative transaction as the transition.
 * No caller-provided embedded evidence, query fallback, or async check-then-write is accepted. */
export function assertActionGuards(guards: any, { action, record, readRelated }: {
    action: any;
    record: any;
    readRelated: any;
}): void;
export function classifyActionGuard(g: any): {
    id: any;
    actions: any;
    when: any;
    crossRecord: any;
    present: any;
    eq: any;
};
/** Lower same-record guards onto their steps and refuse the rest. MUTATES `input` (`present` becomes
 * Mandatory at the step). Returns the residuals: what the native form does not hold, named so the
 * release can record them. Throws ACTION_GUARD_DEPLOYMENT_UNSUPPORTED for a guard that reads another
 * record, or for a cross-record forecast with no guard written to judge it by. */
export function lowerNativeActionGuards(input: any): {
    guard: string;
    kind: string;
    field: any;
    detail: string;
}[];
/** Refuse what no native adapter holds, before anything is created. Lowers a copy; the input is untouched. */
export function assertNativeActionGuardsSupported(input: any): void;
export const ACTION_GUARD_CAPABILITIES: Readonly<{
    version: 1;
    replay: true;
    offline: true;
    kissflow: false;
}>;
