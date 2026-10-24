'use client';

import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { cn } from '../utils/cn';
import { useToast } from '../context/use-toast';
import { copyText } from '../utils/clipboard';
import { ContactMessage } from '../cms/types/cms';
import { TurnstileWidget } from '@/core/blocks/forms';

/**
 * The contact page's two interactions, as the only client code on it. The
 * heading, the introduction and the WhatsApp link render on the server
 * (`ContactPage`), and every word these islands show arrives as a prop, so
 * neither reads the client content copy.
 */

/**
 * Sends an enquiry to the server.
 *
 * A direct fetch, not a CMS context method: the message is never CMS content
 * (it doesn't touch the draft/published document, isn't part of an export
 * pull, and can't be undone by a restore), so routing it through the CMS
 * context was indirection with no purpose.
 */
async function postContactMessage(
  msg: Omit<ContactMessage, 'id' | 'receivedAt' | 'status'> & { turnstileToken?: string }
): Promise<{ stored: boolean; error?: string }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    return { stored: Boolean(data.ok), error: data.error };
  } catch {
    return { stored: false };
  }
}

/**
 * The email card. A real <button> whose accessible name comes from its
 * contents, so the visible label is trivially part of it (WCAG 2.5.3). An
 * aria-label here would have to repeat every visible word to say the same
 * thing. `icon` is rendered on the server.
 */
export function ContactEmailCard({
  email,
  copiedMessage,
  icon,
}: {
  email: string;
  copiedMessage: string;
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        copyText(email);
        setCopied(true);
        showToast(copiedMessage, 'success');
        setTimeout(() => setCopied(false), 2000);
      }}
      className="w-full text-left p-6 rounded-2xl border border-border bg-surface-primary space-y-3 cursor-pointer hover:border-text-primary/30 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none select-none group"
    >
      <span className="text-xs font-medium uppercase tracking-wider text-text-secondary block flex items-center justify-between font-body">
        <span>DIRECT EMAIL</span>
        {icon}
      </span>

      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-base sm:text-lg font-medium text-text-primary group-hover:text-accent transition-colors break-all">
          {email}
        </span>

        <div
          className={cn(
            'px-3.5 py-1.5 rounded-xl border font-body transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 select-none',
            copied
              ? 'bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_rgba(53,242,179,0.25)]'
              : 'bg-surface-secondary border-border text-text-secondary group-hover:border-text-primary/40 group-hover:text-text-primary'
          )}
        >
          {copied ? (
            <div key="copied" className="opb-pop flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
              <span className="text-[11px] font-medium text-accent font-body tracking-wider">
                Copied!
              </span>
            </div>
          ) : (
            <div key="copy" className="opb-pop flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" />
              <span className="text-[11px] font-medium font-body uppercase tracking-wider">
                Copy
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

const ENQUIRY_TYPES = [
  'Project enquiry',
  'Job opportunity',
  'Collaboration',
  'Speaking or teaching',
  'Just saying hello',
  'Other',
] as const;

const EMPTY_FORM = {
  name: '',
  email: '',
  company: '',
  projectType: ENQUIRY_TYPES[0] as string,
  message: '',
  honeypot: '', // Spam protection
};

export interface ContactFormCopy {
  messageSent: string;
  successTitle: string;
  successBody: string;
  sendAnother: string;
}

/** `selectIcon` is the chevron over the native select, rendered on the server. */
export function ContactForm({
  ownerEmail,
  copy,
  selectIcon,
}: {
  ownerEmail: string;
  copy: ContactFormCopy;
  selectIcon: React.ReactNode;
}) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [spamToken, setSpamToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Valid email is required';
    if (!formData.message.trim()) errs.message = 'Please provide project details';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    // Bots fill hidden fields; humans don't. Pretend success and drop it.
    if (formData.honeypot) {
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    // The server stores the enquiry and emails the owner about it — best
    // effort, and a failed notification doesn't undo the save (see
    // app/api/contact/route.ts). If the save itself fails there is nothing to
    // notify about, so the confirmation below deliberately tells the sender to
    // email directly instead.
    trackEvent('Contact submitted');
    const result = await postContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim() || undefined,
      projectType: formData.projectType,
      message: formData.message.trim(),
      turnstileToken: spamToken,
    });

    setIsSubmitting(false);

    if (!result.stored) {
      setErrorMessage(
        result.error ||
          `Your message could not be saved. Please email me directly at ${ownerEmail}.`
      );
      return;
    }

    setSubmitted(true);
    showToast(copy.messageSent, 'success');
    setFormData(EMPTY_FORM);
  };

  if (submitted) {
    return (
      <div className="p-10 sm:p-14 rounded-3xl border border-border bg-surface-primary text-center flex flex-col items-center justify-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-accent" />
        <h3 className="font-display text-2xl sm:text-3xl font-medium text-text-primary">
          {copy.successTitle}
        </h3>
        <p className="text-text-secondary text-base max-w-md font-body font-normal leading-relaxed">
          {copy.successBody}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 px-5 py-2 text-xs font-mono font-medium text-text-muted hover:text-text-primary transition-colors border border-border rounded-full"
        >
          {copy.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot Spam Protection Field */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-danger bg-danger-subtle text-danger text-xs sm:text-sm font-body flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="contact-name"
            className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-2 font-body"
          >
            YOUR NAME *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={cn(
              'w-full px-5 py-3.5 rounded-2xl bg-surface-primary border text-text-primary font-body text-base outline-none transition-all duration-200',
              errors.name
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-accent'
            )}
          />
          {errors.name && (
            <span id="contact-name-error" className="text-xs text-danger mt-1 block font-body">
              {errors.name}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-2 font-body"
          >
            YOUR EMAIL *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={cn(
              'w-full px-5 py-3.5 rounded-2xl bg-surface-primary border text-text-primary font-body text-base outline-none transition-all duration-200',
              errors.email
                ? 'border-danger focus:border-danger'
                : 'border-border focus:border-accent'
            )}
          />
          {errors.email && (
            <span id="contact-email-error" className="text-xs text-danger mt-1 block font-body">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      {/* Company & Project Type Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="contact-company"
            className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-2 font-body"
          >
            COMPANY / ORGANISATION
          </label>
          <input
            id="contact-company"
            name="organization"
            type="text"
            autoComplete="organization"
            placeholder="Optional"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-5 py-3.5 rounded-2xl bg-surface-primary border border-border text-text-primary font-body text-base outline-none focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="contact-project-type"
            className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-2 font-body"
          >
            ENQUIRY TYPE
          </label>

          <div className="relative">
            <select
              id="contact-project-type"
              name="projectType"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-surface-primary border border-border text-text-primary font-body text-base outline-none focus:border-accent appearance-none transition-all duration-200 cursor-pointer"
            >
              {ENQUIRY_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-surface-primary text-text-primary py-2"
                >
                  {type}
                </option>
              ))}
            </select>
            {selectIcon}
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-2 font-body"
        >
          DETAILS *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          placeholder="A little about what you have in mind — goals, timing, scope."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={cn(
            'w-full px-5 py-4 rounded-2xl bg-surface-primary border text-text-primary font-body text-base outline-none transition-all duration-200 resize-none',
            errors.message
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-accent'
          )}
        />
        {errors.message && (
          <span id="contact-message-error" className="text-xs text-danger mt-1 block font-body">
            {errors.message}
          </span>
        )}
      </div>

      {/* Human check. Renders only when the owner configured bot protection;
          otherwise the honeypot above is the whole defence and this is
          nothing. */}
      <TurnstileWidget onToken={setSpamToken} />

      {/* Submit Button (Strict 42px Height) */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Send Message"
        className="w-full h-[42px] rounded-full font-body font-medium text-xs sm:text-[13px] uppercase tracking-wider bg-text-primary text-bg hover:opacity-90 transition-all duration-250 flex items-center justify-center gap-2 group cursor-pointer shadow-sm select-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>SENDING...</span>
          </>
        ) : (
          <>
            <span>SEND MESSAGE</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
          </>
        )}
      </button>
    </form>
  );
}
