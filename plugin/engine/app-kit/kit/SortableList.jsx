// GENERATED from starter/src/components/kit/SortableList.jsx (sha256:254450a85c6cc7d3). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useId } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

// @dnd-kit/modifiers and @dnd-kit/utilities are separate packages and pnpm does not hoist them, so
// importing either would need two more dependencies for about four lines of code. Both are inlined.
const restrictToVerticalAxis = ({ transform }) => ({ ...transform, x: 0 });
const cssTransform = (t) => (t ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)` : undefined);

function GripMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      {[4, 8, 12].flatMap((y) => [5, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />))}
    </svg>
  );
}

// Reordering by hand — priorities, approval chains, checklist steps, anything whose ORDER is the data.
//
// dnd-kit rather than a mouse-event implementation because of the keyboard sensor: drag-and-drop
// built on pointer events alone is unusable without a mouse, and "reorder your approval chain" is
// exactly the kind of control that has to work for everyone. Arrow keys move a picked-up item here.
//
// The parent owns the array. This component reports the new order and renders nothing on its own —
// persisting it (updateItem, a Sequence field, whatever the model calls it) is the page's job, and
// the page is the only thing that knows whether the reorder should be saved at all.

function Row({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef}
         style={{ transform: cssTransform(transform), transition }}
         data-dragging={isDragging || undefined}
         className={`flex items-center gap-3 rounded-lg border border-solid px-3 py-3 text-ctl-fg transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)] ${isDragging ? "z-10 border-brand-600 bg-field-selected shadow-md" : "border-ctl-border bg-ctl-surface hover:bg-ctl-raise"}`}>
      {/* the handle is its own control: dragging from anywhere makes text impossible to select */}
      <button {...attributes} {...listeners}
              aria-label="Reorder"
              className="grid h-8 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-md border-0 bg-transparent text-ctl-fg-muted transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset">
        <GripMark />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * items: [{ id, …anything }]  ·  renderItem: (item, index) => node
 * onReorder: (nextItems) => void — fired with the whole array in its new order.
 */
export function SortableList({ items = [], renderItem, onReorder, emptyText = "Nothing to order yet." }) {
  const ctxId = useId();   // stable across SSR/StrictMode double-renders
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),  // 4px, or a click reads as a drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!items.length) {
    return <div className="rounded-lg border border-dashed border-ctl-border bg-ctl-surface px-5 py-8 text-center text-sm text-ctl-fg-muted">{emptyText}</div>;
  }

  const ids = items.map((it, i) => String(it?.id ?? i));

  return (
    <DndContext id={ctxId} sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = ids.indexOf(String(active.id)), to = ids.indexOf(String(over.id));
        if (from < 0 || to < 0) return;
        onReorder?.(arrayMove(items, from, to));
      }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" data-kf-component="sortable-list">
          {items.map((it, i) => (
            <Row key={ids[i]} id={ids[i]}>{renderItem?.(it, i)}</Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
