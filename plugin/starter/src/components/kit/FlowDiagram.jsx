import { useMemo } from "react";
import { ReactFlow, Background, Controls, MarkerType, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// A workflow, drawn. Every app this product builds HAS a process, and until now a page could only
// describe one in words — a list of step names, which is the least useful form of a diagram.
//
// Nodes are styled from the theme tokens rather than React Flow's defaults, so the diagram belongs to
// the app it sits in and follows light/dark with everything else. The library ships its own
// stylesheet and it must be imported or the canvas renders as unpositioned divs.

const NODE_W = 190;
const NODE_H = 56;

/** Lay steps out left-to-right, wrapping into rows so a long process stays on screen. */
function layout(steps, perRow) {
  return steps.map((s, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    // serpentine: even rows run left→right, odd rows right→left, so the connector between rows is
    // short and the eye follows one continuous path instead of jumping back across the canvas
    const x = (row % 2 === 0 ? col : perRow - 1 - col) * (NODE_W + 60);
    return { step: s, x, y: row * (NODE_H + 70) };
  });
}

// Workflow states use the semantic theme ramps rather than arbitrary chart colours.
const STATE_TONE = {
  done: "var(--success-600)",
  current: "var(--brand-600)",
  blocked: "var(--danger-600)",
  todo: null,
};

/**
 * steps: [{ id, label, actor?, state?: 'done'|'current'|'blocked'|'todo' }]
 * Renders read-only by default — a diagram on a dashboard is for reading, and a draggable node
 * invites an edit the page cannot save.
 */
export function FlowDiagram({ steps = [], perRow = 4, height = 320, editable = false }) {
  const { nodes, edges } = useMemo(() => {
    const placed = layout(steps, Math.max(1, perRow));
    const nodes = placed.map(({ step, x, y }, i) => {
      const tone = STATE_TONE[step.state] ?? null;
      return {
        id: String(step.id ?? i),
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        className: "rounded-lg",
        data: {
          label: (
            <div className="px-1 text-left">
              <div className="truncate text-xs-plus font-semibold leading-tight">{step.label}</div>
              {step.actor ? <div className="truncate text-2xs leading-snug text-ctl-fg-muted">{step.actor}</div> : null}
            </div>
          ),
        },
        style: {
          width: NODE_W, height: NODE_H,
          // the state tints the border and a faint wash; the ground and the text stay on tokens so
          // the node still reads correctly in either theme
          border: `1px solid ${tone ? `color-mix(in oklab, ${tone} 52%, var(--ctl-border))` : "var(--ctl-border)"}`,
          background: tone ? `color-mix(in oklab, ${tone} 9%, var(--material-surface, var(--ctl-surface)))` : "var(--material-surface, var(--ctl-surface))",
          color: "var(--ctl-fg)",
          display: "flex", alignItems: "center",
          boxShadow: "var(--shadow-sm)",
        },
      };
    });
    const edges = nodes.slice(1).map((n, i) => ({
      id: `e${i}`,
      source: nodes[i].id,
      target: n.id,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "color-mix(in oklab, var(--ctl-border-strong) 55%, var(--ctl-border))", strokeWidth: 1.5 },
    }));
    return { nodes, edges };
  }, [steps, perRow]);

  if (!steps.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-ctl-border bg-ctl-surface py-10 text-sm text-ctl-fg-muted"
           style={{ height }}>
        No steps to show yet.
      </div>
    );
  }

  return (
    <div style={{ height }} className="kf-flow overflow-hidden rounded-lg border border-solid border-ctl-border bg-ctl-surface font-sans text-sm text-ctl-fg">
      <ReactFlow
        nodes={nodes} edges={edges}
        fitView
        proOptions={{ hideAttribution: false }}
        nodesDraggable={editable} nodesConnectable={editable} elementsSelectable={editable}
        // a diagram inside a scrolling dashboard must not swallow the page's scroll
        zoomOnScroll={false} panOnScroll={false} preventScrolling={false}
      >
        <Background gap={16} size={1} color="var(--ctl-border)" />
        {editable ? <Controls showInteractive={false} /> : null}
      </ReactFlow>
      <style>{`
        .kf-flow .react-flow__node {
          font-family: var(--font-sans);
          transition: border-color var(--default-transition-duration) var(--default-transition-timing-function), box-shadow var(--default-transition-duration) var(--default-transition-timing-function), transform var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-flow .react-flow__node:hover {
          border-color: var(--ctl-border-strong) !important;
          box-shadow: var(--shadow-sm) !important;
        }
        .kf-flow .react-flow__node.selected {
          box-shadow: 0 0 0 var(--ring-ctl) var(--brand-ring) !important;
        }
        .kf-flow .react-flow__controls {
          overflow: hidden;
          border: 1px solid var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }
        .kf-flow .react-flow__controls-button {
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border-color: var(--ctl-border);
          transition: background-color var(--default-transition-duration) var(--default-transition-timing-function), color var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-flow .react-flow__controls-button:hover {
          color: var(--brand-text);
          background: var(--ctl-raise);
        }
        .kf-flow .react-flow__controls-button svg {
          fill: currentColor;
        }
        .kf-flow .react-flow__attribution {
          color: var(--ctl-fg-muted);
          background: color-mix(in srgb, var(--ctl-surface) 82%, transparent);
          font-family: var(--font-sans);
          font-size: var(--text-2xs);
        }
        .kf-flow .react-flow__attribution a {
          color: var(--brand-text);
        }
      `}</style>
    </div>
  );
}
