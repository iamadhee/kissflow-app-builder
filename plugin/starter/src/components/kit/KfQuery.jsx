import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKf } from "@kissflow/app-ui";

// Server state, handled once instead of in every widget.
//
// The pattern the generator writes is useEffect + useState + a `loading` flag, per widget. Six
// widgets on a page means six copies of it, six independent fetches of overlapping data, and six
// places where nobody handled the error branch — so a failure shows an empty card rather than a
// message. It also refetches everything on every mount, which is why returning to a tab re-hammers
// the API.
//
// This is not a widget. It is the thing that makes the others honest about loading and failing.

/**
 * Defaults chosen for a business dashboard, not a chat app:
 *  - 30s stale window: moving between pages should not refetch a report that was just fetched.
 *  - no refetch on window focus: alt-tabbing back must not restart every query on the screen.
 *  - one retry: a real outage should surface quickly, not after four exponential backoffs.
 */
export const kfQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

/** Wrap the app once, in main.jsx or the page root. */
export function KfQueryProvider({ children, client = kfQueryClient }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * Items from a Kissflow model, cached and shared.
 *
 * Two widgets asking for the same flow fetch ONCE — the key is what dedupes them, so it must
 * describe the request completely. Passing an unstable object (a fresh {} each render) as part of
 * `params` defeats it silently: the key changes every render and the fetch never stops.
 */
export function useKfItems({ flowType, flowId, params, enabled = true, select }) {
  const kf = useKf();   // the same handle every other kf component uses — not a global reach-around
  return useQuery({
    queryKey: ["kf", flowType, flowId, params ?? null],
    enabled: Boolean(kf?.app && flowType && flowId) && enabled,
    select,
    queryFn: async () => {
      // Case is getBoard, NOT getCase — see DataTable.jsx, which is the accessor map everything else
      // in the kit follows. Guessing the symmetrical name gives a runtime "not a function".
      const t = String(flowType).toLowerCase();
      const model = t === "process" ? kf.app.getProcess(flowId)
        : t === "case" || t === "board" ? kf.app.getBoard(flowId)
        : t === "dataset" ? kf.app.getDataset(flowId)
        : kf.app.getDataform(flowId);
      const res = await model.getItems(params);
      return res?.Data ?? res?.data ?? res ?? [];
    },
  });
}

/** Invalidate after a write so the affected lists refetch and the screen stops lying. */
export function useKfInvalidate() {
  const qc = useQueryClient();
  return (flowType, flowId) => qc.invalidateQueries({ queryKey: ["kf", flowType, flowId].filter(Boolean) });
}

export { useQuery, useMutation, useQueryClient };
