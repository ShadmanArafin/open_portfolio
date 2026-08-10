'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../../cms/context/CMSContext';
import { PROFESSIONS, type ProfessionId } from '../../cms/data/professions';

/**
 * The first thing a new owner sees.
 *
 * Somebody who has just clicked a deploy button has a site full of a fictional
 * person's placeholder content and twenty admin screens they have never seen.
 * Dropping them straight into that is how a promising install becomes an
 * abandoned one. Four questions is enough to make the site recognisably theirs,
 * and every one of them is skippable — the screens are all still there
 * afterwards.
 *
 * Written in plain Tailwind rather than the admin's component kit, because this
 * runs before anyone has any reason to care what the admin looks like, and it
 * should survive that kit being replaced.
 */

const ACCENTS = [
  { name: 'Mint', dark: '#35F2B3', light: '#00B97D' },
  { name: 'Blue', dark: '#60A5FA', light: '#2563EB' },
  { name: 'Amber', dark: '#FBBF24', light: '#B45309' },
  { name: 'Rose', dark: '#FB7185', light: '#BE123C' },
  { name: 'Violet', dark: '#A78BFA', light: '#6D28D9' },
  { name: 'Slate', dark: '#94A3B8', light: '#475569' },
];

const field =
  'w-full rounded-xl border border-border bg-surface-primary px-4 py-3 font-body text-base text-text-primary outline-none transition-colors focus:border-accent';
const label = 'mb-2 block font-body text-xs font-medium uppercase tracking-wider text-text-muted';

export const AdminWelcome: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateDraft, publishDraft } = useCMS();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState<ProfessionId>('other');
  const [accent, setAccent] = useState(ACCENTS[0]);

  const steps = ['You', 'Your field', 'Colour', 'Finish'];

  const applyAndPublish = async () => {
    setSaving(true);
    setError(null);

    const preset = PROFESSIONS.find((p) => p.id === profession);

    updateDraft((draft) => {
      if (fullName.trim()) {
        draft.settings.fullName = fullName.trim();
        draft.appearance.giantFooterText = fullName.trim().split(/\s+/)[0].toUpperCase();
        draft.seo.author = fullName.trim();
        draft.settings.copyrightText = `© ${new Date().getFullYear()} ${fullName.trim()}`;
      }
      if (role.trim()) draft.settings.role = role.trim();
      if (location.trim()) draft.settings.location = location.trim();
      if (email.trim()) draft.settings.email = email.trim();

      if (fullName.trim() || role.trim()) {
        const name = fullName.trim() || draft.settings.fullName;
        const job = role.trim() || draft.settings.role;
        draft.seo.siteTitle = `${name} — ${job}`;
        draft.seo.titleTemplate = `%s — ${name}`;
      }

      // The preset renames the built-in sections rather than restructuring
      // anything, so nothing the user has already written can be lost by it.
      if (preset) {
        for (const section of draft.sections) {
          const replacement = preset.sectionLabels[section.id];
          if (replacement) section.label = replacement;
        }
        // MicrocopySettings is a closed set of named keys, so writing into it
        // by string needs an explicit widening. Unknown keys are skipped rather
        // than added, which keeps a stale pack from growing junk fields.
        const microcopy = draft.microcopy as unknown as Record<string, string>;
        for (const [key, value] of Object.entries(preset.microcopy)) {
          if (key in draft.microcopy) microcopy[key] = value;
        }
      }

      draft.appearance.accentDark = accent.dark;
      draft.appearance.accentLight = accent.light;
    });

    // updateDraft debounces its write, so give it a moment to land before the
    // publish reads it back.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const ok = await publishDraft();
    setSaving(false);

    if (!ok) {
      setError('Your answers are saved, but publishing them failed. Try Publish from the top bar.');
      return;
    }
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ol className="mb-10 flex items-center gap-2" aria-label="Setup progress">
        {steps.map((name, index) => (
          <li key={name} className="flex flex-1 items-center gap-2">
            <span
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= step ? 'bg-accent' : 'bg-border'
              }`}
              aria-current={index === step ? 'step' : undefined}
            />
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section>
          <h1 className="font-display text-3xl font-medium text-text-primary">
            Welcome. Let&apos;s make this yours.
          </h1>
          <p className="mt-3 font-body text-sm text-text-secondary">
            Four short steps. Everything here can be changed later, and you can skip straight to the
            editor if you would rather explore first.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="w-name" className={label}>
                Your name
              </label>
              <input
                id="w-name"
                className={field}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="w-role" className={label}>
                What you do
              </label>
              <input
                id="w-role"
                className={field}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product Designer"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="w-location" className={label}>
                  Where you are
                </label>
                <input
                  id="w-location"
                  className={field}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote"
                />
              </div>
              <div>
                <label htmlFor="w-email" className={label}>
                  Public email
                </label>
                <input
                  id="w-email"
                  type="email"
                  className={field}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h1 className="font-display text-3xl font-medium text-text-primary">
            What kind of work do you show?
          </h1>
          <p className="mt-3 font-body text-sm text-text-secondary">
            This renames the sections to language that fits your field. A photographer gets
            &ldquo;Series&rdquo; where a developer gets &ldquo;Projects&rdquo;. It changes wording
            only — nothing you write is moved or lost.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROFESSIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setProfession(option.id)}
                aria-pressed={profession === option.id}
                className={`rounded-xl border px-4 py-4 text-left font-body text-sm transition-colors ${
                  profession === option.id
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border bg-surface-primary text-text-secondary hover:border-text-primary/30'
                }`}
              >
                <span className="block font-medium">{option.name}</span>
                <span className="mt-1 block text-xs text-text-muted">{option.example}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="font-display text-3xl font-medium text-text-primary">Pick a colour.</h1>
          <p className="mt-3 font-body text-sm text-text-secondary">
            Used for links, buttons and highlights. Each of these has been checked to stay readable
            in both light and dark mode.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACCENTS.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setAccent(option)}
                aria-pressed={accent.name === option.name}
                className={`flex items-center gap-3 rounded-xl border px-4 py-4 font-body text-sm transition-colors ${
                  accent.name === option.name
                    ? 'border-accent text-text-primary'
                    : 'border-border text-text-secondary hover:border-text-primary/30'
                }`}
              >
                <span
                  aria-hidden
                  className="h-6 w-6 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: option.dark }}
                />
                {option.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1 className="font-display text-3xl font-medium text-text-primary">
            That&apos;s the setup done.
          </h1>
          <p className="mt-3 font-body text-sm text-text-secondary">
            Publishing now puts <strong>{fullName.trim() || data.settings.fullName}</strong> on the
            live site. The demo projects are still there as examples — replace or delete them
            whenever you like.
          </p>

          <ul className="mt-8 space-y-3 font-body text-sm text-text-secondary">
            <li>
              &middot; Add your own work under <strong>Selected work</strong>.
            </li>
            <li>
              &middot; Upload a photo and a r&eacute;sum&eacute; under <strong>Media</strong>.
            </li>
            <li>
              &middot; The <strong>Dashboard</strong> lists anything still unfinished, with a link
              to the screen that fixes it.
            </li>
          </ul>

          {error && (
            <p role="alert" className="mt-6 font-body text-sm text-red-400">
              {error}
            </p>
          )}
        </section>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-body text-sm text-text-muted underline-offset-4 hover:underline"
        >
          Skip and explore the editor
        </button>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex h-[42px] items-center rounded-full border border-border px-5 font-body text-xs font-medium uppercase tracking-wider text-text-primary"
            >
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex h-[42px] items-center rounded-full bg-text-primary px-6 font-body text-xs font-medium uppercase tracking-wider text-bg transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={applyAndPublish}
              disabled={saving}
              className="inline-flex h-[42px] items-center rounded-full bg-accent px-6 font-body text-xs font-medium uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Publishing...' : 'Publish my site'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
