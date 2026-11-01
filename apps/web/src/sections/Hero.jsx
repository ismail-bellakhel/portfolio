import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Counter, Reveal } from '@/components/primitives';
import { Flag } from '@/components/Logo';
import Presence from '@/components/Presence';
import { headline, markets, profile } from '@/data/content';

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  // Gentle lift of the whole hero as you leave it.
  const y = useTransform(scrollYProgress, [0, 0.12], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 pb-24 pt-32 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <motion.div style={reduce ? undefined : { y }}>
          {/* Visit count. Renders nothing until a real data source exists. */}
          <Reveal className="mb-8 flex flex-wrap items-center gap-3 empty:mb-0">
            <Presence />
          </Reveal>

          {/* Name */}
          <Reveal delay={0.05} className="eyebrow mb-6">
            {profile.name} · {profile.role}
          </Reveal>

          {/* The statement. Each line masked and lifted separately.
              The mask is padded below and pulled back by an equal negative
              margin: at line-height 0.95 the glyph ink overflows its content
              box, so an unpadded overflow:hidden shears the descenders off
              g and p. See SplitHeading in primitives for the full reasoning. */}
          <h1 className="display text-[clamp(2.6rem,8.4vw,7rem)]">
            {['Marketing', 'that runs on', 'evidence.'].map((line, i) => (
              <span
                key={line}
                className="block overflow-hidden pb-[0.3em] [margin-bottom:-0.3em]"
              >
                <motion.span
                  className={
                    i === 2 ? 'inline-block grad-text-live' : 'inline-block grad-text'
                  }
                  initial={reduce ? false : { y: '102%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 1.1,
                    delay: 0.15 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <Reveal
            delay={0.55}
            className="mt-9 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            {profile.summary}
          </Reveal>

          {/* Markets: real flags */}
          <Reveal delay={0.68} className="mt-9 flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
              Markets
            </span>
            {markets.map((m) => (
              <span key={m.code} title={m.name} className="transition-transform hover:scale-110">
                <Flag code={m.code} name={m.name} size={21} />
              </span>
            ))}
          </Reveal>

          {/* Headline numbers */}
          <Reveal
            delay={0.8}
            className="mt-14 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4"
          >
            {headline.map((h) => (
              <div key={h.label}>
                <div className="display text-[clamp(1.9rem,4.4vw,3rem)] text-white">
                  {h.prefix}
                  <Counter to={h.value} />
                  {h.suffix}
                </div>
                <div className="mt-1.5 text-[12.5px] leading-snug text-white/45">
                  {h.label}
                </div>
              </div>
            ))}
          </Reveal>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        style={reduce ? undefined : { opacity: fade }}
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 9, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-3.5 w-3.5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
