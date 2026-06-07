import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GLASS_INSETS =
  'inset 0 1.5px 0 rgba(255,255,255,0.85), ' +
  'inset 1.5px 0 0 rgba(255,215,165,0.45), ' +
  'inset -1.5px 0 0 rgba(255,190,158,0.35), ' +
  'inset 0 -1px 0 rgba(0,0,0,0.05)';

const AI_GLOW = [
  [188, 130, 243],
  [141, 159, 255],
  [245, 185, 234],
  [255, 103, 120],
  [255, 186, 113],
  [188, 130, 243],
].map(([r, g, b]) => [
  `0 0 0 1.5px rgba(${r},${g},${b},0.85)`,
  `0 0 14px 4px rgba(${r},${g},${b},0.42)`,
  `0 0 32px 10px rgba(${r},${g},${b},0.14)`,
  GLASS_INSETS,
].join(', '));

// Computed once at module level — stable across renders, safe on SSR (defaults false).
const isTouchDevice =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const NAME_VARIANTS = [
  { text: 'Ismail Bellakhel',   lang: 'en' },
  { text: 'إسماعيل بلكحل',      lang: 'ar', dir: 'rtl' },
  { text: 'イスマイル・ベラヘル', lang: 'ja' },
  { text: '伊斯梅尔·贝拉赫尔',   lang: 'zh' },
  { text: 'Исмаил Беллахель',   lang: 'ru' },
  { text: '이스마일 벨라헬',      lang: 'ko' },
];

const FADE_MS = 350;
const HOLD_MS = 2800;
// Horizontal padding of the pill (px-4 = 16px each side = 32px total)
const PILL_PAD_X = 32;

// NamePill — animates the pill width directly in px (not via FLIP/scaleX).
// A hidden off-screen sizer measures the next text's natural width before
// the visible text changes, so the spring fires with the correct target.
function NamePill() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);
  const [width,   setWidth]   = useState(null); // null = natural auto until first measure
  const sizerRef = useRef(null);
  const timerRef = useRef(null);

  // Measure the sizer width every time the text changes.
  // useLayoutEffect fires synchronously before paint so there is no flash.
  useLayoutEffect(() => {
    if (sizerRef.current) {
      setWidth(sizerRef.current.offsetWidth + PILL_PAD_X);
    }
  }, [index]);

  useEffect(() => {
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        // Step 1: blur-fade the current text out
        setVisible(false);

        timerRef.current = setTimeout(() => {
          // Step 2: swap text — sizer + useLayoutEffect fire immediately,
          // setting the new width so the spring starts before text reappears
          setIndex(i => (i + 1) % NAME_VARIANTS.length);

          // Step 3: 35 ms later reveal the new text so the pill has already
          // begun its elastic expansion/contraction
          timerRef.current = setTimeout(() => {
            setVisible(true);
            schedule();
          }, 35);
        }, FADE_MS + 40);
      }, HOLD_MS);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, []);

  const { text, lang, dir } = NAME_VARIANTS[index];

  return (
    <>
      {/*
        Hidden off-screen sizer — always renders the CURRENT text with
        the exact same font classes as the visible span so the measured
        offsetWidth matches what the pill will need.
        position:fixed keeps it out of the layout flow entirely.
      */}
      <span
        ref={sizerRef}
        aria-hidden="true"
        className="text-sm font-medium whitespace-nowrap"
        style={{ position: 'fixed', top: -9999, left: -9999, visibility: 'hidden', pointerEvents: 'none' }}
      >
        {text}
      </span>

      {/*
        Direct width animation — no FLIP, no scaleX.
        bounce:0.4 gives a genuine elastic overshoot: the pill expands
        slightly past the target width then settles, which reads as organic
        rather than the robotic linear resize that scaleX-based FLIP produces.
        visualDuration:0.5 keeps it snappy.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity:   1,
          y:         0,
          // box-shadow animation forces a repaint every frame — skip on mobile
          ...(isTouchDevice ? {} : { boxShadow: AI_GLOW }),
          ...(width !== null && { width }),
        }}
        transition={{
          opacity:   { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
          y:         { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
          boxShadow: { duration: 4, repeat: Infinity, ease: 'linear' },
          width:     { type: 'spring', bounce: 0.4, visualDuration: 0.5 },
        }}
        style={{ borderRadius: 9999, overflow: 'hidden' }}
        className="inline-flex items-center px-4 py-2 glass-panel text-sm font-medium text-muted-foreground"
      >
        <motion.span
          animate={{
            opacity: visible ? 1 : 0,
            filter:  visible ? 'blur(0px)' : 'blur(5px)',
          }}
          transition={{ duration: FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          lang={lang}
          dir={dir}
          className="whitespace-nowrap"
        >
          {text}
        </motion.span>
      </motion.div>
    </>
  );
}

const HeroSection = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  const yImage      = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center overflow-hidden pt-20 pb-16 lg:py-0">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          <div className="space-y-8 lg:col-span-6">
            {/*
              NamePill lives OUTSIDE the scroll-fade wrapper.
              The wrapper uses style={{ opacity: opacityText }} which sets
              opacity < 1 on scroll → stacking context → child backdrop-filter
              samples a transparent composite layer = black pill.
              Moving it here means its own motion.div owns opacity,
              co-located with glass-panel's backdrop-filter. Safe. ✓
            */}
            <NamePill />

            {/* Scroll-fade — disabled on mobile (scroll-linked opacity creates a
                compositing layer that breaks any backdrop-filter children) */}
            <motion.div style={isTouchDevice ? undefined : { opacity: opacityText }} className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-gradient text-balance"
              >
                {t.hero.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-prose font-medium"
              >
                {t.hero.description}
              </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button size="lg" className="rounded-xl gap-2 group glass-glow h-14 px-8 text-base" asChild>
                <a href="/ismail-bellakhel-cv.pdf" download="Ismail-Bellakhel-CV.pdf">
                  <Download className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
                  {t.hero.downloadCV}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl gap-2 group h-14 px-8 text-base glass-panel hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
                onClick={() => scrollToSection('cases')}
              >
                {t.hero.viewWork}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <motion.div
              style={isTouchDevice ? undefined : { y: yImage }}
              className="relative w-full max-w-md lg:max-w-lg aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] group glass-frame"
            >
              <motion.img
                src="/images/ismail-bellakhel-seo-award.jpg"
                alt="Ismail Bellakhel with the Svenska SEO-priset award"
                className="w-full h-full object-cover object-[left_center] transition-transform duration-1000 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="glass-panel p-5 rounded-2xl shadow-xl backdrop-blur-xl bg-white/60 dark:bg-black/40 border border-white/30"
                >
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed shadow-sm">
                    {t.hero.awardCaption}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
