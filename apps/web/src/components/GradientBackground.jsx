import React from 'react';

// Aurora Borealis background — dark mode only
// Technique: multiple oversized repeating-linear-gradient layers animated via
// GPU-accelerated transform (translate + scaleY + rotate), not background-position.
// Each layer = one aurora curtain; different colors, speeds, and phase offsets.
const GradientBackground = () => {
  return (
    <div
      className="aurora-root"
      style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Night sky base */}
      <div style={{ position: 'absolute', inset: 0, background: 'hsl(228, 44%, 4%)' }} />

      {/* Layer 1 — green / teal   (slowest, most prominent) */}
      <div className="aurora-l1" />

      {/* Layer 2 — blue / indigo */}
      <div className="aurora-l2" />

      {/* Layer 3 — violet / purple */}
      <div className="aurora-l3" />

      {/* Layer 4 — cyan shimmer   (fastest, adds brightness) */}
      <div className="aurora-l4" />

      {/* Layer 5 — pink / magenta accent (rare aurora colour, high altitude) */}
      <div className="aurora-l5" />

      {/* Bottom fade — keeps the lower page dark so text is readable */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 25%, hsl(228,44%,4%) 78%)',
      }} />
    </div>
  );
};

export default GradientBackground;
