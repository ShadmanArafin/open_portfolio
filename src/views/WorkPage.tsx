import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionLabel } from '../components/common/SectionLabel';
import { Reveal } from '../components/common/Reveal';
import { siteContent, srcSetsFor } from '../cms/server';
import { WorkList } from './work-list';

export async function WorkPage() {
  const data = await siteContent();

  const header = data.sections.find((s) => s.id === 'work-page');
  const allLabel = data.microcopy.allFilterLabel || 'All';
  const projects = [...data.projects]
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    // The list renders cards, not case studies: the story blocks stay on the
    // server rather than travelling to the browser as props.
    .map(({ story: _story, ...project }) => project);

  return (
    <div className="pt-32 sm:pt-40 font-sans">
      <Section className="py-8 sm:py-12 bg-[var(--section-work)]">
        <Container>
          <SectionLabel text={header?.label || 'WORK'} />

          <Reveal type="clip-headline">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-medium tracking-tight text-text-primary mb-6 leading-[1.18]">
              {header?.heading}
            </h1>
          </Reveal>

          {header?.description && (
            <Reveal type="fade-up" delay={0.2}>
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-12 font-body font-normal leading-relaxed">
                {header.description}
              </p>
            </Reveal>
          )}

          <WorkList
            projects={projects}
            allLabel={allLabel}
            srcSets={await srcSetsFor(projects.flatMap((p) => p.images.map((i) => i.url)))}
          />
        </Container>
      </Section>
    </div>
  );
}
