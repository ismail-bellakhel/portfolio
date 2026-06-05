import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [pos, setPos] = useState({ top: 60, right: 16 });
  const triggerRef = useRef(null);

  // Calculate fixed viewport position from trigger button
  const syncPos = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
  };

  // Close on click outside both the trigger and the portal dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (document.getElementById('lang-drop')?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = () => {
    syncPos();
    setOpen(v => !v);
  };

  return (
    <>
      {/* Trigger button */}
      <motion.button
        ref={triggerRef}
        onClick={handleToggle}
        className="liquid-glass-nav-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className="w-4 h-4" />
      </motion.button>

      {/* Dropdown rendered in document.body — zero impact on header layout */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="lang-drop"
              role="listbox"
              aria-label="Select language"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0  }}
              exit={  { opacity: 0, y: -4  }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
              className="w-36 glass-panel rounded-[18px] p-1.5 overflow-hidden"
            >
              {LANGUAGES.map((lang, i) => (
                <motion.button
                  key={lang.code}
                  role="option"
                  aria-selected={language === lang.code}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={  { opacity: 0, x: 8 }}
                  transition={{ duration: 0.15, delay: i * 0.04 }}
                  onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-[12px] transition-colors duration-200 ${
                    language === lang.code
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/8'
                  }`}
                >
                  {lang.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default LanguageSwitch;
