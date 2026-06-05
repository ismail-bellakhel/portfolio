import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Mouse } from 'lucide-react';

const TargetRolesSection = () => {
  const { t } = useLanguage();
  const [activeArea, setActiveArea] = useState('all');
  const [hasInteracted, setHasInteracted] = useState(false);
  const svgRef = useRef(null);
  const sectionRef = useRef(null);
  // track whether last interaction was touch (so mouse-leave doesn't reset on mobile)
  const isTouchRef = useRef(false);

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
    if (!hasInteracted) setHasInteracted(true);
    if (area !== activeArea) setActiveArea(area);
  };

  const handleMouseMove = (e) => {
    if (isTouchRef.current) return;
    applyCoords(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    if (!isTouchRef.current) setActiveArea('all');
  };

  // Touch: tap/drag to select area — persists until another area is tapped
  const handleTouchStart = (e) => {
    isTouchRef.current = true;
    const t0 = e.touches[0];
    if (t0) applyCoords(t0.clientX, t0.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // stop page scroll while interacting with diagram
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

        {/* Layout: single-column centered diagram → two-column on first interaction */}
        <motion.div layout transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }} className="relative">
          <motion.div layout className={`flex gap-8 lg:gap-10 ${
            hasInteracted
              ? 'flex-col lg:flex-row items-start'
              : 'flex-col items-center'
          }`}>

            {/* ── Venn Diagram ──────────────────────────────────────────── */}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 180, damping: 26 }}
              className={hasInteracted
                ? 'w-full lg:w-7/12 flex justify-center order-2 lg:order-1'
                : 'w-full flex justify-center'
              }
            >
              <div
                className={`relative aspect-square w-full transition-[max-width] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  hasInteracted ? 'max-w-[440px]' : 'max-w-[440px] sm:max-w-[480px]'
                }`}
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
                  {/* Marketing Circle */}
                  <motion.circle
                    cx="35" cy="40" r="30"
                    fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="0.5"
                    className="origin-[35%_40%]"
                    animate={{
                      fill: isHighlighted('marketing') ? 'rgba(59,130,246,0.42)' : 'rgba(59,130,246,0.10)',
                      scale: isHighlighted('marketing') ? 1.02 : 1,
                    }}
                  />
                  {/* Analytics Circle */}
                  <motion.circle
                    cx="65" cy="40" r="30"
                    fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="0.5"
                    className="origin-[65%_40%]"
                    animate={{
                      fill: isHighlighted('analytics') ? 'rgba(16,185,129,0.42)' : 'rgba(16,185,129,0.10)',
                      scale: isHighlighted('analytics') ? 1.02 : 1,
                    }}
                  />
                  {/* Customer Circle */}
                  <motion.circle
                    cx="50" cy="65" r="30"
                    fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="0.5"
                    className="origin-[50%_65%]"
                    animate={{
                      fill: isHighlighted('customer') ? 'rgba(139,92,246,0.42)' : 'rgba(139,92,246,0.10)',
                      scale: isHighlighted('customer') ? 1.02 : 1,
                    }}
                  />
                  {/* Labels */}
                  <text x="25" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.marketing}</text>
                  <text x="75" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.analytics}</text>
                  <text x="50" y="80" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.customer}</text>
                </svg>
              </div>
            </motion.div>

            {/* ── Invitation (before first interaction) ──────────────────── */}
            <AnimatePresence mode="wait">
              {!hasInteracted && (
                <motion.div
                  key="invitation"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full flex flex-col items-center gap-3"
                >
                  {/* Bouncing arrow pointing up at the diagram */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="text-primary/40"
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
              )}
            </AnimatePresence>

            {/* ── Roles Panel (after first interaction) ──────────────────── */}
            <AnimatePresence>
              {hasInteracted && (
                <motion.div
                  key="roles-panel"
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: 8,  scale: 0.98 }}
                  transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
                  className="w-full lg:w-5/12 order-1 lg:order-2"
                >
                  <motion.div
                    layout
                    transition={{ layout: { type: 'spring', stiffness: 340, damping: 36 } }}
                    className="glass-panel p-8 rounded-[24px] overflow-hidden"
                  >
                    <motion.h3
                      layout="position"
                      className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      {activeCategoryName}
                    </motion.h3>

                    <motion.div layout="position" className="space-y-4">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {activeRoles.map((role, idx) => (
                          <motion.div
                            key={`${activeArea}-${idx}`}
                            layout
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16, filter: 'blur(3px)' }}
                            transition={{ duration: 0.32, delay: idx * 0.07, ease: [0.4, 0, 0.2, 1] }}
                            className="glass-pill p-5 rounded-[16px]"
                          >
                            <h4 className="text-lg font-bold text-foreground mb-2">{role.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">{role.description}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TargetRolesSection;
