import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Fixed parallax gradient orbs — sit behind all content (z-0)
// Gives the dark-mode site a living ambient glow that shifts with scroll
const GradientBackground = () => {
  const { scrollYProgress } = useScroll();

  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -280]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0,  320]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0,  140]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Top-left — deep blue */}
      <motion.div
        style={{
          y: orb1Y,
          position: 'absolute',
          top: '-18%',
          left: '-8%',
          width: '62vw',
          height: '62vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(220, 80%, 58%, 1) 0%, transparent 68%)',
          filter: 'blur(72px)',
          opacity: 0.09,
          willChange: 'transform',
        }}
      />

      {/* Bottom-right — violet */}
      <motion.div
        style={{
          y: orb2Y,
          position: 'absolute',
          bottom: '-18%',
          right: '-8%',
          width: '58vw',
          height: '58vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(262, 72%, 58%, 1) 0%, transparent 68%)',
          filter: 'blur(68px)',
          opacity: 0.075,
          willChange: 'transform',
        }}
      />

      {/* Mid — teal accent */}
      <motion.div
        style={{
          y: orb3Y,
          position: 'absolute',
          top: '38%',
          left: '22%',
          width: '48vw',
          height: '48vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(195, 68%, 52%, 1) 0%, transparent 65%)',
          filter: 'blur(80px)',
          opacity: 0.05,
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default GradientBackground;
