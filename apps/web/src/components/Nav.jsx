import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight, Download, Menu, X } from 'lucide-react';
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
  const [menu, setMenu] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The menu only exists below lg. Crossing that breakpoint with it open would
  // otherwise leave an orphaned sheet floating over the desktop bar.
  // The page is also pinned while it is open: the sheet hangs off a fixed
  // header, so without this a stray swipe scrolls the content behind it and
  // the menu appears to float away from the page it belongs to.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => e.key === 'Escape' && setMenu(false);
    const mq = window.matchMedia('(min-width: 1024px)');
    const onWide = () => mq.matches && setMenu(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
      window.__lenis?.start();
    };
  }, [menu]);

  /*
    Lenis has to be running again before the scroll is issued, which is why
    this restarts it by hand instead of leaving that to the effect above.

    The sheet pins the page by stopping Lenis, and `setMenu(false)` only
    schedules the restart: React runs the cleanup after this function has
    already returned. Lenis drops a scrollTo outright while stopped, and
    passing `force` does not help either, because the cleanup then calls
    `start()`, which resets the instance and cancels the animation that was
    just forced. Either way the sheet closed and the page stayed where it
    was, so every shortcut on a phone did nothing.

    Starting it here first makes the later cleanup a no-op, since `start()`
    returns early when the instance is already running.
  */
  const go = (id) => {
    setMenu(false);
    window.__lenis?.start();
    scrollToId(id);
  };

  return (
    <>
      {/* Progress hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: bar }}
        className="fixed left-0 top-0 z-50 h-px w-full origin-left bg-gradient-to-r from-glow-blue via-glow-cyan to-glow-violet"
      />

      {/* Scrim. Sits under the header and over the content so the page reads
          as dismissed rather than as competing with the menu, and gives the
          sheet a tap-anywhere close. */}
      <AnimatePresence>
        {menu && (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-30 bg-ink-950/75 lg:hidden"
          />
        )}
      </AnimatePresence>

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
            {/* Two beats then a rest, from the keyframes in tailwind.config.js.
                One ring per beat, since a single ring cannot expand twice in a
                cycle without visibly snapping back between them. The second
                carries its own 340ms delay. All three share the 2.2s period so
                they stay locked together, and all three transforms sit on
                children of the glass bar, so none promotes the bar's layer. */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-heartring rounded-full bg-glow-mint" />
              <span className="absolute inline-flex h-full w-full animate-heartring-soft rounded-full bg-glow-mint" />
              <span className="relative inline-flex h-2 w-2 animate-heartdot rounded-full bg-glow-mint" />
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

            {/* Below lg the section links and the rail are both hidden, so
                without this the page has no navigation at all on a phone. */}
            <button
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-white/80 lg:hidden"
            >
              {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/*
          The sheet is glass, so its entrance animates on the sheet itself.
          Wrapping it in a fading parent would promote that parent to its own
          layer and the backdrop-filter would sample the layer's transparent
          background, painting the panel black.
        */}
        <AnimatePresence>
          {menu && (
            <motion.div
              id="mobile-menu"
              key="sheet"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-sheet mx-4 mt-2 overflow-hidden p-2 lg:hidden"
            >
              <nav aria-label="Sections" className="grid grid-cols-2 gap-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => go(s.id)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl px-3.5 py-3.5 text-left text-[14px] font-medium transition-colors duration-200',
                      active === s.id
                        ? 'bg-white/[0.1] text-white'
                        : 'text-white/60 active:bg-white/[0.06]',
                    )}
                  >
                    {s.label}
                    {active === s.id && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow-cyan" />
                    )}
                  </button>
                ))}
              </nav>

              <a
                href={profile.cv}
                download
                onClick={() => setMenu(false)}
                className="mt-1.5 flex items-center justify-center gap-2 rounded-xl bg-white/[0.09] px-3.5 py-3.5 text-[14px] font-medium text-white/90 sm:hidden"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </motion.div>
          )}
        </AnimatePresence>
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
