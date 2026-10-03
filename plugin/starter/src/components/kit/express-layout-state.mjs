// Pure state/data rules shared by the renderer and its regression tests.
export function resolveRecordSelection(rows, selectedId) {
  return rows.find((row) => String(row._id) === String(selectedId)) || rows[0] || null;
}

export function remainingPaneHeight(top, bottom, padding = 24) {
  return Math.max(240, Math.floor(bottom - top - padding));
}

export function supportsRecordTrend(op = 'count') {
  return op === 'count' || op === 'sum';
}

export function orderedGroups(entries, order = []) {
  const ranks = new Map(order.map((step, index) => [typeof step === 'string' ? step : step.label, index]));
  return [...entries].sort((a, b) => (ranks.get(a[0]) ?? Infinity) - (ranks.get(b[0]) ?? Infinity));
}

export function summarizeRecords(rows, { labelOf, readValue, timeOf, op, limit }) {
  const buckets = new Map();
  for (const row of rows) {
    const label = labelOf(row);
    const rawTime = timeOf?.(row);
    const time = Number.isFinite(rawTime) ? rawTime : undefined;
    const key = Number.isFinite(time) ? time : label;
    const bucket = buckets.get(key) || { label, values: [], time };
    bucket.values.push(readValue ? Number(readValue(row)) || 0 : 1);
    buckets.set(key, bucket);
  }
  const groups = [...buckets.values()];
  if (timeOf) groups.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
  return groups.slice(0, limit > 0 ? limit : undefined).map(({ label, values }) => ({
    label,
    value: values.reduce((sum, value) => sum + value, 0) / (op === 'avg' ? values.length : 1),
  }));
}
