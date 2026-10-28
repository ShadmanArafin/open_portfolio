'use client';

import React, { useState } from 'react';
import { Layers, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { getBlockDefinition } from '@/core/blocks/lookup';
import type { ParsedBlock } from '@/core/blocks/schema';

interface BlockOutlineProps {
  parsed: ParsedBlock[];
  onMove: (index: number, by: number) => void;
  onToggleHidden: (index: number) => void;
}

export function BlockOutline({ parsed, onMove, onToggleHidden }: BlockOutlineProps) {
  const [open, setOpen] = useState(false);

  if (parsed.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-secondary/40 p-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-text-primary"
      >
        <span className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <span>Page Outline ({parsed.length} blocks)</span>
        </span>
        <span className="font-mono text-xs text-text-muted">
          {open ? 'Hide layers ▲' : 'Show layers ▼'}
        </span>
      </button>

      {open && (
        <ol className="mt-3 divide-y divide-border/60 border-t border-border/80 pt-2 text-xs">
          {parsed.map((entry, index) => {
            const isBlock = entry.kind === 'block';
            const label = isBlock ? getBlockDefinition(entry.block.type)?.label : 'Unknown block';
            const hidden = isBlock ? Boolean(entry.block.hidden) : false;

            return (
              <li
                key={isBlock ? entry.block.id : entry.id}
                className="flex items-center justify-between py-2 transition-colors hover:bg-surface-secondary/80 rounded px-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-medium truncate ${hidden ? 'line-through text-text-muted' : 'text-text-primary'}`}
                  >
                    {label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={hidden ? 'Make visible' : 'Hide block'}
                    onClick={() => onToggleHidden(index)}
                    className="p-1 text-text-muted hover:text-text-primary rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    {hidden ? (
                      <EyeOff className="h-3.5 w-3.5 text-danger" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => onMove(index, -1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === parsed.length - 1}
                    onClick={() => onMove(index, 1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
