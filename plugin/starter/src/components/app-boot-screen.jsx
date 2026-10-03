/**
 * The app's first meaningful paint. The matching static markup in index.html appears before the
 * JavaScript bundle has loaded; KfApp keeps this React version mounted while the SDK and first route
 * initialize. Keeping both stages visually identical avoids a white flash between HTML and React.
 *
 * A QUIET VIGNETTE on purpose: the old skeleton drew a whole pretend layout (rail, nav, cards)
 * that never matched the app that replaced it — a bait-and-switch first paint. One breathing
 * mark, one sliding hairline, one line of copy.
 */
export function AppBootScreen() {
  return (
    <div className="kf-boot" role="status" aria-live="polite" aria-label="Preparing your workspace">
      <div className="kf-boot__vignette">
        <span className="kf-boot__halo" aria-hidden="true" />
        <span className="kf-boot__mark" aria-hidden="true">✦</span>
        <div className="kf-boot__bar" aria-hidden="true"><i /></div>
        <p>Preparing your workspace…</p>
      </div>
    </div>
  );
}
