// Shared SDK read boundary. Native endpoints enforce identities; navigation personas do not.
export function effectiveRecordScope(schema, kf, flowId) {
  const model = schema?.dataModels?.find(m => m.id === flowId);
  if (!model?.roleAccess?.some(g => g.scope && !["all", "all-items"].includes(g.scope))) return "all";
  const roles = kf?.user?.AppRoles;
  if (!kf?.user?._id || !Array.isArray(roles)) throw new Error("RECORD_SCOPE_IDENTITY_REQUIRED: authenticated user roles unavailable");
  const ids = new Set(roles.map(r => typeof r === "string" ? r : r._id || r.id));
  const grants = model.roleAccess.filter(g => ids.has(g.id));
  if (!grants.length) throw new Error("RECORD_SCOPE_DENIED: no authenticated role grant");
  if (grants.some(g => !g.scope || ["all", "all-items"].includes(g.scope))) return "all";
  if (grants.some(g => g.scope !== "participating")) throw new Error("RECORD_SCOPE_UNSUPPORTED: no native adapter for the authored scope");
  return "participating";
}

export async function fetchParticipatingRows(handle) {
  const methods = ["getMyItems", "getMyTasksItems", "getParticipatedItems"];
  // All three are needed: created-only or acted-only misses an assigned technician's queue.
  for (const method of methods) if (typeof handle?.[method] !== "function")
    throw new Error(`RECORD_SCOPE_API_UNAVAILABLE: ${method}; no admin/report fallback is permitted`);
  const results = await Promise.all(methods.map(async method => {
    const rows = [], seen = new Set(); let columns = [];
    for (let pageNumber = 1; pageNumber <= 500; pageNumber++) {
      const response = await handle[method]({ pageNumber, pageSize: 100, ...(method === "getMyItems" ? { status: "all" } : {}) });
      const data = response?.Data ?? response?.items;
      if (!Array.isArray(data)) throw new Error(`RECORD_SCOPE_RESPONSE_INVALID: ${method}`);
      columns = response.Columns ?? columns;
      let added = 0;
      for (const row of data) {
        if (!row?._id) throw new Error(`RECORD_SCOPE_RESPONSE_INVALID: ${method} returned a record without identity`);
        if (!seen.has(row._id)) { seen.add(row._id); rows.push(row); added++; }
      }
      const total = response.count ?? response.total;
      if (typeof total === "number" ? rows.length >= total : data.length < 100) return { rows, columns };
      if (!added) throw new Error(`RECORD_SCOPE_PAGINATION_STALLED: ${method}`);
    }
    throw new Error(`RECORD_SCOPE_PAGINATION_LIMIT: ${method}`);
  }));
  return { Data: [...new Map(results.flatMap(r => r.rows).map(row => [row._id, row])).values()],
    Columns: results.find(r => r.columns.length)?.columns ?? [] };
}
