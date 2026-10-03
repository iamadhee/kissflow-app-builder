import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Tree — nested list with expand, select and indent guides.
 *
 * Recursion renders the nodes; a flat `expanded` array holds which ids are open.
 * Keeping open state outside the node objects means a refetched tree keeps its
 * open branches — the ids still match even when the node objects are new.
 *
 * The indent guide is a left border on the children wrapper rather than a line
 * per row, so the guide is continuous and costs one element per level.
 *
 * <Tree nodes={nodes} selected={id} onSelect={setId} />
 */
const { useState, useCallback } = React;


function Caret({ open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('w-3.5 h-3.5 transition-transform ease-ctl duration-[var(--default-transition-duration)]', open && 'rotate-90')}
    >
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Node({ node, depth, expanded, onToggle, selected, onSelect, guides }) {
  const hasKids = Boolean(node.children && node.children.length);
  const open = expanded.indexOf(node.id) > -1;
  const isSel = node.id === selected;

  return (
    <li className="list-none">
      <div
        className={cx(
          'group flex items-center gap-2 min-h-9 pr-2 rounded-md',
          'transition-colors ease-ctl duration-[var(--default-transition-duration)]',
          isSel ? 'bg-field-selected' : 'hover:bg-ctl-raise'
        )}
      >
        <button
          type="button"
          tabIndex={hasKids ? 0 : -1}
          aria-label={hasKids ? (open ? 'Collapse' : 'Expand') : undefined}
          onClick={() => hasKids && onToggle(node.id)}
          className={cx(
            'shrink-0 grid place-items-center w-6 h-6 ml-1 rounded-sm bg-transparent border-0 cursor-pointer',
            'transition-colors ease-ctl duration-[var(--default-transition-duration)] outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
            hasKids ? 'text-ctl-fg-muted hover:text-ctl-fg' : 'invisible'
          )}
        >
          <Caret open={open} />
        </button>

        <button
          type="button"
          aria-current={isSel ? 'true' : undefined}
          onClick={() => {
            if (onSelect) onSelect(node.id, node);
            if (hasKids && !open) onToggle(node.id);
          }}
          className={cx(
            'flex items-center gap-2 flex-1 min-w-0 h-9 text-left text-sm bg-transparent border-0 cursor-pointer',
            'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
            isSel ? 'text-brand-text font-medium' : 'text-ctl-fg'
          )}
        >
          {node.icon ? <span className="shrink-0 text-ctl-fg-muted">{node.icon}</span> : null}
          <span className="truncate">{node.label}</span>
          {node.meta != null ? (
            <span className="shrink-0 ml-auto pl-2 text-sm text-ctl-fg-muted tabular-nums">{node.meta}</span>
          ) : null}
        </button>
      </div>

      {hasKids && open ? (
        <ul
          className={cx(
            'flex flex-col gap-1 m-0 p-0 ml-4 pl-2',
            guides && 'border-0 border-l border-solid border-layer-border'
          )}
        >
          {node.children.map((child) => (
            <Node
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selected={selected}
              onSelect={onSelect}
              guides={guides}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Tree({
  nodes = [],
  selected,
  onSelect,
  expanded: expandedProp,
  onExpandedChange,
  defaultExpanded = [],
  guides = true,
  bordered = false,
  className,
}) {
  const [state, setState] = useState(() => defaultExpanded.slice());
  const controlled = expandedProp != null;
  const expanded = controlled ? expandedProp : state;

  const onToggle = useCallback(
    (id) => {
      const next = expanded.indexOf(id) > -1 ? expanded.filter((x) => x !== id) : expanded.concat(id);
      if (!controlled) setState(next);
      if (onExpandedChange) onExpandedChange(next);
    },
    [expanded, controlled, onExpandedChange]
  );

  return (
    <ul
      role="tree"
      className={cx(
        'flex flex-col gap-1 m-0 p-0 w-full',
        bordered && 'p-2 bg-layer-surface border border-solid border-layer-border rounded-xl',
        className
      )}
    >
      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={onToggle}
          selected={selected}
          onSelect={onSelect}
          guides={guides}
        />
      ))}
    </ul>
  );
}

export { Tree };
export default Tree;
