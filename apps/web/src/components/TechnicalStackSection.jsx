import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion } from 'framer-motion';
import {
  Database,
  Terminal,
  BarChart2,
  LineChart,
  Settings,
  Server,
  Cloud,
  Users,
  Search,
  Code2,
  Layout,
  Bot,
  Workflow,
  Network,
  Code
} from 'lucide-react';

const TechnicalStackSection = () => {
  const { t } = useLanguage();

  // Static icon map to avoid dynamic namespace access (ESLint compliant)
  const iconMap = {
    Database,
    Terminal,
    BarChart2,
    LineChart,
    Settings,
    Server,
    Cloud,
    Users,
    Search,
    Code2,
    Layout,
    Bot,
    Workflow,
    Network,
    Code
  };

  // Safely access technicalStack and extract categories
  const techStackData = t?.technicalStack;
  const categories = techStackData?.categories || [];

  if (!techStackData) {
    console.warn('Technical stack translations missing for current language.');
  }

  return (
    <section id="stack" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-3xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-balance">
            {techStackData?.title || 'Technical Stack'}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            {techStackData?.subtitle || 'Technologies and tools'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="glass-panel-interactive h-full p-8 rounded-[24px] flex flex-col group relative overflow-hidden">
                  <h3 className="text-xl font-bold mb-6 text-foreground tracking-tight">
                    {category.title || 'Category'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {category.technologies?.map((tech, techIndex) => {
                      // Use static iconMap with fallback to Code icon
                      const IconComponent = iconMap[tech.icon] || Code;
                      return (
                        <div
                          key={techIndex}
                          className="glass-pill inline-flex items-center gap-2 px-4 py-2 rounded-xl text-foreground font-medium hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <IconComponent className="w-4 h-4 text-primary" />
                          <span className="text-sm tracking-wide">{tech.name || 'Technology'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Stack data is currently unavailable.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TechnicalStackSection;