import { clamp01, seeded, smoothstep } from '@/lib/utils';

/*
  Per-section background scenes.

  Each factory returns { resize(w,h), draw(ctx, w, h, t, a, p) } where
    t = seconds since mount
    a = crossfade weight for this scene (0 … 1)
    p = how far through the section the viewport is (0 … 1)

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

export function contactScene() {
  let cx = 0;
  let cy = 0;
  let R = 0;
  let rays = [];

  return {
    resize(w, h) {
      const focus = contactFocus(w, h);
      cx = focus.x;
      cy = focus.y;
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
    draw(ctx, w, h, t, a) {
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

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
      g.addColorStop(0, `rgba(220,240,255,${0.22 * a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, TAU);
      ctx.fill();

      ctx.restore();
    },
  };
}
