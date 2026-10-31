import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { profile, sections } from '@/data/content';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -40 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export default function Nav({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Progress hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: bar }}
        className="fixed left-0 top-0 z-50 h-px w-full origin-left bg-gradient-to-r from-glow-blue via-glow-cyan to-glow-violet"
      />

      {/* Top bar. The glass lives on this element itself, never a wrapper. */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-500',
          scrolled ? 'py-2.5' : 'py-5',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6',
            scrolled &&
              'glass rounded-full py-2 pl-5 pr-2 sm:pl-6 max-w-5xl backdrop-saturate-150',
          )}
        >
          <button
            onClick={() => scrollToId('hero')}
            className="group flex items-center gap-2.5 text-left"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-mint opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-glow-mint" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight text-white/90">
              {profile.name}
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {sections.slice(1, -1).map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToId(s.id)}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-300',
                  active === s.id ? 'text-white' : 'text-white/45 hover:text-white/80',
                )}
              >
                {active === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.09]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{s.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={profile.cv}
              download
              className="glass-pill hidden items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium text-white/85 transition-colors hover:text-white sm:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              CV
            </a>
            <button
              onClick={() => scrollToId('contact')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
            >
              Contact
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Section rail: the visible spine of the page. */}
      <nav
        aria-label="Sections"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
      >
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToId(s.id)}
              className="group flex items-center gap-2.5"
              aria-label={s.label}
              aria-current={on ? 'true' : undefined}
            >
              <span
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.18em] transition-all duration-400',
                  on
                    ? 'text-white/75 opacity-100'
                    : 'text-white/40 opacity-0 group-hover:opacity-100',
                )}
              >
                {s.label}
              </span>
              <span
                className={cn(
                  'block rounded-full transition-all duration-500',
                  on
                    ? 'h-5 w-[3px] bg-white shadow-[0_0_12px_2px_rgba(147,197,253,0.7)]'
                    : 'h-[3px] w-[3px] bg-white/30 group-hover:bg-white/60',
                )}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
