'use client';

import React, { useEffect } from 'react';
import { trackEvent } from '../utils/analytics';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Button } from '../components/common/Button';
import { Reveal } from '../components/common/Reveal';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useCMS } from '../cms/context/CMSContext';
import { formatYearRange } from '../cms/utils/dates';
import { CMSImage } from '../components/common/CMSImage';

import Link from 'next/link';
import { useParams } from 'next/navigation';
export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useCMS();

  const projects = [...data.projects]
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];

  // Wraps to the first project; guarded because `projects` can be empty.
  const nextProject =
    projects.length > 0 ? projects[(projectIndex + 1) % projects.length] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Which work gets opened is the single most useful thing to know about a
  // portfolio, so it is reported by slug and title rather than as a bare view.
  useEffect(() => {
    if (project) {
      trackEvent('Project viewed', { slug: project.slug, title: project.title });
    }
  }, [project?.slug]);

  // Deleting a project in the admin must not white-screen the site.
  if (!project) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center justify-center text-center font-sans px-6">
        <h1 className="font-display text-4xl font-medium mb-3 text-text-primary">
          {data.microcopy.notFoundTitle}
        </h1>
        <p className="text-text-secondary font-body mb-8 max-w-md">{data.microcopy.notFoundBody}</p>
        <Button to="/work" icon={<ArrowLeft className="w-4 h-4" />}>
          {data.microcopy.backToWork}
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-32 sm:pt-40 font-sans">
      {/* 01 PROJECT HERO */}
      <section className="pb-16 border-b border-border bg-[var(--section-hero)]">
        <Container>
          <div className="mb-8">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors font-body"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{data.microcopy.backToWork}</span>
            </Link>
          </div>

          <Reveal type="label">
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-accent block mb-3">
              LIVE PROJECT {project.number}
            </span>
          </Reveal>

          <Reveal type="clip-headline">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-medium tracking-tight text-text-primary mb-6 leading-[1.08]">
              {project.title}
            </h1>
          </Reveal>

          <Reveal type="fade-up" delay={0.2}>
            <p className="text-lg sm:text-xl font-body text-text-secondary max-w-4xl leading-relaxed mb-12 font-normal">
              {project.heroHeadline}
            </p>
          </Reveal>

          {/* Metadata Grid Row */}
          <Reveal type="fade-up" delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 sm:p-8 rounded-2xl border border-border bg-surface-primary mb-10">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-1 font-body">
                  ROLE
                </span>
                <span className="text-sm sm:text-base font-medium text-text-primary font-body">
                  {project.role}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-1 font-body">
                  TIMELINE
                </span>
                <span className="text-sm sm:text-base font-medium text-text-primary font-body">
                  {project.timeline}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-1 font-body">
                  PLATFORM
                </span>
                <span className="text-sm sm:text-base font-medium text-text-primary font-body">
                  {project.platform}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted block mb-1 font-body">
                  YEAR
                </span>
                <span className="text-sm sm:text-base font-medium text-text-primary font-body">
                  {formatYearRange(project)}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Live Project CTA Button */}
          {project.siteUrl && project.siteUrl !== '#' && (
            <Reveal type="fade-up" delay={0.35} className="mb-12">
              <Button
                href={project.siteUrl}
                variant="primary"
                icon={<ArrowUpRight className="w-4 h-4" />}
                onClick={() => trackEvent('Live site clicked', { project: project.title })}
              >
                VISIT LIVE PROJECT
              </Button>
            </Reveal>
          )}

          {/* Large Hero Showcase Image */}
          <Reveal type="scale-image" delay={0.4}>
            <div
              className={cn(
                'w-full aspect-[16/9] rounded-2xl sm:rounded-3xl border border-border overflow-hidden relative bg-gradient-to-br',
                project.visualPlaceholder
              )}
            >
              {project.images && project.images[0] && project.images[0].url ? (
                <CMSImage
                  src={project.images[0].url}
                  alt={project.images[0].alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/30 backdrop-blur-[2px]">
                  <div className="w-full max-w-2xl p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                      </div>
                      <span className="text-xs font-mono text-white/60">
                        {project.platform} — INTERFACE VIEW
                      </span>
                    </div>
                    <div className="w-full h-8 bg-white/20 rounded-lg mb-4" />
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="h-28 rounded-xl bg-white/15 border border-white/10" />
                      <div className="h-28 rounded-xl bg-white/15 border border-white/10" />
                      <div className="h-28 rounded-xl bg-white/15 border border-white/10" />
                    </div>
                    <div className="w-2/3 h-4 bg-white/20 rounded" />
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 02 OVERVIEW */}
      <Section className="border-b border-border bg-surface-primary">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionLabel text="OVERVIEW" />
              <h2 className="font-display text-3xl font-medium text-text-primary">
                Product Context
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed font-body font-normal">
              {project.overview.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* 03 CHALLENGE */}
      <Section className="border-b border-border bg-surface-secondary/40">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionLabel text="THE CHALLENGE" />
              <h2 className="font-display text-3xl font-medium text-text-primary">Problem Space</h2>
            </div>
            <div className="lg:col-span-8">
              <p className="text-lg sm:text-xl text-text-primary leading-relaxed p-8 rounded-2xl border border-border bg-surface-primary font-body font-normal">
                "{project.challenge}"
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 04 DESIGN APPROACH */}
      <Section className="border-b border-border bg-surface-primary">
        <Container>
          <SectionLabel text="DESIGN APPROACH" />
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-text-primary mb-12">
            Structured Execution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.approachSteps.map((step, idx) => (
              <Reveal key={step.title} type="fade-up" delay={idx * 0.08}>
                <div className="p-8 rounded-2xl border border-border bg-surface-secondary/40 h-full flex flex-col justify-between space-y-4">
                  <div>
                    <span className="font-mono text-xs font-medium text-accent block mb-2">
                      STEP 0{idx + 1}
                    </span>
                    <h3 className="font-display text-lg font-medium text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 05 SELECTED SCREENS & HIGHLIGHTS */}
      {project.images && project.images.length > 1 && (
        <Section className="border-b border-border bg-surface-secondary/30">
          <Container>
            <SectionLabel text="INTERFACE VISUALS" />
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-text-primary mb-12">
              Selected Screens & Components
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="p-6 rounded-2xl border border-border bg-surface-primary space-y-4"
                >
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-text-muted block font-body">
                    {img.label}
                  </span>
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface-secondary">
                    {img.url ? (
                      <CMSImage
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${img.placeholderGradient} flex items-center justify-center text-xs font-mono text-text-muted`}
                      >
                        {img.alt}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 06 OUTCOME */}
      <Section className="border-b border-border bg-surface-primary">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionLabel text="OUTCOME & IMPACT" />
              <h2 className="font-display text-3xl font-medium text-text-primary">Key Takeaways</h2>
            </div>
            <div className="lg:col-span-8">
              <div className="p-8 rounded-2xl border border-border bg-surface-secondary/40">
                <div className="flex items-center gap-3 mb-4 text-accent">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-display font-medium text-lg text-text-primary">
                    Project Note
                  </span>
                </div>
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-body font-normal">
                  {project.outcomeNote}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 07 NEXT PROJECT — hidden when this is the only project */}
      {nextProject && nextProject.id !== project.id && (
        <Section className="py-24 sm:py-36 bg-[var(--section-hero)]">
          <Container>
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="font-mono text-xs font-medium tracking-wider uppercase text-text-muted block">
                NEXT PROJECT
              </span>
              <Link href={`/work/${nextProject.slug}`} className="group inline-block">
                <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-text-primary group-hover:text-accent transition-colors leading-tight">
                  {nextProject.name} ↗
                </h2>
                <p className="text-base text-text-secondary font-body font-normal mt-2">
                  {nextProject.category} — {formatYearRange(nextProject)}
                </p>
              </Link>
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
};
