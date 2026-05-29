import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -z-10" />
      <div className="max-w-7xl mx-auto glass-panel p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Ismail<span className="text-muted-foreground font-medium">Bellakhel</span>
            </span>
            <span className="text-sm text-muted-foreground">{t.footer.copyright}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="mailto:ismailbellakhel@povmedia.se"
              className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/ismailbellakhel/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[#0A66C2] hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/ismail-bellakhel"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors duration-300">
              {t.footer.privacy}
            </a>
            <span className="opacity-30">•</span>
            <a href="#" className="hover:text-foreground transition-colors duration-300">
              {t.footer.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;