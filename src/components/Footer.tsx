import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';
import { Mail, Copy, Check, Download, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSocialPlatform } from '../cms/data/socialPlatforms';
import { Container } from './common/Container';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from './common/CMSImage';
import { resolveAssetUrl } from '../cms/utils/mediaUrls';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { data } = useCMS();

  const handleCopyEmail = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const emailToCopy = data.settings.email;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailToCopy).catch(() => {
        const el = document.createElement('textarea');
        el.value = emailToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = emailToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    setCopied(true);
    trackEvent('Email copied');
    showToast('Email address copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDownEmail = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopyEmail();
    }
  };

  const socialLinks = (data.socialLinks || [])
    .filter((s) => s.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <footer
      id="contact"
      className="w-full border-t border-border bg-[var(--section-footer)] text-text-primary pt-24 sm:pt-32 lg:pt-36 transition-colors duration-300 relative overflow-hidden font-sans scroll-mt-28"
    >
      <Container>
        {/* FOOTER MAIN 12-COLUMN EDITORIAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 sm:pb-24 border-b border-border">
          {/* LEFT 7 COLUMNS: IDENTITY & CONTACT INFO */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-border flex-shrink-0 shadow-sm">
                <CMSImage
                  src={data.settings.avatarPath || '/demo/avatar.svg'}
                  alt={data.settings.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-display font-medium text-xl sm:text-2xl text-text-primary">
                  {data.settings.fullName}
                </h3>
                <span className="text-xs sm:text-sm font-mono text-accent">
                  {data.settings.role}
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.18] max-w-xl text-text-primary"
            >
              {data.microcopy.letsWorkTogetherTitle ||
                "Let's build something exceptional together."}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href={`mailto:${data.settings.email}`}
                className="h-[42px] px-6 rounded-full bg-text-primary text-bg font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              >
                <span>{data.microcopy.contactButton || 'SEND A MESSAGE'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* An uploaded résumé is stored as `idb:<id>`, so it has to go
                  through the resolver or the href is dead. No résumé, no
                  button — an empty download link is worse than none. */}
              {data.settings.resumeUrl && (
                <a
                  href={resolveAssetUrl(data.settings.resumeUrl)}
                  download={data.settings.resumeFilename || 'resume.pdf'}
                  onClick={() => trackEvent('Resume downloaded')}
                  className="h-[42px] px-6 rounded-full border border-border bg-surface-secondary text-text-primary font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:border-text-primary/40 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-accent" />
                  <span>{data.microcopy.myResume || 'DOWNLOAD RESUME'}</span>
                </a>
              )}
            </motion.div>
          </div>

          {/* RIGHT 5 COLUMNS: SOCIAL CARDS & EMAIL COPY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {socialLinks.map((card, idx) => {
                const IconComponent = getSocialPlatform(card.iconType).icon;

                return (
                  <motion.a
                    key={card.id || card.label}
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('Social clicked', { platform: card.iconType })}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-surface-primary border border-border hover:border-text-primary/30 transition-all duration-200 group flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between text-text-muted group-hover:text-accent transition-colors">
                      <span className="text-[10px] font-mono uppercase tracking-wider">
                        {card.label}
                      </span>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-primary font-body">
                        {card.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Email Copy Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              onClick={(e) => handleCopyEmail(e)}
              onKeyDown={handleKeyDownEmail}
              tabIndex={0}
              role="button"
              aria-label="Copy email address"
              className="p-5 rounded-[22px] bg-surface-primary border border-border flex flex-col justify-between gap-3 hover:border-text-primary/30 transition-all cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium text-text-muted font-body">
                <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                <span>{data.microcopy.directEmailLabel || 'Or, feel free to send me a mail'}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-display font-medium text-sm sm:text-base text-text-primary group-hover:text-accent transition-colors break-all">
                  {data.settings.email}
                </span>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyEmail(e);
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl border font-body transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 cursor-pointer',
                    copied
                      ? 'bg-accent/15 border-accent/40 text-accent font-medium'
                      : 'bg-surface-secondary border-border text-text-secondary group-hover:border-text-primary/40 group-hover:text-text-primary'
                  )}
                >
                  {copied ? (
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
                      <span className="text-[11px] font-medium text-accent font-body tracking-wider">
                        Copied!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary" />
                      <span className="text-[11px] font-medium font-body uppercase tracking-wider hidden xs:inline-block">
                        Copy
                      </span>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FOOTER LOWER META AREA */}
        <div className="flex items-center justify-center py-6 border-t border-border text-xs text-text-muted font-body font-normal text-center w-full">
          <span>
            {data.settings.copyrightText ||
              `Handmade with care ✦ © ${new Date().getFullYear()} ${data.settings.fullName}`}
          </span>
        </div>
      </Container>

      {/* GIANT OVERSIZED TYPOGRAPHY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full overflow-hidden select-none pointer-events-none mt-6 relative flex justify-center items-center"
      >
        <h1 className="font-display font-medium text-[clamp(120px,22vw,360px)] leading-[0.8] tracking-tighter text-center text-text-primary/10 whitespace-nowrap -mb-[2vw]">
          {data.appearance?.giantFooterText || 'PORTFOLIO'}
        </h1>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--section-footer)] to-transparent pointer-events-none" />
      </motion.div>
    </footer>
  );
};
