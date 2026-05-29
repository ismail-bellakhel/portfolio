import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const WritingSection = () => {
  const { t } = useLanguage();

  return (
    <section id="writing" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="glass-panel p-8 md:p-12 rounded-[32px] flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpen className="w-64 h-64" />
            </div>
            
            <div className="shrink-0 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
            
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {t.writing.title}
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                {t.writing.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WritingSection;