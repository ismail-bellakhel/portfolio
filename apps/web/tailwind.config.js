/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05060a',
          900: '#080a12',
          850: '#0b0e18',
          800: '#10141f',
        },
        glow: {
          blue: '#60a5fa',
          cyan: '#22d3ee',
          mint: '#34d399',
          violet: '#a78bfa',
          amber: '#fbbf24',
        },
      },
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        /*
          A cardiac rhythm, not a metronome. Tailwind's `animate-ping` fires
          one evenly spaced ring every second, which reads as a generic
          blinking indicator. A heart beats twice in quick succession, the
          loud "lub" then the softer "dub", then rests for most of the cycle.

          There are two ring elements rather than two beats inside one
          keyframe. A single ring cannot expand twice per cycle without
          snapping back to scale(1) in between, and the only way to hide that
          snap is to make each expansion short, which is what went wrong the
          first time: the ring grew and vanished inside 264ms, too fast to
          read as a ring at all, so only the dot looked animated. Each ring
          below gets a full 1s to travel out and fade, and the second one is
          offset by 340ms in its own `animation-delay` to land on the second
          beat. They overlap, which is what gives the pair its double-tap.

          Everything shares the 2.2s period so the rings and the dot stay
          locked together, and all three rest for the back half of it.
        */
        heartring: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '45%': { transform: 'scale(3.1)', opacity: '0' },
          '100%': { transform: 'scale(3.1)', opacity: '0' },
        },
        // The softer second beat: starts dimmer and does not travel as far.
        'heartring-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.38' },
          '42%': { transform: 'scale(2.5)', opacity: '0' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        heartdot: {
          '0%, 100%': { transform: 'scale(1)' },
          '8%': { transform: 'scale(1.32)' },
          '16%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.16)' },
          '35%': { transform: 'scale(1)' },
        },
      },
      animation: {
        marquee: 'marquee 45s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
        heartring: 'heartring 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'heartring-soft':
          'heartring-soft 2.2s cubic-bezier(0, 0, 0.2, 1) 0.34s infinite',
        heartdot: 'heartdot 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
