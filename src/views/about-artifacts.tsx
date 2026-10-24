'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '../components/common/Container';
import { SectionLabel } from '../components/common/SectionLabel';
import { CMSImageBase } from '../components/common/cms-image-base';
import { MediaLightboxModal, type GalleryMediaItem } from '../components/common/MediaLightboxModal';
import type { CMSState, VisualArtifactItem } from '../cms/types/cms';

/**
 * The About page's one interactive part: the explorations grid, its filter
 * and its lightbox. The rest of the page renders on the server.
 */
export function ArtifactsGallery({
  artifacts: artifactsList,
  microcopy,
  srcSets,
}: {
  artifacts: VisualArtifactItem[];
  microcopy: CMSState['microcopy'];
  /** Image URL → `srcset`, worked out by the server parent (`srcSetsFor`). */
  srcSets?: Record<string, string>;
}) {
  const data = { microcopy };
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeMedia, setActiveMedia] = useState<GalleryMediaItem | null>(null);

  const filteredArtifacts = artifactsList.filter((art) => {
    if (activeFilter === 'all') return true;
    return art.category === activeFilter;
  });

  const handleOpenArtifact = (art: VisualArtifactItem) => {
    setActiveMedia({
      id: art.id,
      type: 'image',
      src: art.src,
      alt: art.alt,
      title: 'Visual Design Exploration',
    });
  };

  return (
    <>
      <section className="py-20 sm:py-28 border-b border-border bg-[var(--section-hero)]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <SectionLabel text="GALLERY" />
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-[1.18]">
                {data.microcopy.visualExplorationsTitle || 'Visual Design Explorations'}
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 font-body text-xs uppercase tracking-wider">
              {['all', 'ui', 'systems', 'mobile'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-text-primary text-bg border-text-primary font-medium'
                      : 'bg-surface-primary text-text-secondary border-border hover:border-text-primary/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Artifacts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <>
              {filteredArtifacts.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => handleOpenArtifact(art)}
                  aria-label={`Expand artwork: ${art.alt || art.id}`}
                  className="opb-pop aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-surface-secondary relative group cursor-pointer text-left w-full"
                >
                  <CMSImageBase
                    src={art.src}
                    srcSet={srcSets?.[art.src]}
                    alt={art.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <span className="h-10 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-body text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>Expand Artwork</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </>
          </div>
        </Container>
      </section>
      <MediaLightboxModal
        isOpen={!!activeMedia}
        item={activeMedia}
        onClose={() => setActiveMedia(null)}
      />
    </>
  );
}
