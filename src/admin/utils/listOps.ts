/** Shared list helpers for the admin CRUD screens. */

interface Sortable {
  sortOrder: number;
}

/** Ascending copy — never sort the draft array in place during render. */
export function sorted<T extends Sortable>(list: T[]): T[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Renumber sortOrder to 1..n so ordering stays stable after add/remove/move. */
export function resequence<T extends Sortable>(list: T[]): T[] {
  return list.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
}

/** Move the item with `id` one slot up or down, returning a resequenced list. */
export function moveById<T extends Sortable & { id: string }>(
  list: T[],
  id: string,
  direction: 'up' | 'down'
): T[] {
  const ordered = sorted(list);
  const index = ordered.findIndex((item) => item.id === id);
  if (index === -1) return list;

  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= ordered.length) return list;

  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  return resequence(ordered);
}

export function nextSortOrder<T extends Sortable>(list: T[]): number {
  return list.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;
}

/**
 * Sort key that puts a record at the top of its list.
 *
 * The work screens unshift a new record onto the array and then render the
 * array sorted by sortOrder, so a new record given the *highest* order landed
 * at the bottom — you added a project and had to scroll to find it.
 */
export function firstSortOrder<T extends Sortable>(list: T[]): number {
  return list.reduce((min, item) => Math.min(min, item.sortOrder), 1) - 1;
}

/** `id` values just need to be unique within the content tree. */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Shared input styling, matching the existing Astryx screens. */
export const inputClass =
  'w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-xs text-text-primary outline-none focus:border-accent';

export const textareaClass = `${inputClass} resize-none`;

export const monoInputClass =
  'w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-xs text-text-primary outline-none focus:border-accent ';
