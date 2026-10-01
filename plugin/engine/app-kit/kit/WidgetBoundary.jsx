// GENERATED from starter/src/components/kit/WidgetBoundary.jsx (sha256:18391121d4286a63). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { ErrorBoundary } from "react-error-boundary";
import { Alert } from "./Alert.jsx";
import { Button } from "./Button.jsx";

// One widget throwing must not take the page with it.
//
// A generated dashboard is a dozen widgets over live data nobody has seen. When a single one hits a
// null field or a malformed date, React unmounts the WHOLE tree — the user gets a blank white page
// with eleven working widgets on it, and nothing on screen says which one failed.
//
// This is the cheapest reliability win in the kit: wrap each widget, lose one card instead of a page,
// and name the failure where it happened.

function Fallback({ error, resetErrorBoundary, label }) {
  return (
    <Alert
      tone="danger"
      title={label ? `${label} could not be shown` : "This section could not be shown"}
      data-kf-component="widget-boundary-fallback"
      action={(
        <Button type="button" variant="secondary" size="sm" onClick={resetErrorBoundary}>
          Try again
        </Button>
      )}
    >
      {/* the message, not a stack trace — the reader is a business user, and the stack is in the console */}
      {String(error?.message || error)}
    </Alert>
  );
}

/**
 * Wrap any widget: <WidgetBoundary label="Open requisitions"><DataGrid …/></WidgetBoundary>
 * `label` names the card in the fallback, so a failure points at itself.
 */
export function WidgetBoundary({ label, children, onReset }) {
  return (
    <ErrorBoundary
      FallbackComponent={(p) => <Fallback {...p} label={label} />}
      onError={(e) => console.error(`[kf] widget "${label || "unnamed"}" failed:`, e)}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
