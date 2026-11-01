import { useEffect, useMemo, useRef } from 'react';
import { clamp01 } from '@/lib/utils';
import {
  radarScene,
  experienceScene,
  casesScene,
  projectsScene,
  stackScene,
  coverageScene,
  contactScene,
} from './scenes';

/*
  SceneLayer renders every section's background motif onto ONE canvas and
  crossfades between them based on how much of each section is on screen.

  It sits at z-index 0, below FiberField (z-1) and below content (z-10), so the
  glass panels' backdrop-filter picks it up and refracts it.
*/

export default function SceneLayer({ stackLabels = [], sectorLabels = [], onActive }) {
  const canvasRef = useRef(null);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const registry = useMemo(
    () => [
      ['sectors', coverageScene(sectorLabels)],
      ['experience', experienceScene()],
      ['cases', casesScene()],
      ['projects', projectsScene()],
      ['stack', stackScene(stackLabels)],
      ['roles', radarScene()],
      ['contact', contactScene()],
    ],
    [stackLabels, sectorLabels],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now();

    const weights = new Array(registry.length).fill(0);
    const progress = new Array(registry.length).fill(0);
    let lastActive = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const [, scene] of registry) scene.resize(w, h);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const frame = (now) => {
      raf = requestAnimationFrame(frame);

      const t = reduce ? 0 : (now - start) / 1000;
      const vh = window.innerHeight;

      // Measure each section's overlap with the viewport.
      let sum = 0;
      let best = -1;
      let bestW = 0;

      for (let i = 0; i < registry.length; i++) {
        const el = document.getElementById(registry[i][0]);
        if (!el) {
          weights[i] = 0;
          continue;
        }
        const r = el.getBoundingClientRect();
        const overlap = Math.min(vh, r.bottom) - Math.max(0, r.top);
        const frac = clamp01(overlap / Math.min(vh, Math.max(r.height, 1)));
        const wgt = frac * frac * (3 - 2 * frac); // smoothstep
        weights[i] = wgt;
        progress[i] = clamp01((vh - r.top) / (r.height + vh));
        sum += wgt;
        if (wgt > bestW) {
          bestW = wgt;
          best = i;
        }
      }

      // Normalise so overlapping sections crossfade rather than stack.
      if (sum > 1) for (let i = 0; i < weights.length; i++) weights[i] /= sum;

      const activeId = best >= 0 && bestW > 0.12 ? registry[best][0] : null;
      if (activeId !== lastActive) {
        lastActive = activeId;
        onActiveRef.current?.(activeId);
      }

      ctx.clearRect(0, 0, w, h);
      if (sum < 0.004) return;

      for (let i = 0; i < registry.length; i++) {
        const a = weights[i];
        if (a < 0.004) continue;
        registry[i][1].draw(ctx, w, h, t, a, progress[i]);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [registry]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
