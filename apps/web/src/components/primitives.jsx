import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';

/*
  Motion primitives.

  THE GLASS RULE
  --------------
  `backdrop-filter` samples the nearest compositing layer. An ancestor with
  opacity < 1 or a transform gets promoted to its own layer, and the glass then
  blurs that layer's transparent background, i.e. it renders BLACK.

  So: parallax transforms go ON the glass element itself, never on a wrapper,
  and entrance animations on glass animate opacity on that same node.
  `Reveal` is therefore only safe for non-glass content.
*/

/** Scroll progress (0→1) across a section. Attach `ref` to the <section>. */
export function useSectionScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    // The ref lands on a child element, so it isn't populated during this
    // component's layout effect.
    layoutEffect: false,
  });
  return { ref, progress: scrollYProgress };
}

/** Parallax offset derived from a section progress value. */
export function useParallax(progress, depth = 40) {
  const reduce = useReducedMotion();
  const raw = useTransform(progress, [0, 1], [depth, -depth]);
  const y = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.35 });
  return reduce ? undefined : y;
}

/** Fade/slide in. For TEXT and non-glass content only. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as: Tag = motion.div,
  ...rest
}) {
  const reduce = useReducedMotion();
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** A glass panel with parallax + opacity entrance applied to ITSELF. */
export function GlassCard({
  children,
  progress,
  depth = 28,
  delay = 0,
  className,
  sheen = true,
  ...rest
}) {
  const y = useParallax(progress, depth);
  const ref = useRef(null);

  const onMove = (e) => {
    if (!sheen || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      style={y ? { y } : undefined}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('glass glass-i', sheen && 'glass-sheen', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/*
  Every card inside a grid parallaxes by the SAME amount. Varying depth per
  column looks livelier in isolation but it breaks the grid: neighbouring
  cards drift to different heights and a row stops reading as a row. Depth
  varies between sections instead, through each section's own progress.
*/
export const CARD_DEPTH = 24;

/** Count-up number that fires once when scrolled into view. */
export function Counter({ to, duration = 1.6, decimals = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const u = Math.min((now - t0) / (duration * 1000), 1);
      // easeOutExpo
      const e = u === 1 ? 1 : 1 - Math.pow(2, -10 * u);
      setVal(to * e);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={cn('tnum', className)}>
      {val.toFixed(decimals)}
    </span>
  );
}

/**
 * Headline that animates in word by word.
 *
 * Two traps are being avoided here.
 *
 * 1. The `whileInView` trigger lives on the CLIPPING wrapper, not on the word.
 *    IntersectionObserver intersects against clipping ancestors, so a word
 *    parked at y:105% inside `overflow:hidden` reports zero visible area, so it
 *    would never animate in, and so would never become visible. Deadlock.
 *
 * 2. `wordClassName` lands on the transformed span. A transformed element forms
 *    its own containing block, so an ancestor's `background-clip: text` never
 *    paints through it. The gradient has to be declared on the word itself.
 *
 * 3. The mask is padded at the bottom and pulled back by an equal negative
 *    margin. `line-height: 0.95` is tighter than Inter's ascent + descent
 *    (~1.19em), so half-leading is negative and glyph ink overflows the
 *    content box by ~0.12em below. `overflow:hidden` then shears the tails off
 *    y, p, g and Q. 0.3em clears that with room to spare, and the equal
 *    negative margin keeps layout unchanged.
 */
export function SplitHeading({ text, className, wordClassName, delay = 0 }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.3em] align-bottom [margin-bottom:-0.3em]"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.span
            className={cn('inline-block', wordClassName)}
            variants={{ hidden: { y: '105%' }, show: { y: '0%' } }}
            transition={{
              duration: 0.85,
              delay: delay + i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </span>
  );
}

/** Section shell: id, scroll ref, and consistent rhythm. */
export function Section({ id, children, className, ...rest }) {
  const { ref, progress } = useSectionScroll();
  return (
    <section
      id={id}
      ref={ref}
      className={cn('relative z-10 px-5 py-28 sm:px-8 md:py-36', className)}
      {...rest}
    >
      {typeof children === 'function' ? children(progress) : children}
    </section>
  );
}

/** Eyebrow + title + optional lede, used at the top of every section. */
export function SectionHeading({ eyebrow, title, lede, progress, align = 'left' }) {
  const y = useParallax(progress, 52);
  return (
    <motion.div
      style={y ? { y } : undefined}
      className={cn('mb-14 max-w-3xl md:mb-20', align === 'center' && 'mx-auto text-center')}
    >
      <Reveal className="eyebrow mb-5 flex items-center gap-3">
        {align !== 'center' && <span className="h-px w-8 bg-white/25" />}
        {eyebrow}
      </Reveal>
      <h2 className="display text-[clamp(2rem,5.5vw,3.75rem)]">
        <SplitHeading text={title} wordClassName="grad-text" />
      </h2>
      {lede && (
        <Reveal delay={0.12} className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
          {lede}
        </Reveal>
      )}
    </motion.div>
  );
}

export { motion, useMotionValue, useReducedMotion, useTransform, useSpring };
