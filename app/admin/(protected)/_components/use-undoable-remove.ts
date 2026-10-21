'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Delete, then a moment to change your mind.
 *
 * The editors arm a delete and ask for a second press, which stops a slip of
 * the finger; it does nothing for "that was the wrong one", which is noticed
 * a second later. Nothing is written until Save, so putting the record back
 * where it was is all an undo has to do — no server round trip, nothing to
 * reverse. One level: the next delete replaces it.
 */
export function useUndoableRemove<T extends { id: string }>(
  list: T[],
  setList: Dispatch<SetStateAction<T[]>>
) {
  const [removed, setRemoved] = useState<{ item: T; index: number; label: string } | null>(null);

  const remove = (id: string, label: string) => {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;
    setRemoved({ item: list[index], index, label });
    setList((current) => current.filter((item) => item.id !== id));
  };

  /** Puts it back where it was, and returns its id. */
  const undo = (): string | null => {
    if (!removed) return null;
    const { item, index } = removed;
    setList((current) => {
      if (current.some((existing) => existing.id === item.id)) return current;
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, item);
      return next;
    });
    setRemoved(null);
    return item.id;
  };

  return { removed, remove, undo, dismiss: () => setRemoved(null) };
}
