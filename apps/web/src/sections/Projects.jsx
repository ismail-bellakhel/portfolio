import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import {
  GlassCard,
  Reveal,
  Section,
  SectionHeading,
  CARD_DEPTH,
} from '@/components/primitives';
import { ToolLogo } from '@/components/Logo';
import { projects } from '@/data/content';
import { cn } from '@/lib/utils';

/* A screenshot that pans slightly on hover and swaps through a gallery. */
function Shot({ project }) {
  const [idx, setIdx] = useState(0);
  const shots = project.gallery?.length ? project.gallery : [project.image];
  if (!project.image) return null;

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-ink-900 ring-1 ring-white/[0.08]">
      <motion.img
        key={shots[idx]}
        src={shots[idx]}
        alt={`${project.name} interface`}
        loading="lazy"
        decoding="async"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="aspect-[16/10] w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

      {shots.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {shots.map((s, i) => (
            <button
              key={s}
              onClick={() => setIdx(i)}
              aria-label={`View screenshot ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, progress, depth, delay, featured }) {
  return (
    <GlassCard
      progress={progress}
      depth={depth}
      delay={delay}
      className={cn(
        'group flex flex-col overflow-hidden p-5 sm:p-6',
        featured && 'lg:col-span-3',
      )}
    >
      <div className={cn(featured && 'grid items-center gap-7 lg:grid-cols-2')}>
        <Shot project={project} />

        <div className={cn('flex flex-col', project.image && !featured && 'pt-5')}>
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-glow-violet/80">
            {project.kicker}
          </div>

          <h3
            className={cn(
              'mb-3 font-semibold tracking-tight text-white',
              featured ? 'text-[clamp(1.5rem,3vw,2.2rem)]' : 'text-[19px]',
            )}
          >
            {project.name}
          </h3>

          <p className="mb-4 text-[14px] leading-relaxed text-white/70">{project.summary}</p>

          {featured && (
            <p className="mb-5 text-[13px] leading-relaxed text-muted">{project.description}</p>
          )}

          {/* Real tech logos */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {project.stack.map((slug) => (
              <span
                key={slug}
                className="group/logo flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/[0.07]"
                title={slug}
              >
                <ToolLogo slug={slug} size={15} className="logo-mono" />
              </span>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-white/45"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2.5">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-ink-950 transition-transform duration-300 hover:scale-[1.04]"
              >
                {project.liveLabel || 'Open live'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium text-white/80 transition-colors hover:text-white"
              >
                <ToolLogo slug="github" name="GitHub" size={14} />
                Repository
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Projects"
            title="Things I designed and shipped."
            lede="Freelance and independent work: products, client sites and prototypes, built end to end outside the day job."
            progress={progress}
          />

          <Reveal className="-mt-6 mb-10 flex flex-wrap items-center gap-2.5">
            <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium text-white/80">
              <Briefcase className="h-3 w-3 text-glow-violet" />
              Freelance · Available for projects
            </span>
            <span className="text-[12px] text-white/40">
              Strategy, build and measurement, by the project or on retainer.
            </span>
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProjectCard
                key={p.slug}
                project={p}
                progress={progress}
                depth={24}
                delay={i * 0.06}
                featured
              />
            ))}

            {rest.map((p, i) => (
              <ProjectCard
                key={p.slug}
                project={p}
                progress={progress}
                depth={CARD_DEPTH}
                delay={(i % 3) * 0.05}
              />
            ))}
          </div>

          <Reveal delay={0.1} className="mt-10 text-center">
            <a
              href="https://github.com/ismail-bellakhel"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:text-white"
            >
              <ToolLogo slug="github" name="GitHub" size={16} />
              All repositories on GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>
      )}
    </Section>
  );
}
