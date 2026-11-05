import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import {
  CARD_DEPTH,
  Counter,
  GlassCard,
  Section,
  SectionHeading,
} from '@/components/primitives';
import { assessment } from '@/data/content';
import { cn } from '@/lib/utils';

/*
  Alva Labs results.

  Both charts here are redrawn from the reports rather than reinterpreted,
  because the whole value of publishing a test result is that it can be
  checked against its source, which is linked at the foot of the section.

  The bell is Alva's own chart: a normal distribution over the ten-point
  standard scale with the scored band lit. The logic chart is the report's
  task breakdown, every answered task plotted at its difficulty.

  Both are SVG, both animate on `whileInView` on the drawn element itself,
  never on a wrapper, because these sit inside glass panels and a wrapper
  with opacity < 1 would promote the panel's layer and turn it black.
*/

const EASE = [0.22, 1, 0.36, 1];

/* The scale runs 1-10 and the population average is 5 to 6, so the curve is
   centred between them and spread so that 1 and 10 land in the tails. */
const MEAN = 5.5;
const SIGMA = 2.45;
const BELL_W = 300;

const gauss = (x) => Math.exp(-((x - MEAN) ** 2) / (2 * SIGMA * SIGMA));

/* Every path in this chart is the same curve read at different spans, so they
   all come from one sampler and cannot drift apart. `x` is in viewBox units,
   the scale position is 1-10 across that width. */
const curveY = (x, h) => h - gauss(0.5 + (x / BELL_W) * 10) * (h - 2);

const sample = (x0, x1, h, steps) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    pts.push(`${x.toFixed(1)} ${curveY(x, h).toFixed(1)}`);
  }
  return pts.join(' L ');
};

const DECILE = BELL_W / 10;

/* 150 samples: fine enough to read as a curve, short enough to stay cheap. */
const curvePath = (h) => `M 0 ${h} L ${sample(0, BELL_W, h, 150)} L ${BELL_W} ${h} Z`;

/* The scored decile, as its own slice of the curve closed down to the
   baseline. It used to be a rectangle clipped to the curve and grown with a
   CSS scaleY, which Safari drops: a transformed child of a clipped <g> is
   not painted at all there. Cutting the real shape needs neither the clip
   nor the transform, and the band follows the curve exactly rather than
   approximately. */
const bandPath = (score, h) =>
  `M ${(score - 1) * DECILE} ${h} L ${sample((score - 1) * DECILE, score * DECILE, h, 12)} L ${score * DECILE} ${h} Z`;

/* Just the lid of that slice. A flat cap on a sloping curve reads as a
   mistake, so the marker is curved too. */
const capPath = (score, h) => `M ${sample((score - 1) * DECILE, score * DECILE, h, 12)}`;

/**
 * A scored normal distribution. `score` is 1-10; its decile is cut out of the
 * curve and filled with `tint`, so the mark reads as a slice of the population
 * rather than as a bar of its own.
 */
function Bell({ score, tint, h = 54, delay = 0, compact = false }) {
  const reduce = useReducedMotion();
  const mid = (score - 0.5) * DECILE;
  const inView = { once: true, margin: '-40px 0px' };

  /*
    The curve stretches to the full width of its row but keeps a fixed pixel
    height, so five of these stack to a predictable rhythm instead of each
    one's height depending on the column it landed in. That means the viewBox
    is scaled non-uniformly, so every stroke here is non-scaling and the peak
    marker is a slice of the curve rather than a dot: a circle would be drawn
    as an ellipse once the horizontal scale is 1.5x the vertical.

    Nothing here is animated with a CSS transform. Everything is opacity or
    pathLength, both of which every engine draws the same way. Transforms on
    SVG children need `transform-box: fill-box`, which Safari wants prefixed
    and which framer-motion does not prefix, so a scaled child silently
    vanishes there.
  */
  return (
    <svg
      viewBox={`0 0 ${BELL_W} ${h + 1}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="w-full"
      style={{ height: h + 1 }}
    >
      <path d={curvePath(h)} fill="rgba(255,255,255,0.055)" />

      {/* Decile gridlines, each stopping at the curve so the shape stays
          readable as a distribution and the lit band has something to be
          measured against. */}
      {!compact &&
        Array.from({ length: 9 }, (_, i) => (
          <line
            key={i}
            x1={(i + 1) * DECILE}
            x2={(i + 1) * DECILE}
            y1={curveY((i + 1) * DECILE, h)}
            y2={h}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      <motion.path
        d={bandPath(score, h)}
        fill={tint}
        fillOpacity="0.55"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inView}
        transition={{ duration: 0.6, delay, ease: EASE }}
      />

      <path
        d={curvePath(h)}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* The mark: a stem up the scored decile's centre, capped at the curve. */}
      <motion.line
        x1={mid}
        x2={mid}
        y1={h}
        y2={curveY(mid, h)}
        stroke={tint}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={inView}
        transition={{ duration: 0.7, delay: delay + 0.1, ease: EASE }}
      />
      <motion.path
        d={capPath(score, h)}
        fill="none"
        stroke={tint}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={inView}
        transition={{ duration: 0.5, delay: delay + 0.4, ease: EASE }}
        style={{ filter: `drop-shadow(0 0 6px ${tint})` }}
      />
    </svg>
  );
}

/**
 * The logic report's task breakdown. Every answered task plotted as a dot at
 * its difficulty, solved below the axis line and missed above it.
 *
 * This is the shape of an adaptive test: difficulty climbs until the answers
 * start failing, and where they do is the score. Showing it means the four
 * misses at difficulty 10 are on the page next to the hits, which is the
 * honest version of a single number.
 */
function TaskPlot({ tasks, score, delay = 0 }) {
  const reduce = useReducedMotion();
  const W = 320;
  const H = 150;
  const mid = 84;
  const step = 7;
  const x = (d) => 18 + ((d - 1) / 9) * (W - 36);

  const dots = [];
  for (const task of tasks) {
    for (let i = 0; i < task.ok; i++) {
      dots.push({ key: `ok-${task.d}-${i}`, d: task.d, y: mid + 11 + i * step, ok: true });
    }
    for (let i = 0; i < task.miss; i++) {
      dots.push({
        key: `miss-${task.d}-${i}`,
        d: task.d,
        y: mid - 11 - i * step,
        ok: false,
      });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="w-full">
      {/* The scored difficulty, as a band rather than a line: the result is a
          range on this axis, not a point on it. */}
      <motion.rect
        x={x(score) - 11}
        y="6"
        width="22"
        height={H - 28}
        rx="11"
        fill="rgba(52,211,153,0.07)"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px 0px' }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      />

      <line
        x1="10"
        x2={W - 10}
        y1={mid}
        y2={mid}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      {/* The dots pop by animating `r`, not a scale: `r` is a plain SVG
          attribute, so it needs no CSS transform on an SVG child. */}
      {dots.map((dot, i) => (
        <motion.circle
          key={dot.key}
          cx={x(dot.d)}
          cy={dot.y}
          r={4}
          fill={dot.ok ? '#34d399' : '#fb923c'}
          fillOpacity={dot.ok ? 0.85 : 0.75}
          initial={reduce ? false : { r: 0, opacity: 0 }}
          whileInView={{ r: 4, opacity: 1 }}
          viewport={{ once: true, margin: '-40px 0px' }}
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 24,
            delay: delay + 0.15 + i * 0.035,
          }}
        />
      ))}

      {[1, 4, 7, 10].map((d) => (
        <text
          key={d}
          x={x(d)}
          y={H - 4}
          textAnchor="middle"
          className="fill-white/35 font-mono text-[9px]"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}

function FactorRow({ factor, on, onSelect, delay }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={on}
      className={cn(
        'w-full rounded-2xl px-3.5 pb-2 pt-3 text-left transition-colors duration-300',
        on ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]',
      )}
    >
      <div className="mb-1.5 flex items-baseline gap-3">
        <span
          className={cn(
            'text-[13px] font-medium transition-colors duration-300',
            on ? 'text-white' : 'text-white/65',
          )}
        >
          {factor.name}
        </span>
        <span className="ml-auto text-[11.5px] text-white/45">{factor.label}</span>
        <span
          className="font-mono text-[12px] font-semibold"
          style={{ color: factor.tint }}
        >
          <Counter to={factor.score} duration={1.3} />
        </span>
      </div>
      <Bell score={factor.score} tint={factor.tint} h={44} delay={delay} />
      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
        <span>{factor.low}</span>
        <span>{factor.high}</span>
      </div>
    </button>
  );
}

function ListCard({ title, items, icon: Icon, tint, progress, delay }) {
  return (
    <GlassCard progress={progress} depth={CARD_DEPTH} delay={delay} className="p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: `${tint}1f` }}
        >
          <Icon className="h-3 w-3" style={{ color: tint }} />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
          {title}
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px 0px' }}
            transition={{ duration: 0.45, delay: i * 0.055, ease: EASE }}
            className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/75"
          >
            <span
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
              style={{ background: tint }}
            />
            {item}
          </motion.li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default function Assessment() {
  const { logic, personality, provider } = assessment;
  const [active, setActive] = useState(personality.factors[1].key);
  const factor = personality.factors.find((f) => f.key === active);

  return (
    <Section id="assessment">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={`${provider} Assessments`}
            title="Tested, not asserted."
            lede="Logic and personality measured by Alva Labs, plotted against the population. Every curve is the test's own distribution, and the lit band is where my result sits in it."
            progress={progress}
          />

          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            {/* LOGIC */}
            <GlassCard progress={progress} depth={CARD_DEPTH} className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: '#34d399', boxShadow: '0 0 12px #34d399' }}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
                  {logic.title}
                </span>
              </div>

              <div className="mb-6 flex items-end gap-4">
                <span className="display text-[clamp(3rem,9vw,4.5rem)] leading-[0.85] text-white">
                  <Counter to={logic.score} />
                </span>
                <div className="pb-1.5">
                  <div className="text-[13px] font-medium text-white/85">
                    {logic.band}
                  </div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45">
                    {logic.percentile}
                  </div>
                </div>
              </div>

              <Bell score={logic.score} tint="#34d399" h={58} />
              <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                <span>Below average</span>
                <span>Above average</span>
              </div>

              <p className="mt-6 border-t border-white/[0.07] pt-6 text-[13.5px] leading-relaxed text-white/60">
                {logic.blurb}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center gap-4 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                    Solved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c]" />
                    Missed
                  </span>
                  <span className="ml-auto normal-case tracking-normal">
                    by task difficulty
                  </span>
                </div>
                <TaskPlot tasks={logic.tasks} score={logic.score} delay={0.1} />
              </div>
            </GlassCard>

            {/* PERSONALITY */}
            <GlassCard
              progress={progress}
              depth={CARD_DEPTH}
              delay={0.08}
              className="p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: factor.tint, boxShadow: `0 0 12px ${factor.tint}` }}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
                  {personality.title}
                </span>
                <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/30 sm:inline">
                  Select a trait
                </span>
              </div>

              <div className="-mx-1 space-y-0.5">
                {personality.factors.map((f, i) => (
                  <FactorRow
                    key={f.key}
                    factor={f}
                    on={f.key === active}
                    onSelect={() => setActive(f.key)}
                    delay={0.1 + i * 0.055}
                  />
                ))}
              </div>

              {/* Detail for the selected trait. Keyed so the copy and the three
                  facet curves re-run their entrance on every swap. */}
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="mt-6 border-t border-white/[0.07] pt-6"
              >
                <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] font-semibold text-white/90">
                    {factor.label}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">
                    {factor.percentile}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-white/65">
                  {factor.summary}
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  {factor.facets.map((facet, i) => (
                    <motion.div
                      key={facet.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: EASE }}
                    >
                      <div className="mb-1.5 flex items-baseline gap-2">
                        <span className="text-[11.5px] font-medium text-white/70">
                          {facet.name}
                        </span>
                        <span
                          className="ml-auto font-mono text-[11px]"
                          style={{ color: factor.tint }}
                        >
                          <Counter to={facet.score} duration={1.1} />
                        </span>
                      </div>
                      <Bell
                        score={facet.score}
                        tint={factor.tint}
                        h={30}
                        compact
                        delay={0.1 + i * 0.07}
                      />
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                        {facet.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </GlassCard>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <ListCard
              title="Strengths"
              items={personality.strengths}
              icon={Plus}
              tint="#34d399"
              progress={progress}
            />
            <ListCard
              title="Possible challenges"
              items={personality.challenges}
              icon={Minus}
              tint="#fb923c"
              progress={progress}
              delay={0.08}
            />
            <GlassCard
              progress={progress}
              depth={CARD_DEPTH}
              delay={0.16}
              className="p-6 sm:p-7"
            >
              <div className="mb-5 flex items-center gap-2.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: '#60a5fa1f' }}
                >
                  <Check className="h-3 w-3 text-[#60a5fa]" />
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
                  Motivated by
                </span>
              </div>
              {[
                { label: 'Drivers', items: personality.drivers },
                { label: 'Culture', items: personality.culture },
              ].map((row, gi) => (
                <div key={row.label} className={gi ? 'mt-5' : undefined}>
                  <div className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/35">
                    {row.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {row.items.map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px 0px' }}
                        transition={{
                          duration: 0.45,
                          delay: gi * 0.12 + i * 0.055,
                          ease: EASE,
                        }}
                        className="rounded-full bg-white/[0.055] px-3 py-1.5 text-[12px] font-medium text-white/75 ring-1 ring-white/[0.06]"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>

        </div>
      )}
    </Section>
  );
}
