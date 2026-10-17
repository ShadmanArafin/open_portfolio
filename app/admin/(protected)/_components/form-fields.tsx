'use client';

/**
 * The two controls every builder screen uses.
 *
 * Field is a labelled input or textarea with a hint under it, and a problem
 * message that replaces the hint when there is one. CheckField is the
 * checkbox with its description. Small on purpose: they exist so the pages
 * and writing editors do not grow a third and fourth copy of "label, input,
 * hint", which is how two screens end up with two different ideas of what a
 * form looks like.
 */

const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';

export function Field({
  label,
  value,
  onChange,
  hint,
  problem,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  problem?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${field} py-2`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={field}
          style={{ minHeight: 44 }}
        />
      )}
      {problem ? <span className="text-danger">{problem}</span> : null}
      {hint && !problem ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

export function CheckField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
      <span className="font-semibold">
        {label}
        {description ? (
          <span className="block font-normal text-text-secondary">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
