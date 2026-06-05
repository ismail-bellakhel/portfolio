import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Lens Displacement Map
//
// Simulates thick glass slab: centre = no displacement, edges = outward
// refraction (like Snell's law at a curved surface).
//
// Output: 256×256 RGBA canvas where R=horizontal, G=vertical displacement.
//   128 = neutral  |  > 128 = positive offset  |  < 128 = negative offset
// ─────────────────────────────────────────────────────────────────────────────
function genDisplacementMap(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const h = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Normalised position [-1, 1]
      const nx = (x - h) / h;
      const ny = (y - h) / h;

      // Chebyshev distance from centre (0 = centre, 1 = edge/corner)
      const cheb = Math.max(Math.abs(nx), Math.abs(ny));

      // Activate refraction only in the outer 35% band
      const t = Math.max(0, (cheb - 0.65) / 0.35);
      // Smoothstep: nice cubic ease
      const strength = t * t * (3 - 2 * t);
      const amp = strength * 65; // max ±65 displacement

      // Outward surface normal using Chebyshev gradient
      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      // Blend between pure-axis and diagonal direction at corners
      const axisWeight = Math.min(1, Math.abs(ax - ay) * 8);
      let gx = Math.sign(nx) * axisWeight;
      let gy = Math.sign(ny) * (1 - axisWeight);
      // Normalise
      const len = Math.sqrt(gx * gx + gy * gy) || 1;
      gx /= len;
      gy /= len;

      const i = (y * size + x) * 4;
      d[i]     = Math.max(0, Math.min(255, Math.round(128 + gx * amp)));
      d[i + 1] = Math.max(0, Math.min(255, Math.round(128 + gy * amp)));
      d[i + 2] = 0;
      d[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// Specular Highlight Map
//
// Bright near the top edge (simulates light hitting the glass surface),
// fading to black — composited via feBlend screen onto the displaced result.
// ─────────────────────────────────────────────────────────────────────────────
function genSpecularMap(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Base: black (no specular in most areas)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);

  // Top-edge specular band
  const topGrad = ctx.createLinearGradient(0, 0, 0, size * 0.20);
  topGrad.addColorStop(0, 'rgba(255,252,248,0.58)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, size, size * 0.20);

  // Side-edge subtle specular (left and right)
  const leftGrad = ctx.createLinearGradient(0, 0, size * 0.06, 0);
  leftGrad.addColorStop(0, 'rgba(255,245,230,0.18)');
  leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, size * 0.06, size);

  const rightGrad = ctx.createLinearGradient(size, 0, size * 0.94, 0);
  rightGrad.addColorStop(0, 'rgba(255,235,215,0.14)');
  rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(size * 0.94, 0, size, size);

  return c.toDataURL('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassFilter
//
// • Generates displacement + specular maps
// • Injects an inline <svg><defs> into the document body with the filter
// • Feature-detects backdrop-filter: url() support (Chrome/Blink only)
//   and adds `lg-lens-on` class to <html> so CSS can enhance glass elements
// ─────────────────────────────────────────────────────────────────────────────
export default function GlassFilter() {
  useEffect(() => {
    // ── Feature detect (do NOT add class yet — SVG must exist first) ─────────
    const probe = document.createElement('div');
    probe.style.backdropFilter = 'url(#probe)';
    const lensSupported = probe.style.backdropFilter.includes('url');

    // ── Generate maps (synchronous — canvas API) ─────────────────────────────
    const dispUrl = genDisplacementMap(256);
    const specUrl = genSpecularMap(256);

    // ── Build SVG filter ─────────────────────────────────────────────────────
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;top:0;left:0;overflow:hidden;pointer-events:none;z-index:-9999;';

    svg.innerHTML = `
      <defs>
        <filter id="lg-lens"
          x="-5%" y="-5%" width="110%" height="110%"
          color-interpolation-filters="sRGB"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox">
          <feImage href="${dispUrl}"
            x="0" y="0" width="1" height="1"
            preserveAspectRatio="none" result="dispMap"/>
          <feDisplacementMap in="SourceGraphic" in2="dispMap"
            scale="0.10" xChannelSelector="R" yChannelSelector="G"
            result="displaced"/>
          <feColorMatrix in="displaced" type="saturate"
            values="1.30" result="saturated"/>
          <feImage href="${specUrl}"
            x="0" y="0" width="1" height="1"
            preserveAspectRatio="none" result="specLayer"/>
          <feBlend in="saturated" in2="specLayer" mode="screen"/>
        </filter>
      </defs>
    `;

    // ── Inject SVG first, THEN add class ─────────────────────────────────────
    // Critical: if class is added before the SVG exists, Chrome sees
    // `backdrop-filter: url(#lg-lens)` referencing nothing → renders black
    // for one paint cycle before the filter is available.
    document.body.appendChild(svg);
    if (lensSupported) {
      document.documentElement.classList.add('lg-lens-on');
    }

    return () => {
      document.documentElement.classList.remove('lg-lens-on');
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    };
  }, []);

  return null;
}
