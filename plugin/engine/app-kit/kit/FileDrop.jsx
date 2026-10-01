// GENERATED from starter/src/components/kit/FileDrop.jsx (sha256:1f7e99b230f4a502). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * FileDrop — a drop target that is also a button.
 *
 * The visible surface is a label wrapping a real file input, so clicking, Enter,
 * Space and the OS file dialog all work without a synthetic click. Drag state is
 * counted rather than toggled: dragenter and dragleave fire for every child
 * element, so a boolean flickers as the pointer crosses the inner text.
 *
 * Validation is the caller's: this reports files and renders what it is given.
 *
 * <FileDrop accept="image/*" multiple files={files} onFiles={add} onRemove={drop} />
 */
const { useState, useRef, useId } = React;


function UploadMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-6 h-6">
      <path d="M12 15.5V5.5m0 0L8.5 9M12 5.5 15.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 14.5v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FileMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
      <path d="M4 2.5h5L12 5.5v8H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 2.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function size(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function FileDrop({
  onFiles,
  files = [],
  onRemove,
  accept,
  multiple = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  label = 'Drop files here, or click to browse',
  hint,
  className,
}) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const take = (list) => {
    const arr = Array.prototype.slice.call(list || []);
    if (arr.length && onFiles) onFiles(multiple ? arr : arr.slice(0, 1));
  };

  /* Read-only drops the dropzone AND the per-file remove buttons: the upload input and
     the ✕ are the two mutation paths here, and neither is rendered. */
  if (readOnly && !disabled) {
    const names = (files || []).map((f) => (f && f.name) || String(f)).filter(Boolean);
    return (
      <div className={cx('flex flex-col gap-2 w-full', className)}>
        <FieldValue id={id} multiline={names.length > 1} value={names.join(', ')} />
        {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
      </div>
    );
  }

  return (
    <div className={cx('flex flex-col gap-3 w-full', className)}>
      <label
        htmlFor={id}
        onDragEnter={(e) => {
          e.preventDefault();
          depth.current += 1;
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) {
            depth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!disabled) take(e.dataTransfer && e.dataTransfer.files);
        }}
        className={cx(
          'flex flex-col items-center justify-center gap-2 w-full px-6 py-8 text-center',
          'border border-dashed rounded-xl select-none',
          'transition-[background-color,border-color,color] ease-ctl duration-[var(--default-transition-duration)]',
          'focus-within:ring-2 focus-within:ring-brand-ring focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
          dragging
            ? 'bg-field-selected border-brand-600 text-brand-text'
            : invalid
            ? 'bg-field-surface border-danger-600 text-danger-text'
            : 'bg-field-surface border-field-border text-ctl-fg-muted hover:border-field-border-hover hover:bg-ctl-raise',
          disabled ? 'opacity-[.45] cursor-not-allowed' : 'cursor-pointer'
        )}
        data-dragging={dragging || undefined}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            take(e.target.files);
            e.target.value = '';
          }}
        />
        <span className={dragging ? 'text-brand-600' : 'text-ctl-fg-muted'}>
          <UploadMark />
        </span>
        <span className="text-sm font-medium leading-snug text-ctl-fg">{label}</span>
        {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
      </label>

      {files.length ? (
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {files.map((f, i) => (
            <li
              key={(f.name || 'file') + i}
              className="flex items-center gap-3 px-3 h-10 bg-ctl-surface border border-solid border-field-border rounded-lg"
            >
              <span className="text-ctl-fg-muted">
                <FileMark />
              </span>
              <span className="flex-1 min-w-0 text-sm text-ctl-fg truncate">{f.name}</span>
              <span className="shrink-0 text-sm text-ctl-fg-muted tabular-nums">{size(f.size)}</span>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(f, i)}
                  aria-label={'Remove ' + (f.name || 'file')}
                  className="shrink-0 grid place-items-center w-6 h-6 rounded-sm bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { FileDrop };
export default FileDrop;
