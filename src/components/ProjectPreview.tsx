'use client';

import React, { useState, ViewTransition } from 'react';
import { trackEvent } from '../utils/analytics';
import { ProjectItem } from '../cms/types/cms';
import { formatYearRange } from '../cms/utils/dates';
import { CMSImageBase } from './common/cms-image-base';
import { ArrowUpRight } from 'lucide-react';
import { ImageLightboxModal } from './common/ImageLightboxModal';

import Link from 'next/link';
interface ProjectPreviewProps {
  project: ProjectItem;
  index: number;
  /** Image URL → `srcset`, worked out by the server parent (`srcSetsFor`). */
  srcSets?: Record<string, string>;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ project, srcSets }) => {
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    imageAlt: string;
  }>({
    isOpen: false,
    imageSrc: null,
    imageAlt: '',
  });

  const openLightbox = (src: string, alt: string) => {
    setLightboxState({
      isOpen: true,
      imageSrc: src,
      imageAlt: alt,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  // No invented fallback. This used to guess `https://<slug>.com`, which sends
  // visitors to a domain that may not be yours — or may be somebody else's.
  const liveWebsiteUrl = (project.liveUrl || project.siteUrl || project.companyUrl || '').trim();

  return (
    <>
      <div className="w-full border-t border-border pt-16 sm:pt-24 pb-16 sm:pb-28 mb-16 sm:mb-24 last:mb-0 last:pb-0">
        {/* 12-Column Layout: Left Content (Sticky) + Right 4 Scrolling Images */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
          {/* =================================================================== */}
          {/* LEFT COLUMN: STICKY PROJECT INFORMATION                             */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 transition-colors duration-300">
            {/* Subtle Opacity & Translate Entrance Reveal */}
            <div className="opb-reveal">
              {/* Year & Company Pill Signal */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="px-3.5 py-1 rounded-full text-xs font-medium font-body bg-surface-primary text-text-primary border border-border">
                  {formatYearRange(project)}
                </span>

                {/* Visual Company Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium font-body bg-surface-primary border border-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
                  <span className="text-text-primary uppercase tracking-wider font-medium text-xs sm:text-[13px]">
                    {project.company}
                  </span>
                </div>
              </div>

              {/* Project Title (Medium Weight) — links to the case page. Nothing
                  else on the site did, so /work/:slug was only reachable from
                  another project's "next project" link, which you could not get
                  to in the first place. */}
              {/* h2: on /work this follows the page h1, and on the home page it
                  sits beside the section h2 — both valid outlines, where h3
                  skipped a level on /work. Size comes from the classes. */}
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-text-primary mb-4 leading-tight">
                <Link
                  href={`/work/${project.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {project.title}
                </Link>
              </h2>

              {/* 2 Concise Editorial Paragraphs */}
              <div className="space-y-3.5 text-sm sm:text-base text-text-secondary leading-relaxed mb-8 font-body font-normal">
                {project.description.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Metadata Table / Dividers */}
              <div className="w-full flex flex-col font-body text-xs sm:text-sm">
                {/* Role Divider Row */}
                <div className="py-3.5 border-t border-border flex items-center justify-between gap-4">
                  <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                    Role
                  </span>
                  <span className="text-text-primary font-medium text-right">{project.role}</span>
                </div>

                {/* Deliverables Divider Row */}
                <div className="py-3.5 border-t border-border flex items-center justify-between gap-4">
                  <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                    Deliverables
                  </span>
                  <span className="text-text-primary font-medium text-right max-w-[220px]">
                    {project.deliverables.join(', ')}
                  </span>
                </div>

                {/* Company Divider Row (Clean Text) */}
                <div className="py-3.5 border-t border-border flex items-center justify-between gap-4">
                  <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                    Company
                  </span>
                  <span className="text-text-primary font-medium text-right uppercase">
                    {project.company}
                  </span>
                </div>

                {/* Case Page Row */}
                <div className="py-3.5 border-t border-border flex items-center justify-between gap-4">
                  <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                    Full case
                  </span>
                  {/* min-h-24 and vertical padding: these measured 102x16 on a
                      phone, under the 24x24 CSS px floor in WCAG 2.5.8 (Target
                      Size, Minimum, AA). They are standalone calls to action
                      rather than links inside a sentence, so the "inline"
                      exception does not apply to them. */}
                  <Link
                    href={`/work/${project.slug}`}
                    // The name starts with the words on screen (WCAG 2.5.3), so saying
                    // "Read the case" to voice control finds it.
                    aria-label={`Read the case: ${project.title}`}
                    className="inline-flex min-h-[24px] items-center gap-1.5 py-1 font-medium text-text-primary hover:text-accent transition-colors group cursor-pointer"
                  >
                    <span>Read the case</span>
                    <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                {/* Visit Live External Website Link Row — omitted when there is
                    no URL, rather than linking somewhere invented. */}
                {liveWebsiteUrl && (
                  <div className="py-3.5 border-t border-b border-border flex items-center justify-between gap-4">
                    <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                      Visit Site
                    </span>
                    <a
                      href={liveWebsiteUrl}
                      onClick={() => trackEvent('Live site clicked', { project: project.title })}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Live Site: ${project.title}`}
                      className="inline-flex min-h-[24px] items-center gap-1.5 py-1 font-medium text-text-primary hover:text-accent transition-colors group cursor-pointer"
                    >
                      <span>Visit Live Site</span>
                      <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: 4 VERTICALLY SCROLLING IMAGES                        */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 flex flex-col space-y-8 sm:space-y-10">
            {project.images.map((imgItem, imgIdx) => {
              const hasRealUrl = !!imgItem.url;
              const open = () => imgItem.url && openLightbox(imgItem.url, imgItem.alt);
              // A button only when there is a picture to open: the role, the
              // tab stop and the handlers come together or not at all.
              const interactive = hasRealUrl
                ? {
                    role: 'button' as const,
                    tabIndex: 0,
                    'aria-label': `Expand image: ${imgItem.alt || project.title}`,
                    onClick: open,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                      }
                    },
                  }
                : {};

              return (
                <div
                  key={imgItem.id}
                  {...interactive}
                  className={`opb-reveal-scale w-full aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-surface-secondary relative shadow-sm group ${hasRealUrl ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent' : ''}`}
                >
                  {hasRealUrl && imgItem.url ? (
                    /* Clean Image Rendering without Floating Text Overlay Bars */
                    <ViewTransition
                      name={imgIdx === 0 ? `project-hero-${project.slug}` : undefined}
                      share={imgIdx === 0 ? 'morph' : undefined}
                      default="none"
                    >
                      <div className="w-full h-full relative overflow-hidden">
                        <CMSImageBase
                          src={imgItem.url}
                          srcSet={srcSets?.[imgItem.url]}
                          alt={imgItem.alt}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        />
                      </div>
                    </ViewTransition>
                  ) : (
                    /* Fallback Editorial Wireframe Graphic Artwork */
                    <div
                      className={`w-full h-full bg-gradient-to-br ${imgItem.placeholderGradient} flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.015]`}
                    >
                      {/* Image Header Label */}
                      <div className="flex items-center justify-between text-xs font-mono text-white/60">
                        <span className="uppercase tracking-wider font-body">{imgItem.label}</span>
                        <span>IMAGE 0{imgIdx + 1} / 04</span>
                      </div>

                      {/* Editorial Mockup Wireframe Art inside image container */}
                      <div className="my-auto py-6">
                        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-border shadow-2xl transition-transform duration-500 group-hover:-translate-y-1.5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                            </div>
                            <span className="text-[10px] font-mono text-white/50">
                              {project.name}
                            </span>
                          </div>
                          <div className="w-3/4 h-5 rounded bg-white/30 mb-3" />
                          <div className="w-1/2 h-3.5 rounded bg-white/20 mb-6" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-16 rounded-xl bg-white/10 border border-border" />
                            <div className="h-16 rounded-xl bg-white/10 border border-border" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Image Caption */}
                      <div className="flex items-center justify-between text-xs text-white/70 font-body font-medium">
                        <span>
                          {project.company} — {imgItem.alt}
                        </span>
                        <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-accent group-hover:text-bg transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Modal (Centered Preview in Middle of Screen) */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        imageSrc={lightboxState.imageSrc}
        imageAlt={lightboxState.imageAlt}
        title={project.title}
        onClose={closeLightbox}
      />
    </>
  );
};
