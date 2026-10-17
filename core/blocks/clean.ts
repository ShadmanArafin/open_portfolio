/**
 * Cleaning stored blocks.
 *
 * One implementation because pages and writing store the *same* block shape —
 * a second copy is how the two drift until a block saves on one screen and is
 * refused on the other. Lives in core rather than beside either action so
 * neither has to export a helper (anything exported from a `'use server'`
 * module becomes a callable endpoint).
 */

export function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

export function cleanBlock(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const entry = raw as Record<string, unknown>;
  if (!isText(entry.id, 100) || entry.id.length === 0) return null;
  if (!isText(entry.type, 100) || entry.type.length === 0) return null;
  if (typeof entry.v !== 'number' || !Number.isFinite(entry.v) || entry.v < 0) return null;
  if (!entry.props || typeof entry.props !== 'object') return null;

  const clean: Record<string, unknown> = {
    id: entry.id,
    type: entry.type,
    v: entry.v,
    props: entry.props,
  };
  if (entry.frame && typeof entry.frame === 'object' && !Array.isArray(entry.frame)) {
    clean.frame = entry.frame;
  }
  if (typeof entry.hidden === 'boolean') clean.hidden = entry.hidden;
  if (isText(entry.anchor, 200) && entry.anchor.length > 0) clean.anchor = entry.anchor;
  if (isText(entry.role, 100) && entry.role.length > 0) clean.role = entry.role;
  return clean;
}
