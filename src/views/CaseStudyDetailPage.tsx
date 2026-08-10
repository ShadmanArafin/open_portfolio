'use client';

import React, { useEffect } from 'react';
import { trackEvent } from '../utils/analytics';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { ContactCTASection } from '../components/ContactCTASection';
import { useCMS } from '../cms/context/CMSContext';
import { formatYearRange } from '../cms/utils/dates';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
export const CaseStudyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useCMS();

  const caseStudiesList = [...data.caseStudies]
    .filter((cs) => cs.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const caseStudyIndex = caseStudiesList.findIndex((cs) => cs.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const viewedCaseStudy = caseStudiesList[caseStudyIndex];
  useEffect(() => {
    if (viewedCaseStudy) {
      trackEvent('Case study viewed', {
        slug: viewedCaseStudy.slug,
        title: viewedCaseStudy.title,
      });
    }
  }, [viewedCaseStudy?.slug]);

  if (caseStudyIndex === -1) {
    // A real 404, not a silent redirect to the index. The old behaviour hid
    // broken links from users and told crawlers the page existed.
    notFound();
  }

  const study = caseStudiesList[caseStudyIndex];
  const nextStudy = caseStudiesList[(caseStudyIndex + 1) % caseStudiesList.length];

  return (
    <div className="w-full pt-32 sm:pt-40 font-sans">
      {/* =================================================================== */}
      {/* 01. HERO SECTION                                                    */}
      {/* =================================================================== */}
      <Section className="bg-[var(--section-hero)] text-text-primary transition-colors duration-300">
        <Container>
          {/* Back to Case Studies link */}
          <div className="mb-8">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 font-body text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>{data.microcopy.backToCaseStudies}</span>
            </Link>
          </div>

          <SectionLabel text={`CASE STUDY — ${study.number}`} />

          {/* Category & Title */}
          <div className="max-w-4xl mb-10 sm:mb-12">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-accent mb-3 block">
              {study.category} — {formatYearRange(study)}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-medium tracking-tight text-text-primary mb-6 leading-[1.18]">
              {study.title}
            </h1>
            <p className="text-lg sm:text-xl font-body font-normal text-text-secondary leading-relaxed max-w-3xl">
              {study.shortChallenge}
            </p>
          </div>

          {/* Metadata Grid Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border bg-surface-primary shadow-sm font-body text-xs sm:text-sm">
            <div>
              <span className="text-text-muted uppercase font-mono tracking-wider text-[11px] block mb-1">
                Role
              </span>
              <span className="text-text-primary font-medium">{study.role}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase font-mono tracking-wider text-[11px] block mb-1">
                Timeline
              </span>
              <span className="text-text-primary font-medium">{study.timeline}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase font-mono tracking-wider text-[11px] block mb-1">
                Platform
              </span>
              <span className="text-text-primary font-medium">{study.platform}</span>
            </div>
            <div>
              <span className="text-text-muted uppercase font-mono tracking-wider text-[11px] block mb-1">
                Industry
              </span>
              <span className="text-accent font-medium">{study.industry}</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* =================================================================== */}
      {/* 02. STORY OVERVIEW                                                  */}
      {/* =================================================================== */}
      <Section className="border-t border-border bg-[var(--section-about)] text-text-primary transition-colors duration-300">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <SectionLabel text="01 / OVERVIEW" />
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-text-primary">
                Understanding the Problem & Scope
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              {study.overview &&
                study.overview.map((paragraph: string, idx: number) => (
                  <p
                    key={idx}
                    className="text-base sm:text-lg text-text-secondary leading-relaxed font-body font-normal"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* =================================================================== */}
      {/* 03. KEY DESIGN DECISIONS                                           */}
      {/* =================================================================== */}
      {study.keyDecisions && study.keyDecisions.length > 0 && (
        <Section className="border-t border-border bg-[var(--section-capabilities)] text-text-primary transition-colors duration-300">
          <Container>
            <SectionLabel text="02 / KEY DECISIONS" />

            <div className="mb-12 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-text-primary mb-3">
                Architectural & UX Rationale
              </h2>
              <p className="text-base font-body text-text-secondary">
                Trade-offs and interface choices made to optimize user efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {study.keyDecisions.map((dec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-surface-primary border border-border space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent font-medium uppercase tracking-wider">
                      DECISION {dec.number}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-surface-secondary border border-border text-accent font-medium">
                      {dec.impact}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-medium text-text-primary leading-tight">
                    {dec.title}
                  </h3>

                  <p className="text-sm font-body text-text-secondary leading-relaxed font-normal">
                    {dec.rationale}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* =================================================================== */}
      {/* 04. MULTIPLE CUSTOM BLOCKS & SECTIONS                              */}
      {/* =================================================================== */}
      {study.blocks && study.blocks.length > 0 && (
        <Section className="border-t border-border bg-[var(--section-work)] text-text-primary transition-colors duration-300">
          <Container>
            <div className="space-y-16">
              {study.blocks.map((block: any) => (
                <div key={block.id} className="max-w-4xl space-y-4">
                  {block.content.title && (
                    <h3 className="font-display text-2xl sm:text-3xl font-medium text-text-primary tracking-tight">
                      {block.content.title}
                    </h3>
                  )}
                  {block.content.text && (
                    <p className="text-base sm:text-lg font-body text-text-secondary leading-relaxed font-normal whitespace-pre-wrap">
                      {block.content.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* =================================================================== */}
      {/* 05. OUTCOME & METRICS                                               */}
      {/* =================================================================== */}
      {study.outcomes && study.outcomes.length > 0 && (
        <Section className="border-t border-border bg-[var(--section-about)] text-text-primary transition-colors duration-300">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4">
                <SectionLabel text={data.microcopy.impactMetricsLabel} />
                <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-text-primary">
                  {data.microcopy.measuredOutcomesTitle}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {study.outcomes.map((out: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-surface-primary border border-border text-center"
                    >
                      {out.metric && (
                        <span className="font-display text-3xl font-medium text-accent block mb-2">
                          {out.metric}
                        </span>
                      )}
                      <span className="font-body text-xs sm:text-sm text-text-secondary block">
                        {out.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* =================================================================== */}
      {/* 06. NEXT CASE STUDY NAVIGATOR                                       */}
      {/* =================================================================== */}
      <Section className="border-t border-border bg-[var(--section-capabilities)] text-text-primary transition-colors duration-300">
        <Container>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
              {data.microcopy.nextCaseStudyLabel}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-text-primary mb-6">
              {nextStudy.title}
            </h3>
            <Link
              href={`/case-studies/${nextStudy.slug}`}
              className="inline-flex items-center justify-center gap-2 h-[42px] px-6 sm:px-7 rounded-full font-body text-xs sm:text-[13px] font-medium uppercase tracking-wider bg-text-primary text-bg hover:opacity-90 transition-all duration-250 group cursor-pointer shadow-sm select-none"
            >
              <span>EXPLORE CASE STUDY {nextStudy.number}</span>
              <ArrowUpRight className="w-4 h-4 text-current transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
            </Link>
          </div>
        </Container>
      </Section>

      {/* 07. CONTACT CTA SECTION */}
      <ContactCTASection />
    </div>
  );
};
