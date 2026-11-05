import { clamp01, seeded, smoothstep } from '@/lib/utils';

/*
  Per-section background scenes.

  Each factory returns { resize(w,h), draw(ctx, w, h, t, a, p, pointer) } where
    t = seconds since mount
    a = crossfade weight for this scene (0 … 1)
    p = how far through the section the viewport is (0 … 1)
    pointer = eased cursor as { x, y } (each -1 … 1 from the centre), plus
              { spinX, spinY, dragging } for scenes that can be turned by hand

  A factory may also return hit(x, y). Returning true from it claims the
  press, and SceneLayer turns the drag into spinX/spinY instead of letting
  it fall through to the page as a selection.

  All of these sit BEHIND the glass panels, so the panels' backdrop-filter
  refracts them. That is the whole point: the glass becomes a lens onto a
  background that means something different in every section.
*/

const TAU = Math.PI * 2;

/* ---------------------------------------------------------------
   A radar sweep picking targets out of the dark. Bound to Target Roles.
   Named for what it draws, not the section, because the two motifs were
   swapped once already and names tied to a section go stale the moment
   they move.
   --------------------------------------------------------------- */
export function radarScene() {
  let cx = 0;
  let cy = 0;
  let R = 0;
  const blips = [];

  return {
    resize(w, h) {
      cx = w * 0.5;
      cy = h * 0.52;
      R = Math.min(w, h) * 0.46;
      blips.length = 0;
      const rand = seeded(9931);
      for (let i = 0; i < 6; i++) {
        blips.push({
          ang: (i / 6) * TAU + rand() * 0.5,
          rad: (0.34 + rand() * 0.58) * R,
          size: 2 + rand() * 2.4,
        });
      }
    },
    draw(ctx, w, h, t, a) {
      const sweep = (t * 0.42) % TAU;

      // Range rings
      ctx.strokeStyle = `rgba(148,197,255,${0.055 * a})`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * i) / 4, 0, TAU);
        ctx.stroke();
      }

      // Radial spokes
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
        ctx.stroke();
      }

      // Sweep wedge
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(96,165,250,${0.16 * a})`);
      g.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweep - 0.44, sweep);
      ctx.closePath();
      ctx.fill();

      // Leading edge
      ctx.strokeStyle = `rgba(190,225,255,${0.34 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.stroke();

      // Blips brighten as the sweep passes over them
      for (const b of blips) {
        let d = sweep - b.ang;
        while (d < 0) d += TAU;
        const hot = Math.exp(-d * 2.4);
        const x = cx + Math.cos(b.ang) * b.rad;
        const y = cy + Math.sin(b.ang) * b.rad;
        ctx.fillStyle = `rgba(190,230,255,${(0.1 + hot * 0.8) * a})`;
        ctx.beginPath();
        ctx.arc(x, y, b.size * (1 + hot * 1.5), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   EXPERIENCE: stratified timeline bands drifting horizontally.
   --------------------------------------------------------------- */
export function experienceScene() {
  let bands = [];

  return {
    resize(w, h) {
      const rand = seeded(5521);
      bands = [];
      for (let i = 0; i < 7; i++) {
        bands.push({
          y: (i + 0.5) * (h / 7),
          speed: 10 + rand() * 26,
          offset: rand() * w,
          ticks: 10 + Math.floor(rand() * 10),
          alpha: 0.05 + rand() * 0.1,
        });
      }
    },
    draw(ctx, w, h, t, a) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const b of bands) {
        const shift = (b.offset + t * b.speed) % (w + 300);

        ctx.strokeStyle = `rgba(130,180,245,${b.alpha * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, b.y);
        ctx.lineTo(w, b.y);
        ctx.stroke();

        // Milestone ticks riding the band
        for (let i = 0; i < b.ticks; i++) {
          const x = ((shift + (i * (w + 300)) / b.ticks) % (w + 300)) - 150;
          const hgt = 5 + (i % 3) * 5;
          ctx.fillStyle = `rgba(170,210,255,${(b.alpha + 0.1) * a})`;
          ctx.fillRect(x, b.y - hgt / 2, 1.6, hgt);
        }
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   RESULTS: an ascending bar chart with a revealing trend line.
   --------------------------------------------------------------- */
export function casesScene() {
  let bars = [];
  let W = 0;
  let H = 0;

  return {
    resize(w, h) {
      W = w;
      H = h;
      const rand = seeded(3307);
      const n = w < 640 ? 18 : 34;
      bars = [];
      for (let i = 0; i < n; i++) {
        const climb = Math.pow(i / n, 1.5);
        bars.push({
          base: 0.12 + climb * 0.56 + rand() * 0.13,
          wob: rand() * TAU,
          rate: 0.5 + rand(),
        });
      }
    },
    draw(ctx, w, h, t, a, p) {
      const n = bars.length;
      const gap = w / n;
      const bw = gap * 0.42;
      const floor = h * 0.84;

      // Gridlines
      ctx.strokeStyle = `rgba(255,255,255,${0.035 * a})`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = floor - (floor * 0.72 * i) / 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pts = [];
      for (let i = 0; i < n; i++) {
        const b = bars[i];
        const hgt = (b.base + Math.sin(t * b.rate + b.wob) * 0.035) * floor * 0.78;
        const x = i * gap + gap / 2;
        const y = floor - hgt;
        pts.push([x, y]);

        const g = ctx.createLinearGradient(0, y, 0, floor);
        g.addColorStop(0, `rgba(96,165,250,${0.3 * a})`);
        g.addColorStop(1, `rgba(96,165,250,0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - bw / 2, y, bw, hgt);
      }

      // Trend line draws itself as you scroll through the section.
      const reveal = clamp01(p * 1.5);
      const upto = Math.floor(reveal * (n - 1));
      if (upto > 0) {
        ctx.strokeStyle = `rgba(52,211,153,${0.5 * a})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i <= upto; i++) {
          const [x, y] = pts[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const [hx, hy] = pts[upto];
        const pulse = 3.5 + Math.sin(t * 4) * 1.4;
        ctx.fillStyle = `rgba(190,255,230,${0.85 * a})`;
        ctx.beginPath();
        ctx.arc(hx, hy, pulse, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   PROJECTS: wireframe UI windows floating at different depths.
   --------------------------------------------------------------- */
export function projectsScene() {
  let frames = [];

  return {
    resize(w, h) {
      const rand = seeded(7717);
      frames = [];
      const n = w < 640 ? 4 : 7;
      for (let i = 0; i < n; i++) {
        const scale = 0.4 + rand() * 0.75;
        frames.push({
          x: rand() * w,
          y: rand() * h,
          w: 150 * scale,
          h: 100 * scale,
          vx: (rand() - 0.5) * 9,
          vy: -4 - rand() * 10,
          rows: 2 + Math.floor(rand() * 3),
          alpha: 0.05 + rand() * 0.08,
        });
      }
    },
    draw(ctx, w, h, t, a) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const f of frames) {
        let x = f.x + f.vx * t;
        let y = f.y + f.vy * t;
        // wrap
        x = ((x % (w + 300)) + w + 300) % (w + 300) - 150;
        y = ((y % (h + 260)) + h + 260) % (h + 260) - 130;

        const al = f.alpha * a;
        ctx.strokeStyle = `rgba(167,139,250,${al * 2.1})`;
        ctx.lineWidth = 1;

        // window chrome
        ctx.strokeRect(x, y, f.w, f.h);
        ctx.beginPath();
        ctx.moveTo(x, y + 11);
        ctx.lineTo(x + f.w, y + 11);
        ctx.stroke();

        // traffic lights
        ctx.fillStyle = `rgba(200,180,255,${al * 2.4})`;
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          ctx.arc(x + 7 + d * 7, y + 5.5, 1.6, 0, TAU);
          ctx.fill();
        }

        // content rows
        ctx.fillStyle = `rgba(167,139,250,${al * 1.5})`;
        for (let r = 0; r < f.rows; r++) {
          const ry = y + 20 + r * 11;
          if (ry > y + f.h - 6) break;
          ctx.fillRect(x + 7, ry, (f.w - 14) * (0.4 + ((r * 7) % 6) / 10), 3);
        }
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   STACK: a constellation of linked tool nodes at three depths.
   --------------------------------------------------------------- */
export function stackScene(labels = []) {
  let nodes = [];
  let W = 0;
  let H = 0;

  return {
    resize(w, h) {
      W = w;
      H = h;
      const rand = seeded(4421);
      const n = w < 640 ? 16 : 30;
      nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({
          x: rand() * w,
          y: rand() * h,
          vx: (rand() - 0.5) * 11,
          vy: (rand() - 0.5) * 11,
          depth: 0.35 + rand() * 0.65,
          label: labels.length ? labels[i % labels.length] : null,
        });
      }
    },
    draw(ctx, w, h, t, a) {
      const pos = nodes.map((nd) => {
        let x = nd.x + nd.vx * t;
        let y = nd.y + nd.vy * t;
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;
        return [x, y, nd];
      });

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Proximity links
      const maxD = Math.min(w, h) * 0.22;
      ctx.lineWidth = 1;
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i][0] - pos[j][0];
          const dy = pos[i][1] - pos[j][1];
          const d = Math.hypot(dx, dy);
          if (d > maxD) continue;
          const str = (1 - d / maxD) * 0.2 * a;
          ctx.strokeStyle = `rgba(125,200,255,${str})`;
          ctx.beginPath();
          ctx.moveTo(pos[i][0], pos[i][1]);
          ctx.lineTo(pos[j][0], pos[j][1]);
          ctx.stroke();
        }
      }

      // Nodes + labels
      ctx.font = '500 10px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const [x, y, nd] of pos) {
        ctx.fillStyle = `rgba(190,225,255,${0.45 * a * nd.depth})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6 * nd.depth + 0.7, 0, TAU);
        ctx.fill();

        if (nd.label) {
          ctx.fillStyle = `rgba(200,225,255,${0.3 * a * nd.depth})`;
          ctx.fillText(nd.label, x, y - 8);
        }
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   One labelled column per industry, each stack of cells filling from the
   baseline up as the section scrolls, with a signal climbing each at its
   own rate. Bound to Sectors: six industries, one method.

   This replaced a set of orbiting rings. The rings were a pretty motif but
   an arbitrary one, the kind of generic science-y loop that could sit
   behind any section on any site. A labelled column per industry is the
   same density of motion and it says what the section says.
   --------------------------------------------------------------- */
export function coverageScene(labels = []) {
  let cols = [];
  let baseY = 0;
  let pitch = 0;
  let barW = 0;
  let labelled = false;

  const ROWS = 9;

  return {
    resize(w, h) {
      const rand = seeded(4409);
      const n = Math.max(labels.length, 1);
      // Tied to the content column so the stacks line up under the cards.
      const span = Math.min(w * 0.88, 1060);
      const left = (w - span) / 2;
      const step = span / n;

      barW = Math.min(step * 0.42, 54);
      pitch = Math.min(h * 0.052, 30);
      baseY = h * 0.8;
      // The longest label is ~68px at 10px type. Below that the six names run
      // into each other, so on a phone the columns go unlabelled.
      labelled = step > 84;

      cols = labels.length ? labels : [''];
      cols = cols.map((label, i) => ({
        label,
        x: left + step * (i + 0.5),
        // Where the stack settles, and how fast its signal climbs.
        fill: 0.52 + rand() * 0.46,
        rate: 0.34 + rand() * 0.42,
        phase: rand(),
      }));
    },
    draw(ctx, w, h, t, a, p) {
      ctx.save();

      // Baseline
      const x0 = cols[0].x - pitch;
      const x1 = cols[cols.length - 1].x + pitch;
      ctx.strokeStyle = `rgba(148,197,255,${0.1 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, baseY + 0.5);
      ctx.lineTo(x1, baseY + 0.5);
      ctx.stroke();

      // Labels sit on the dark background, not on the additive pass, so
      // they stay legible instead of blooming into the cells above them.
      if (labelled) {
        ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(190,215,255,${0.22 * a})`;
        for (const c of cols) {
          if (c.label) ctx.fillText(c.label, c.x, baseY + 17);
        }
      }

      ctx.globalCompositeOperation = 'lighter';
      const cellH = pitch * 0.46;

      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        // Columns open left to right as the section crosses the viewport.
        const open = smoothstep(0, 1, clamp01((p * 1.7 - i * 0.07) / 0.55));
        const lit = c.fill * open * ROWS;
        const climb = ((t * c.rate + c.phase) % 1.35) / 1.35 * (ROWS + 1.5);

        for (let r = 0; r < ROWS; r++) {
          const y = baseY - (r + 1) * pitch + (pitch - cellH);
          const on = clamp01(lit - r);
          const hit = Math.max(0, 1 - Math.abs(climb - r) * 1.5) * on;

          // The gap between an empty cell and a filled one is what makes this
          // read as a chart rather than as a grid of boxes, so the unlit state
          // stays very low and the lit state carries the contrast.
          ctx.fillStyle = `rgba(110,170,255,${(0.03 + on * 0.21) * a})`;
          ctx.fillRect(c.x - barW / 2, y, barW, cellH);

          if (hit > 0.01) {
            ctx.fillStyle = `rgba(52,211,153,${hit * 0.45 * a})`;
            ctx.fillRect(c.x - barW / 2, y, barW, cellH);
          }
        }

        // Crest: a soft cap riding the top of whatever is lit.
        const top = baseY - lit * pitch;
        if (lit > 0.2) {
          const g = ctx.createRadialGradient(c.x, top, 0, c.x, top, pitch * 1.6);
          g.addColorStop(0, `rgba(170,215,255,${0.17 * a})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(c.x, top, pitch * 1.6, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   CONTACT: signals converging on a single point.
   --------------------------------------------------------------- */

/**
 * The point the contact scene converges on, in viewport coordinates.
 *
 * FiberField reads this too, so the descending strands pinch exactly where
 * these rays land. Both canvases are `position: fixed` and full-viewport, so
 * they share a coordinate space. Keep this as the single source of truth: if
 * the two drift apart, the end of the page reads as two unrelated motions
 * fighting each other.
 */
export const contactFocus = (w, h) => ({ x: w * 0.5, y: h * 0.5 });

/*
  The end of the conduit.

  Rays converge on the focus, FiberField pinches every strand into the same
  point, and the sphere sits on it. This is the section where the page's
  argument lands: everything that has been travelling down it arrives here
  and goes into the mark at the core. The sphere is built last so it is
  painted over the rays rather than under them.
*/
export function contactScene() {
  let cx = 0;
  let cy = 0;
  let R = 0;
  let rays = [];
  const ball = sphereScene({ at: 'merge' });

  return {
    resize(w, h) {
      const focus = contactFocus(w, h);
      cx = focus.x;
      cy = focus.y;
      ball.resize(w, h);
      R = Math.hypot(w, h) * 0.55;
      const rand = seeded(8803);
      rays = [];
      for (let i = 0; i < 30; i++) {
        rays.push({
          ang: (i / 30) * TAU + rand() * 0.2,
          phase: rand(),
          speed: 0.1 + rand() * 0.28,
        });
      }
    },
    hit(x, y) {
      return ball.hit(x, y);
    },

    draw(ctx, w, h, t, a, p, pointer) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const r of rays) {
        const ca = Math.cos(r.ang);
        const sa = Math.sin(r.ang);

        ctx.strokeStyle = `rgba(120,180,255,${0.05 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + ca * R, cy + sa * R);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Signal travelling inward
        const u = 1 - ((r.phase + t * r.speed) % 1);
        const x0 = cx + ca * R * u;
        const y0 = cy + sa * R * u;
        const x1 = cx + ca * R * Math.min(1, u + 0.14);
        const y1 = cy + sa * R * Math.min(1, u + 0.14);

        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `rgba(210,235,255,${0.6 * a})`);
        g.addColorStop(1, 'rgba(120,180,255,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // Expanding rings from the centre
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.3 + i / 3) % 1);
        const rad = u * R * 0.5;
        ctx.strokeStyle = `rgba(150,200,255,${(1 - u) * 0.16 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, TAU);
        ctx.stroke();
      }

      /*
        The halo at the focus. It swells with the charge, so a burst of
        arriving light shows as the whole point flaring rather than as the
        core alone getting brighter behind an unchanged glow.
      */
      const feed = clamp01(coreFeed.charge);
      const hr = 70 + feed * 46;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
      g.addColorStop(0, `rgba(220,240,255,${(0.22 + feed * 0.3) * a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, hr, 0, TAU);
      ctx.fill();

      ctx.restore();

      ball.draw(ctx, w, h, t, a, p, pointer);
    },
  };
}


/* ---------------------------------------------------------------
   HERO: a sphere drawn as three concentric clouds of points.

   Three things decide whether a point cloud reads as a sphere or as a
   smudge, and none of them is the number of points.

   1. The projection is orthographic. Dividing by depth pushes near points
      outside the silhouette, and the hard circular edge is the whole
      illusion. Every point lands inside a circle of its layer's radius.
   2. The silhouette is the brightest and the fattest part of the cloud.
      Points near z = 0 are seen edge-on, so a sphere's own geometry piles
      them up there; `rim` exaggerates that into a drawn edge.
   3. The surface is lit from a direction, so the ball shades across its
      face instead of being evenly speckled.

   The three layers do different jobs, and all three are the same dot.
   CORE is a small shell packed tight enough that the additive pass
   stacks it into a bright centre on its own: no separate treatment, no
   glow sprite, just the same points at a much higher density inside a
   much smaller radius. SKIN is the sphere proper and carries the
   silhouette. DUST is a sparse, wider shell turning with the rest.

   Disturb it, by hovering or by turning it by hand, and the outer
   layers answer in two ways. Most points stretch: thrown outward along
   their own radius and pulled home when the disturbance passes. A few
   break off entirely, leave the body on their own path and fade out in
   the space around it. See `ejecta`.

   What the whole thing is for: the field of light running down the page
   is evidence in transit, and at the bottom of the page every strand of
   it merges into one point. That point is the centre of this sphere. So
   the sphere is where the work ends up, and the mark at its core is lit
   by what arrives. See `coreFeed`.
   --------------------------------------------------------------- */

const CORE = 0;
const SKIN = 1;
const DUST = 2;

/*
  Light arriving from the conduit, as a charge between 0 and 1.

  FiberField tops this up each time a packet is drawn into the merge
  point and bleeds it off the rest of the time. The sphere only ever
  reads it. The two live on separate canvases with separate loops, and
  a shared number is the smallest possible join between them: no events,
  no subscription, nothing to tear down.
*/
export const coreFeed = { charge: 0 };

export function sphereScene(opts = {}) {
  const GOLDEN = 2.39996323;

  // Resting radius of each layer, as a multiple of R.
  const RADII = [0.42, 1, 1.3];

  // 'hero' parks it in the empty right half. 'merge' pins it to the point
  // the strands converge on, so the light lands in the middle of it.
  const place = opts.at || 'hero';

  let pos = new Float32Array(0);
  let grain = new Float32Array(0);
  let layer = new Uint8Array(0);
  let count = 0;

  let cx = 0;
  let cy = 0;
  let R = 0;
  let dim = 1;

  // Where the sphere actually sat on the last frame drawn. `cy` is the
  // resting centre; this is that plus the scroll drift, and it is what a
  // hit test has to measure against or the grab area lags the object.
  let lastOy = 0;

  /*
    Dots that have left the body.

    A fixed pool, written round in a ring. These spawn from whichever
    point happens to break off, so there is no sensible ceiling on demand
    and no safe way to let an array grow: a long drag would allocate
    without end. Sized so that running out costs a speck nobody was going
    to follow anyway.
  */
  const ejecta = [];
  for (let i = 0; i < 180; i++) {
    ejecta.push({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, light: 0.5, bright: 1,
    });
  }
  let nextEject = 0;

  /**
   * Hand a point its freedom.
   *
   * It keeps the screen position and the shade it had on the shell, so
   * the moment of release is invisible, and takes a heading pointing away
   * from the centre with enough scatter that a cluster breaking off at
   * once does not travel as a sheet.
   */
  const throwOff = (sx, sy, x1, y1, r, light, g) => {
    const e = ejecta[nextEject];
    nextEject = (nextEject + 1) % ejecta.length;

    const d = Math.hypot(x1, y1) || 1;
    const ux = x1 / d;
    const uy = -y1 / d;
    const spread = (Math.random() - 0.5) * 0.9;
    const cs = Math.cos(spread);
    const sn = Math.sin(spread);
    const speed = (9 + Math.random() * 30) * (r / 220 + 0.5);

    e.x = sx;
    e.y = sy;
    e.vx = (ux * cs - uy * sn) * speed;
    e.vy = (ux * sn + uy * cs) * speed;
    e.max = 2.4 + Math.random() * 3.6;
    e.life = e.max;
    e.size = 0.9 + g * 1.1;
    e.light = light;
    e.bright = 0.35 + g * 0.5;
  };

  // Scene time at the previous frame this actually drew, so the ejecta can
  // be integrated against real elapsed seconds.
  let lastT = 0;

  /*
    Points are bucketed by colour and by alpha, and each bucket is painted
    in one pass. Per-point fillStyle would mean thousands of colour strings
    a frame on top of everything FiberField is already doing. Six shades by
    eight alphas is past the point where the stepping shows.
  */
  const SHADES = 6;
  const LEVELS = 8;

  const bins = [];
  for (let i = 0; i < SHADES * LEVELS; i++) bins.push([]);

  /*
    Deep end and pale end of the lit range, in the blue the hero tints by.
    The deep end sits a long way off black on purpose. Take it down to a
    true shadow and the ball turns into a crescent, because the unlit half
    stops registering and the silhouette loses half its circle.
  */
  const DARK = [62, 96, 158];
  const PALE = [216, 236, 255];
  const fill = [];
  for (let s = 0; s < SHADES; s++) {
    const k = (s + 0.5) / SHADES;
    fill.push([
      Math.round(DARK[0] + (PALE[0] - DARK[0]) * k),
      Math.round(DARK[1] + (PALE[1] - DARK[1]) * k),
      Math.round(DARK[2] + (PALE[2] - DARK[2]) * k),
    ]);
  }

  /*
    Packed ball, for the core.

    A shell will not do here. Points spread over the surface of a sphere
    project as a ring: brightest where you see it edge-on, emptiest
    through the middle, which is the exact opposite of a bright centre.
    So the core is filled, and filled unevenly, with the radius pulled
    hard toward zero. Density does the rest, exactly as it should: the
    same dot as everything else, just far more of them per pixel at the
    middle than at the edge.

    The radius comes from a hash of the index rather than from the index
    itself. Walking it in order would tie each direction to a depth and
    the ball would wind up as a spiral.
  */
  const packed = (out, at, n, tag) => {
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * GOLDEN;
      const s = Math.sin(i * 78.233) * 43758.5453;
      // An exponent of 1/3 spreads the points evenly through the volume.
      // Anything above it pulls them inward, and inward is where the
      // brightness has to come from, so this sits well above.
      const r = Math.pow(s - Math.floor(s), 0.9);
      const j = at + i;
      out[j * 3] = Math.cos(th) * ring * r;
      out[j * 3 + 1] = y * r;
      out[j * 3 + 2] = Math.sin(th) * ring * r;
      layer[j] = tag;
      grain[j] = 0.5 + 0.5 * Math.sin(j * 51.17);
    }
  };

  // Fibonacci lattice. Latitude and longitude rings crowd at the poles and
  // that crowding reads as two bright caps; this spaces points evenly, so
  // the only density left is the rim, which is the one that sells the form.
  const lattice = (out, at, n, tag) => {
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * GOLDEN;
      const j = at + i;
      out[j * 3] = Math.cos(th) * ring;
      out[j * 3 + 1] = y;
      out[j * 3 + 2] = Math.sin(th) * ring;
      layer[j] = tag;
      // Fixed per-point jitter, so points differ in weight without
      // shimmering from one frame to the next.
      grain[j] = 0.5 + 0.5 * Math.sin(j * 51.17);
    }
  };

  return {
    resize(w, h) {
      const narrow = w < 1024;
      const small = w < 640;

      /*
        The core gets more points than the skin and the dust together,
        inside a third of their radius, and most of those sit in the
        innermost tenth of it. That is the whole mechanism: same dot, same
        additive pass, two orders of magnitude the areal density at the
        middle, so it stacks into a bright centre without being drawn as one.
      */
      const nCore = small ? 3000 : 9000;
      const nSkin = small ? 1100 : 2900;
      const nDust = small ? 520 : 1600;
      count = nCore + nSkin + nDust;

      if (place === 'merge') {
        /*
          Pinned to the point FiberField pulls every strand into, so the
          light does not arrive near the sphere, it arrives inside it. Held
          well back in strength: the contact copy sits directly on top of
          this one, and the brightness it does get should come from the
          light being delivered rather than from a baseline.
        */
        const focus = contactFocus(w, h);
        cx = focus.x;
        cy = focus.y;
        R = narrow ? Math.min(w * 0.3, h * 0.17) : Math.min(w * 0.19, h * 0.3);
        dim = small ? 0.3 : narrow ? 0.42 : 0.6;
      } else {
        /*
          Centred in the right half of the hero on a desktop, so the
          headline and the figures keep the left half to themselves. Sized
          so the dust shell, the widest layer, still clears the section rail.

          A phone has no empty half to put it in: the copy runs the full
          width, so the sphere can only ever sit behind the headline. There
          it is lifted toward the top and taken down to a third of its
          strength, to read as texture behind the words rather than as
          something competing with them for the same pixels. A tablet has
          enough room that it only needs holding back a little.
        */
        R = narrow ? Math.min(w * 0.26, h * 0.15) : Math.min(w * 0.17, h * 0.28);
        cx = narrow ? w * 0.5 : w * 0.75;
        cy = narrow ? h * 0.26 : h * 0.5;
        dim = small ? 0.34 : narrow ? 0.6 : 1;
      }

      pos = new Float32Array(count * 3);
      grain = new Float32Array(count);
      layer = new Uint8Array(count);

      packed(pos, 0, nCore, CORE);
      lattice(pos, nCore, nSkin, SKIN);
      lattice(pos, nCore + nSkin, nDust, DUST);
    },

    /*
      Is this screen point on the sphere? SceneLayer asks before it starts a
      drag, so a press in the empty part of the section is still a press on
      the page. Measured against the skin, not the dust: the dust is a haze
      and grabbing at a haze would feel like the hit area overran the object.
    */
    hit(x, y) {
      if (!R) return false;
      const dx = x - cx;
      const dy = y - lastOy;
      return dx * dx + dy * dy < R * R * 1.15;
    },

    draw(ctx, w, h, t, a, p, pointer) {
      if (!count) return;

      /*
        Three things turn it, and they add rather than override. The slow
        drift is the idle life. The cursor lean is parallax, and it is
        backed off while a drag is in progress so the two are not fighting
        for the same axis. The drag itself is an absolute angle handed over
        by SceneLayer, which also keeps the spin going after release.
      */
      /*
        Elapsed seconds, clamped. Scroll away and this scene stops being
        drawn while `t` keeps running, so the first frame back would hand
        the ejecta a gap of however long you were gone and teleport every
        one of them off the edge of the screen.
      */
      const step = Math.min(Math.max(t - lastT, 0), 0.05);
      lastT = t;

      const held = pointer && pointer.dragging ? 1 : 0;
      const lean = 1 - held * 0.75;
      const yaw = t * 0.14 + (pointer ? pointer.x * 0.42 * lean + pointer.spinX : 0);
      const pitch =
        -0.17 + (pointer ? pointer.y * 0.26 * lean + pointer.spinY : 0);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      /*
        How much light the conduit has delivered. The hero sphere is lit on
        its own terms, so it only takes a trace of this; the one at the
        merge point is the thing actually being fed and takes all of it.
      */
      const feed = clamp01(coreFeed.charge) * (place === 'merge' ? 1 : 0.25);

      /*
        Sinks a little as the hero leaves, so it reads as being left behind
        rather than as being switched off. Measured from p = 0.5, which is
        where a full-height first section sits when the page is at the top:
        drifting from raw `p` instead would start the sphere 63px above the
        middle and it would never once be where it was asked to be.
      */
      const oy = place === 'merge' ? cy : cy - (p - 0.5) * h * 0.14;
      lastOy = oy;

      /*
        Cursor in sphere units, so the hovered patch can be measured
        against point coordinates directly. The pointer SceneLayer hands
        over is already eased, which is what pulls the dust back in
        smoothly once the cursor moves off rather than snapping it home.
      */
      let hx = 0;
      let hy = 0;
      let hOn = 0;
      if (pointer) {
        hx = (((pointer.x + 1) / 2) * w - cx) / R;
        hy = -((((pointer.y + 1) / 2) * h - oy) / R);
        if (hx * hx + hy * hy < 4.4) hOn = 1;
      }

      /*
        How stirred up it is. Hovering is enough to shake a few dots
        loose; turning it by hand throws off a good deal more, because a
        hand on the thing should cost it more than a cursor resting
        nearby. Scaled by the frame so the rate is the same whatever the
        display is running at, and not by `a`, since a sphere halfway
        through a crossfade is still being touched just as hard.
      */
      const disturb = hOn * (1 + held * 1.6) * (step * 60);

      for (let i = 0; i < bins.length; i++) bins[i].length = 0;

      for (let i = 0; i < count; i++) {
        const x0 = pos[i * 3];
        const y0 = pos[i * 3 + 1];
        const z0 = pos[i * 3 + 2];
        const lay = layer[i];
        const g = grain[i];

        // Yaw about the vertical, then tilt. Both are body transforms, so
        // the shell and the mark inside it turn as one piece.
        const x1 = x0 * cosY + z0 * sinY;
        const zr = z0 * cosY - x0 * sinY;
        const y1 = y0 * cosP - zr * sinP;
        const z1 = y0 * sinP + zr * cosP;

        /*
          Breathing stays under one percent. A large displacement is what
          turned the first attempt at this into a cloud: it drags points
          off the silhouette, and once the edge is soft there is no sphere
          left to read.
        */
        let rad = RADII[lay] * (1 + 0.008 * Math.sin(x1 * 11 + y1 * 7 + t * 0.7));

        /*
          The hovered patch. Only the near face responds: a bulge visible
          through the far side of the body would give away that this is a
          flat drawing. The dust is thrown well clear and the skin barely
          moves. The core never moves at all, so there is always a still
          bright thing at the middle to measure the throw against.
        */
        let lift = 0;
        if (hOn && lay !== CORE && z1 > -0.25) {
          const dx = x1 * RADII[lay] - hx;
          const dy = y1 * RADII[lay] - hy;
          const d2 = dx * dx + dy * dy;
          if (d2 < 2.4) {
            /*
              The patch has to be wide. A tight one was measurably correct
              and completely invisible: the dust shell is sparse by design,
              so a narrow gaussian only ever had a dozen points inside it
              and throwing a dozen points reads as nothing at all.
            */
            lift = Math.exp(-d2 / 0.5) * (0.35 + 0.65 * z1);
            rad += lift * (lay === DUST ? 0.8 + g * 0.55 : 0.09);
          }
        }

        // Orthographic. No depth divide, so no layer can spill past its
        // own radius and blur the edge it is meant to be drawing.
        const sx = cx + x1 * rad * R;
        const sy = oy - y1 * rad * R;

        // Seen edge-on at z = 0: this is the drawn silhouette.
        const e = 1 - Math.abs(z1);
        const rim = e * e * e;
        // 0 at the back, 1 at the front, soft through the middle.
        const front = z1 < -0.1 ? 0 : z1 > 0.65 ? 1 : (z1 + 0.1) / 0.75;

        // Lit from the upper left, as the page's own light is.
        let light = 0.56 - x1 * 0.36 + y1 * 0.26;
        light = light < 0.1 ? 0.1 : light > 1 ? 1 : light;

        let alpha;
        let size;

        if (lay === SKIN) {
          // Cloudiness across the face, so it is not an even speckle.
          const mottle =
            0.65 + 0.35 * Math.sin(x1 * 9 + z1 * 4) * Math.cos(y1 * 8 - z1 * 5);
          alpha =
            (0.035 + rim * (0.55 + light * light * 0.45) + front * (0.12 + mottle * 0.2)) *
            (0.45 + light * 0.55) *
            (0.5 + g * 0.5);
          // Fatter on the rim and nearer the front, which is the other
          // half of why the silhouette holds together.
          size = 0.8 + rim * (0.9 + g * 1.1) + front * 0.35;
        } else if (lay === DUST) {
          // Mostly ambient with only a touch of rim, so it stays a haze
          // around the sphere instead of drawing a second hard edge.
          alpha = (0.1 + front * 0.3 + rim * 0.1) * (0.4 + light * 0.6) * (0.3 + g * 0.7);
          /*
            Dust in front of the focus plane swells and fades together, the
            cheap stand-in for throwing it out of focus. Spreading the same
            light over more pixels is what reads as blur.
          */
          size = 0.9 + g * 0.6;
          const soft = front * front * (1.1 + g * 0.9);
          size += soft;
          alpha *= (0.9 + g * 0.6) / size;
          alpha *= 1 + lift * 2.4;
        } else {
          /*
            The core is one flat value per point and the brightness is
            left entirely to how many of them land on the same pixel.
            No rim term: rim is a silhouette cue and this layer has no
            silhouette to draw, it is a filled volume, so weighting by
            it would only redraw the shell's ring from the inside.

            The value is low on purpose. There are many times more of
            these per unit of screen than there are skin points, and at
            the skin's alpha the stack would clip the middle to a flat
            white disc with no gradient left in it. Dense and dim is
            what builds into bright.
          */
          alpha = (0.05 + front * 0.045) * (0.45 + light * 0.55) * (0.5 + g * 0.5);
          size = 1.1;
        }

        // Arriving light washes over the shell too, but only faintly. It
        // is the core that is being fed; the shell just catches some of it.
        alpha *= a * dim * (1 + feed * 0.5);
        if (lay === SKIN) alpha *= 1 + lift * 3.2;
        if (alpha < 0.012) continue;
        if (alpha > 1) alpha = 1;

        const shade = Math.min(SHADES - 1, (light * SHADES) | 0);
        const level = Math.min(LEVELS - 1, (alpha * LEVELS) | 0);
        bins[shade * LEVELS + level].push(sx, sy, size);

        /*
          Breaking off. A point that is being thrown hard has a small
          chance each frame of leaving for good instead of springing back,
          taking its own screen position and an outward heading with it.
          The chance is per point per frame and deliberately tiny: the
          effect is a few specks drifting off, not the shell shedding.
        */
        if (lift > 0.25 && lay !== CORE && Math.random() < lift * disturb * 0.02) {
          throwOff(sx, sy, x1, y1, rad * R, light, g);
        }
      }

      /*
        The ejected dots, in free flight. They are the same square the
        rest of the sphere is drawn with, so what tells them apart is only
        that they are outside it and on their way out: a slow drift, a
        slight outward drag, and a fade that takes them to nothing.
      */
      for (let i = 0; i < ejecta.length; i++) {
        const e = ejecta[i];
        if (e.life <= 0) continue;

        e.life -= step;
        if (e.life <= 0) continue;

        e.x += e.vx * step;
        e.y += e.vy * step;
        // Slows as it goes, so it reads as being let go rather than fired.
        const slow = Math.exp(-step * 0.55);
        e.vx *= slow;
        e.vy *= slow;

        const u = e.life / e.max;
        // Fades out over the whole flight and in over the start of it, so
        // a dot never appears at full strength on top of the shell it
        // just left.
        const alpha = u * u * Math.min(1, (1 - u) * 6) * e.bright * a * dim;
        if (alpha < 0.012) continue;

        const shade = Math.min(SHADES - 1, (e.light * SHADES) | 0);
        const level = Math.min(LEVELS - 1, (alpha * LEVELS) | 0);
        bins[shade * LEVELS + level].push(e.x, e.y, e.size);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let b = 0; b < bins.length; b++) {
        const row = bins[b];
        if (!row.length) continue;
        const c = fill[(b / LEVELS) | 0];
        const alpha = ((b % LEVELS) + 0.5) / LEVELS;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
        for (let i = 0; i < row.length; i += 3) {
          const s = row[i + 2];
          ctx.fillRect(row[i], row[i + 1], s, s);
        }
      }

      ctx.restore();
    },
  };
}
