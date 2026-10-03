/**
 * Offline mock of the Kissflow SDK (`kf`), seeded from `lib/kf-schema.json`.
 *
 * Lets a Kissflow App UI **run and be tested outside the Kissflow iframe** — where
 * the real `KFSDK.initialize()` never resolves. Each synced data model becomes an
 * in-memory store with `getItems`/`getItem`/`createItem`/`updateItem`/`deleteItem`,
 * so pages render against realistic data. The active role is supplied by the
 * provider (see the dev role switcher) and reflected on `kf.user`.
 *
 * This is DEV-ONLY scaffolding — in real Kissflow the genuine SDK is used.
 */
import type { KfInstance } from "../context";
import type { KfSchema } from "./schema";
/**
 * Build a mock `kf`. The provider mutates `kf.user.AppRoles` when the dev switches
 * role, so the same instance is reused (stable identity for route-sync).
 */
export declare function createMockKf(schema: KfSchema): KfInstance;
