import { useCallback, useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';

import FiberField from '@/components/FiberField';
import SceneLayer from '@/components/SceneLayer';
import Nav from '@/components/Nav';
import Hero from '@/sections/Hero';
import Sectors from '@/sections/Sectors';
import Experience from '@/sections/Experience';
import Cases from '@/sections/Cases';
import Projects from '@/sections/Projects';
import Stack from '@/sections/Stack';
import Roles from '@/sections/Roles';
import Contact from '@/sections/Contact';
import {
  sectors as sectorData,
  signals,
  stack as stackData,
} from '@/data/content';

/* Module scope, so the reference is stable and SceneLayer's registry memo
   does not rebuild every render. */
const SECTOR_LABELS = sectorData.map((s) => s.short);

/** The conduit colour for each section. */
const TINTS = {
  hero: { r: 96, g: 165, b: 250 },
  sectors: { r: 96, g: 165, b: 250 },
  experience: { r: 34, g: 211, b: 238 },
  cases: { r: 52, g: 211, b: 153 },
  projects: { r: 167, g: 139, b: 250 },
  stack: { r: 56, g: 189, b: 248 },
  roles: { r: 129, g: 140, b: 248 },
  contact: { r: 96, g: 165, b: 250 },
};

export default function App() {
  const [active, setActive] = useState('hero');

  // Smooth scroll. Lenis transforms the page, but the canvases are
  // position:fixed and read window.scrollY, so they stay in sync.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    let raf = 0;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  const stackLabels = useMemo(
    () => stackData.flatMap((c) => c.tools.map((t) => t.name)),
    [],
  );

  /*
    SceneLayer only knows about the sections that own a background scene, and
    the hero owns none, so it reports `null` whenever nothing else is on
    screen. That null IS the hero. Discarding it left the nav and the rail
    stuck on whichever section was last lit, so scrolling back to the top (or
    clicking Home) still read "Sectors".
  */
  const handleActive = useCallback((id) => setActive(id || 'hero'), []);

  return (
    <div className="noise relative min-h-screen bg-ink-950">
      <SceneLayer
        stackLabels={stackLabels}
        sectorLabels={SECTOR_LABELS}
        onActive={handleActive}
      />
      <FiberField tint={TINTS[active] || TINTS.hero} signals={signals} />

      <Nav active={active} />

      <main className="relative z-10">
        <Hero />
        <Sectors />
        <Experience />
        <Cases />
        <Projects />
        <Stack />
        <Roles />
        <Contact />
      </main>
    </div>
  );
}
