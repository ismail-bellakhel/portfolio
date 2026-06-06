import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Mouse } from 'lucide-react';

// Rainbow keyframes — each circle starts at a different phase so they feel
// independent but share the same Apple Intelligence colour vocabulary.
const GLOW_M = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'];
const GLOW_A = ['#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];
const GLOW_C = ['#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
const GLOW_TRANSITION = { duration: 5, repeat: Infinity, ease: 'linear' };

const TargetRolesSection = () => {
  const { t } = useLanguage();
  const [activeArea, setActiveArea] = useState('all');
  const [hasInteracted, setHasInteracted] = useState(false);
  const svgRef = useRef(null);
  const sectionRef = useRef(null);
  const isTouchRef = useRef(false);
  const debounceRef = useRef(null);
  const activeAreaRef = useRef('all');

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const detectArea = (x, y) => {
    const inCircle = (c) => Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2) <= Math.pow(c.r, 2);
    const inM = inCircle({ x: 35, y: 40, r: 30 });
    const inA = inCircle({ x: 65, y: 40, r: 30 });
    const inC = inCircle({ x: 50, y: 65, r: 30 });
    if (inM && inA && inC) return 'all';
    if (inM && inA)        return 'marketingAnalytics';
    if (inM && inC)        return 'marketingCustomer';
    if (inA && inC)        return 'analyticsCustomer';
    if (inM)               return 'marketing';
    if (inA)               return 'analytics';
    if (inC)               return 'customer';
    return 'all';
  };

  const applyCoords = (clientX, clientY) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const area = detectArea(x, y);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      activeAreaRef.current = area;
      setHasInteracted(true);
      setActiveArea(area);
    }, 700);
  };

  const handleMouseMove = (e) => {
    if (isTouchRef.current) return;
    applyCoords(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    clearTimeout(debounceRef.current);
    if (!isTouchRef.current) setActiveArea('all');
  };

  const handleTouchStart = (e) => {
    isTouchRef.current = true;
    const t0 = e.touches[0];
    if (t0) applyCoords(t0.clientX, t0.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const t0 = e.touches[0];
    if (t0) applyCoords(t0.clientX, t0.clientY);
  };

  const isHighlighted = (circleName) => {
    if (activeArea === 'all') return true;
    if (activeArea === circleName) return true;
    if (activeArea.toLowerCase().includes(circleName.toLowerCase())) return true;
    return false;
  };

  const activeRoles = t.roles.positions[activeArea] || t.roles.positions.all;
  const activeCategoryName = t.roles.categories[activeArea];

  // Shared transition for group opacity + scale
  const groupTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] };

  return (
    <section id="roles" ref={sectionRef} className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance tracking-tight">
            {t.roles.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl">
            {t.roles.subtitle}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start items-center">

          {/* ── Venn Diagram ──────────────────────────────────────────── */}
          <div className="w-full lg:w-7/12 flex justify-center">
            <div
              className="relative aspect-square w-full max-w-[440px] sm:max-w-[480px]"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/*
                    Apple Intelligence glow filter:
                    - feGaussianBlur spreads the stroke into a soft halo
                    - feMerge stacks two blurred copies (depth) + the sharp original on top
                    - Oversized filter region (x/y -50%, width/height 200%) so the
                      blur doesn't get clipped at the viewBox boundary
                  */}
                  <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* ── Marketing circle (blue) ────────────────────────── */}
                <motion.g
                  style={{ transformOrigin: '35% 40%' }}
                  animate={{ scale: isHighlighted('marketing') ? 1.02 : 1, opacity: isHighlighted('marketing') ? 1 : 0.28 }}
                  transition={groupTransition}
                >
                  {/* Flat fill */}
                  <circle cx="35" cy="40" r="30" fill="rgba(59,130,246,0.22)" />
                  {/* Animated rainbow glow edge */}
                  <motion.circle
                    cx="35" cy="40" r="30"
                    fill="none" strokeWidth="1.4"
                    filter="url(#ai-glow)"
                    animate={{ stroke: GLOW_M }}
                    transition={GLOW_TRANSITION}
                  />
                </motion.g>

                {/* ── Analytics circle (emerald) ─────────────────────── */}
                <motion.g
                  style={{ transformOrigin: '65% 40%' }}
                  animate={{ scale: isHighlighted('analytics') ? 1.02 : 1, opacity: isHighlighted('analytics') ? 1 : 0.28 }}
                  transition={groupTransition}
                >
                  <circle cx="65" cy="40" r="30" fill="rgba(16,185,129,0.22)" />
                  <motion.circle
                    cx="65" cy="40" r="30"
                    fill="none" strokeWidth="1.4"
                    filter="url(#ai-glow)"
                    animate={{ stroke: GLOW_A }}
                    transition={GLOW_TRANSITION}
                  />
                </motion.g>

                {/* ── Customer circle (violet) ───────────────────────── */}
                <motion.g
                  style={{ transformOrigin: '50% 65%' }}
                  animate={{ scale: isHighlighted('customer') ? 1.02 : 1, opacity: isHighlighted('customer') ? 1 : 0.28 }}
                  transition={groupTransition}
                >
                  <circle cx="50" cy="65" r="30" fill="rgba(139,92,246,0.22)" />
                  <motion.circle
                    cx="50" cy="65" r="30"
                    fill="none" strokeWidth="1.4"
                    filter="url(#ai-glow)"
                    animate={{ stroke: GLOW_C }}
                    transition={GLOW_TRANSITION}
                  />
                </motion.g>

                {/* Labels */}
                <text x="25" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.marketing}</text>
                <text x="75" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.analytics}</text>
                <text x="50" y="80" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.customer}</text>
              </svg>
            </div>
          </div>

          {/* ── Right column: invitation OR roles ─────────────────────── */}
          <div className="w-full lg:w-5/12">
            <AnimatePresence mode="wait">
              {!hasInteracted ? (

                <motion.div
                  key="invitation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-center lg:items-start gap-3 pt-4 lg:pt-8"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="text-primary/40 lg:hidden"
                  >
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                      <path d="M1 12L11 2L21 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>

                  <div className="glass-pill inline-flex items-center gap-3 px-7 py-4 rounded-2xl">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    >
                      <Mouse className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className="text-left">
                      <div className="text-foreground font-semibold text-sm tracking-wide">
                        {t.roles.diagramInstruction}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5 font-medium">
                        {t.roles.diagramHint ?? 'Hover the circles to reveal matching roles'}
                      </div>
                    </div>
                  </div>
                </motion.div>

              ) : (

                <div key="roles" className="pt-4 lg:pt-2">

                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={activeCategoryName}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      {activeCategoryName}
                    </motion.h3>
                  </AnimatePresence>

                  <div className="space-y-3">
                    <AnimatePresence mode="wait">
                      {activeRoles.map((role, idx) => (
                        <motion.div
                          key={role.title}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.12, delay: 0 } }}
                          transition={{ duration: 0.32, delay: idx * 0.07, ease: [0.4, 0, 0.2, 1] }}
                          className="glass-pill p-5 rounded-[16px]"
                        >
                          <h4 className="text-base font-bold text-foreground mb-1.5">{role.title}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed font-medium">{role.description}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                </div>

              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TargetRolesSection;
