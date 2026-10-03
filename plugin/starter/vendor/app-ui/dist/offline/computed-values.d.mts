export function computedContract(field: any): {
    aggregate?: any;
    readOnly?: boolean | undefined;
    formula?: any;
    formulaAst?: any;
};
/** Return detached, fully derived rows. Failure never partially mutates the input store. */
export function deriveRecords(models: any, store: any, { clock, strict }?: {
    clock?: string | undefined;
    strict?: boolean | undefined;
}): Map<any, any>;
export function isComputed(f: any): boolean;
