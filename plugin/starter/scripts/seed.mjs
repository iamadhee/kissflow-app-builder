/**
 * Seed the connected Kissflow app with realistic demo data so the replicated UI
 * has something to show. Reads .env (same KF_* keys as kf-sync). DEV ONLY.
 *
 *   node scripts/seed.mjs            # seed the default model set
 *   node scripts/seed.mjs --wipe     # delete existing records first
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const env = Object.fromEntries(
  readFileSync(join(cwd, ".env"), "utf8")
    .split("\n").filter(Boolean).filter((l) => !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const { KF_DOMAIN, KF_ACCOUNT_ID, KF_APP_ID, KF_ACCESS_KEY_ID, KF_ACCESS_KEY_SECRET } = env;
const base = `https://${KF_DOMAIN}`, A = KF_ACCOUNT_ID, app = `_application_id=${KF_APP_ID}`;
const H = { "X-Access-Key-Id": KF_ACCESS_KEY_ID, "X-Access-Key-Secret": KF_ACCESS_KEY_SECRET, "Content-Type": "application/json", Accept: "application/json" };
const J = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const pick = (arr, i) => arr[i % arr.length];

const CITIES = ["Sydney", "Balmain", "Glebe", "Haymarket", "Darlinghurst", "Newtown", "Bondi", "Manly", "Parramatta", "Chatswood", "Surry Hills", "Pyrmont"];
const CATEGORIES = ["Apparel", "Grocery", "Electronics", "Footwear", "Home & Living", "Beauty"];
const PROJECT_STATUS = ["Shortlisted", "Under Review", "Finalized", "On Hold", "Dropped"];

function genValue(field, i) {
  const t = (field.type || "Text").toLowerCase();
  const n = (field.name || "").toLowerCase();
  if (t.includes("geolocation") || t.includes("attachment") || t.includes("image")) return undefined;
  if (t.includes("email")) return `store${i + 1}@retailco.com`;
  if (t.includes("currency")) return (Math.floor((i * 73 + 17) % 90) + 5) * 10000;
  if (t.includes("number")) return ((i * 37 + 11) % 950) + 50;
  if (t.includes("datetime")) return `2026-0${(i % 6) + 1}-${String(((i * 7) % 27) + 1).padStart(2, "0")}T10:30:00.000Z`;
  if (t.includes("date")) return `2026-0${(i % 6) + 1}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`;
  if (n.includes("status")) return pick(PROJECT_STATUS, i);
  if (n.includes("untitled")) return pick(PROJECT_STATUS, i); // Projects case uses this as status
  if (n.match(/name|title|summary|store/)) return `${pick(CITIES, i)} Store ${i + 1}`;
  if (n.match(/city|location|district|site/)) return pick(CITIES, i);
  if (n.match(/category|brand/)) return pick(CATEGORIES, i);
  if (n.match(/sku|code|id|number/)) return `RT-${1000 + i}`;
  if (n.match(/supplier|vendor/)) return `${pick(CATEGORIES, i)} Supplier ${i + 1}`;
  if (n.match(/phone|contact/)) return `+61 4${String(10000000 + i * 137).slice(0, 8)}`;
  return `${field.name} ${i + 1}`;
}

async function getFields(family, id) {
  const j = await J(await fetch(`${base}/${family}/2/${A}/${id}/fields?${app}`, { headers: H }));
  return (Array.isArray(j) ? j : []).filter((f) => !f.IsSystemField && !f.IsInternal);
}
const dataFor = (fields, i) => Object.fromEntries(fields.map((f) => [f.Id, genValue({ id: f.Id, name: f.Name, type: f.Type }, i)]).filter(([, v]) => v !== undefined));

async function seedForm(id, n) {
  const fields = await getFields("form", id);
  let ok = 0;
  for (let i = 0; i < n; i++) {
    const draft = await J(await fetch(`${base}/form/2/${A}/${id}?${app}`, { method: "POST", headers: H, body: JSON.stringify(dataFor(fields, i)) }));
    if (draft?._id) { const s = await fetch(`${base}/form/2/${A}/${id}/${draft._id}/submit?${app}`, { method: "POST", headers: H, body: "{}" }); if (s.ok) ok++; }
  }
  console.log(`  form ${id}: +${ok}/${n}`);
}
async function seedCase(id, n) {
  const fields = await getFields("case", id);
  let ok = 0;
  for (let i = 0; i < n; i++) {
    const r = await fetch(`${base}/case/2/${A}/${id}?${app}`, { method: "POST", headers: H, body: JSON.stringify(dataFor(fields, i)) });
    if (r.ok) ok++;
  }
  console.log(`  case ${id}: +${ok}/${n}`);
}
async function seedProcess(id, n) {
  const fields = await getFields("process", id);
  let ok = 0;
  for (let i = 0; i < n; i++) {
    const inst = await J(await fetch(`${base}/process/2/${A}/${id}?${app}`, { method: "POST", headers: H, body: JSON.stringify({}) }));
    if (inst?._id) {
      await fetch(`${base}/process/2/${A}/${id}/${inst._id}?${app}`, { method: "POST", headers: H, body: JSON.stringify(dataFor(fields, i)) }).catch(() => {});
      ok++;
    }
  }
  console.log(`  process ${id}: +${ok}/${n} (drafts)`);
}

const FORMS = ["Store_Data_A00", "Progress_Performance_A00", "Foot_Fall_A00", "Budget_details_A00", "Store_Inventory_A00", "Catalogue_A00"];
const CASES = ["Projects_A00", "Customer_Service_A00", "Site_Selection_A00", "Marketing_Planning_A00"];
const PROCESSES = ["Vashi_Site_Acquistion_A00", "Vashi_Setup_Operations_A00", "Capex_Approval_A00"];

async function main() {
  console.log(`Seeding ${KF_APP_ID} on ${KF_DOMAIN}…`);
  for (const id of FORMS) await seedForm(id, 14).catch((e) => console.log(`  form ${id} ✗ ${e.message}`));
  for (const id of CASES) await seedCase(id, 18).catch((e) => console.log(`  case ${id} ✗ ${e.message}`));
  for (const id of PROCESSES) await seedProcess(id, 10).catch((e) => console.log(`  process ${id} ✗ ${e.message}`));
  console.log("done.");
}
main();
