import React from 'react';
import { Mail, ChevronDown } from 'lucide-react';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { siteContent } from '../cms/server';
import { ContactEmailCard, ContactForm } from './contact-actions';

/**
 * The contact page, rendered on the server. The two things a visitor does
 * here — copy the address, send the form — are client islands
 * (`contact-actions.tsx`) that get their words as props; everything else
 * ships as HTML.
 *
 * `whatsappIcon` arrives rendered from the route: an icon is markup, and
 * passing it in keeps the icon library out of the browser bundle entirely.
 */
export async function ContactPage({ whatsappIcon }: { whatsappIcon?: React.ReactNode }) {
  const data = await siteContent();
  const settings = data.settings;
  const header = data.sections.find((s) => s.id === 'contact-page');

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
                <ContactEmailCard
                  email={settings.email}
                  copiedMessage={data.microcopy.emailCopied}
                  icon={
                    <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                  }
                />

                {/* WhatsApp Action Button (42px Height).
                    Token colours, not brand green: white on #25D366 is ~2.5:1
                    and no theme can fix a hardcoded pair. The icon carries the
                    brand; the contrast carries the readability. No aria-label
                    for the same 2.5.3 reason as the email card — the visible
                    words are the name. */}
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-[42px] px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider transition-all duration-250 shadow-sm hover:-translate-y-[1px] inline-flex items-center justify-center gap-2 group cursor-pointer select-none"
                >
                  {whatsappIcon}
                  <span>CONTACT ON WHATSAPP ({settings.whatsappFormatted})</span>
                </a>
              </div>
            </div>

            {/* Right Form Column (7 Cols) */}
            <div className="lg:col-span-7">
              <ContactForm
                ownerEmail={settings.email}
                copy={{
                  messageSent: data.microcopy.messageSent,
                  successTitle: data.microcopy.contactSuccessTitle,
                  successBody: data.microcopy.contactSuccessBody,
                  sendAnother: data.microcopy.sendAnotherMessage,
                }}
                selectIcon={
                  <ChevronDown className="w-4 h-4 text-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200" />
                }
              />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
