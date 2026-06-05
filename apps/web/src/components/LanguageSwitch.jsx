import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk'   },
  { code: 'fr', label: 'Français'},
];

const LanguageSwitch = () => {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">

      {/* Trigger — matches theme-toggle button exactly */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="liquid-glass-nav-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className="w-4 h-4" />
      </motion.button>

      {/* Dropdown — liquid glass, spring drop / fold */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="lang-menu"
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0  }}
            exit={  { opacity: 0, y: -4  }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="absolute right-0 top-full mt-2 w-36 glass-panel rounded-[18px] p-1.5 z-[60] overflow-hidden"
          >
            {LANGUAGES.map((lang, i) => (
              <motion.button
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                initial={{ opacity: 0, x: 8  }}
                animate={{ opacity: 1, x: 0  }}
                exit={  { opacity: 0, x: 8   }}
                transition={{ duration: 0.16, delay: i * 0.04 }}
                onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-[12px] transition-colors duration-200 ${
                  language === lang.code
                    ? 'bg-primary/12 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/6 dark:hover:bg-white/6'
                }`}
              >
                {lang.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LanguageSwitch;
