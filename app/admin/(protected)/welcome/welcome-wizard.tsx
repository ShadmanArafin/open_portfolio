'use client';

import { useState } from 'react';
import { PROFESSIONS, type ProfessionId } from '@/cms/data/professions';
import { WELCOME_ACCENTS, type WelcomeAccent } from '@/core/content/welcome';
import { dismissWelcome } from '../_components/welcome-dismissed';
import { applyWelcomeAction } from '../_actions/welcome';

/**
 * The wizard proper. The rules it applies live in `core/content/welcome.ts`
 * and run on the server; this is steps, wording and two buttons.
 *
 * Written in plain Tailwind rather than the old admin component kit, because
 * this runs before anyone has any reason to care what the admin looks like,
 * and it should survive that kit being replaced — which is now happening.
 */

const field =
  'w-full rounded-xl border border-border bg-surface-primary px-4 py-3 font-body text-base text-text-primary outline-none transition-colors focus:border-accent';
const label = 'mb-2 block font-body text-xs font-medium uppercase tracking-wider text-text-muted';

export function WelcomeWizard({ currentName }: { currentName: string }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState<ProfessionId>('other');
  const [accent, setAccent] = useState<WelcomeAccent>(WELCOME_ACCENTS[0]);

  const steps = ['You', 'Your field', 'Colour', 'Finish'];

  const applyAndPublish = async () => {
    setSaving(true);
    setError(null);

    let result: Awaited<ReturnType<typeof applyWelcomeAction>> | null = null;
    try {
      result = await applyWelcomeAction({
        fullName,
        role,
        location,
        email,
        profession,
        accentName: accent.name,
      });
    } catch {
      setError('Could not reach the server. Try again.');
      setSaving(false);
      return;
    }

    setSaving(false);

    // Completing the wizard counts as dismissing it, whether or not the
    // publish succeeded. A failed publish already reports itself below;
    // trapping them here on top of that would be punishing the wrong person.
    dismissWelcome();

    if (!result.ok) {
      setError(result.error ?? 'That did not go through. Try again.');
      return;
    }
    // A full navigation: the action published, and the admin shells may be
    // cached from before the change.
    window.location.assign('/admin');
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
          <p className="m-0 mt-3 font-body text-sm text-text-secondary">
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
          <p className="m-0 mt-3 font-body text-sm text-text-secondary">
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
          <p className="m-0 mt-3 font-body text-sm text-text-secondary">
            Used for links, buttons and highlights. Each of these has been checked to stay readable
            in both light and dark mode.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WELCOME_ACCENTS.map((option) => (
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
          <p className="m-0 mt-3 font-body text-sm text-text-secondary">
            Publishing now puts <strong>{fullName.trim() || currentName}</strong> on the live site.
            The demo projects are still there as examples — replace or delete them whenever you
            like.
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
            <p role="alert" className="m-0 mt-6 font-body text-sm text-danger">
              {error}
            </p>
          )}
        </section>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            // Record the choice before leaving. Without this the assistant
            // gate sees the still-placeholder name and sends them right back
            // here, which is what made this button inert.
            dismissWelcome();
            window.location.assign('/admin');
          }}
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
              onClick={() => void applyAndPublish()}
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
}
