import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Github, Code2 } from 'lucide-react';

const ExperimentsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="experiments" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="glass-panel p-8 md:p-12 rounded-[32px] text-center relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 ease-out">
                <Code2 className="h-8 w-8" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance tracking-tight">
                {t.experiments.title}
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                {t.experiments.description}
              </p>

              <Button
                size="lg"
                className="rounded-xl gap-3 group/btn h-14 px-8 text-base glass-glow transition-all duration-300"
                asChild
              >
                <a
                  href="https://github.com/ismail-bellakhel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                  {t.experiments.viewGithub}
                </a>
              </Button>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperimentsSection;
