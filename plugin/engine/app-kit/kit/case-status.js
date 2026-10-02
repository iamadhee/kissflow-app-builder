// case-status.js — pure helpers for Kissflow board (case) items: live status fields and actions.

// A live board item carries its status as _status_id / _status_name / _category. Pages (and the
// preview) read _current_step / _status, so fill those from the live fields without overwriting.
export function normaliseCaseRow(row) {
  if (!row || typeof row !== "object") return row;
  const name = row._status_name ?? row._status?.Name ?? (typeof row._status === "string" ? row._status : undefined);
  return { ...row, _current_step: row._current_step ?? name, _status: typeof row._status === "string" ? row._status : name };
}
export const normaliseCaseRows = (res) => ({ ...res, Data: (res?.Data || []).map(normaliseCaseRow) });

// Where a board item should go for an action. A status id or name moves there; approve/submit/next
// moves one status forward, sendback/back one back, reject to a status named like a rejection.
export function caseTarget(statuses, currentId, kind) {
  const live = statuses.filter((st) => !st.system);
  const k = String(kind || "approve").trim();
  const direct = live.find((st) => st.id === k || st.name.toLowerCase() === k.toLowerCase());
  if (direct) return direct;
  const at = live.findIndex((st) => st.id === currentId);
  const kl = k.toLowerCase();
  if (["approve", "submit", "next", "forward", "complete"].includes(kl)) return at >= 0 ? live[at + 1] : live[1];
  if (["sendback", "back", "previous"].includes(kl)) return at > 0 ? live[at - 1] : undefined;
  if (kl === "reject") return live.find((st) => /reject|declin|cancel/i.test(st.name));
  return undefined;
}

