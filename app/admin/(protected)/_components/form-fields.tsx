'use client';

/**
 * The controls every builder screen uses.
 *
 * Field is a labelled input or textarea with a hint under it, and a problem
 * message that replaces the hint when there is one. CheckField is the
 * checkbox with its description, and SelectField the dropdown for values
 * that come from a fixed set. Small on purpose: they exist so the builder
 * screens do not each grow a copy of "label, input, hint", which is how two
 * screens end up with two different ideas of what a form looks like.
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
  type = 'text',
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  problem?: string | null;
  rows?: number;
  placeholder?: string;
  /** The services screen is the caller that needs more than plain text. */
  type?: 'text' | 'password' | 'number';
  autoComplete?: string;
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
          type={type}
          autoComplete={autoComplete}
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
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The help screen disables the errors toggle when there is nothing to attach. */
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex min-h-[44px] items-center gap-3 text-sm ${
        disabled ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
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

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={field}
        style={{ minHeight: 44 }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

/** An ISO instant as the `YYYY-MM-DDTHH:mm` a datetime-local input shows, in local time. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/**
 * A moment in time, picked in the owner's own clock and stored as an exact
 * instant (ISO, UTC).
 *
 * Scheduling used a text box, and whatever was typed was later read by the
 * server in *its* timezone — "09:00" meant 09:00 UTC on most hosts, hours
 * away from what the owner meant. The browser knows the owner's timezone, so
 * the conversion happens here, once, and the stored value is unambiguous.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (iso: string) => void;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input
        type="datetime-local"
        value={toLocalInput(value)}
        onChange={(event) => {
          const date = new Date(event.target.value);
          onChange(Number.isNaN(date.getTime()) ? '' : date.toISOString());
        }}
        className={field}
        style={{ minHeight: 44 }}
      />
      {hint ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}
