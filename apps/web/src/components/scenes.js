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
   Tilted orbital rings with travelling satellites. Bound to Sectors:
   several industries circling one method.
   --------------------------------------------------------------- */
export function orbitScene() {
  let cx = 0;
  let cy = 0;
  let R = 0;
  let rings = [];
  let sats = [];

  const TINTS = [
    [96, 165, 250],
    [52, 211, 153],
    [167, 139, 250],
  ];

  return {
    resize(w, h) {
      cx = w * 0.5;
      cy = h * 0.5;
      R = Math.min(w, h) * 0.42;
      const rand = seeded(2213);
      rings = [];
      for (let i = 0; i < 5; i++) {
        rings.push({
          rx: R * (0.42 + i * 0.15),
          ry: R * (0.42 + i * 0.15) * (0.26 + rand() * 0.42),
          rot: rand() * Math.PI,
          spin: (rand() - 0.5) * 0.09,
          tint: TINTS[i % 3],
        });
      }
      sats = [];
      for (let i = 0; i < 18; i++) {
        const ring = rings[i % rings.length];
        sats.push({
          ring,
          ang: rand() * TAU,
          speed: 0.14 + rand() * 0.4,
          size: 1.2 + rand() * 2,
        });
      }
    },
    draw(ctx, w, h, t, a) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.68);
      g.addColorStop(0, `rgba(150,190,255,${0.1 * a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.68, 0, TAU);
      ctx.fill();

      for (const r of rings) {
        const rot = r.rot + t * r.spin;
        const [cr, cg, cb] = r.tint;
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.14 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r.rx, r.ry, rot, 0, TAU);
        ctx.stroke();
      }

      for (const s of sats) {
        const r = s.ring;
        const rot = r.rot + t * r.spin;
        const ang = s.ang + t * s.speed;
        const ex = Math.cos(ang) * r.rx;
        const ey = Math.sin(ang) * r.ry;
        const x = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
        const y = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
        const [cr, cg, cb] = r.tint;

        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.6 * a})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

/* ---------------------------------------------------------------
   CONTACT: signals converging on a single point.
   --------------------------------------------------------------- */
export function contactScene() {
  let cx = 0;
  let cy = 0;
  let R = 0;
  let rays = [];

  return {
    resize(w, h) {
      cx = w * 0.5;
      cy = h * 0.5;
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
