import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Trophy } from 'lucide-react';
import {
  CARD_DEPTH,
  Counter,
  GlassCard,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives';
import { cases } from '@/data/content';

/* ---------------------------------------------------------------
   The award moment: a cinematic band.

   The source photo is portrait (1044×1507), so cropping it into a
   wide letterbox would cut off either the face or the trophy. It is
   kept in its own aspect on the right instead, with a heavily blurred
   copy of itself filling the band behind as ambient colour. Only the
   foreground portrait is parallaxed; the blurred backdrop is static
   so the browser rasterises that filter exactly once.
   --------------------------------------------------------------- */
const AWARD_ARTICLE =
  'https://www.dagensps.se/redaktionen-har-ordet/dagens-ps-vinner-svenska-seo-priset-2024/';

function AwardMoment() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.01, 1.08]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);
  const sweep = useTransform(scrollYProgress, [0.08, 0.8], ['-140%', '320%']);
  const glow = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.15, 0.7, 0.15]);

  return (
    <div ref={ref} className="relative my-6">
      <div className="relative overflow-hidden rounded-[24px] ring-1 ring-white/10 sm:rounded-[30px]">
        {/* Ambient backdrop. The stage behind him is navy with gold signage, so
            the band borrows those two colours as gradients rather than blurring
            a copy of the bitmap, since a filter that large stalls the compositor. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(85% 115% at 76% 30%, rgba(37,78,196,0.70) 0%, rgba(5,6,10,0) 62%),' +
              'radial-gradient(65% 85% at 10% 72%, rgba(214,151,32,0.30) 0%, rgba(5,6,10,0) 64%),' +
              'linear-gradient(105deg, #0a1026 0%, #142152 52%, #0a1024 100%)',
          }}
        />

        {/* Amber bloom */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { opacity: glow }}
          className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-glow-amber/25 blur-[70px]"
        />

        {/* Light sweep across the whole band */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            style={{ x: sweep }}
            className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
          />
        )}

        <div className="relative grid items-center gap-7 p-6 sm:gap-9 sm:p-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:p-14">
          {/*
            `min-w-0` is load-bearing. A grid track's automatic minimum is the
            min-content of its items, and the article link below holds a
            `truncate` line, which is `white-space: nowrap`, so its min-content
            is the entire untruncated headline. That pushed this column to
            420px inside a 287px grid on a 375px screen and the band's
            `overflow-hidden` sheared every line of the caption off at the
            right edge. Letting the track go below min-content lets the
            headline truncate as it was always meant to.
          */}
          <div className="min-w-0">
            <Reveal className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-glow-amber/15 px-3.5 py-1.5 ring-1 ring-glow-amber/30">
              <Trophy className="h-3.5 w-3.5 text-glow-amber" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-glow-amber">
                Swedish SEO Award 2024
              </span>
            </Reveal>

            <h3 className="display text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.05] text-white">
              <Reveal delay={0.05}>Winner,</Reveal>
              <Reveal delay={0.1} className="text-glow-amber">
                News Media
              </Reveal>
            </h3>

            <Reveal delay={0.16} className="mt-5 max-w-md text-[14.5px] leading-relaxed text-white/65">
              Contributed to the technical SEO strategy that won the 2024 Swedish
              SEO Award in the News Media category. The same work grew Google
              Discover traffic 161% and took DagensPS past a million weekly
              readers.
            </Reveal>

            {/* The receipt. The claim above is checkable, so it links to the
                announcement DagensPS published on 12 Nov 2024. The thumbnail is
                that article's own og:image, the ceremony photo, served from this
                origin rather than hotlinked so the card cannot break if they
                move the file. */}
            <Reveal delay={0.22} className="mt-7">
              <a
                href={AWARD_ARTICLE}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 rounded-2xl bg-white/[0.05] p-2.5 pr-4 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.09]"
              >
                <img
                  src="/images/dagensps-seo-award-2024.jpg"
                  alt="The DagensPS team at the Svenska SEO-priset 2024 ceremony"
                  loading="lazy"
                  decoding="async"
                  width={112}
                  height={56}
                  className="h-11 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10 sm:h-14 sm:w-28 sm:rounded-xl"
                />
                <span className="min-w-0 flex-1">
                  {/* Tracking is relaxed only once there is room for it. At
                      0.14em this line is wider than the 137px the row leaves
                      on a 375px screen and it wraps onto two. */}
                  <span className="block truncate text-[10.5px] uppercase tracking-[0.08em] text-white/40 sm:tracking-[0.14em]">
                    Dagens PS · Nov 2024
                  </span>
                  <span className="block truncate text-[13px] font-medium text-white/85">
                    Dagens PS vinner svenska SEO-priset 2024
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-glow-amber" />
              </a>
            </Reveal>

            <Reveal delay={0.28} className="mt-5 flex flex-wrap gap-2">
              {['Svenska SEO-priset', 'Stockholm', 'DagensPS'].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/[0.07] px-3 py-1 text-[11.5px] text-white/60 ring-1 ring-white/[0.08]"
                >
                  {t}
                </span>
              ))}
            </Reveal>
          </div>

          {/* The photograph, in its own aspect so face and trophy both survive. */}
          <Reveal
            delay={0.1}
            y={34}
            className="relative mx-auto w-full min-w-0 max-w-[330px] md:max-w-none"
          >
            <div className="relative overflow-hidden rounded-[22px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/15">
              <motion.img
                src="/images/ismail-bellakhel-seo-award.jpg"
                alt="Ismail Bellakhel holding the 2024 Swedish SEO Award"
                loading="lazy"
                decoding="async"
                style={reduce ? undefined : { scale, y: imgY }}
                className="aspect-[3/4] w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Individual result card.
   --------------------------------------------------------------- */
function ResultCard({ item, progress, delay }) {
  return (
    <GlassCard
      progress={progress}
      depth={CARD_DEPTH}
      delay={delay}
      className="flex flex-col p-6 sm:min-h-[340px] sm:p-7"
    >
      <div className="display mb-1 text-[clamp(2.1rem,4.6vw,3.1rem)] leading-none text-white">
        {item.display ? (
          <span className="bg-gradient-to-br from-white to-white/55 bg-clip-text text-transparent">
            {item.display}
          </span>
        ) : (
          <>
            {item.prefix}
            <Counter to={item.metric} />
            {item.suffix}
          </>
        )}
      </div>

      <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-glow-mint/70">
        {item.company}
      </div>

      <h3 className="mb-2.5 text-[15px] font-semibold tracking-tight text-white/95">
        {item.title}
      </h3>
      <p className="mb-5 flex-1 text-[13px] leading-relaxed text-muted">{item.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-white/45"
          >
            {tag}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Cases() {
  const items = cases.filter((c) => !c.featured);

  return (
    <Section id="cases">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Results"
            title="Verified outcomes, not adjectives."
            lede="Every number below comes from work I shipped, measured and reported."
            progress={progress}
          />

          <AwardMoment />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <ResultCard
                key={item.title}
                item={item}
                progress={progress}
                delay={(i % 3) * 0.05}
              />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
