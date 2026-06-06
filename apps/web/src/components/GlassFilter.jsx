import { useLayoutEffect } from 'react';

function genDisplacementMap(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;

  const ctx = c.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(size, size);
  const d = img.data;
  const h = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - h) / h;
      const ny = (y - h) / h;

      const cheb = Math.max(Math.abs(nx), Math.abs(ny));
      const t = Math.max(0, (cheb - 0.65) / 0.35);
      const strength = t * t * (3 - 2 * t);
      const amp = strength * 65;

      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      const axisWeight = Math.min(1, Math.abs(ax - ay) * 8);

      let gx = Math.sign(nx) * axisWeight;
      let gy = Math.sign(ny) * (1 - axisWeight);

      const len = Math.sqrt(gx * gx + gy * gy) || 1;
      gx /= len;
      gy /= len;

      const i = (y * size + x) * 4;
      d[i] = Math.max(0, Math.min(255, Math.round(128 + gx * amp)));
      d[i + 1] = Math.max(0, Math.min(255, Math.round(128 + gy * amp)));
      d[i + 2] = 0;
      d[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

function genSpecularMap(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;

  const ctx = c.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);

  const topGrad = ctx.createLinearGradient(0, 0, 0, size * 0.2);
  topGrad.addColorStop(0, 'rgba(255,252,248,0.58)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, size, size * 0.2);

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

export default function GlassFilter() {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('lg-lens-on');

    const oldSvg = document.getElementById('lg-lens-svg');
    if (oldSvg) oldSvg.remove();

    const probe = document.createElement('div');
    probe.style.backdropFilter = 'url("#probe")';
    probe.style.webkitBackdropFilter = 'url("#probe")';

    const lensSupported =
      probe.style.backdropFilter.includes('url') ||
      probe.style.webkitBackdropFilter.includes('url');

    if (!lensSupported) return;

    // feDisplacementMap + feBlend is far too expensive on mobile GPUs —
    // causes scroll stutter on every glass element. Skip on touch devices.
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const dispUrl = genDisplacementMap(256);
    const specUrl = genSpecularMap(256);

    if (!dispUrl || !specUrl) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('id', 'lg-lens-svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    svg.style.cssText = `
      position: fixed;
      width: 0;
      height: 0;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
    `;

    svg.innerHTML = `
      <defs>
        <filter
          id="lg-lens"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          color-interpolation-filters="sRGB"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
        >
          <feImage
            href="${dispUrl}"
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            result="dispMap"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="dispMap"
            scale="0.10"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.30"
            result="saturated"
          />

          <feImage
            href="${specUrl}"
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            result="specLayer"
          />

          <feBlend
            in="saturated"
            in2="specLayer"
            mode="screen"
          />
        </filter>
      </defs>
    `;

    document.body.appendChild(svg);

    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add('lg-lens-on');
      });
    }, 160);

    return () => {
      window.clearTimeout(timer);
      document.documentElement.classList.remove('lg-lens-on');

      const mountedSvg = document.getElementById('lg-lens-svg');
      if (mountedSvg) mountedSvg.remove();
    };
  }, []);

  return null;
}