'use client';

import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { cn } from '../utils/cn';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../cms/context/CMSContext';

export const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { data, submitContactMessage } = useCMS();
  const settings = data.settings;
  const header = data.sections.find((s) => s.id === 'contact-page');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: 'Project enquiry',
    message: '',
    honeypot: '', // Spam protection
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleCopyEmail = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(settings.email);
    setCopied(true);
    showToast(data.microcopy.emailCopied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

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

    // Messages are stored locally and appear in /admin/messages. There is no
    // mail delivery yet, so the confirmation below deliberately tells the
    // sender to email directly if it's urgent.
    trackEvent('Contact submitted');
    const stored = submitContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim() || undefined,
      projectType: formData.projectType,
      message: formData.message.trim(),
    });

    setIsSubmitting(false);

    if (!stored) {
      setErrorMessage(
        `Your message could not be saved. Please email me directly at ${settings.email}.`
      );
      return;
    }

    setSubmitted(true);
    showToast(data.microcopy.messageSent, 'success');
    setFormData({
      name: '',
      email: '',
      company: '',
      projectType: 'Project enquiry',
      message: '',
      honeypot: '',
    });
  };

  return (
    <div className="pt-32 sm:pt-40 font-sans">
      <Section className="py-12 sm:py-16 bg-[var(--section-hero)]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column (5 Cols) */}
            <div className="lg:col-span-5">
              <SectionLabel text={header?.label || 'CONTACT'} />

              <Reveal type="clip-headline">
                <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight text-text-primary mb-6 leading-[1.08]">
                  {header?.heading}
                </h1>
              </Reveal>

              <Reveal type="fade-up" delay={0.2}>
                <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8 font-body font-normal">
                  {header?.description}
                </p>
              </Reveal>

              <div className="space-y-4">
                {/* Email Copy Box */}
                {/* A real <button>, so Enter and Space work without hand-rolling
                    key handlers and screen readers announce it correctly. */}
                <button
                  type="button"
                  onClick={() => handleCopyEmail()}
                  aria-label={`Copy email address ${settings.email}`}
                  className="w-full text-left p-6 rounded-2xl border border-border bg-surface-primary space-y-3 cursor-pointer hover:border-text-primary/30 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none select-none group"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted block flex items-center justify-between font-body">
                    <span>DIRECT EMAIL</span>
                    <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                  </span>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-base sm:text-lg font-medium text-text-primary group-hover:text-accent transition-colors break-all">
                      {settings.email}
                    </span>

                    {/* Animated Copy Button Pill */}
                    <motion.div
                      layout
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl border font-body transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 select-none',
                        copied
                          ? 'bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_rgba(53,242,179,0.25)]'
                          : 'bg-surface-secondary border-border text-text-secondary group-hover:border-text-primary/40 group-hover:text-text-primary'
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.div
                            key="copied"
                            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                            transition={{ duration: 0.22, ease: 'backOut' }}
                            className="flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
                            <span className="text-[11px] font-medium text-accent font-body tracking-wider">
                              Copied!
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" />
                            <span className="text-[11px] font-medium font-body uppercase tracking-wider">
                              Copy
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </button>

                {/* WhatsApp Action Button (42px Height) */}
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact via WhatsApp"
                  className="w-full h-[42px] px-6 rounded-full bg-[#25D366] text-white font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:bg-[#20bd5a] transition-all duration-250 shadow-sm hover:-translate-y-[1px] inline-flex items-center justify-center gap-2 group cursor-pointer select-none"
                >
                  <FaWhatsapp className="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-105" />
                  <span>CONTACT ON WHATSAPP ({settings.whatsappFormatted})</span>
                </a>
              </div>
            </div>

            {/* Right Form Column (7 Cols) */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="p-10 sm:p-14 rounded-3xl border border-border bg-surface-primary text-center flex flex-col items-center justify-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-accent" />
                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-text-primary">
                    {data.microcopy.contactSuccessTitle}
                  </h3>
                  <p className="text-text-secondary text-base max-w-md font-body font-normal leading-relaxed">
                    {data.microcopy.contactSuccessBody}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2 text-xs font-mono font-medium text-text-muted hover:text-text-primary transition-colors border border-border rounded-full"
                  >
                    {data.microcopy.sendAnotherMessage}
                  </button>
                </div>
              ) : (
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
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs sm:text-sm font-body flex items-start gap-2.5">
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
                            ? 'border-red-500/80 focus:border-red-500'
                            : 'border-border focus:border-accent'
                        )}
                      />
                      {errors.name && (
                        <span
                          id="contact-name-error"
                          className="text-xs text-red-400 mt-1 block font-body"
                        >
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
                            ? 'border-red-500/80 focus:border-red-500'
                            : 'border-border focus:border-accent'
                        )}
                      />
                      {errors.email && (
                        <span
                          id="contact-email-error"
                          className="text-xs text-red-400 mt-1 block font-body"
                        >
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

                      {/* Sleek Custom Select Container */}
                      <div className="relative">
                        <select
                          id="contact-project-type"
                          name="projectType"
                          value={formData.projectType}
                          onChange={(e) =>
                            setFormData({ ...formData, projectType: e.target.value })
                          }
                          className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-surface-primary border border-border text-text-primary font-body text-base outline-none focus:border-accent appearance-none transition-all duration-200 cursor-pointer"
                        >
                          <option
                            value="Project enquiry"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Project enquiry
                          </option>
                          <option
                            value="Job opportunity"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Job opportunity
                          </option>
                          <option
                            value="Collaboration"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Collaboration
                          </option>
                          <option
                            value="Speaking or teaching"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Speaking or teaching
                          </option>
                          <option
                            value="Just saying hello"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Just saying hello
                          </option>
                          <option
                            value="Other"
                            className="bg-surface-primary text-text-primary py-2"
                          >
                            Other
                          </option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200" />
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
                          ? 'border-red-500/80 focus:border-red-500'
                          : 'border-border focus:border-accent'
                      )}
                    />
                    {errors.message && (
                      <span
                        id="contact-message-error"
                        className="text-xs text-red-400 mt-1 block font-body"
                      >
                        {errors.message}
                      </span>
                    )}
                  </div>

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
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
