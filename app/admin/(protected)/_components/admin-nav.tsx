'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { groupSections, type AdminSection } from './sections';

/**
 * The admin's section nav — 25 links, and the phone is where it was worst.
 *
 * As a wrapped list the header was the whole first screenful on a 360px
 * viewport, and every link was a 20px-tall line of text: a scroll before you
 * reach the page, and a target half the size a thumb can hit. The phone now
 * gets a Menu button — 44px tall, and it names the section you are in — which
 * opens the same list as 44px pills; from `sm` up it stays the wrapped list.
 *
 * The links come in labelled groups (Build, Profile, Audience, Look & reach,
 * System), each its own list under a small heading, so the eye finds the
 * cluster first and the link second.
 *
 * Two details worth keeping:
 * - `aria-current="page"` marks the section you are in, for eyes and for
 *   screen readers. `/admin` only counts as active on itself; matching it as a
 *   prefix would light up Dashboard on every screen.
 * - Every link carries a pending dot. The admin is `force-dynamic` and has no
 *   `loading.tsx` (a boundary that streams a shell would answer unknown admin
 *   URLs with 200 — the bug this repo already fixed once on the public site),
 *   so a tap on a slow connection shows nothing until the server answers. The
 *   dot is fixed-size and only fades in while a navigation is pending, so it
 *   cannot shift the row it sits in.
 */
function PendingDot() {
  const { pending } = useLinkStatus();
  return (
    // Zero-width wrapper: the dot is painted, not laid out, so it can never
    // rewrap the list or nudge the row it sits on.
    <span aria-hidden className="relative inline-block h-1.5 w-0 align-middle">
      <span
        // The pulse waits a moment before starting, so a fast navigation does
        // not flash. Inline on purpose: it has to beat the shorthand
        // `animate-pulse` emits, and a stylesheet rule of equal rank would lose.
        style={{ animationDelay: '120ms' }}
        className={`absolute left-1 top-0 h-1.5 w-1.5 rounded-full bg-current transition-opacity ${
          pending ? 'animate-pulse opacity-60' : 'opacity-0'
        }`}
      />
    </span>
  );
}

export function AdminNav({ sections }: { sections: AdminSection[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
  const current = sections.find((section) => isActive(section.href));

  return (
    <nav aria-label="Admin sections" className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="admin-sections"
        className="flex w-full items-center justify-between gap-3 rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary sm:hidden"
        style={{ minHeight: 44 }}
      >
        <span>
          Menu
          {current ? <span className="text-text-muted"> · {current.label}</span> : null}
        </span>
        <span aria-hidden className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      <div
        id="admin-sections"
        className={`${open ? 'flex' : 'hidden'} mt-3 flex-col gap-3 sm:mt-0 sm:flex sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-2`}
      >
        {groupSections(sections).map(({ group, sections: members }) => (
          <div
            key={group ?? 'home'}
            className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2"
          >
            {group ? (
              <p
                id={`admin-group-${group.replace(/\W+/g, '-').toLowerCase()}`}
                className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted"
              >
                {group}
              </p>
            ) : null}
            <ul
              aria-labelledby={
                group ? `admin-group-${group.replace(/\W+/g, '-').toLowerCase()}` : undefined
              }
              className="m-0 flex list-none flex-wrap gap-2 p-0 sm:gap-x-3 sm:gap-y-1"
            >
              {members.map((section) => {
                const active = isActive(section.href);
                return (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-[44px] items-center rounded-full border px-3 text-sm no-underline sm:min-h-[28px] sm:border-0 sm:px-0 ${
                        active
                          ? 'border-text-primary font-semibold text-text-primary'
                          : 'border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {section.label}
                      <PendingDot />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
