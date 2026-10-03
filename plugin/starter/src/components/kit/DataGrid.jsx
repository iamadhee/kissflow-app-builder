import React from 'react';
import Table from './Table.jsx';
import Button from './Button.jsx';
import { formatCell } from './format.js';

/* An action cell holds a control, and a control has an intrinsic width: `whitespace-nowrap` means
   it cannot wrap and no padding it can give back. Table squeezes every column toward a reading
   floor once the grid is narrower than the sum of its semantic minimums — which is right for text
   and wrong for a button. On the used-car management dashboard that squeeze put a 141px "Inspect
   stock" button in a 121px column at the table's right edge, so 26px of it disappeared under the
   scroll container's clip: the primary action of the row, invisible.

   Measure the label in the button's own font and declare that as the column's minimum. A declared
   minimum is absolute — Table honours it in narrow mode too — so the squeeze lands on the text
   columns instead, which can wrap. */
const ACTION_BUTTON_PADDING = 48; /* Button md is px-6 */
const ACTION_CELL_PADDING = 16;
let metricContext;
function actionColumnWidth(label) {
  const text = String(label ?? '');
  let textWidth = 0;
  if (typeof document !== 'undefined') {
    if (metricContext === undefined) metricContext = document.createElement('canvas').getContext('2d') || null;
    if (metricContext) {
      const body = getComputedStyle(document.body);
      metricContext.font = `600 ${body.fontSize || '14px'} ${body.fontFamily || 'sans-serif'}`;
      textWidth = metricContext.measureText(text).width;
    }
  }
  /* No document (or a canvas the browser refused): 7.6px per character is a deliberate
     over-estimate of a 14px semibold glyph. A slightly wide action column costs nothing. */
  if (!(textWidth > 0)) textWidth = text.length * 7.6;
  return Math.ceil(textWidth) + ACTION_BUTTON_PADDING + ACTION_CELL_PADDING;
}

/** Recipe-facing operational grid. Compact string columns are lowered to the richer Table API. */
function DataGrid({ columns = [], rows = [], onOpen, openLabel = 'Open', className = '', ...props }) {
  const normalized = columns.map((column) => typeof column === 'string'
    ? { key: column, label: column, render: (row) => formatCell(row?.[column]) }
    : column);
  if (onOpen) normalized.push({
    key: '__open', label: 'Actions', sizing: 'action', sortable: false,
    minWidth: actionColumnWidth(openLabel),
    render: (row) => <Button rank="quiet" onClick={() => onOpen(row)} data-cx-action="open-record">{openLabel}</Button>,
  });
  // Table has a deliberately narrow API and does not forward arbitrary DOM attributes. Keep the
  // recipe/binding markers on this semantic grid boundary so browser verification can prove the
  // selected themed component actually rendered.
  return <div className={className} {...props}><Table columns={normalized} rows={rows} /></div>;
}

export { DataGrid };
export default DataGrid;
