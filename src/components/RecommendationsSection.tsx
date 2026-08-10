import React from 'react';
import { Section } from './common/Section';
import { Container } from './common/Container';
import { SectionLabel } from './common/SectionLabel';
import { Reveal } from './common/Reveal';
import { motion } from 'framer-motion';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from './common/CMSImage';

export const RecommendationsSection: React.FC = () => {
  const { data } = useCMS();

  const recConfig = data.sections.find((s) => s.id === 'recommendations');
  const recommendations = (data.recommendations || [])
    .filter((r) => r.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if ((recConfig && !recConfig.visible) || recommendations.length === 0) return null;

  return (
    <Section
      id="recommendations"
      className="border-t border-border bg-[var(--section-hero)] text-text-primary py-20 lg:py-28 transition-colors duration-300 font-sans scroll-mt-28"
    >
      <Container>
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <Reveal type="fade-up" delay={0.05}>
            <SectionLabel text={recConfig?.label || 'RECOMMENDATIONS'} />
          </Reveal>

          <Reveal type="clip-headline" delay={0.15}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-[1.18]">
              {recConfig?.heading || 'Kind words from leaders and colleagues.'}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-surface-primary border border-border flex flex-col justify-between space-y-6 shadow-sm"
            >
              <p className="text-base sm:text-lg font-body text-text-secondary leading-relaxed italic font-normal">
                "{rec.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                {rec.avatar && (
                  <CMSImage
                    src={rec.avatar}
                    alt={rec.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                )}
                <div>
                  <h4 className="font-display font-medium text-base text-text-primary">
                    {rec.name}
                  </h4>
                  <p className="font-body text-xs text-text-muted">
                    {rec.role && <>{rec.role} — </>}
                    <span className="text-accent">{rec.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
