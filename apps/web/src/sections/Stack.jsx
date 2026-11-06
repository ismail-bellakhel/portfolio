import { icon } from '@/lib/icons';
import {
  GlassCard,
  Section,
  SectionHeading,
  CARD_DEPTH,
} from '@/components/primitives';
import { ToolLogo } from '@/components/Logo';
import { stack } from '@/data/content';

export default function Stack() {
  return (
    <Section id="stack">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Technical Stack"
            title="The tools behind the numbers."
            lede="Measurement, SEO, automation and AI. The systems I use daily to instrument, test and scale marketing."
            progress={progress}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((group, i) => {
              const Icon = icon(group.icon);
              return (
                <GlassCard
                  key={group.title}
                  progress={progress}
                  depth={CARD_DEPTH}
                  delay={(i % 4) * 0.05}
                  className="flex flex-col p-6"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="glass-pill flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="h-4 w-4 text-white/70" />
                    </span>
                    <h3 className="text-[13.5px] font-semibold leading-tight tracking-tight text-white/95">
                      {group.title}
                    </h3>
                  </div>

                  <ul className="space-y-2">
                    {group.tools.map((tool) => (
                      <li
                        key={tool.name}
                        className="group/row flex items-center gap-3 rounded-xl bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.05] transition-colors duration-300 hover:bg-white/[0.07]"
                      >
                        <ToolLogo
                          logo={tool.logo}
                          slug={tool.slug}
                          name={tool.name}
                          fallback={tool.fallback}
                          size={16}
                          className="logo-mono shrink-0"
                        />
                        <span className="text-[12.5px] font-medium text-white/65 transition-colors duration-300 group-hover/row:text-white/90">
                          {tool.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}
