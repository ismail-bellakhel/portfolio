import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion } from 'framer-motion';

const SectorExperienceSection = () => {
  const { t } = useLanguage();

  const sectors = [
    { key: 'newsMedia', span: 'md:col-span-2' },
    { key: 'saas', span: 'md:col-span-1' },
    { key: 'edtech', span: 'md:col-span-1' },
    { key: 'telecom', span: 'md:col-span-1' },
    { key: 'consulting', span: 'md:col-span-1' },
    { key: 'automotive', span: 'md:col-span-1' },
    { key: 'realEstate', span: 'md:col-span-2' },
    { key: 'international', span: 'md:col-span-1' },
    { key: 'customerService', span: 'md:col-span-1' },
    { key: 'customerServiceMgmt', span: 'md:col-span-2' },
    { key: 'retail', span: 'md:col-span-1' },
    { key: 'fitness', span: 'md:col-span-1' },
    { key: 'frenchTelecom', span: 'md:col-span-2' }
  ];

  return (
    <section id="sectors" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-3xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance tracking-tight">
            {t.sectors.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            {t.sectors.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className={sector.span}
            >
              <div className="glass-panel-interactive h-full p-8 rounded-[20px] flex flex-col group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight relative z-10">
                  {t.sectors[sector.key].title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">
                  {t.sectors[sector.key].description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorExperienceSection;