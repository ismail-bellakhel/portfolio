import { useEffect, useRef } from 'react';
import { clamp, clamp01, lerp, seeded } from '@/lib/utils';
import { contactFocus, coreFeed } from '@/components/scenes';

/*
  FiberField
  ----------
  The signature motion of the site: a bundle of fibre-optic strands running the
  full height of the page, with packets of light travelling down them.

  Each packet is born as a signal and ends as light. In the hero a KPI or a
  tool name (see `signals` in data/content) fades up on its own, with nothing
  beside it. It then collapses into a bare point of light, and only once that
  point starts falling does the fall draw a trail out of it. The light carries
  on down the conduit to the contact point, where it merges. The claim is
  stated once, in words, at the top of the page; everything below it is that
  same evidence still travelling, which is why the rest of the page sees light
  and not text.

  How it works
  - Each strand is an implicit curve x(y) built from two sine terms. There is no
    stored geometry, so the strand is infinitely long and costs nothing to scroll.
  - Each strand has a `depth` (0.25 … 1). Page scroll is multiplied by depth when
    sampling the curve, which produces real parallax between strands.
  - A packet ignites (`birth`), travels down the strand, then is drawn into the
    contact focus (`absorb`). Scroll velocity feeds into its speed and stretches
    its tail, so flicking the page makes the light streak.
  - `tint` is driven by whichever section is currently in view, so the whole
    conduit changes colour as you move through the page.

  Performance
  - One canvas, one RAF, DPR capped at 1.5.
  - No shadowBlur (very expensive). Glow is faked with three additive strokes of
    decreasing width and increasing alpha.
  - Labels are collected during the additive pass and painted afterwards in
    source-over, because additive text on a dark field washes out to mush.
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
const LIGHT_DENSITY = 0.172;

/*
  A phone shows the same traffic in a third of the width, so the bundle reads
  as busier there at an identical setting. It carries a further 10% less.
*/
const MOBILE_LIGHT_DENSITY = LIGHT_DENSITY * 0.9;

/*
  Extra traffic carried by the strands in the right-hand half of the width,
  where the page has no copy for the field to compete with. This ramps from
  nothing at the centre to its full value at the right edge, rather than
  switching on as a step at the halfway mark. A step gave the outermost
  strands, the ones over the empty gutter by the rail, exactly the same rate
  as the ones just right of the headline, so the edge stayed dark.
*/
const RIGHT_BIAS = 1.55;

/*
  How long a packet spends igniting, in seconds. It does not travel during this
  window, and nothing but the text exists for the first part of it.

  `birth` is allowed to start negative. That is the stagger: a packet seeded
  below zero waits its turn before igniting, which is what makes the first
  frame a cascade of KPIs arriving rather than all of them at once.

  Up from 1.15, but only the reading stage is longer. The hold is doubled to
  1.15s, since at 0.57s a four word signal was still resolving its last word
  when it started to collapse. The two stages after it keep the durations they
  always had, 0.32s to fall in and 0.25s for the light to take over: those are
  a handover rather than something to be read, and stretching them just made
  the signal look like it was labouring.

  1.725 = 1.15 reading + 0.32 collapsing + 0.25 becoming light.
*/
const BIRTH_TIME = 1.725;

/*
  The three stages of ignition, as fractions of BIRTH_TIME. They run in strict
  sequence, because the point is that one thing becomes another rather than two
  things sharing the screen.

    0 … TEXT_HOLD            the words, and nothing else at all. They blur up
                             one at a time, left to right.
    TEXT_HOLD … COLLAPSE_END the words fall in toward the centre of the line,
                             blurring out as they go.
    COLLAPSE_END … 1         the light fades in at that same centre, where the
                             words just were.

  The label is laid out centred on the light's own position, so the point the
  words collapse into is exactly the point the light appears at.

  These are fractions, so they move whenever BIRTH_TIME does. They are set
  against the split above: 1.15 / 1.725 and 1.47 / 1.725.
*/
const TEXT_HOLD = 0.667;
const COLLAPSE_END = 0.853;

/*
  How far a packet must fall, in pixels, to draw its trail out to full length.
  The trail is a product of motion, so a light that has just formed and is not
  yet moving has none at all.
*/
const TRAIL_DRAW = 190;

const LABEL_FONT = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
const CONTEXT_FONT = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace';

/*
  Word positions for a signal, measured once and kept.

  The animation is per word, so every word needs its own offset along the line
  and its own width. Both fonts are fixed, so those numbers never change and
  re-measuring them every frame would be pure waste.
*/
const layouts = new WeakMap();

function layoutSignal(ctx, sig) {
  const hit = layouts.get(sig);
  if (hit) return hit;

  const words = [];
  let dx = 0;

  const run = (text, font, gap) => {
    ctx.font = font;
    const space = ctx.measureText(' ').width;
    for (const word of text.split(' ')) {
      if (!word) continue;
      const width = ctx.measureText(word).width;
      words.push({ text: word, font, dx, width });
      dx += width + space;
    }
    dx += gap;
  };

  run(sig.value, LABEL_FONT, 6);
  const dim = words.length;
  run(sig.label, CONTEXT_FONT, 0);

  const out = { words, dim, total: dx };
  layouts.set(sig, out);
  return out;
}

/*
  A shuffled deck, dealt one signal at a time and reshuffled when exhausted.
  Drawing at random instead would show the same KPI twice in a row often enough
  to look broken on a field this sparse.
*/
function makeDeck(signals, rand) {
  let order = [];
  return () => {
    if (!signals.length) return null;
    if (!order.length) {
      order = signals.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    return signals[order.pop()];
  };
}

function makeStrands(count, w, h, density) {
  const rand = seeded(20260401);
  const strands = [];

  for (let i = 0; i < count; i++) {
    // Spread strands across the width with jitter so they don't look ruled.
    const slot = (i + 0.5) / count;
    const x = (slot + (rand() - 0.5) * 0.055) * w;
    const depth = 0.28 + rand() * 0.72;

    /*
      The right-hand half of the page is the empty half: the copy, the
      headline and the figures all sit left. The strands over there carry a
      little more traffic so the weight of the field balances the weight of
      the text, rather than both piling up on the same side. The further
      right a strand sits, the emptier the page behind it, so the further it
      is lifted.
    */
    const bias = 1 + (RIGHT_BIAS - 1) * clamp01((slot - 0.5) / 0.5);

    strands.push({
      x,
      depth,
      bias,
      // Two sine terms at different wavelengths = organic wander.
      amp1: (26 + rand() * 70) * depth,
      amp2: (10 + rand() * 30) * depth,
      freq1: 0.0012 + rand() * 0.0019,
      freq2: 0.0045 + rand() * 0.006,
      phase1: rand() * Math.PI * 2,
      phase2: rand() * Math.PI * 2,
      packets: [],
      nextSpawn: (rand() * 2.4) / (density * bias),
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

export default function FiberField({ tint, signals = [], intensity = 1 }) {
  const canvasRef = useRef(null);
  const tintRef = useRef(tint);
  const intensityRef = useRef(intensity);
  const signalsRef = useRef(signals);

  tintRef.current = tint;
  intensityRef.current = intensity;
  signalsRef.current = signals;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const density = coarse ? MOBILE_LIGHT_DENSITY : LIGHT_DENSITY;
    const deal = makeDeck(signalsRef.current, seeded(20260402));

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

    // Reused every frame. Labels are collected during the additive pass and
    // painted after it, and reallocating this array was measurable.
    const labels = [];

    const newPacket = (s, y) => ({
      y,
      // Where it ignited. The text dissolves over the first stretch of the
      // fall, measured from here.
      y0: y,
      speed: (150 + Math.random() * 230) * (0.5 + s.depth),
      len: 90 + Math.random() * 190,
      bright: 0.4 + Math.random() * 0.6,
      sig: deal(),
      // Below 0 it is waiting its turn, 0 to 1 it is igniting and holding
      // station, at 1 it is formed and falling.
      birth: 0,
      // 0 while travelling, ramps to 1 once the packet reaches the merge
      // point and is drawn into it.
      absorb: 0,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      strands = makeStrands(
        coarse ? MOBILE_STRANDS : DESKTOP_STRANDS,
        w,
        h,
        density,
      );

      /*
        Seed the viewport so the very first frame already carries signals.
        At this density a strand spawns roughly every sixteen seconds, so an
        unseeded field starts empty and fills in slowly, which reads as broken
        rather than calm.

        They all start unlit and staggered, so what the page opens on is the
        signals themselves fading up one after another, and only then falling.
        Nothing is already in flight on the first frame.
      */
      const seeds = Math.min(strands.length, coarse ? 5 : 9);
      for (let i = 0; i < seeds; i++) {
        const s = strands[Math.floor((i * strands.length) / seeds)];
        const p = newPacket(s, h * 0.92 * ((i + 0.5) / seeds));
        p.birth = -i * 0.34;
        s.packets.push(p);
      }
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

      /*
        The charge bleeds off here rather than in the sphere that reads it.
        This loop runs on every frame of the page's life; the sphere's only
        runs while it is on screen, so leaving the decay there would park
        the charge at whatever it held when you scrolled away and hand it
        back at that level whenever you came back.
      */
      coreFeed.charge *= Math.exp(-dt * 0.9);

      /*
        Text belongs to the hero and nowhere else. Below it every section has
        its own copy and its own scene, and a second layer of floating words
        behind them is noise. The gate rides the hero's own bottom edge, so
        the labels dissolve as the first section slides up over them instead
        of cutting out at an arbitrary scroll offset.
      */
      const hero = document.getElementById('hero');
      const heroGate = hero
        ? clamp01(hero.getBoundingClientRect().bottom / (h * 0.55))
        : 0;

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
          /*
            Same average wait as a 1.1-to-4.5 range, but a quarter of the
            spread. The wide range was not adding life, it was handing the
            occasional strand a dead spell four times longer than its
            neighbour's, and a few of those landing together is what left
            whole stretches of the page unlit.
          */
          s.nextSpawn = (2.2 + Math.random() * 1.2) / (density * s.bias);
          if (s.packets.length < 4) {
            // Born just inside the top edge rather than well above it, so the
            // ignition is actually seen. A packet that forms off screen and
            // slides down is the thing this is meant to replace.
            s.packets.push(newPacket(s, 40 + Math.random() * (h * 0.22)));
          }
        }

        // --- advance and draw packets ---
        for (let i = s.packets.length - 1; i >= 0; i--) {
          const p = s.packets[i];

          /*
            Ignition. A packet holds station while it forms, so the signal
            reads as being created at that point rather than having drifted in
            from somewhere above. Only once lit does it start to fall.
          */
          const prevY = p.y;
          if (p.birth < 1) p.birth = Math.min(p.birth + dt / BIRTH_TIME, 1);
          else {
            // Scroll velocity drags packets along and stretches their tail.
            p.y += (p.speed * (1 + energy * 5) + velocity * s.depth * 0.55) * dt;
          }

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
            /*
              Hand the arrival to the sphere sitting on this point. The
              charge is topped up over the whole of the absorption rather
              than banked in one go when the packet dies, so what the core
              shows is the light going into it, not a flash afterwards.
              Scaled by the packet's own brightness, so a strong signal
              counts for more than a faint one.
            */
            coreFeed.charge = clamp01(coreFeed.charge + dt * 2.4 * p.bright);
          }

          // Arriving light retracts into the point rather than just fading, so
          // the trail reads as being swallowed by it.
          const ease = 1 - p.absorb * p.absorb;
          // Negative birth is the stagger wait, which reads as not yet existing.
          const born = clamp01(p.birth);

          /*
            The light is the last stage of ignition only, and it starts after
            the words have already fallen into the point it appears at, so a
            signal is never seen sitting next to a lamp that is already lit.
          */
          const lit = clamp01((born - COLLAPSE_END) / (1 - COLLAPSE_END));

          /*
            The trail is drawn out by the fall, not by the birth. A light that
            has just formed is a bare point; it only streaks once it has put
            distance behind it.
          */
          const drawn = clamp01((p.y - p.y0) / TRAIL_DRAW);
          const tail = p.len * (1 + energy * 3.4) * (merging ? ease : 1) * drawn;

          if (p.absorb >= 1 || p.y - tail > h + 160 || p.y < -900) {
            s.packets.splice(i, 1);
            continue;
          }

          const a =
            p.bright *
            amp *
            (0.5 + s.depth * 0.5) *
            (merging ? ease : 1) *
            lit;

          // Three additive passes fake a bloom far more cheaply than shadowBlur.
          strokeRun(s, p.y - tail, p.y, rgb, a * 0.1, 7);
          strokeRun(s, p.y - tail * 0.6, p.y, rgb, a * 0.3, 2.6);
          strokeRun(s, p.y - tail * 0.3, p.y, rgb, a * 0.95, 1.1);

          /*
            Bright head. It condenses: wide and faint where the text was, then
            tightening to a point as the light finishes taking its place.
          */
          const hx = strandX(s, p.y, scrollSmooth, warp);
          if (lit > 0) {
            const hr = 13 * (0.55 + 0.45 * lit) + (1 - lit) * 16;
            const g = ctx.createRadialGradient(hx, p.y, 0, hx, p.y, hr);
            g.addColorStop(0, `rgba(255,255,255,${a * 0.85})`);
            g.addColorStop(0.35, `rgba(${rgb.r},${rgb.g},${rgb.b},${a * 0.45})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(hx, p.y, hr, 0, Math.PI * 2);
            ctx.fill();
          }

          /*
            The text exists only at the moment of creation, and only in the
            hero. It is handed to the label pass with its two stage clocks:
            how far it has blurred up, and how far it has fallen into itself.
          */
          if (p.sig && born < 1 && heroGate > 0.01) {
            const appear = clamp01(born / TEXT_HOLD);
            const collapse = clamp01(
              (born - TEXT_HOLD) / (COLLAPSE_END - TEXT_HOLD),
            );
            const base = heroGate * amp * (0.55 + s.depth * 0.45);

            if (base > 0.02) {
              labels.push(
                hx,
                p.y,
                base,
                rgb.r,
                rgb.g,
                rgb.b,
                p.sig,
                appear,
                collapse,
              );
            }
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      /*
        Labels last, and in source-over. Drawn inside the additive pass they
        blow out to white mush the moment two of them overlap. They sit behind
        the page content (this canvas is z-index 1, the sections are z-10), so
        they can never fight the copy for legibility.
      */
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < labels.length; i += 9) {
        const base = labels[i + 2];
        const x = labels[i];
        const y = labels[i + 1];
        const sig = labels[i + 6];
        const appear = labels[i + 7];
        const collapse = labels[i + 8];

        const { words, dim, total } = layoutSignal(ctx, sig);

        /*
          Centred on the light, then nudged back inside the viewport if that
          would hang off an edge. The words still collapse to the light's own
          x, so a shifted line simply slides home from further away.
        */
        const start = clamp(x - total / 2, 10, Math.max(10, w - 10 - total));

        // Accelerating, so the line lets go slowly and then drops into the
        // point, rather than sliding at a constant speed like a transition.
        const pull = collapse * collapse;

        for (let k = 0; k < words.length; k++) {
          const word = words[k];

          /*
            Each word arrives a beat after the one before it, so the signal
            reads left to right as it forms instead of appearing whole.
          */
          const up = clamp01((appear - k * 0.1) / 0.45);
          if (up <= 0) continue;

          const alpha = base * up * (1 - collapse) * (k < dim ? 0.95 : 0.6);
          if (alpha < 0.02) continue;

          const home = start + word.dx + word.width / 2;
          const cx = lerp(home, x, pull);
          const cy = y + (1 - up) * 7;

          /*
            Blurred at both ends: out of focus as it resolves, and out of
            focus again as it falls into the light. Only applied when it is
            actually needed, since a canvas filter is not free.
          */
          const blur = (1 - up) * 3.5 + collapse * 5;
          ctx.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px)` : 'none';

          ctx.font = word.font;
          ctx.fillStyle =
            k < dim
              ? `rgba(255,255,255,${alpha})`
              : `rgba(${labels[i + 3]},${labels[i + 4]},${labels[i + 5]},${alpha})`;
          ctx.fillText(word.text, cx, cy);
        }
      }

      ctx.filter = 'none';
      labels.length = 0;
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
