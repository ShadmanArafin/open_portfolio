'use client';

/**
 * A refused write, with the way out of it.
 *
 * The sentence itself comes from the server (`conflictMessage`): it has the
 * revisions and the diff, and no form island can reconstruct either. What a
 * sentence cannot do is the one thing the message keeps asking for — reload —
 * so this adds the control. No merge UI, no dialog: the site moved on, and
 * reading the current version is the only honest next step.
 *
 * Rendered inline where the form's own error would be, so it lands under the
 * button that was pressed. `w-full` keeps it on its own line inside the
 * wrapping rows these islands live in.
 */
export function ConflictNotice({ message }: { message: string }) {
  return (
    <>
      <span role="alert" className="w-full text-sm text-danger">
        {message}
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary"
        style={{ minHeight: 44 }}
      >
        Reload this screen
      </button>
    </>
  );
}
