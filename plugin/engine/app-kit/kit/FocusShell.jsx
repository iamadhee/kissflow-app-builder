// GENERATED from starter/src/components/kit/FocusShell.jsx (sha256:c5f58ed4be5b1511). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * FocusShell — one column, centred, no navigation. Sign-in, a wizard step, an
 * onboarding screen, a "your export is ready" page.
 *
 * The whole design is the omission: no sidebar, no topbar, nothing to click
 * except the thing being asked for. Any shell that keeps its nav during a
 * checkout or a sign-in is inviting the user to leave mid-task.
 *
 * `width` is a measure, not a breakpoint — sm for a login card, lg for a wizard
 * step with a form in it. `aside` puts a second column beside the content on
 * wide screens (a marketing panel, a summary), and drops it below on narrow.
 *
 * <FocusShell brand={…} title="Sign in" footer={…}>…</FocusShell>
 */

/* Slots take either node props or children carrying data-slot="name" — the same
   contract Toolbar uses, because a JSX caller and a template caller cannot pass
   nodes the same way. Unslotted children fall through to the main content. */
function useSlots(children, names) {
  /* Fragments are transparent. React.Children.toArray counts a Fragment as ONE
     child and never looks inside it, and a template's <sc-if>/<sc-for> wraps its
     branch in exactly that — so a slot declared inside a conditional lost its
     data-slot and fell through to the content. Flattening first makes a
     conditional slot behave like an unconditional one. */
  const flat = (nodes) =>
    React.Children.toArray(nodes).reduce(
      (out, n) => out.concat(n && n.type === React.Fragment ? flat(n.props.children) : n),
      []
    );
  const kids = flat(children);
  const slotOf = (n) => (n && n.props ? n.props['data-slot'] : null);
  const out = { rest: kids.filter((k) => names.indexOf(slotOf(k)) < 0) };
  names.forEach((name) => {
    const found = kids.filter((k) => slotOf(k) === name);
    out[name] = found.length ? found : null;
  });
  return out;
}

const WIDTHS = { sm: 'max-w-modal-sm', md: 'max-w-modal-md', lg: 'max-w-modal-lg' };

function FocusShell({
  title,
  description,
  brand,
  header,
  footer,
  aside,
  children,
  width = 'sm',
  align = 'center',
  className,
}) {
  const slot = useSlots(children, ['brand', 'header', 'footer', 'aside']);
  const brandNode = brand || slot.brand;
  const headerNode = header || slot.header;
  const footerNode = footer || slot.footer;
  const asideNode = aside || slot.aside;
  const content = slot.rest;

  const column = (
    <div className={cx('flex flex-col gap-6 w-full', WIDTHS[width] || WIDTHS.sm)}>
      {brandNode ? <div className="flex items-center shrink-0">{brandNode}</div> : null}
      {headerNode ? <div className="shrink-0">{headerNode}</div> : null}

      {title || description ? (
        <div className="flex flex-col gap-2">
          {title ? (
            <h1 className="m-0 font-display text-2xl font-semibold leading-tight tracking-tight text-ctl-fg text-pretty">{title}</h1>
          ) : null}
          {description ? (
            <p className="m-0 text-base leading-relaxed text-ctl-fg-muted text-pretty">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-5">{content}</div>

      {footerNode ? (
        <div className="flex items-center gap-3 flex-wrap pt-2 text-sm text-ctl-fg-muted">{footerNode}</div>
      ) : null}
    </div>
  );

  if (!asideNode)
    return (
      <div
        className={cx(
          'flex w-full h-full min-h-0 overflow-y-auto bg-ctl-offset text-ctl-fg',
          align === 'top' ? 'items-start' : 'items-center',
          'justify-center p-8',
          className
        )}
      >
        {column}
      </div>
    );

  return (
    <div className={cx('flex w-full h-full min-h-0 overflow-hidden bg-ctl-offset text-ctl-fg', className)}>
      <div
        className={cx(
          'flex flex-1 min-w-0 justify-center overflow-y-auto p-8',
          align === 'top' ? 'items-start' : 'items-center'
        )}
      >
        {column}
      </div>
      {/* Hidden rather than reflowed below the form: a marketing panel under a
          sign-in field is noise, not content. */}
      <div className="hidden lg:flex w-2/5 max-w-lg shrink-0 flex-col justify-center gap-6 p-10 bg-ctl-surface border-0 border-l border-solid border-layer-border">
        {asideNode}
      </div>
    </div>
  );
}

export { FocusShell };
export default FocusShell;
