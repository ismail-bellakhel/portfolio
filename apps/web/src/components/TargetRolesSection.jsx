import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Mouse } from 'lucide-react';

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

        {/* Always side-by-side: 60/40 on mobile, 7/12 · 5/12 on desktop */}
        <div className="flex flex-row gap-3 lg:gap-10 items-start">

          {/* ── Venn Diagram ──────────────────────────────────────────── */}
          <div className="w-[60%] lg:w-7/12 flex justify-center">
            <div
              className="relative aspect-square w-full lg:max-w-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-2xl"
                style={{
                  filter: hasInteracted
                    ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))'
                    : 'drop-shadow(0 20px 60px rgba(59,130,246,0.18)) drop-shadow(0 0 40px rgba(139,92,246,0.14))',
                  transition: 'filter 0.7s ease',
                }}
              >
                <defs>
                  {/* Marketing — blue radial gradient, bright top-left */}
                  <radialGradient id="grad-marketing" cx="38%" cy="32%" r="68%" gradientUnits="objectBoundingBox">
                    <stop offset="0%"   stopColor="#93c5fd" stopOpacity="0.95" />
                    <stop offset="45%"  stopColor="#3b82f6" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.35" />
                  </radialGradient>
                  {/* Analytics — emerald radial gradient, bright top-right */}
                  <radialGradient id="grad-analytics" cx="62%" cy="32%" r="68%" gradientUnits="objectBoundingBox">
                    <stop offset="0%"   stopColor="#6ee7b7" stopOpacity="0.95" />
                    <stop offset="45%"  stopColor="#10b981" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity="0.35" />
                  </radialGradient>
                  {/* Customer — violet radial gradient, bright top-centre */}
                  <radialGradient id="grad-customer" cx="50%" cy="28%" r="70%" gradientUnits="objectBoundingBox">
                    <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.95" />
                    <stop offset="45%"  stopColor="#8b5cf6" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#3b0764" stopOpacity="0.35" />
                  </radialGradient>
                </defs>

                {/* Circles — gradient fill, opacity + scale animated */}
                <motion.circle
                  cx="35" cy="40" r="30"
                  fill="url(#grad-marketing)"
                  stroke="rgba(147,197,253,0.25)" strokeWidth="0.4"
                  className="origin-[35%_40%]"
                  animate={{
                    opacity: isHighlighted('marketing') ? 1 : 0.22,
                    scale:   isHighlighted('marketing') ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.circle
                  cx="65" cy="40" r="30"
                  fill="url(#grad-analytics)"
                  stroke="rgba(110,231,183,0.25)" strokeWidth="0.4"
                  className="origin-[65%_40%]"
                  animate={{
                    opacity: isHighlighted('analytics') ? 1 : 0.22,
                    scale:   isHighlighted('analytics') ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.circle
                  cx="50" cy="65" r="30"
                  fill="url(#grad-customer)"
                  stroke="rgba(196,181,253,0.25)" strokeWidth="0.4"
                  className="origin-[50%_65%]"
                  animate={{
                    opacity: isHighlighted('customer') ? 1 : 0.22,
                    scale:   isHighlighted('customer') ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* Labels */}
                <text x="25" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.marketing}</text>
                <text x="75" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.analytics}</text>
                <text x="50" y="80" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.customer}</text>
              </svg>
            </div>
          </div>

          {/* ── Right column: invitation OR roles ─────────────────────── */}
          <div className="w-[40%] lg:w-5/12">
            <AnimatePresence mode="wait">
              {!hasInteracted ? (

                <motion.div
                  key="invitation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-start gap-2 pt-2 lg:pt-8"
                >
                  <div className="glass-pill inline-flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-7 lg:py-4 rounded-2xl">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="shrink-0"
                    >
                      <Mouse className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </motion.div>
                    <div className="text-left">
                      <div className="text-foreground font-semibold text-[10px] lg:text-sm tracking-wide leading-tight">
                        {t.roles.diagramInstruction}
                      </div>
                      <div className="text-muted-foreground text-[9px] lg:text-xs mt-0.5 font-medium leading-tight hidden sm:block">
                        {t.roles.diagramHint ?? 'Hover the circles to reveal matching roles'}
                      </div>
                    </div>
                  </div>
                </motion.div>

              ) : (

                <div key="roles" className="pt-1 lg:pt-2">

                  {/* Category title */}
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={activeCategoryName}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="text-[10px] lg:text-sm font-bold uppercase tracking-widest text-primary mb-3 lg:mb-6 flex items-center gap-1.5 lg:gap-2"
                    >
                      <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      {activeCategoryName}
                    </motion.h3>
                  </AnimatePresence>

                  {/* Role pills — glass-pill + opacity on same element (no black flash) */}
                  <div className="space-y-2 lg:space-y-3">
                    <AnimatePresence mode="wait">
                      {activeRoles.map((role, idx) => (
                        <motion.div
                          key={role.title}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.12, delay: 0 } }}
                          transition={{ duration: 0.32, delay: idx * 0.07, ease: [0.4, 0, 0.2, 1] }}
                          className="glass-pill p-3 lg:p-5 rounded-[12px] lg:rounded-[16px]"
                        >
                          <h4 className="text-[11px] lg:text-base font-bold text-foreground mb-0.5 lg:mb-1.5 leading-tight">{role.title}</h4>
                          <p className="text-muted-foreground text-[10px] lg:text-sm leading-snug lg:leading-relaxed font-medium">{role.description}</p>
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
