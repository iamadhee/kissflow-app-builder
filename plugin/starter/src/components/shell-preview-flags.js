// The catalog switch lives alone so `app-shell.jsx` can read it WITHOUT importing
// `shell-preview-content.jsx` — that module pulls the five component-review galleries, and a static
// import of it put ~1.8 MB of specimens into every generated prototype that can never render them
// (the catalog is reachable only when `NAV_MENUS` is empty, which never holds for a real app).
//
// Temporary catalog switch. Keep the layout specimens implemented and importable while they are
// hidden from both the preview navigation and the catalog body.
export const SHOW_LAYOUTS_CATALOG = false;
