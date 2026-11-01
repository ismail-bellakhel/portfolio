import { useEffect, useRef } from 'react';
import { clamp, clamp01, lerp, seeded } from '@/lib/utils';
import { contactFocus } from '@/components/scenes';

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

/*
  How many lights are in flight, relative to the original tuning.

  A packet's population is its lifetime divided by its spawn interval, so
  dividing the interval by this number scales the count on screen by it. The
  knob is here rather than on the strand count because dropping strands would
  also widen the gaps in the bundle; this thins the traffic while leaving the
  spread across the viewport exactly as it was.
*/
const LIGHT_DENSITY = 0.9;

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
      packets: [],
      nextSpawn: (rand() * 2.4) / LIGHT_DENSITY,
      hueShift: (rand() - 0.5) * 48,
    });
  }
  return strands;
}

/**
 * x position of a strand at viewport y, given current scroll.
 *
 * `warp` is the contact-section pinch. It pulls x toward the focus by an
 * amount that peaks at the focus line and falls to zero at the edges of its
 * reach, so the bundle narrows to a waist and opens again rather than being
 * bent wholesale. At full strength every strand resolves to the same x at the
 * focus line, which is what makes them read as merging into one point.
 */
function strandX(s, y, scroll, warp) {
  const py = y + scroll * s.depth;
  const x =
    s.x +
    Math.sin(py * s.freq1 + s.phase1) * s.amp1 +
    Math.sin(py * s.freq2 + s.phase2) * s.amp2;

  if (!warp) return x;
  const k = warp.at(y);
  return k > 0 ? x + (warp.cx - x) * k : x;
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

    // How strongly the strands are pinched toward the contact scene's focus.
    // 0 everywhere except over the contact section at the end of the page.
    let converge = 0;
    let warp = null;

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
      // While pinching, x changes fast near the waist, so the run is sampled
      // more finely. At the usual 26-step cap the tip of the waist renders as
      // a visible corner instead of a curve.
      const steps = warp
        ? clamp(Math.ceil(Math.abs(span) / 14), 2, 54)
        : clamp(Math.ceil(Math.abs(span) / 26), 2, 26);

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const y = y0 + (span * i) / steps;
        const x = strandX(s, y, scrollSmooth, warp);
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

      // --- contact pinch ---
      // Measured the same way SceneLayer weights its scenes, so the strands
      // tighten in step with the converging rays being drawn underneath
      // instead of leading or trailing them.
      const contact = document.getElementById('contact');
      let targetConverge = 0;
      if (contact) {
        const r = contact.getBoundingClientRect();
        const overlap = Math.min(h, r.bottom) - Math.max(0, r.top);
        const frac = clamp01(overlap / Math.min(h, Math.max(r.height, 1)));
        targetConverge = frac * frac * (3 - 2 * frac); // smoothstep
      }
      converge += (targetConverge - converge) * clamp01(dt * 2.6);

      if (converge > 0.002) {
        const focus = contactFocus(w, h);
        const reach = h * 0.5;
        warp = {
          cx: focus.x,
          cy: focus.y,
          strength: converge,
          at(y) {
            const f = 1 - clamp01(Math.abs(y - focus.y) / reach);
            return converge * f * f * (3 - 2 * f);
          },
        };
      } else {
        warp = null;
      }

      ctx.clearRect(0, 0, w, h);

      // The strands themselves are never stroked. Only the travelling light and
      // its trail are drawn, so the path is implied by the motion rather than
      // laid out as visible wiring. With motion reduced there is no travelling
      // light, so there is nothing left to draw.
      if (reduce) return;

      ctx.globalCompositeOperation = 'lighter';

      for (const s of strands) {
        const rgb = {
          r: clamp(colour.r + s.hueShift, 0, 255),
          g: clamp(colour.g + s.hueShift * 0.45, 0, 255),
          b: clamp(colour.b - s.hueShift * 0.25, 0, 255),
        };

        // --- spawn packets ---
        s.nextSpawn -= dt * (1 + energy * 3.2);
        if (s.nextSpawn <= 0) {
          s.nextSpawn = (1.1 + Math.random() * 3.4) / LIGHT_DENSITY;
          if (s.packets.length < 4) {
            s.packets.push({
              y: -120 - Math.random() * 200,
              speed: (150 + Math.random() * 230) * (0.5 + s.depth),
              len: 90 + Math.random() * 190,
              bright: 0.4 + Math.random() * 0.6,
              // 0 while travelling, ramps to 1 once the packet reaches the
              // merge point and is drawn into it.
              absorb: 0,
            });
          }
        }

        // --- advance and draw packets ---
        for (let i = s.packets.length - 1; i >= 0; i--) {
          const p = s.packets[i];

          // Scroll velocity drags packets along and stretches their tail.
          const prevY = p.y;
          p.y += (p.speed * (1 + energy * 5) + velocity * s.depth * 0.55) * dt;

          /*
            The merge point is a terminus, not a waypoint. Once the pinch is
            established, a packet that reaches the focus line stops there and
            is drawn in, instead of sliding through the point it just merged
            into and out the bottom of the screen.

            `prevY <= warp.cy` is what makes this safe. Only packets arriving
            from above are held; any that were already past the focus when the
            pinch began keep falling and leave normally, rather than snapping
            backwards up to the line.
          */
          const merging =
            warp && warp.strength > 0.55 && prevY <= warp.cy && p.y >= warp.cy;
          if (merging) {
            p.y = warp.cy;
            p.absorb = clamp01(p.absorb + dt * 2.4);
          }

          // Arriving light retracts into the point rather than just fading, so
          // the trail reads as being swallowed by it.
          const ease = 1 - p.absorb * p.absorb;
          const tail = p.len * (1 + energy * 3.4) * (merging ? ease : 1);

          if (p.absorb >= 1 || p.y - tail > h + 160 || p.y < -900) {
            s.packets.splice(i, 1);
            continue;
          }

          const a = p.bright * amp * (0.5 + s.depth * 0.5) * (merging ? ease : 1);

          // Three additive passes fake a bloom far more cheaply than shadowBlur.
          strokeRun(s, p.y - tail, p.y, rgb, a * 0.1, 7);
          strokeRun(s, p.y - tail * 0.6, p.y, rgb, a * 0.3, 2.6);
          strokeRun(s, p.y - tail * 0.3, p.y, rgb, a * 0.95, 1.1);

          // Bright head.
          const hx = strandX(s, p.y, scrollSmooth, warp);
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
