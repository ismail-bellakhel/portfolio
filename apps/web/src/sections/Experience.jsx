import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  CARD_DEPTH,
  GlassCard,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives';
import { CompanyLogo, ToolLogo } from '@/components/Logo';
import { education, experience, languages } from '@/data/content';
import { cn } from '@/lib/utils';

/*
  A vertical timeline whose connecting line draws itself as you scroll.
  The line is an absolutely-positioned element OUTSIDE the glass cards, so
  scaling it never promotes a glass ancestor to its own compositing layer.
*/

export default function Experience() {
  const railRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 0.75', 'end 0.4'],
    layoutEffect: false,
  });
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <Section id="experience">
      {(progress) => (
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Experience"
            title="Fifteen years, five companies."
            lede="From competitive intelligence in Paris to growth and MarTech leadership for a Stockholm publisher."
            progress={progress}
          />

          {/*
            The rail is a desktop affordance and it is dropped below md.
            Its 48px indent plus the card's own padding left under 240px of
            measure on a 375px screen, which wrapped the summary every three
            or four words. On mobile the card runs full width and the company
            mark sits above it instead of beside it.
          */}
          <div ref={railRef} className="relative">
            {/* Rail */}
            <div className="absolute bottom-0 left-[19px] top-2 hidden w-px bg-white/[0.08] md:left-[27px] md:block" />
            <motion.div
              style={{ scaleY: draw }}
              className="absolute bottom-0 left-[19px] top-2 hidden w-px origin-top bg-gradient-to-b from-glow-cyan via-glow-blue to-transparent shadow-[0_0_14px_2px_rgba(34,211,238,0.45)] md:left-[27px] md:block"
            />

            <div className="space-y-5">
              {experience.map((job, i) => (
                // Company alone is not unique: there are two Concentrix
                // roles. Pairing it with the role keeps each card's identity
                // stable across re-renders.
                <div key={`${job.company}-${job.role}`} className="relative md:pl-20">
                  {/* Node */}
                  <Reveal
                    y={0}
                    delay={0.05}
                    className="mb-3 flex h-10 w-10 items-center justify-center md:absolute md:left-0 md:top-6 md:mb-0 md:h-14 md:w-14"
                  >
                    <CompanyLogo
                      logo={job.logo}
                      domain={job.domain}
                      name={job.company}
                      size={40}
                      className="relative z-10"
                    />
                  </Reveal>

                  <GlassCard
                    progress={progress}
                    depth={22 - i * 2}
                    delay={0.08}
                    className="p-6 md:p-8"
                  >
                    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1.5">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {job.role}
                      </h3>
                      <span className="font-mono text-[11px] tracking-tight text-white/40">
                        {job.period}
                      </span>
                    </div>

                    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
                      <span className="font-medium text-glow-cyan">{job.company}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/45">{job.location}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/45">{job.sector}</span>
                    </div>

                    <p className="mb-5 text-[14px] leading-relaxed text-muted">{job.summary}</p>

                    <ul
                      className={cn(
                        'space-y-2.5',
                        job.stack.length > 0 && 'mb-6',
                      )}
                    >
                      {job.highlights.map((hl) => (
                        <li key={hl} className="flex gap-3 text-[13.5px] leading-relaxed text-white/65">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-glow-cyan/70" />
                          {hl}
                        </li>
                      ))}
                    </ul>

                    {/* Real tool logos for the stack used in this role. Roles
                        with no named tooling skip the strip entirely, rather
                        than leaving its margin behind as a gap. */}
                    {job.stack.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {job.stack.map((slug) => (
                          <span
                            key={slug}
                            className="group flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/[0.07]"
                          >
                            <ToolLogo slug={slug} size={15} className="logo-mono" />
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>

          {/* Education + languages. Same depth on both, or the parallax
              pulls them to different heights and they stop lining up. */}
          <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2">
            <GlassCard progress={progress} depth={CARD_DEPTH} className="p-6 sm:p-7">
              <div className="eyebrow mb-4">Education</div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-white/95">
                {education.school}
              </h3>
              <p className="mb-5 text-[13px] text-muted">{education.degree}</p>
              <div className="flex flex-wrap gap-1.5">
                {education.modules.map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-white/50"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </GlassCard>

            <GlassCard progress={progress} depth={CARD_DEPTH} className="p-6 sm:p-7">
              <div className="eyebrow mb-4">Languages</div>
              <div className="space-y-3.5">
                {languages.map((l) => (
                  <div key={l.name} className="flex items-center justify-between gap-4">
                    <span className="text-[14px] font-medium text-white/85">{l.name}</span>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 font-mono text-[11px] text-white/55">
                      {l.level}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </Section>
  );
}
