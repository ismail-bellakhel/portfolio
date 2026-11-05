/*
  The split brain behind the assessment section.

  Two hemispheres of the same lobed silhouette, facing each other across a
  midline. The left one is drawn as folds and has charge running round them.
  The right one is drawn as a gear train and turns. That is the section in one
  object: a personality measured as something that flows, and a logic score
  measured as something that meshes.

  Everything is built from maths rather than traced paths, so one definition
  serves every viewport and the folds and teeth stay the same thickness on a
  phone as on a desktop.

  This lives in its own file because it is longer than the rest of the scenes
  put together and would bury them.
*/

import { clamp01 } from '@/lib/utils';

const TAU = Math.PI * 2;

const BLUE = [96, 165, 250];
const VIOLET = [167, 139, 250];
const MINT = [52, 211, 153];
const CYAN = [34, 211, 238];

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* The brain's own units. Scaled to the viewport once, in resize. */
const A = 138;
const B = 136;
const GAP = 10;

/*
  A lobed arc.

  Plain ellipse radius modulated by two sines, which is what gives the
  silhouette its cauliflower edge and gives the inner folds their wander. The
  same function draws the outline (rad 1, half a turn) and every fold inside
  it (smaller rad, shorter sweep), so the folds always share the curvature of
  the shell they sit in. `wob` phases the modulation, so no two folds ripple
  in step.
*/
function lobed(from, to, rad, wob, steps, amp, freq) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const th = from + (to - from) * (i / steps);
    const r =
      rad *
      (1 + amp * Math.sin(freq * th + wob) + amp * 0.34 * Math.sin(freq * 1.7 * th - wob));
    pts.push([Math.cos(th) * A * r, Math.sin(th) * B * r]);
  }
  return pts;
}

/* Left half: a half turn from the top of the midline round to the bottom of
   it, pushed clear of the centre. Both ends land on x = 0 before the shift,
   so the straight edge that closes the shape IS the midline. */
const shift = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);
const mirror = (pts) => pts.map(([x, y]) => [-x, y]);

/* Five scallops round the outer edge, shallow enough that every one of them
   stays convex. A deeper modulation bites into the shell and the silhouette
   stops being a brain and starts being a pair of lungs. */
const OUTLINE = shift(lobed(Math.PI / 2, Math.PI * 1.5, 1, 1.25, 180, 0.072, 10), -GAP);
const MIRRORED = mirror(OUTLINE);

/* Folds. Concentric-ish arcs at different depths, plus two short hooks, which
   is roughly how the reference drawing reads: long sweeps with tight returns
   tucked between them. */
const FOLDS = [
  [1.74, 2.6, 0.82, 0.6, 0.06],
  [2.08, 3.06, 0.56, 2.3, 0.08],
  [2.7, 3.58, 0.84, 1.4, 0.06],
  [3.2, 4.06, 0.58, 3.1, 0.08],
  [3.72, 4.6, 0.8, 0.3, 0.06],
  [2.42, 3.28, 0.32, 1.7, 0.1],
  [3.32, 4.18, 0.33, 4.2, 0.1],
].map(([f, t, r, w, amp]) => shift(lobed(f, t, r, w, 72, amp, 7), -GAP));

/* Every conductor on the left, outline included: charge runs the rim too. */
const WIRES = [OUTLINE, ...FOLDS];

/*
  The gear train.

  Centres are spaced at the sum of the two pitch radii, so neighbours mesh
  instead of merely sitting near each other, and each one turns against the
  one that drives it at a rate inversely proportional to its radius. That
  ratio is the whole reason a gear train reads as mechanical: get it wrong
  and five discs just spin.
*/
const GEARS = [
  { x: 54, y: 0, r: 40, teeth: 12, dir: 1 },
  { x: 60, y: -60, r: 32, teeth: 9, dir: -1 },
  { x: 100, y: -85, r: 24, teeth: 7, dir: 1 },
  { x: 62, y: 62, r: 34, teeth: 10, dir: -1 },
  { x: 107, y: 40, r: 26, teeth: 8, dir: 1 },
].map((g) => ({ ...g, x: g.x + GAP, speed: (g.dir * 9.5) / g.r, phase: g.x * 0.07 }));

/* One cog, as a closed crenellated path. Four points a tooth: up the leading
   flank, across the tip, down the trailing flank, along the root. */
function cog(ctx, g, rot) {
  const root = g.r * 0.8;
  const step = TAU / g.teeth;
  ctx.beginPath();
  for (let i = 0; i < g.teeth; i++) {
    const a0 = rot + i * step;
    const p = [
      [a0, root],
      [a0 + step * 0.1, g.r],
      [a0 + step * 0.4, g.r],
      [a0 + step * 0.5, root],
    ];
    for (let k = 0; k < 4; k++) {
      const x = g.x + Math.cos(p[k][0]) * p[k][1];
      const y = g.y + Math.sin(p[k][0]) * p[k][1];
      if (i === 0 && k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

export function brainScene() {
  let cx = 0;
  let cy = 0;
  let s = 1;
  let dim = 1;

  /*
    Neon, without a shadow blur.

    `shadowBlur` is the obvious way to get a glow and it is also the slowest
    thing in the 2D context, and this scene would need it on about twenty
    paths a frame. Two strokes of the same path under `lighter`, one wide and
    faint and one thin and bright, add up to the same halo for a fraction of
    the cost.
  */
  const glow = (ctx, trace, col, al, wide, thin) => {
    ctx.strokeStyle = rgba(col, al * 0.3);
    ctx.lineWidth = wide / s;
    trace();
    ctx.stroke();
    ctx.strokeStyle = rgba(col, al);
    ctx.lineWidth = thin / s;
    ctx.stroke();
  };

  const poly = (ctx, pts, close) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  };

  return {
    resize(w, h) {
      cx = w * 0.5;
      cy = h * 0.5;
      /*
        Big enough to be the section's object, short of the width where it
        would run under the cards on either side. On a phone there are no
        cards beside it, so it takes most of the width instead of shrinking
        to a knot, and it is dimmed to compensate: the column is narrow
        enough that the heading sits right on top of it, and a motif that
        competes with the copy it sits behind has stopped being a background.
      */
      const narrow = w < 760;
      s = Math.min(h * 0.62, w * (narrow ? 0.82 : 0.52)) / 300;
      dim = narrow ? 0.6 : 1;
    },
    draw(ctx, w, h, t, weight, p, pointer) {
      const a = weight * dim;
      const lean = pointer ? pointer.x * 14 : 0;
      const tilt = pointer ? pointer.y * 8 : 0;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // Drifts a little against the scroll, like every other motif here.
      ctx.translate(cx + lean, cy + tilt + (p - 0.5) * -52);
      ctx.scale(s, s);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      /* ---- LEFT: the folds, then the charge running them ---- */

      // The shell breathes, so the half that is meant to read as living is
      // never completely still even between pulses.
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.55);

      glow(ctx, () => poly(ctx, OUTLINE, true), BLUE, (0.4 + breathe * 0.14) * a, 5, 1.5);
      for (const f of FOLDS) {
        glow(ctx, () => poly(ctx, f, false), BLUE, 0.21 * a, 3.4, 1.1);
      }

      /*
        Charge.

        Two heads per conductor, offset half a lap apart, each trailing a tail
        that fades out behind it. The tail is walked back along the stored
        points rather than measured in pixels: the points are dense and evenly
        spaced in angle, so index steps are close enough to arc length, and it
        costs nothing.
      */
      for (let i = 0; i < WIRES.length; i++) {
        const pts = WIRES[i];
        const n = pts.length;
        const rim = i === 0;
        const speed = rim ? 0.085 : 0.16 + (i % 3) * 0.05;
        const heads = rim ? 3 : 2;
        const tail = rim ? 26 : 14;

        for (let k = 0; k < heads; k++) {
          const u = (t * speed + k / heads + i * 0.21) % 1;
          const head = Math.floor(u * (n - 1));

          for (let j = 0; j < tail; j++) {
            let b = head - j;
            if (b < 1) {
              // The rim is a loop, so its charge wraps. A fold is a stroke
              // with two ends, and a tail that wrapped would jump across the
              // hemisphere to get back to the start.
              if (!rim) break;
              b += n - 1;
            }
            const fade = 1 - j / tail;
            const col = j < 3 ? VIOLET : BLUE;
            ctx.strokeStyle = rgba(col, fade * fade * a);
            ctx.lineWidth = ((j < 3 ? 2.6 : 1.8) * fade) / s;
            ctx.beginPath();
            ctx.moveTo(pts[b - 1][0], pts[b - 1][1]);
            ctx.lineTo(pts[b][0], pts[b][1]);
            ctx.stroke();
          }
        }
      }

      /* ---- MIDLINE ---- */
      ctx.strokeStyle = rgba([190, 225, 255], 0.16 * a);
      ctx.lineWidth = 1.2 / s;
      ctx.beginPath();
      ctx.moveTo(0, -B * 0.92);
      ctx.lineTo(0, B * 0.92);
      ctx.stroke();

      /*
        The signal crossing over. It leaves the left half on the beat of the
        breathing and runs down the midline into the gears, which is the one
        thing that keeps the two halves from reading as two drawings.
      */
      const cross = (t * 0.45) % 1;
      const cy2 = -B * 0.92 + cross * B * 1.84;
      const g = ctx.createLinearGradient(0, cy2 - 26, 0, cy2 + 26);
      g.addColorStop(0, rgba(CYAN, 0));
      g.addColorStop(0.5, rgba(CYAN, 0.75 * a));
      g.addColorStop(1, rgba(CYAN, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.4 / s;
      ctx.beginPath();
      ctx.moveTo(0, cy2 - 26);
      ctx.lineTo(0, cy2 + 26);
      ctx.stroke();

      /* ---- RIGHT: the shell, then the train ---- */

      glow(ctx, () => poly(ctx, MIRRORED, true), MINT, 0.4 * a, 5, 1.5);

      for (const gear of GEARS) {
        const rot = gear.phase + t * gear.speed;

        // A tooth passing the mesh point lights the gear fractionally. It is
        // the difference between drawing a turning wheel and drawing a wheel
        // that is driving something.
        const bite = 0.5 + 0.5 * Math.sin(rot * gear.teeth);
        const al = (0.27 + bite * 0.08) * a;

        glow(ctx, () => cog(ctx, gear, rot), MINT, al, 4, 1.2);

        // Hub, and a pair of spokes to make the rotation legible: a smooth
        // ring gives the eye nothing to track and the gear looks static.
        glow(
          ctx,
          () => {
            ctx.beginPath();
            ctx.arc(gear.x, gear.y, gear.r * 0.3, 0, TAU);
          },
          CYAN,
          al * 0.9,
          3,
          1,
        );
        ctx.strokeStyle = rgba(CYAN, al * 0.7);
        ctx.lineWidth = 1 / s;
        ctx.beginPath();
        for (let i = 0; i < 2; i++) {
          const ang = rot + (i / 2) * Math.PI;
          ctx.moveTo(gear.x + Math.cos(ang) * gear.r * 0.3, gear.y + Math.sin(ang) * gear.r * 0.3);
          ctx.lineTo(gear.x + Math.cos(ang) * gear.r * 0.74, gear.y + Math.sin(ang) * gear.r * 0.74);
        }
        ctx.stroke();
      }

      // Where the train takes the signal: the drive gear flares as the
      // crossing pulse reaches its height.
      const drive = GEARS[0];
      const hit = clamp01(1 - Math.abs(cy2 - drive.y) / 70);
      if (hit > 0.01) {
        ctx.strokeStyle = rgba(CYAN, hit * hit * 0.5 * a);
        ctx.lineWidth = 2 / s;
        ctx.beginPath();
        ctx.arc(drive.x, drive.y, drive.r * (0.4 + hit * 0.7), 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
    },
  };
}
