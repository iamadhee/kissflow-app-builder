/**
 * LIVE dev `kf` — same shape as the mock, but data ops hit the real Kissflow REST
 * API through the dev-server proxy (`/__kf/*`, which attaches the admin access key
 * server-side). Lets a Kissflow App UI read AND write your real dev app while running
 * outside the Kissflow iframe.
 *
 * Verified REST contract (dev-lcncdemo):
 *   Form  list   GET  /form/2/{acct}/{id}/list            → { Data, count, Columns }
 *   Form  create POST /form/2/{acct}/{id}                  → draft (_id: draft_…)
 *   Form  submit POST /form/2/{acct}/{id}/{draftId}/submit → real record
 *   Form  delete DELETE /form/2/{acct}/{id}/{itemId}
 *   Case  list   GET  /case/2/{acct}/{id}/list             → { Data }
 *   Process list/admin needs admin/view scope on the key.
 *
 * DEV-ONLY. Never bundled into the Kissflow deployment (the proxy is dev-server only).
 */
import type { KfInstance } from "../context";
import type { KfSchema } from "./schema";
export declare function createLiveKf(schema: KfSchema, base?: string): KfInstance;
