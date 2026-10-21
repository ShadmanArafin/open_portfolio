'use client';

export function UndoNotice({ label, onUndo }: { label: string; onUndo: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-secondary px-3 py-2">
      <p role="status" className="m-0 text-sm text-text-secondary">
        Deleted “{label || 'Untitled'}”. Nothing is gone until you save.
      </p>
      <button
        type="button"
        onClick={onUndo}
        className="rounded-full border border-border px-3 text-sm font-semibold text-text-primary"
        style={{ minHeight: 44 }}
      >
        Undo
      </button>
    </div>
  );
}
