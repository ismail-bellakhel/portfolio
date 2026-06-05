import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import LanguageSwitch from '@/components/LanguageSwitch.jsx';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setMobileOpen]   = useState(false);
  const [activeSection, setActiveSection]   = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home','sectors','roles','cases','stack','experiments','writing','contact'];
      const pos = window.scrollY + 100;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const navItems = [
    { id: 'home',        label: t.nav.home },
    { id: 'sectors',     label: t.nav.sectors },
    { id: 'roles',       label: t.nav.roles },
    { id: 'cases',       label: t.nav.cases },
    { id: 'stack',       label: t.nav.stack },
    { id: 'experiments', label: t.nav.experiments },
    { id: 'writing',     label: t.nav.writing },
    { id: 'contact',     label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ── Nav bar — always relative, glass fades via data-scrolled CSS ── */}
        <div
          className="header-nav flex items-center justify-between min-w-0 rounded-2xl"
          data-scrolled={isScrolled}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo('home')}
            className="text-sm sm:text-lg font-bold text-foreground hover:opacity-70 transition-opacity duration-300 tracking-tight flex-shrink-0"
          >
            Ismail<span className="text-muted-foreground font-medium">Bellakhel</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-xl whitespace-nowrap ${
                  activeSection === item.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeSection === item.id && (
                  <motion.div
                    layoutId="header-active-tab"
                    className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <LanguageSwitch />

            {/* Hamburger — same glass button style */}
            <motion.button
              onClick={() => setMobileOpen(v => !v)}
              className="liquid-glass-nav-btn lg:hidden"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMobileMenuOpen ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0,    scale: 1   }}
                  exit={  { opacity: 0, rotate:  45,  scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu — liquid glass, spring drop / fold ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0  }}
              exit={  { opacity: 0, y: -6  }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="lg:hidden mt-2 glass-panel rounded-[20px] p-2 absolute left-3 right-3 sm:left-6 sm:right-6 overflow-hidden"
            >
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0   }}
                  exit={  { opacity: 0, x: -8   }}
                  transition={{ duration: 0.18, delay: i * 0.035 }}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-[14px] transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
};

export default Header;
