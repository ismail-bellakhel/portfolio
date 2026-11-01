import { Fragment, useEffect, useRef, useState } from 'react';
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
      viewport={{ once: true, margin: '-80px 0px' }}
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
      viewport={{ once: true, margin: '-60px 0px' }}
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

/**
 * Count-up number that fires once when scrolled into view.
 *
 * The root margin is vertical-only on purpose. `margin: '-60px'` is a CSS
 * shorthand, so it shrinks the observation root on all four sides, including
 * horizontally. This span wraps only the digits, so it can be ~18px wide, and
 * in the hero's left column it sits at x 20-38 on a narrow viewport. A root
 * shrunk to x >= 60 never intersects it, `inView` stays false, and the number
 * sits at 0 forever while the wider right column counts up normally.
 */
export function Counter({ to, duration = 1.6, decimals = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
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

/*
  Shared timing for the blur reveal, so every title in the site rises with the
  same curve. Framer takes the cubic-bezier control points directly.
*/
export const REVEAL_DURATION = 0.7;
export const REVEAL_EASE = [0.2, 0.7, 0.2, 1];

/**
 * Staggered blur-in reveal: each part fades up from `blur(10px)` and 0.3em
 * below, 40ms apart (18ms for `by="char"`), once, when 30% of the line is in
 * view. Used for every heading on the page.
 *
 * Three details are load-bearing.
 *
 * 1. The separator is a real space in its own text node, NOT a non-breaking
 *    space inside the word's span. NBSP is line-break class GL, which forbids a
 *    break on either side of it, so gluing it to the word removes every break
 *    opportunity in the line and a long title overflows its column instead of
 *    wrapping.
 *
 * 2. `partClassName` lands on the animated span. `filter` and `transform` both
 *    make an element a containing block, so an ancestor's
 *    `background-clip: text` cannot paint through it. The gradient has to be
 *    declared on the part itself.
 *
 * 3. There is no `overflow: hidden` mask around each part, unlike the lift
 *    reveal this replaced. A mask would clip the blur halo square at the word's
 *    own box and leave a visible hard edge on all four sides while the word is
 *    still soft. With a rise of only 0.3em there is nothing worth masking.
 */
export function RevealText({
  text,
  by = 'word',
  delay = 0,
  className,
  partClassName,
  as: Tag = 'span',
}) {
  const reduce = useReducedMotion();
  const chars = by === 'char';
  const parts = chars ? Array.from(text) : text.split(' ');
  const step = chars ? 0.018 : 0.04;

  return (
    <Tag className={className}>
      {parts.map((part, i) => (
        <Fragment key={`${part}-${i}`}>
          <motion.span
            className={cn('inline-block', partClassName)}
            initial={reduce ? false : { opacity: 0, filter: 'blur(10px)', y: '0.3em' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: '0em' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: REVEAL_DURATION,
              delay: delay + i * step,
              ease: REVEAL_EASE,
            }}
          >
            {part === ' ' ? '\u00A0' : part}
          </motion.span>
          {!chars && i < parts.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Section shell: id, scroll ref, and consistent rhythm. */
export function Section({ id, children, className, ...rest }) {
  const { ref, progress } = useSectionScroll();
  return (
    <section
      id={id}
      ref={ref}
      className={cn('relative z-10 px-5 py-20 sm:px-8 sm:py-28 md:py-36', className)}
      {...rest}
    >
      {typeof children === 'function' ? children(progress) : children}
    </section>
  );
}

/** Eyebrow + title + optional lede, used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  progress,
  align = 'left',
  children,
}) {
  const y = useParallax(progress, 52);
  return (
    <motion.div
      style={y ? { y } : undefined}
      className={cn(
        'mb-10 max-w-3xl sm:mb-14 md:mb-20',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      <Reveal className="eyebrow mb-5 flex items-center gap-3">
        {align !== 'center' && <span className="h-px w-8 bg-white/25" />}
        {eyebrow}
      </Reveal>
      <h2 className="display text-[clamp(2rem,5.5vw,3.75rem)]">
        <RevealText text={title} partClassName="grad-text" />
      </h2>
      {lede && (
        <Reveal
          delay={0.12}
          className="mt-5 text-[16.5px] leading-relaxed text-muted sm:mt-6 sm:text-lg md:text-xl"
        >
          {lede}
        </Reveal>
      )}
      {/* Anything that trails the lede has to live inside this block. It
          parallaxes by up to 52px in each direction while the rest of the
          section stays put, so a sibling tucked underneath with a negative
          margin gets run over by the lede on the way down. */}
      {children}
    </motion.div>
  );
}

export { motion, useMotionValue, useReducedMotion, useTransform, useSpring };
