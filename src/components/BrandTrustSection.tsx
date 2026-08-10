import React from 'react';
import { motion } from 'framer-motion';
import { Container } from './common/Container';
import { useCMS } from '../cms/context/CMSContext';
import { CMSImage } from './common/CMSImage';

export const BrandTrustSection: React.FC = () => {
  const { data } = useCMS();

  const brandConfig = data.sections.find((s) => s.id === 'brands');
  const brandsList = (data.brands || [])
    .filter((b) => b.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (brandConfig && !brandConfig.visible) return null;

  return (
    <section
      id="brands"
      className="w-full border-t border-b border-border bg-[var(--section-hero)] text-text-primary py-14 sm:py-16 lg:py-20 transition-colors duration-300 relative overflow-hidden scroll-mt-28"
    >
      {/* Global Container for Section Title & Brand Grid */}
      <Container>
        {/* 01. SECTION TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="text-xs sm:text-[13px] lg:text-[14px] font-medium font-body uppercase tracking-[0.15em] text-text-muted">
            {brandConfig?.heading ||
              data.microcopy.selectedBrandsTitle ||
              "SELECTED BRANDS I'VE WORKED WITH"}
          </h2>
        </motion.div>

        {/* 02. BRAND LOGO GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 justify-items-center items-center">
          {brandsList.map((brand, index) => {
            const sizeClass =
              brand.size === 'wide'
                ? 'max-w-[140px] sm:max-w-[160px]'
                : brand.size === 'small'
                  ? 'max-w-[100px] sm:max-w-[115px]'
                  : 'max-w-[125px] sm:max-w-[140px]';

            return (
              <motion.div
                key={brand.id || brand.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px' }}
                transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="h-[72px] sm:h-[80px] lg:h-[84px] w-full max-w-[160px] sm:max-w-[190px] flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 dark:opacity-60 dark:brightness-[1.6] dark:hover:brightness-100 dark:hover:opacity-100 hover:-translate-y-[1px] transition-all duration-300 group/logo cursor-pointer"
                title={`${brand.name}`}
              >
                <CMSImage
                  src={brand.logo}
                  alt={brand.alt || brand.name}
                  className={`max-h-[32px] sm:max-h-[36px] lg:max-h-[38px] w-auto ${sizeClass} object-contain transition-transform duration-300 group-hover/logo:scale-105`}
                />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
