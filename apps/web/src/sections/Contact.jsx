import { ArrowUpRight, Download, Mail, Phone } from 'lucide-react';
import {
  GlassCard,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/primitives';
import { ToolLogo } from '@/components/Logo';
import Presence from '@/components/Presence';
import { languages, profile, writing } from '@/data/content';

const channels = [
  { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  ...profile.phones.map((p) => ({
    icon: Phone,
    label: p.label,
    value: p.value,
    href: `tel:${p.value.replace(/\s/g, '')}`,
  })),
  { slug: 'linkedin', label: 'LinkedIn', value: '/in/ismailbellakhel', href: profile.linkedin },
  { slug: 'github', label: 'GitHub', value: '@ismail-bellakhel', href: profile.github },
];

export default function Contact() {
  return (
    <Section id="contact" className="pb-20 md:pb-24">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Contact"
            title="Let's build the system."
            lede="Open to growth, analytics and AI marketing roles across the Nordics and remote-first teams in Europe."
            progress={progress}
          />

          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            {/* Primary call to action */}
            <GlassCard progress={progress} depth={28} className="flex flex-col p-6 sm:p-10">
              <h3 className="display mb-5 text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] text-white">
                Tell me what you&apos;re measuring.
              </h3>
              <p className="mb-9 max-w-md text-[14.5px] leading-relaxed text-muted">
                {profile.longSummary}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-2.5">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-ink-950 transition-transform duration-300 hover:scale-[1.04]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Get in touch
                </a>
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download CV
                </a>
              </div>
            </GlassCard>

            {/* Channels */}
            <GlassCard progress={progress} depth={-24} delay={0.06} className="p-6 sm:p-8">
              <div className="eyebrow mb-5">Direct</div>
              <div className="space-y-2">
                {channels.map(({ icon: Icon, slug, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-3.5 rounded-xl bg-white/[0.035] px-3.5 py-3 ring-1 ring-white/[0.06] transition-colors duration-300 hover:bg-white/[0.07]"
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 shrink-0 text-white/50 transition-colors group-hover:text-glow-cyan" />
                    ) : (
                      <ToolLogo slug={slug} name={label} size={16} className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] uppercase tracking-[0.14em] text-white/35">
                        {label}
                      </span>
                      <span className="block truncate text-[13px] font-medium text-white/80">
                        {value}
                      </span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </a>
                ))}
              </div>
            </GlassCard>

            {/* Languages */}
            <GlassCard progress={progress} depth={22} delay={0.04} className="p-6 sm:p-7">
              <div className="eyebrow mb-5">Languages</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {languages.map((l) => (
                  <div
                    key={l.name}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.035] px-3.5 py-2.5 ring-1 ring-white/[0.06]"
                  >
                    <span className="text-[13px] font-medium text-white/85">{l.name}</span>
                    <span className="font-mono text-[11px] text-white/50">{l.level}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Writing */}
            <GlassCard progress={progress} depth={-20} delay={0.1} className="p-6 sm:p-7">
              <div className="eyebrow mb-4">{writing.title}</div>
              <p className="text-[13px] leading-relaxed text-muted">{writing.description}</p>
            </GlassCard>
          </div>

          {/* Footer */}
          <Reveal
            delay={0.1}
            className="mt-16 flex flex-col items-center gap-5 border-t border-white/[0.07] pt-9 sm:flex-row sm:justify-between"
          >
            {/* The closing signature, matching the line that opens the hero.
                Not profile.role: that is the job title and it still belongs in
                the page metadata and the CV. */}
            <div className="text-[12px] text-white/35">
              © {new Date().getFullYear()} {profile.name} · Marketing &amp; AI
              Consultancy
            </div>
            <Presence />
          </Reveal>
        </div>
      )}
    </Section>
  );
}
