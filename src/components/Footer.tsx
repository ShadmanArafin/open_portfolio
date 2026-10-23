import { isShippedCopyright } from '@/core/content/identity';
import { sanitizeHref } from '@/core/security/urls';
import { Mail, Download, ArrowUpRight } from 'lucide-react';
import { getSocialPlatform } from '../cms/data/socialPlatforms';
import { Container } from './common/Container';
import { siteContent } from '../cms/server';
import { siteNow } from '@/core/content/now';
import { CopyEmailButton, TrackedLink } from './footer-actions';
import { CMSImage } from './common/CMSImage';
import { NewsletterSignup } from './NewsletterSignup';
import { resolveAssetUrl } from '../cms/utils/mediaUrls';

export async function Footer() {
  const data = await siteContent();
  const year = (await siteNow()).getFullYear();

  // Same rule as the social row block: a stored link that is not a safe
  // destination is left out rather than rendered as a dead or hostile card.
  const socialLinks = (data.socialLinks || [])
    .filter((s) => s.visible !== false)
    .flatMap((s) => {
      const url = sanitizeHref(s.url);
      return url ? [{ ...s, url }] : [];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <footer
      id="contact"
      className="w-full border-t border-border bg-[var(--section-footer)] text-text-primary pt-24 sm:pt-32 lg:pt-36 transition-colors duration-300 relative overflow-clip font-sans scroll-mt-28"
    >
      <Container>
        {/* FOOTER MAIN 12-COLUMN EDITORIAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 sm:pb-24 border-b border-border">
          {/* LEFT 7 COLUMNS: IDENTITY & CONTACT INFO */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10">
            <div className="opb-reveal flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-border flex-shrink-0 shadow-sm">
                <CMSImage
                  src={data.settings.avatarPath || '/demo/avatar.svg'}
                  alt={data.settings.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                {/* Identity, not a section: the footer CTA below is the h2, so
                    a heading here would either skip a level (h3 after h1) or
                    duplicate it. Size comes from the classes. */}
                <p className="font-display font-medium text-xl sm:text-2xl text-text-primary">
                  {data.settings.fullName}
                </p>
                <span className="text-xs sm:text-sm font-mono text-accent">
                  {data.settings.role}
                </span>
              </div>
            </div>

            <h2 className="opb-reveal font-display text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.18] max-w-xl text-text-primary">
              {data.microcopy.letsWorkTogetherTitle ||
                "Let's build something exceptional together."}
            </h2>

            <div className="opb-reveal flex flex-wrap items-center gap-4">
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
                <TrackedLink
                  event="Resume downloaded"
                  href={resolveAssetUrl(data.settings.resumeUrl)}
                  download={data.settings.resumeFilename || 'resume.pdf'}
                  className="h-[42px] px-6 rounded-full border border-border bg-surface-secondary text-text-primary font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider hover:border-text-primary/40 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-accent" />
                  <span>{data.microcopy.myResume || 'DOWNLOAD RESUME'}</span>
                </TrackedLink>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: SOCIAL CARDS & EMAIL COPY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {socialLinks.map((card) => {
                const IconComponent = getSocialPlatform(card.iconType).icon;

                return (
                  <TrackedLink
                    key={card.id || card.label}
                    event="Social clicked"
                    eventProps={{ platform: card.iconType }}
                    href={card.url}
                    target="_blank"
                    // `me`: these are the owner's own profiles, and it is what
                    // lets Mastodon and other IndieWeb verifiers link back.
                    rel="me noopener noreferrer"
                    className="opb-reveal p-4 rounded-2xl bg-surface-primary border border-border hover:border-text-primary/30 transition-all duration-200 group flex flex-col justify-between h-24"
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
                  </TrackedLink>
                );
              })}
            </div>

            {/* Email Copy Card.
                A plain container around one real button: an earlier version
                made the whole card a div-button wrapping a second button,
                which nests interactive controls (WCAG 4.1.2) and announces
                twice. One control, one announcement. */}
            <div className="opb-reveal p-5 rounded-[22px] bg-surface-primary border border-border flex flex-col justify-between gap-3 hover:border-text-primary/30 transition-all group">
              <div className="flex items-center gap-2 text-[11px] font-medium text-text-muted font-body">
                <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                <span>{data.microcopy.directEmailLabel || 'Or, feel free to send me a mail'}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-display font-medium text-sm sm:text-base text-text-primary group-hover:text-accent transition-colors break-all">
                  {data.settings.email}
                </span>

                <CopyEmailButton email={data.settings.email} />
              </div>
            </div>
          </div>
        </div>

        {/* Renders nothing at all unless the owner switched it on. */}
        <NewsletterSignup />

        {/* FOOTER LOWER META AREA.
            Secondary, not muted: 12px muted fails 4.5:1 in light mode and the
            matrix caught it. Fine print still has to be readable. */}
        <div className="flex items-center justify-center py-6 border-t border-border text-xs text-text-secondary font-body font-normal text-center w-full">
          <span>
            {isShippedCopyright(data.settings.copyrightText)
              ? `Handmade with care ✦ © ${year} ${data.settings.fullName}`
              : data.settings.copyrightText ||
                `Handmade with care ✦ © ${year} ${data.settings.fullName}`}
          </span>
        </div>
      </Container>

      {/* GIANT OVERSIZED TYPOGRAPHY */}
      <div className="opb-reveal w-full overflow-hidden select-none pointer-events-none mt-6 relative flex justify-center items-center">
        {/*
         * A watermark, not a heading.
         *
         * This was an `<h1>` at 10% opacity, on pages where `HeroSection`
         * already renders the real one — so every page had two, and a screen
         * reader announced a decorative word as a top-level heading. That is
         * SC 1.3.1: the markup said "heading" and the design said "texture".
         * A div with `aria-hidden` says what it is.
         *
         * The size floor was also wrong: 120px is taller than a phone is wide,
         * so with `whitespace-nowrap` a long name made the box 406px inside a
         * 375px viewport. It never scrolled the page only because an ancestor
         * happened to clip it, which is luck rather than layout.
         */}
        <div
          aria-hidden="true"
          className="font-display font-medium text-[clamp(56px,20vw,360px)] leading-[0.8] tracking-tighter text-center text-text-primary/10 whitespace-nowrap -mb-[2vw] max-w-full overflow-hidden"
        >
          {data.appearance?.giantFooterText || 'PORTFOLIO'}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--section-footer)] to-transparent pointer-events-none" />
      </div>
    </footer>
  );
}
