import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import LanguageSwitch from '@/components/LanguageSwitch.jsx';
import { Menu, X, Sun, Moon, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Cycles: auto → dark → light → auto
const NEXT_MODE = { auto: 'dark', dark: 'light', light: 'auto' };
const MODE_ICON = { light: Sun, dark: Moon, auto: SunMoon };
const MODE_LABEL = { light: 'Light', dark: 'Dark', auto: 'Auto' };

const Header = () => {
  const { t } = useLanguage();
  const { mode, setMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['home', 'sectors', 'roles', 'cases', 'stack', 'experiments', 'writing', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'sectors', label: t.nav.sectors },
    { id: 'roles', label: t.nav.roles },
    { id: 'cases', label: t.nav.cases },
    { id: 'stack', label: t.nav.stack },
    { id: 'experiments', label: t.nav.experiments },
    { id: 'writing', label: t.nav.writing },
    { id: 'contact', label: t.nav.contact }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-x-clip ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 rounded-2xl min-w-0 ${
          isScrolled ? 'glass-panel px-4 sm:px-6 py-3' : 'px-2 py-2'
        }`}>
          <button
            onClick={() => scrollToSection('home')}
            className="text-sm sm:text-lg font-bold text-foreground hover:opacity-70 transition-opacity duration-300 tracking-tight flex-shrink-0 min-w-0"
          >
            Ismail<span className="text-muted-foreground font-medium">Bellakhel</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl group ${
                  activeSection === item.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeSection === item.id && (
                  <motion.div
                    layoutId="header-active-tab"
                    className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Theme toggle — cycles auto → dark → light → auto */}
            <motion.button
              onClick={() => setMode(NEXT_MODE[mode])}
              title={`Theme: ${MODE_LABEL[mode]} — click to change`}
              className="liquid-glass-nav-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`Current theme: ${MODE_LABEL[mode]}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {React.createElement(MODE_ICON[mode], { className: 'w-4 h-4' })}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <LanguageSwitch />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-2 glass-panel p-4 absolute left-4 right-4"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all duration-200 rounded-xl ${
                      activeSection === item.id
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;