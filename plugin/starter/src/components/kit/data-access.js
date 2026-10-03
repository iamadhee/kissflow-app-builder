// Bounded, explicit pagination and identity-isolated in-flight request sharing.
// No long-lived data cache: after a request settles, the next read hits the SDK.
const inFlight = new WeakMap();
export function shareRead(kf, key, load) {
  let requests = inFlight.get(kf);
  if (!requests) { requests = new Map(); inFlight.set(kf, requests); }
  const identity = JSON.stringify([kf.user?._id, kf.user?.AppRoles, key]);
  if (requests.has(identity)) return requests.get(identity);
  const task = Promise.resolve().then(load);
  requests.set(identity, task);
  task.finally(() => { if (requests.get(identity) === task) requests.delete(identity); }).catch(() => {});
  return task;
}
export function invalidateReads(kf) { inFlight.delete(kf); }

export async function readAllPages(read, { pageSize = 100, maxPages = 100, ...query } = {}) {
  if (!Number.isInteger(pageSize) || pageSize < 1 || !Number.isInteger(maxPages) || maxPages < 1)
    throw new Error('PAGINATION_OPTIONS_INVALID');
  const rows = [], seen = new Set(); let columns = [];
  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
    const response = await read({ ...query, pageNumber, pageSize });
    const data = response?.Data ?? response?.items;
    if (!Array.isArray(data)) throw new Error('PAGINATION_RESPONSE_INVALID: expected Data or items');
    if (response.Columns?.length) columns = response.Columns;
    let added = 0;
    for (const row of data) {
      if (!row?._id) throw new Error('PAGINATION_RECORD_ID_MISSING');
      if (!seen.has(row._id)) { seen.add(row._id); rows.push(row); added++; }
    }
    const total = response.count ?? response.total;
    if (typeof total === 'number' ? rows.length >= total : data.length < pageSize)
      return { Data: rows, Columns: columns, total: rows.length, complete: true };
    if (!added) throw new Error('PAGINATION_STALLED: endpoint repeated a page or omitted records before total');
  }
  throw new Error('PAGINATION_LIMIT: narrow the query or request a paged view; partial data is not a complete dashboard');
}
