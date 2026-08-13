'use client';

import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { listBlockDefinitions } from '../../../core/blocks/registry';

/**
 * Add a block.
 *
 * This used to be a list of names with a note saying adding was switched off
 * "so the demo stays the shape it started in" — which protected a demo nobody
 * asked to be protected, and withheld the one action that answers the question
 * the visitor came with. Building a page is the product. A visitor who cannot
 * add a block has not tried it.
 *
 * Grouped exactly as the product groups them, because `group` is a field on the
 * block definition and not a decision this file gets to make. What each button
 * inserts is `definition.defaults()` — the same call the real admin makes — so a
 * block added here arrives in the state the product would give it, warnings and
 * empty fields included. An added block that arrived pre-filled would be a lie
 * about the first thing you do after adding one.
 */

const GROUP_LABELS: Record<string, string> = {
  identity: 'Who you are',
  work: 'What you have done',
  credentials: 'Why you can be trusted',
  conversion: 'Getting in touch',
  utility: 'Layout and everything else',
};

export function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const byGroup = new Map<string, { type: string; label: string; description: string }[]>();
    for (const definition of listBlockDefinitions()) {
      const list = byGroup.get(definition.group) ?? [];
      list.push({
        type: definition.type,
        label: definition.label,
        description: definition.description,
      });
      byGroup.set(definition.group, list);
    }
    // Ordered by the labels above rather than by insertion, so the palette does
    // not reshuffle when a block is added to the registry.
    return Object.keys(GROUP_LABELS)
      .filter((group) => byGroup.has(group))
      .map((group) => ({ group, items: byGroup.get(group) ?? [] }));
  }, []);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="studio__palette">
      <button
        type="button"
        className="studio__addbtn"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Plus aria-hidden />
        Add a block
      </button>

      {open && (
        <div className="studio__palettebody">
          <p className="studio__hint">
            {total} types, the same list your own install has. Each one arrives empty, which is what
            adding a block actually looks like.
          </p>
          {groups.map((group) => (
            <div key={group.group}>
              <h4>{GROUP_LABELS[group.group] ?? group.group}</h4>
              <ul>
                {group.items.map((item) => (
                  <li key={item.type}>
                    <button
                      type="button"
                      onClick={() => {
                        onAdd(item.type);
                        setOpen(false);
                      }}
                      title={item.description}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
