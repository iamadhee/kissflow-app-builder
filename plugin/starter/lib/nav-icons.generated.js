// The CHECKED-IN DEFAULT nav icon set. Tracked on purpose — do not gitignore it.
//
// `src/components/nav-icons.js` imports this module statically, so it has to resolve on a fresh
// clone or the starter's Vite build and `engine/test/nav-icons.test.mjs` both fail at import time.
// Nothing rewrites this file in place: a prototype build copies the starter tree into the run's
// own workspace and `stageNavIcons` writes the per-run set into THAT copy
// (`<runDir>/.proto-build/lib/`), which is what the bundle resolves against. Deploys do the same
// into their own workspace. So this file stays put, and the set below is what the bare starter —
// dev server, ui tests, component catalog — renders with.
//
// Static named imports only: a dynamic lookup over lucide measured 1,023 KB in the single-file
// build against 11 KB for the ~15 icons a real app names.
import { BarChart3, CalendarDays, CheckCircle2, Circle, FilePlus2, LayoutDashboard, Table2 } from "lucide-react";

export const NAV_ICONS = { BarChart3, CalendarDays, CheckCircle2, Circle, FilePlus2, LayoutDashboard, Table2 };
