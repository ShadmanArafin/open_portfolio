'use client';

import React from 'react';
import {
  AtSign,
  Briefcase,
  Building2,
  FileText,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Palette,
  PenLine,
  Plug,
  Search,
} from 'lucide-react';
import type { Persona } from '@/lib/demo/personas';

/**
 * The admin's own navigation.
 *
 * Icons come from lucide, which is the set the real admin uses, and each item
 * carries the same one it carries there. That is the whole reason to take the
 * dependency: an approximation with different icons teaches a visitor the wrong
 * shape of the thing they are about to install.
 *
 * The account row at the bottom is the real admin's too — avatar, name, role,
 * and a sign-out that actually signs you out. In the demo that returns you to
 * the sign-in card rather than destroying a session, because there is no
 * session; what matters is that the control is where it will be, and that
 * pressing it does the thing its label says.
 *
 * Below the width where labels stop fitting this becomes an icon rail rather
 * than disappearing. Navigation that vanishes on a laptop is how a visitor
 * concludes the product has one screen.
 */

export type ScreenId =
  | 'dashboard'
  | 'pages'
  | 'writing'
  | 'work'
  | 'clients'
  | 'experience'
  | 'messages'
  | 'newsletter'
  | 'appearance'
  | 'seo'
  | 'media'
  | 'history'
  | 'services'
  | 'help';

type Icon = typeof LayoutDashboard;

export const SIDEBAR: { group: string; items: { id: ScreenId; label: string; icon: Icon }[] }[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pages', label: 'Pages', icon: FileText },
      { id: 'writing', label: 'Writing', icon: PenLine },
    ],
  },
  {
    group: 'Content',
    items: [
      { id: 'work', label: 'Selected work', icon: Briefcase },
      { id: 'clients', label: 'Clients', icon: Building2 },
      { id: 'experience', label: 'Experience', icon: History },
      { id: 'media', label: 'Media library', icon: ImageIcon },
    ],
  },
  {
    group: 'Inbox',
    items: [
      { id: 'messages', label: 'Messages', icon: Mail },
      { id: 'newsletter', label: 'Newsletter', icon: AtSign },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'services', label: 'Services', icon: Plug },
      { id: 'history', label: 'Version history', icon: History },
      { id: 'help', label: 'Help & feedback', icon: LifeBuoy },
    ],
  },
];

/** Two letters, the way the real admin falls back when there is no photograph. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function AdminNav({
  persona,
  current,
  unread,
  workLabel,
  onGo,
  onSignOut,
}: {
  persona: Persona;
  current: ScreenId;
  unread: number;
  workLabel: string;
  onGo: (id: ScreenId) => void;
  onSignOut: () => void;
}) {
  return (
    <nav className="studio__nav" aria-label="Admin">
      <div className="studio__navscroll">
        {SIDEBAR.map((section) => (
          <div key={section.group} className="studio__navsection">
            <h3>{section.group}</h3>
            <ul>
              {section.items.map((item) => {
                const Glyph = item.icon;
                const label = item.id === 'work' ? workLabel : item.label;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={item.id === current ? 'page' : undefined}
                      onClick={() => onGo(item.id)}
                      title={label}
                    >
                      <Glyph className="studio__navicon" aria-hidden />
                      <span className="studio__navlabel">{label}</span>
                      {item.id === 'messages' && unread > 0 && (
                        <span className="studio__navcount">{unread}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="studio__account">
        <span className="studio__avatar" aria-hidden>
          {initials(persona.name)}
        </span>
        <span className="studio__accountwho">
          <strong>{persona.name}</strong>
          <em>Administrator</em>
        </span>
        <button type="button" onClick={onSignOut} title="Sign out" aria-label="Sign out">
          <LogOut className="studio__navicon" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
