'use client';

import React, { useMemo, useState } from 'react';
import {
  getBlockDefinition,
  listBlockDefinitions,
  parsePage,
  runBlockChecks,
} from '../../../core/blocks/registry';
import { PERSONAS, type Persona, type PersonaId } from '@/lib/demo/personas';
import { THEMES, blockContentFor, vocabulary } from '@/lib/demo/render';
import type { PageBlock } from '@/lib/demo/types';
import { DEVICES, SitePreview, type DeviceId } from './site-preview';
import { FieldList } from './fields';

/**
 * The whole product, running in a browser tab with nothing behind it.
 *
 * Four screens in the order somebody would actually meet them — sign in, the
 * four setup questions, the editor, the published site — because the thing a
 * visitor is really deciding is not "is the output nice" but "will I be able to
 * work this". A gallery of screenshots cannot answer that and this can.
 *
 * There is no server, no database and no account. The state is React state and
 * it is gone when the tab closes, which is the honest version of "try it": no
 * sign-up to regret, nothing shared to vandalise, and no instance for anybody
 * to maintain. Every hand-maintained demo instance in the research was dead or
 * retired.
 *
 * What is real: the blocks, the block renderer, the theme tokens, the editor's
 * field metadata, the profession vocabulary and the content warnings. All of it
 * is imported from the product. What is simulated: persistence, authentication,
 * uploads, and email.
 */

type Screen = 'signin' | 'wizard' | 'studio';
type Channel = 'draft' | 'live';

const SIDEBAR = [
  { group: 'Overview', items: ['Dashboard', 'Analytics', 'Homepage', 'Pages', 'Writing'] },
  { group: 'Content', items: ['Selected work', 'Clients', 'Experience', 'Capabilities'] },
  { group: 'Inbox', items: ['Messages', 'Newsletter'] },
  { group: 'Configuration', items: ['Navigation', 'Appearance', 'SEO', 'Services', 'History'] },
];

export function Studio() {
  const [screen, setScreen] = useState<Screen>('signin');
  const [personaId, setPersonaId] = useState<PersonaId>('photographer');
  const persona: Persona = useMemo(
    () => PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0],
    [personaId]
  );

  const [themeId, setThemeId] = useState(persona.themeId);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Two copies of the page, which is the product's actual model: a draft
  // nobody can see and a published snapshot everybody can. Keeping both here
  // is what lets the demo show what Publish is *for*.
  const [draft, setDraft] = useState<PageBlock[]>(persona.blocks);
  const [live, setLive] = useState<PageBlock[]>(persona.blocks);
  const [channel, setChannel] = useState<Channel>('draft');

  const [device, setDevice] = useState<DeviceId>('desktop');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(live), [draft, live]);

  /** Switching who you are reloads their content, their theme and their words. */
  const choosePersona = (id: PersonaId) => {
    const next = PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
    setPersonaId(id);
    setThemeId(next.themeId);
    setDraft(next.blocks);
    setLive(next.blocks);
    setSelectedId(null);
    setChannel('draft');
  };

  if (screen === 'signin') {
    return <SignIn persona={persona} onIn={() => setScreen('wizard')} />;
  }

  if (screen === 'wizard') {
    return (
      <Wizard
        personaId={personaId}
        themeId={themeId}
        onPersona={choosePersona}
        onTheme={setThemeId}
        onDone={() => setScreen('studio')}
      />
    );
  }

  const blocks = channel === 'draft' ? draft : live;
  const selected = draft.find((block) => block.id === selectedId) ?? null;
  const definition = selected ? getBlockDefinition(selected.type) : null;

  const mutate = (id: string, change: (block: PageBlock) => PageBlock) =>
    setDraft((current) => current.map((block) => (block.id === id ? change(block) : block)));

  const move = (id: string, by: number) =>
    setDraft((current) => {
      const at = current.findIndex((block) => block.id === id);
      const to = at + by;
      if (at === -1 || to < 0 || to >= current.length) return current;
      const copy = [...current];
      const [taken] = copy.splice(at, 1);
      copy.splice(to, 0, taken);
      return copy;
    });

  const publish = () => {
    setLive(draft);
    setChannel('live');
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 2600);
  };

  return (
    <div className="studio">
      <div className="studio__bar">
        <div className="studio__group">
          <span className="studio__status" data-dirty={dirty ? 'true' : 'false'}>
            {dirty ? 'Unpublished changes' : 'Published'}
          </span>
          <button
            type="button"
            className="studio__btn studio__btn--primary"
            onClick={publish}
            disabled={!dirty}
          >
            {justPublished ? 'Published ✓' : 'Publish'}
          </button>
        </div>

        <div className="studio__group">
          <label className="studio__pick">
            <span>Who</span>
            <select value={personaId} onChange={(e) => choosePersona(e.target.value as PersonaId)}>
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="studio__pick">
            <span>Theme</span>
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="studio__btn"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          >
            {mode === 'light' ? 'Dark' : 'Light'}
          </button>

          <div className="studio__toggle" role="group" aria-label="Screen size">
            {DEVICES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={device === option.id}
                onClick={() => setDevice(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="studio__toggle" role="group" aria-label="Which version to show">
            {(['draft', 'live'] as Channel[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={channel === value}
                onClick={() => setChannel(value)}
              >
                {value === 'draft' ? 'Draft' : 'Live site'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="studio__body">
        <nav className="studio__nav" aria-label="Admin">
          {SIDEBAR.map((section) => (
            <div key={section.group}>
              <h3>{section.group}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item} aria-current={item === 'Homepage' ? 'page' : undefined}>
                    {item === 'Selected work' ? vocabulary(persona).work : item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="studio__navnote">
            One screen of twenty-three. The rest work the same way — a list, and a form.
          </p>
        </nav>

        <div className="studio__outline">
          <h3>Home page</h3>
          <p className="studio__hint">
            {draft.length} blocks. Select one to edit it, and watch the preview.
          </p>
          <ol>
            {draft.map((block, index) => {
              const def = getBlockDefinition(block.type);
              const warnings = warningsFor(block, persona);
              return (
                <li key={block.id} data-selected={block.id === selectedId ? 'true' : 'false'}>
                  <button type="button" onClick={() => setSelectedId(block.id)}>
                    <span className="studio__blocklabel">{def?.label ?? block.type}</span>
                    {block.hidden && <span className="studio__flag">Hidden</span>}
                    {warnings.length > 0 && (
                      <span className="studio__flag studio__flag--warn" title={warnings[0]}>
                        Check
                      </span>
                    )}
                  </button>
                  <span className="studio__rowbtns">
                    <button
                      type="button"
                      onClick={() => move(block.id, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(block.id, 1)}
                      disabled={index === draft.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => mutate(block.id, (b) => ({ ...b, hidden: !b.hidden }))}
                      aria-label={block.hidden ? 'Show' : 'Hide'}
                    >
                      {block.hidden ? '◌' : '●'}
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>

          <details className="studio__palette">
            <summary>Add a block</summary>
            <p className="studio__hint">
              {listBlockDefinitions().length} types. Adding is switched off here so the demo stays
              the shape it started in.
            </p>
            <ul>
              {listBlockDefinitions().map((def) => (
                <li key={def.type}>{def.label}</li>
              ))}
            </ul>
          </details>
        </div>

        <div className="studio__panel">
          {selected && definition ? (
            <>
              <h3>{definition.label}</h3>
              <p className="studio__hint">{definition.description}</p>
              {warningsFor(selected, persona).map((warning) => (
                <p className="studio__warn" key={warning}>
                  {warning}
                </p>
              ))}
              <FieldList
                fields={definition.fields}
                props={selected.props}
                onChange={(props) => mutate(selected.id, (b) => ({ ...b, props }))}
              />
            </>
          ) : (
            <>
              <h3>Nothing selected</h3>
              <p className="studio__hint">
                Choose a block on the left. Every block describes its own form, which is why there
                are twenty-four blocks and one editor.
              </p>
            </>
          )}
        </div>

        <div className="studio__preview">
          <div className="studio__previewbar">
            <span>
              {channel === 'draft' ? 'Draft — only you can see this' : 'Live — what visitors see'}
            </span>
            <span>
              {DEVICES.find((d) => d.id === device)?.width}px ·{' '}
              {persona.name.toLowerCase().replace(/\s+/g, '')}.example
            </span>
          </div>
          <div className="studio__frame">
            <SitePreview
              persona={persona}
              blocks={blocks}
              themeId={themeId}
              mode={mode}
              device={device}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The content warnings the real editor shows.
 *
 * `runBlockChecks` is the product's own, so a block pointed at an empty
 * collection warns here exactly as it would there — including the warning that
 * it will render nothing at all, which is the failure the author is the last
 * person to notice.
 */
function warningsFor(block: PageBlock, persona: Persona): string[] {
  const parsed = parsePage([block])[0];
  if (!parsed || parsed.kind !== 'block') return [];
  return runBlockChecks(parsed, blockContentFor(persona));
}

function SignIn({ persona, onIn }: { persona: Persona; onIn: () => void }) {
  return (
    <div className="gate">
      <div className="gate__card">
        <p className="micro">Your site · /admin</p>
        <h2 className="title">Sign in</h2>
        <p className="small">
          On a real install this is your email and a passphrase you chose. Here it is one button,
          and there is no account behind it.
        </p>

        <dl className="gate__creds">
          <div>
            <dt>Email</dt>
            <dd>{persona.email}</dd>
          </div>
          <div>
            <dt>Passphrase</dt>
            <dd>••••••••••••</dd>
          </div>
        </dl>

        <button type="button" className="btn" onClick={onIn}>
          Sign in as the demo owner
        </button>
        <p className="gate__note">
          Nothing is stored and nothing is sent. Close the tab and it is gone.
        </p>
      </div>
    </div>
  );
}

function Wizard({
  personaId,
  themeId,
  onPersona,
  onTheme,
  onDone,
}: {
  personaId: PersonaId;
  themeId: string;
  onPersona: (id: PersonaId) => void;
  onTheme: (id: string) => void;
  onDone: () => void;
}) {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];

  return (
    <div className="gate">
      <div className="gate__card gate__card--wide">
        <p className="micro">Setup · question 2 of 4</p>
        <h2 className="title">What kind of work do you show?</h2>
        <p className="small">
          This renames sections to language that fits your field — a photographer gets{' '}
          <em>Portfolio</em> and <em>Brands I&rsquo;ve shot for</em> where a developer gets{' '}
          <em>Projects</em> and <em>Stack</em>. It changes wording only, so nothing you have written
          can be lost by it, and you can change it again later.
        </p>

        <div className="gate__choices">
          {PERSONAS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === personaId}
              onClick={() => onPersona(option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.hint}</span>
            </button>
          ))}
        </div>

        <h3 className="head">And a look</h3>
        <div className="gate__choices gate__choices--tight">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-pressed={theme.id === themeId}
              onClick={() => onTheme(theme.id)}
            >
              <strong>{theme.name}</strong>
              <span>{theme.description}</span>
            </button>
          ))}
        </div>

        <p className="small">
          Suggested for {persona.label.toLowerCase()}s:{' '}
          <strong>{THEMES.find((t) => t.id === persona.themeId)?.name}</strong>. Every one of these
          is checked against the same contrast rules that block publishing.
        </p>

        <button type="button" className="btn" onClick={onDone}>
          Open the editor
        </button>
      </div>
    </div>
  );
}
