'use client';

import { useMemo, useRef, useState } from 'react';
import { MAX_CSV_BYTES, readCsv, templateCsv } from '@/core/import/csv';
import type { CsvImporter } from '@/core/import/csv-templates';

const secondary =
  'inline-flex items-center rounded-full border border-border px-3 text-sm text-text-secondary no-underline hover:text-text-primary';

/**
 * "Import CSV" and its template, beside a collection screen's Add button.
 *
 * Read in the browser: the rows become ordinary new records at the top of the
 * list, unsaved, so the owner sees every one before Save — the same Save,
 * token check and server-side cleaning as a record made by hand.
 */
export function CsvImport<T>({
  importer,
  existing,
  create,
  onImport,
}: {
  importer: CsvImporter<T>;
  /** The records already on the screen, so names and addresses stay unique. */
  existing: T[];
  /** The screen's own new record, given every record so far. */
  create: (items: T[]) => T;
  onImport: (records: T[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<string[] | null>(null);
  const href = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(templateCsv(importer.template))}`,
    [importer]
  );

  const read = async (file: File) => {
    if (file.size > MAX_CSV_BYTES) {
      setReport(['That file is over 1 MB — a list for this screen is far smaller.']);
      return;
    }
    const { rows, problems } = readCsv(await file.text(), importer.template);
    const made: T[] = [];
    for (const row of rows) {
      const all = [...existing, ...made];
      made.push(importer.apply(row, create(all), all));
    }
    onImport(made);
    setReport([
      made.length === 0
        ? 'Nothing was added.'
        : `Added ${made.length} record${made.length === 1 ? '' : 's'} at the top. Check them, then Save.`,
      ...problems,
    ]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={secondary}
        style={{ minHeight: 44 }}
      >
        Import CSV
      </button>
      <a
        href={href}
        download={`${importer.template.name}-template.csv`}
        className={secondary}
        style={{ minHeight: 44 }}
        title={importer.template.columns
          .map((column) => `${column.key}${column.required ? ' (required)' : ''}: ${column.hint}`)
          .join('\n')}
      >
        CSV template
      </a>
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void read(file);
        }}
      />
      {report ? (
        <div role="status" className="grid w-full gap-1 text-sm text-text-secondary">
          {report.map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}
