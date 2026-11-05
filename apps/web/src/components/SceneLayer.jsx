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
  sphereScene,
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
      ['hero', sphereScene()],
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

    /*
      Pointer position as -1 … 1 from the centre of the viewport. `pointer` is
      eased toward `target` rather than snapped to it, so a scene leaning on it
      swings with some weight behind it instead of twitching. Listening on the
      window, not the canvas: the canvas is pointer-events:none, and has to
      stay that way or it would eat every click on the page.
    */
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, spinX: 0, spinY: 0, dragging: false };
    let moved = false;

    /*
      Turning a scene by hand.

      A scene that can be grabbed exposes hit(x, y). On a press we ask the
      scenes that are actually on screen, and the first to claim the point
      takes the drag. Everything else keeps working exactly as before,
      which matters because this canvas covers the whole page: a press that
      nothing claims has to stay an ordinary press.

      Mouse only. On a touch screen the same gesture is the one that
      scrolls the page, and quietly eating people's scrolls over a third of
      the hero to allow a flourish is a bad trade.
    */
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const SPIN_PER_PX = 0.0085;
    // Far enough to turn it right round and then some, short of the point
    // where the pitch inverts and the lighting reads as a bug.
    const PITCH_LIMIT = 1.1;

    const vel = { x: 0, y: 0 };
    let pendX = 0;
    let pendY = 0;
    let lastX = 0;
    let lastY = 0;
    let grabbed = false;

    const interactive = (e) =>
      e.target?.closest?.('a, button, input, textarea, select, label, [role="button"]');

    const claim = (x, y) => {
      for (let i = 0; i < registry.length; i++) {
        if (weights[i] < 0.05) continue;
        if (registry[i][1].hit?.(x, y)) return true;
      }
      return false;
    };

    const onDown = (e) => {
      if (coarse || e.button !== 0 || interactive(e)) return;
      if (!claim(e.clientX, e.clientY)) return;
      grabbed = true;
      moved = true;
      pointer.dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      vel.x = 0;
      vel.y = 0;
      document.body.style.cursor = 'grabbing';
      // Otherwise the drag starts selecting whatever copy it passes over.
      e.preventDefault();
    };

    const onPointer = (e) => {
      moved = true;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;

      if (grabbed) {
        pendX += e.clientX - lastX;
        pendY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }

      /*
        A grabbable thing has to say so. Without the cursor change nothing
        on screen suggests the sphere can be turned, and a feature nobody
        can find is not a feature.
      */
      if (!coarse) {
        const over = !interactive(e) && claim(e.clientX, e.clientY);
        if (over) document.body.style.cursor = 'grab';
        else if (document.body.style.cursor === 'grab') document.body.style.cursor = '';
      }
    };

    const onUp = () => {
      if (!grabbed) return;
      grabbed = false;
      pointer.dragging = false;
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });

    let last = start;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) {
        const k = clamp01(dt * 2.6);
        pointer.x += (target.x - pointer.x) * k;
        pointer.y += (target.y - pointer.y) * k;

        /*
          Drag, then throw. While held, the pixels moved since the last
          frame become angle, and the rate of that becomes the velocity
          carried after release. Velocity is eased rather than taken raw,
          so one stuttery final frame cannot decide how hard the thing
          spins once it is let go.
        */
        if (grabbed) {
          const sx = pendX * SPIN_PER_PX;
          const sy = pendY * SPIN_PER_PX;
          pendX = 0;
          pendY = 0;
          pointer.spinX += sx;
          pointer.spinY += sy;
          const e = clamp01(dt * 11);
          vel.x += (sx / Math.max(dt, 0.001) - vel.x) * e;
          vel.y += (sy / Math.max(dt, 0.001) - vel.y) * e;
        } else {
          pointer.spinX += vel.x * dt;
          pointer.spinY += vel.y * dt;
          const drag = Math.exp(-dt * 2.2);
          vel.x *= drag;
          vel.y *= drag;
        }

        if (pointer.spinY > PITCH_LIMIT) {
          pointer.spinY = PITCH_LIMIT;
          vel.y = 0;
        } else if (pointer.spinY < -PITCH_LIMIT) {
          pointer.spinY = -PITCH_LIMIT;
          vel.y = 0;
        }
      }

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
        /*
          No pointer at all until the cursor has actually moved. Handing over
          the 0,0 default would put it at the dead centre of the viewport,
          which on a wide screen is close enough to the hero sphere to count
          as hovering it, so the thing opened mid-flinch.
        */
        registry[i][1].draw(ctx, w, h, t, a, progress[i], moved ? pointer : null);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = '';
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
