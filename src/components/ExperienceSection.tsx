import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { siteContent } from '../cms/server';
import { formatPeriod } from '../cms/utils/dates';

export async function ExperienceSection() {
  const data = await siteContent();
  const expConfig = data.sections.find((s) => s.id === 'experience');
  const expList = data.experience
    .filter((e) => e.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (expConfig && !expConfig.visible) return null;

  return (
    <Section
      id="experience"
      className="border-t border-border bg-[var(--section-experience)] text-text-primary py-20 lg:py-28 xl:py-32 transition-colors duration-300 scroll-mt-28 font-sans"
    >
      <Container>
        {/* Section Label & Headline */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <Reveal type="fade-up" delay={0.05}>
            <SectionLabel text={expConfig?.label || 'EXPERIENCE'} />
          </Reveal>

          <Reveal type="clip-headline" delay={0.15}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium tracking-tight text-text-primary leading-[1.18]">
              {expConfig?.heading || "Where I've been building and learning."}
            </h2>
          </Reveal>
        </div>

        {/* Premium Editorial Rows */}
        <div className="space-y-0 divide-y divide-border border-t border-b border-border">
          {expList.map((exp, idx) => {
            const hasLink = exp.companyUrl && exp.companyUrl !== '#';

            return (
              <Reveal key={exp.id} type="fade-up" delay={0.1 + idx * 0.08}>
                {/* The row is clickable, but only the company name is the link —
                    its `::after` covers the row. Wrapping the whole row in an
                    <a> and naming it "View <company>" hid everything the row
                    says from its accessible name (WCAG 2.5.3, label in name),
                    so a voice-control user saying what they could see got
                    nothing. */}
                <div
                  className={`group relative py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-baseline transition-all duration-300 hover:bg-surface-primary/40 px-2 sm:px-4 rounded-xl text-left ${hasLink ? 'cursor-pointer' : ''}`}
                >
                  {/* Left Column: Timeline & Employment Type (~3 Cols) */}
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <span className="text-xs font-mono font-medium text-accent tracking-wider uppercase">
                      {formatPeriod(exp)}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest font-medium">
                      {exp.type}
                    </span>
                  </div>

                  {/* Center Column: Role Title & Company (~4 Cols) */}
                  <div className="lg:col-span-4 space-y-1">
                    <h3 className="font-display text-xl sm:text-2xl font-medium text-text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                      <span>{exp.role}</span>
                    </h3>
                    {hasLink ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-body text-text-secondary font-medium block after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent"
                      >
                        {exp.company}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="text-sm font-body text-text-secondary font-medium block">
                        {exp.company}
                      </span>
                    )}
                  </div>

                  {/* Right Column: Summary & Bullet Points (~5 Cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <p className="text-sm text-text-secondary font-body leading-relaxed">
                      {exp.summary}
                    </p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {exp.highlights.map((item, hIdx) => (
                          <li
                            key={hIdx}
                            className="text-xs text-text-muted font-body flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
