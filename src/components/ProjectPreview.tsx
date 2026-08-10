import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';
import { Link } from 'react-router-dom';
import { ProjectItem } from '../cms/types/cms';
import { formatYearRange } from '../cms/utils/dates';
import { CMSImage } from './common/CMSImage';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageLightboxModal } from './common/ImageLightboxModal';

interface ProjectPreviewProps {
  project: ProjectItem;
  index: number;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ project }) => {
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
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
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-text-primary mb-4 leading-tight">
                <Link to={`/work/${project.slug}`} className="hover:text-accent transition-colors">
                  {project.title}
                </Link>
              </h3>

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
                  <Link
                    to={`/work/${project.slug}`}
                    aria-label={`Read the ${project.title} case page`}
                    className="inline-flex items-center gap-1.5 font-medium text-text-primary hover:text-accent transition-colors group cursor-pointer"
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
                      aria-label={`Visit ${project.title} live website`}
                      className="inline-flex items-center gap-1.5 font-medium text-text-primary hover:text-accent transition-colors group cursor-pointer"
                    >
                      <span>Visit Live Site</span>
                      <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: 4 VERTICALLY SCROLLING IMAGES                        */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 flex flex-col space-y-8 sm:space-y-10">
            {project.images.map((imgItem, imgIdx) => {
              const hasRealUrl = !!imgItem.url;

              return (
                <motion.div
                  key={imgItem.id}
                  initial={{ opacity: 0, scale: 1.015 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-5% 0px' }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  data-cursor-text="VIEW ↗"
                  onClick={() => {
                    if (hasRealUrl && imgItem.url) {
                      openLightbox(imgItem.url, imgItem.alt);
                    }
                  }}
                  className={`w-full aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-surface-secondary relative shadow-sm group ${hasRealUrl ? 'cursor-pointer' : ''}`}
                >
                  {hasRealUrl && imgItem.url ? (
                    /* Clean Image Rendering without Floating Text Overlay Bars */
                    <div className="w-full h-full relative overflow-hidden">
                      <CMSImage
                        src={imgItem.url}
                        alt={imgItem.alt}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                      />
                    </div>
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
                </motion.div>
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
