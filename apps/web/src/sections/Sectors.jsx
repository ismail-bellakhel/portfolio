import { icon } from '@/lib/icons';
import {
  GlassCard,
  Section,
  SectionHeading,
  CARD_DEPTH,
} from '@/components/primitives';
import { Flag } from '@/components/Logo';
import { markets, sectors } from '@/data/content';

export default function Sectors() {
  return (
    <Section id="sectors">
      {(progress) => (
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Sector Experience"
            title="Six industries, one method."
            lede="Growth, measurement and marketing systems built across news media, real estate, EdTech, fitness, telecoms and automotive retail, in eight markets."
            progress={progress}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s, i) => {
              const Icon = icon(s.icon);
              return (
                <GlassCard
                  key={s.key}
                  progress={progress}
                  depth={CARD_DEPTH}
                  delay={(i % 3) * 0.06}
                  className="group flex min-h-[256px] flex-col p-7"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <span className="glass-pill flex h-11 w-11 items-center justify-center rounded-2xl">
                      <Icon className="h-[18px] w-[18px] text-white/75" />
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[10.5px] text-white/55">
                      {s.metric}
                    </span>
                  </div>

                  <h3 className="mb-2.5 text-[17px] font-semibold tracking-tight text-white/95">
                    {s.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-muted">{s.description}</p>
                </GlassCard>
              );
            })}
          </div>

          {/* Markets band: real flags, scrolling */}
          <div className="edge-fade-x relative mt-16 overflow-hidden">
            <div className="flex w-max animate-marquee gap-10">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 gap-10" aria-hidden={dup === 1}>
                  {markets.map((m) => (
                    <div key={m.code} className="flex items-center gap-3">
                      <Flag code={m.code} name={m.name} size={26} />
                      <span className="whitespace-nowrap text-[13px] font-medium tracking-tight text-white/45">
                        {m.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
