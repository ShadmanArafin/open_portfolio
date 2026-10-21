'use client';

/** "Save as PDF" is the browser's own print dialog; this only opens it. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print-hide
      style={{
        minHeight: 44,
        paddingInline: 'var(--space-5)',
        borderRadius: 999,
        border: 'var(--hairline) solid var(--border-color)',
        background: 'transparent',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
      }}
    >
      Print or save as PDF
    </button>
  );
}
