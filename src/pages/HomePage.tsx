import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { BrandTrustSection } from '../components/BrandTrustSection';
import { ProjectPreview } from '../components/ProjectPreview';
import { CaseStudiesSection } from '../components/CaseStudiesSection';
import { AboutSection } from '../components/AboutSection';
import { CapabilitiesSection } from '../components/CapabilitiesSection';
import { ExperienceSection } from '../components/ExperienceSection';
import { ProcessSprintSection } from '../components/ProcessSprintSection';
import { RecommendationsSection } from '../components/RecommendationsSection';
import { ContactCTASection } from '../components/ContactCTASection';
import { Section } from '../components/common/Section';
import { Container } from '../components/common/Container';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { useCMS } from '../cms/context/CMSContext';

/**
 * Homepage sections render in the order stored in the CMS, so the reorder
 * controls in the Homepage Builder actually move things. Only ids present in
 * this map are homepage sections — standalone page headers (`work-page` and
 * friends) live in the same list and are skipped here.
 */
const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSection,
  brands: BrandTrustSection,
  work: WorkSection,
  'case-studies': CaseStudiesSection,
  about: AboutSection,
  capabilities: CapabilitiesSection,
  experience: ExperienceSection,
  process: ProcessSprintSection,
  recommendations: RecommendationsSection,
  contact: ContactCTASection,
};

export const HomePage: React.FC = () => {
  const { data } = useCMS();

  const orderedSections = [...data.sections]
    .filter((s) => s.visible !== false && SECTION_COMPONENTS[s.id])
    .sort((a, b) => a.order - b.order);

  return (
    <div className="w-full font-sans">
      {orderedSections.map((section) => {
        const SectionComponent = SECTION_COMPONENTS[section.id];
        return <SectionComponent key={section.id} />;
      })}
    </div>
  );
};

/** The "Selected Work" band. Defined here because it exists only on the homepage. */
function WorkSection() {
  const { data } = useCMS();
  const config = data.sections.find((s) => s.id === 'work');

  const featured = [...data.projects]
    .filter((p) => p.status === 'published' && p.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 2);

  if (featured.length === 0) return null;

  return (
    <Section
      id="work"
      className="border-t border-border bg-[var(--section-work)] text-text-primary transition-colors duration-300 scroll-mt-28"
    >
      <Container>
        <SectionLabel text={config?.label || 'SELECTED WORK'} />

        <Reveal type="clip-headline" delay={0.1}>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary max-w-2xl mb-4 leading-[1.18]">
            {config?.heading}
          </h2>
        </Reveal>

        {config?.description && (
          <Reveal type="fade-up" delay={0.25}>
            <p className="text-base sm:text-lg font-body font-normal text-text-secondary leading-relaxed mb-12 sm:mb-16 max-w-2xl">
              {config.description}
            </p>
          </Reveal>
        )}

        <div className="flex flex-col">
          {featured.map((project, idx) => (
            <ProjectPreview key={project.id} project={project} index={idx} />
          ))}
        </div>

        {config?.primaryCtaLabel && (
          <div className="w-full mt-16 sm:mt-24 flex justify-start sm:justify-end items-center">
            <Reveal type="fade-up">
              <Link
                to={config.primaryCtaUrl || '/work'}
                aria-label={config.primaryCtaLabel}
                className="inline-flex items-center justify-center gap-2 h-[42px] px-5 sm:px-6 rounded-full font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider bg-text-primary text-bg border border-transparent hover:opacity-90 transition-all duration-250 shadow-sm hover:-translate-y-[1px] group cursor-pointer select-none"
              >
                <span>{config.primaryCtaLabel}</span>
                <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
              </Link>
            </Reveal>
          </div>
        )}
      </Container>
    </Section>
  );
}
