'use client';

/** The words beside a Save button. Announced when they appear. */
export function UnsavedNote({ dirty }: { dirty: boolean }) {
  if (!dirty) return null;
  return (
    <p role="status" className="m-0 text-sm font-semibold text-text-primary">
      Unsaved changes
    </p>
  );
}
