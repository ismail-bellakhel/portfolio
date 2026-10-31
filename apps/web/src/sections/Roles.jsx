import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import {
  GlassCard,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives';
import { profile, roleGroups } from '@/data/content';
import { cn } from '@/lib/utils';

/*
  The browsable role diagram.

  Three overlapping fields (Growth, Analytics, AI) drawn as an SVG Venn.
  Each of the seven regions is its own hotspot: hover or tap it and the panel
  on the right swaps to the roles that live in that intersection. Until you
  touch it, it browses itself, stepping region to region so the diagram is
  never static.

  The SVG sits outside the glass panel: it transforms, and a transformed
  ancestor would turn the glass black.
*/

const R = 112;
const CIRCLES = [
  { key: 'growth', cx: 148, cy: 140, tint: '#60a5fa' },
  { key: 'analytics', cx: 256, cy: 140, tint: '#34d399' },
  { key: 'ai', cx: 202, cy: 238, tint: '#a78bfa' },
];

// Where each region's hotspot and label sit, and which circles form it.
const REGIONS = [
  { key: 'growth', x: 100, y: 104, of: ['growth'] },
  { key: 'analytics', x: 304, y: 104, of: ['analytics'] },
  { key: 'ai', x: 202, y: 296, of: ['ai'] },
  { key: 'growthAnalytics', x: 202, y: 100, of: ['growth', 'analytics'] },
  { key: 'growthAi', x: 143, y: 212, of: ['growth', 'ai'] },
  { key: 'analyticsAi', x: 261, y: 212, of: ['analytics', 'ai'] },
  { key: 'all', x: 202, y: 170, of: ['growth', 'analytics', 'ai'] },
];

const ORDER = [
  'all',
  'growth',
  'growthAnalytics',
  'analytics',
  'analyticsAi',
  'ai',
  'growthAi',
];

function Diagram({ active, setActive, onTouch, progress }) {
  const reduce = useReducedMotion();
  const rotate = useTransform(progress, [0, 1], [-7, 7]);
  const activeOf = REGIONS.find((r) => r.key === active)?.of ?? [];

  return (
    <motion.svg
      viewBox="0 0 404 372"
      role="group"
      aria-label="Target role fields"
      style={reduce ? undefined : { rotate }}
      className="w-full max-w-[460px] overflow-visible"
    >
      <defs>
        {CIRCLES.map((c) => (
          <radialGradient key={c.key} id={`fill-${c.key}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.tint} stopOpacity="0.055" />
            <stop offset="100%" stopColor={c.tint} stopOpacity="0.17" />
          </radialGradient>
        ))}
      </defs>

      {CIRCLES.map((c, i) => {
        const lit = activeOf.includes(c.key);
        return (
          <motion.g
            key={c.key}
            animate={
              reduce
                ? undefined
                : { y: [0, i % 2 === 0 ? -5 : 5, 0], x: [0, i === 1 ? 4 : -4, 0] }
            }
            transition={{
              repeat: Infinity,
              duration: 11 + i * 2.5,
              ease: 'easeInOut',
            }}
          >
            <motion.circle
              cx={c.cx}
              cy={c.cy}
              r={R}
              fill={`url(#fill-${c.key})`}
              animate={{ opacity: lit ? 1 : 0.45 }}
              transition={{ duration: 0.5 }}
            />
            <motion.circle
              cx={c.cx}
              cy={c.cy}
              r={R}
              fill="none"
              stroke={c.tint}
              animate={{
                strokeOpacity: lit ? 0.85 : 0.22,
                strokeWidth: lit ? 1.6 : 1,
              }}
              transition={{ duration: 0.5 }}
              style={{ filter: lit ? `drop-shadow(0 0 12px ${c.tint}aa)` : 'none' }}
            />
            <text
              x={c.cx}
              y={c.cy + (i === 2 ? 132 : -126)}
              textAnchor="middle"
              className="fill-white/55 font-mono text-[10px] uppercase"
              style={{ letterSpacing: '0.2em' }}
            >
              {roleGroups[c.key].label}
            </text>
          </motion.g>
        );
      })}

      {REGIONS.map((r) => {
        const on = r.key === active;
        const g = roleGroups[r.key];
        return (
          <g
            key={r.key}
            onMouseEnter={() => {
              onTouch();
              setActive(r.key);
            }}
            onClick={() => {
              onTouch();
              setActive(r.key);
            }}
            className="cursor-pointer"
          >
            <circle cx={r.x} cy={r.y} r={26} fill="transparent" />
            <motion.circle
              cx={r.x}
              cy={r.y}
              fill={g.tint}
              animate={{ r: on ? 6.5 : 3.5, opacity: on ? 1 : 0.4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{ filter: on ? `drop-shadow(0 0 10px ${g.tint})` : 'none' }}
            />
            {on && (
              <motion.circle
                cx={r.x}
                cy={r.y}
                fill="none"
                stroke={g.tint}
                strokeWidth="1"
                initial={{ r: 6, opacity: 0.8 }}
                animate={{ r: 24, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.9, ease: 'easeOut' }}
              />
            )}
            <text
              x={r.x}
              y={r.y - 14}
              textAnchor="middle"
              className="pointer-events-none fill-white font-mono text-[9.5px] tabular-nums"
              opacity={on ? 0.9 : 0.35}
            >
              {g.roles.length}
            </text>
          </g>
        );
      })}
    </motion.svg>
  );
}

export default function Roles() {
  const [active, setActive] = useState('all');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    const t = setInterval(() => {
      setActive((cur) => ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]);
    }, 3200);
    return () => clearInterval(t);
  }, [touched]);

  const group = roleGroups[active];

  return (
    <Section id="roles">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Target Roles"
            title="Where I sit on the map."
            lede="Growth, analytics and AI overlap in my work. Browse the intersections. The centre is where I operate today."
            progress={progress}
          />

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            <Reveal className="flex justify-center">
              <Diagram
                active={active}
                setActive={setActive}
                onTouch={() => setTouched(true)}
                progress={progress}
              />
            </Reveal>

            <GlassCard progress={progress} depth={26} className="p-7 sm:p-9">
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: group.tint,
                    boxShadow: `0 0 12px ${group.tint}`,
                  }}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
                  {group.label}
                </span>
                <span className="ml-auto font-mono text-[10.5px] text-white/35">
                  {String(group.roles.length).padStart(2, '0')}
                </span>
              </div>

              <motion.ul key={active} className="min-h-[190px] space-y-2.5">
                {group.roles.map((role, i) => (
                  <motion.li
                    key={role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-3.5 py-2.5 ring-1 ring-white/[0.06]"
                  >
                    <Check
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: group.tint }}
                    />
                    <span className="text-[13.5px] font-medium text-white/85">{role}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="mt-7 flex flex-wrap gap-1.5 border-t border-white/[0.07] pt-6">
                {ORDER.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTouched(true);
                      setActive(key);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-300',
                      key === active
                        ? 'bg-white text-ink-950'
                        : 'bg-white/[0.05] text-white/55 hover:text-white/85',
                    )}
                  >
                    {roleGroups[key].label}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          <Reveal delay={0.1} className="mt-10 text-center">
            <a
              href={`mailto:${profile.email}`}
              className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:text-white"
            >
              Hiring for one of these?
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>
      )}
    </Section>
  );
}
