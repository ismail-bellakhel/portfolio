import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  ChevronLeft, ChevronRight,
  Newspaper, Zap, BookOpen, Wifi, Briefcase,
  Car, Home, Globe, Headphones, Users,
  ShoppingBag, Activity, Phone,
} from 'lucide-react';

const SECTORS = [
  'newsMedia', 'saas', 'edtech', 'telecom', 'consulting',
  'automotive', 'realEstate', 'international', 'customerService',
  'customerServiceMgmt', 'retail', 'fitness', 'frenchTelecom',
];

const N = SECTORS.length; // 13 real cards
// Doubled array: phantom copies of every card so the seamless snap happens
// only after frenchTelecom (index N-1) is well off-screen (signedDist > 4).
// Snap triggers at extNext >= N + 4, then resets to realNext = (N+4) % N.
const EXTENDED = [...SECTORS, ...SECTORS];

const SECTOR_ICONS = {
  newsMedia: Newspaper,
  saas: Zap,
  edtech: BookOpen,
  telecom: Wifi,
  consulting: Briefcase,
  automotive: Car,
  realEstate: Home,
  international: Globe,
  customerService: Headphones,
  customerServiceMgmt: Users,
  retail: ShoppingBag,
  fitness: Activity,
  frenchTelecom: Phone,
};

const CARD_GAP = 20;

const SectorCard = ({ sectorKey, index, dragX, cardW, cardStep, offset, t }) => {
  const Icon = SECTOR_ICONS[sectorKey];

  const signedDist = useTransform(dragX, v => (v - offset) / cardStep + index);

  const scale = useTransform(signedDist, d => {
    const a = Math.min(Math.abs(d), 3);
    return 1 - a * 0.08;
  });
  const opacity = useTransform(signedDist, d => {
    const a = Math.min(Math.abs(d), 3);
    return Math.max(0.28, 1 - a * 0.24);
  });
  const zIndex = useTransform(signedDist, d => Math.round(20 - Math.min(Math.abs(d), 3) * 5));
  // rotateY removed — it creates a 3D rendering context that makes backdrop-filter
  // render as solid black in Chrome on all descendant elements. Use scale only.

  return (
    <motion.div
      style={{ scale, opacity, zIndex, width: cardW, flexShrink: 0 }}
      className="py-6"
    >
      <div className="liquid-glass-sector h-full min-h-[260px] p-8 rounded-[26px] relative overflow-hidden flex flex-col">
        <div className="mb-5 w-11 h-11 rounded-2xl flex items-center justify-center liquid-glass-sector-icon flex-shrink-0">
          <Icon className="w-5 h-5 text-foreground/65" />
        </div>
        <h3 className="text-[17px] font-bold mb-3 tracking-tight text-foreground/92 relative z-10 leading-snug">
          {t.sectors[sectorKey].title}
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed relative z-10 flex-1">
          {t.sectors[sectorKey].description}
        </p>
      </div>
    </motion.div>
  );
};

const SectorExperienceSection = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0); // always a real index (0..N-1)
  const currentRef = useRef(0);              // tracks extended index during phantom advance
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  // initialise to 0; useLayoutEffect will set the real offset before first paint
  const dragX = useMotionValue(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);

  // containerW=0 until useLayoutEffect fires; render nothing until measured
  const cardW = containerW > 0 ? Math.min(360, Math.max(260, containerW * 0.74)) : 300;
  const cardStep = cardW + CARD_GAP;
  const offset = containerW > 0 ? (containerW - cardW) / 2 : 0;

  // Set correct initial position BEFORE first paint (no flash of wrong layout)
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const cw = Math.min(360, Math.max(260, w * 0.74));
    const cs = cw + CARD_GAP;
    const off = (w - cw) / 2;
    setContainerW(w);
    dragX.set(off - currentRef.current * cs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure container and re-center on resize
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const cw = Math.min(360, Math.max(260, w * 0.74));
      const cs = cw + CARD_GAP;
      const off = (w - cw) / 2;
      setContainerW(w);
      dragX.set(off - currentRef.current * cs);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [dragX]);

  // Manual navigation — always real indices
  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, N - 1));
    currentRef.current = clamped;
    setCurrent(clamped);
    animate(dragX, offset - clamped * cardStep, {
      type: 'spring',
      stiffness: 280,
      damping: 32,
    });
  }, [dragX, offset, cardStep]);

  // Auto-advance: walks through EXTENDED, snaps back only after frenchTelecom
  // (index N-1) has left the visible area (signedDist > 4 from centre).
  // That happens once extNext > N + 3, i.e. extNext >= N + 4.
  const advance = useCallback(() => {
    // Safety: never go past the end of the doubled array
    if (currentRef.current >= 2 * N - 1) {
      dragX.set(offset - 0 * cardStep);
      currentRef.current = 0;
      setCurrent(0);
      return;
    }

    const extNext  = currentRef.current + 1;
    const realNext = extNext % N;

    setCurrent(realNext);
    currentRef.current = extNext;

    animate(dragX, offset - extNext * cardStep, {
      type: 'spring',
      stiffness: 280,
      damping: 32,
      onComplete: () => {
        // Snap once frenchTelecom is off-screen:
        // frenchTelecom is at index N-1; it exits the ±3 visible band
        // when the centre is at extNext >= (N-1) + 4 = N + 3
        if (extNext >= N + 4) {
          dragX.set(offset - realNext * cardStep);
          currentRef.current = realNext;
        }
      },
    });
  }, [dragX, offset, cardStep]);

  const advanceRef = useRef(advance);
  useEffect(() => { advanceRef.current = advance; }, [advance]);

  // Auto-play every 2 seconds, paused while hovered or dragging
  useEffect(() => {
    const id = setInterval(() => {
      if (!isHoveredRef.current && !isDraggingRef.current) advanceRef.current();
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const handleDragEnd = useCallback((_, info) => {
    isDraggingRef.current = false;
    // After drag, currentRef may be an extended index — normalise to real
    const realCurrent = currentRef.current % N;
    if (info.offset.x < -50 || info.velocity.x < -500) goTo(realCurrent + 1);
    else if (info.offset.x > 50 || info.velocity.x > 500) goTo(realCurrent - 1);
    else goTo(realCurrent);
  }, [goTo]);

  return (
    <section id="sectors" className="py-24 relative z-10">
      <svg style={{ display: 'none' }} aria-hidden="true">
        <defs>
          <filter id="glass-refraction" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.028" numOctaves="2" seed="42" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-3xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            {t.sectors.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            {t.sectors.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Carousel — overflow-x clip prevents page horizontal scroll */}
      <div
        ref={containerRef}
        className="relative w-full select-none"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
        style={{
          overflowX: 'clip',
          maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{
            left: offset - (N - 1) * cardStep,
            right: offset,
          }}
          dragTransition={{ bounceStiffness: 320, bounceDamping: 40 }}
          onDragStart={() => { isDraggingRef.current = true; }}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="flex gap-5 cursor-grab active:cursor-grabbing"
        >
          {EXTENDED.map((key, i) => (
            <SectorCard
              key={`${key}-${i}`}
              sectorKey={key}
              index={i}
              dragX={dragX}
              cardW={cardW}
              cardStep={cardStep}
              offset={offset}
              t={t}
            />
          ))}
        </motion.div>
      </div>

      {/* Navigation controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="liquid-glass-nav-btn disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Previous sector"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-[7px]">
            {SECTORS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to sector ${i + 1}`}
                className={`rounded-full transition-all duration-300 ease-out ${
                  i === current
                    ? 'w-5 h-[7px] bg-foreground'
                    : 'w-[7px] h-[7px] bg-foreground/20 hover:bg-foreground/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(current + 1)}
            disabled={current === N - 1}
            className="liquid-glass-nav-btn disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Next sector"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-3 tabular-nums">
          {current + 1} / {N}
        </p>
      </div>
    </section>
  );
};

export default SectorExperienceSection;
