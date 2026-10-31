import { useEffect, useRef } from 'react';
import { clamp, clamp01, lerp, seeded } from '@/lib/utils';

/*
  FiberField
  ----------
  The signature motion of the site: a bundle of fibre-optic strands running the
  full height of the page, with packets of light travelling down them.

  How it works
  - Each strand is an implicit curve x(y) built from two sine terms. There is no
    stored geometry, so the strand is infinitely long and costs nothing to scroll.
  - Each strand has a `depth` (0.25 … 1). Page scroll is multiplied by depth when
    sampling the curve, which produces real parallax between strands.
  - Light packets travel down a strand. Scroll velocity feeds into their speed and
    stretches their tail, so flicking the page makes the light streak.
  - `tint` is driven by whichever section is currently in view, so the whole
    conduit changes colour as you move through the page.

  Performance
  - One canvas, one RAF, DPR capped at 1.5.
  - No shadowBlur (very expensive). Glow is faked with three additive strokes of
    decreasing width and increasing alpha.
  - Scroll is read passively; the draw is clipped to the viewport.
*/

const DESKTOP_STRANDS = 16;
const MOBILE_STRANDS = 8;

function makeStrands(count, w, h) {
  const rand = seeded(20260401);
  const strands = [];

  for (let i = 0; i < count; i++) {
    // Spread strands across the width with jitter so they don't look ruled.
    const slot = (i + 0.5) / count;
    const x = (slot + (rand() - 0.5) * 0.055) * w;
    const depth = 0.28 + rand() * 0.72;

    strands.push({
      x,
      depth,
      // Two sine terms at different wavelengths = organic wander.
      amp1: (26 + rand() * 70) * depth,
      amp2: (10 + rand() * 30) * depth,
      freq1: 0.0012 + rand() * 0.0019,
      freq2: 0.0045 + rand() * 0.006,
      phase1: rand() * Math.PI * 2,
      phase2: rand() * Math.PI * 2,
      // Dim always-on strand so the conduit is visible between packets.
      base: 0.05 + depth * 0.1,
      packets: [],
      nextSpawn: rand() * 2.4,
      hueShift: (rand() - 0.5) * 48,
    });
  }
  return strands;
}

/** x position of a strand at viewport y, given current scroll. */
function strandX(s, y, scroll) {
  const py = y + scroll * s.depth;
  return (
    s.x +
    Math.sin(py * s.freq1 + s.phase1) * s.amp1 +
    Math.sin(py * s.freq2 + s.phase2) * s.amp2
  );
}

export default function FiberField({ tint, intensity = 1 }) {
  const canvasRef = useRef(null);
  const tintRef = useRef(tint);
  const intensityRef = useRef(intensity);

  tintRef.current = tint;
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let strands = [];
    let raf = 0;
    let last = performance.now();

    // Scroll state: smoothed position + velocity.
    let scroll = window.scrollY;
    let scrollSmooth = scroll;
    let velocity = 0;

    // Current blended colour of the conduit.
    const colour = { r: 96, g: 165, b: 250 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      strands = makeStrands(coarse ? MOBILE_STRANDS : DESKTOP_STRANDS, w, h);
    };

    const onScroll = () => {
      scroll = window.scrollY;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    /** Stroke a glowing run along strand `s` from y0 to y1. */
    const strokeRun = (s, y0, y1, rgb, alpha, width) => {
      const span = y1 - y0;
      const steps = clamp(Math.ceil(Math.abs(span) / 26), 2, 26);

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const y = y0 + (span * i) / steps;
        const x = strandX(s, y, scrollSmooth);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Fade the packet along its length so it reads as a comet tail.
      const grad = ctx.createLinearGradient(0, y0, 0, y1);
      grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      grad.addColorStop(0.55, `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha * 0.55})`);
      grad.addColorStop(0.92, `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`);
      grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.9})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);

      // No explicit `document.hidden` guard: browsers already suspend rAF for
      // hidden tabs, and some embedded/headless views report hidden while
      // still being painted, which would freeze the field on screen.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Smooth the scroll and derive velocity from the smoothed delta.
      const prev = scrollSmooth;
      scrollSmooth += (scroll - scrollSmooth) * clamp01(dt * 9);
      const instant = (scrollSmooth - prev) / Math.max(dt, 0.001);
      velocity += (instant - velocity) * clamp01(dt * 6);

      // Ease the conduit colour toward the active section tint.
      const target = tintRef.current || { r: 96, g: 165, b: 250 };
      const k = clamp01(dt * 1.6);
      colour.r = lerp(colour.r, target.r, k);
      colour.g = lerp(colour.g, target.g, k);
      colour.b = lerp(colour.b, target.b, k);

      // Scroll "energy": 0 at rest, 1 when flicking hard.
      const energy = clamp01(Math.abs(velocity) / 2600);
      const amp = intensityRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const s of strands) {
        const rgb = {
          r: clamp(colour.r + s.hueShift, 0, 255),
          g: clamp(colour.g + s.hueShift * 0.45, 0, 255),
          b: clamp(colour.b - s.hueShift * 0.25, 0, 255),
        };

        // --- always-on strand ---
        const baseAlpha = s.base * amp * (0.62 + energy * 0.5);
        strokeRun(s, -40, h + 40, rgb, baseAlpha, 1);

        if (reduce) continue;

        // --- spawn packets ---
        s.nextSpawn -= dt * (1 + energy * 3.2);
        if (s.nextSpawn <= 0) {
          s.nextSpawn = 1.1 + Math.random() * 3.4;
          if (s.packets.length < 4) {
            s.packets.push({
              y: -120 - Math.random() * 200,
              speed: (150 + Math.random() * 230) * (0.5 + s.depth),
              len: 90 + Math.random() * 190,
              bright: 0.4 + Math.random() * 0.6,
            });
          }
        }

        // --- advance and draw packets ---
        for (let i = s.packets.length - 1; i >= 0; i--) {
          const p = s.packets[i];

          // Scroll velocity drags packets along and stretches their tail.
          p.y += (p.speed * (1 + energy * 5) + velocity * s.depth * 0.55) * dt;
          const tail = p.len * (1 + energy * 3.4);

          if (p.y - tail > h + 160 || p.y < -900) {
            s.packets.splice(i, 1);
            continue;
          }

          const a = p.bright * amp * (0.5 + s.depth * 0.5);

          // Three additive passes fake a bloom far more cheaply than shadowBlur.
          strokeRun(s, p.y - tail, p.y, rgb, a * 0.1, 7);
          strokeRun(s, p.y - tail * 0.6, p.y, rgb, a * 0.3, 2.6);
          strokeRun(s, p.y - tail * 0.3, p.y, rgb, a * 0.95, 1.1);

          // Bright head.
          const hx = strandX(s, p.y, scrollSmooth);
          const g = ctx.createRadialGradient(hx, p.y, 0, hx, p.y, 13);
          g.addColorStop(0, `rgba(255,255,255,${a * 0.85})`);
          g.addColorStop(0.35, `rgba(${rgb.r},${rgb.g},${rgb.b},${a * 0.45})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hx, p.y, 13, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
