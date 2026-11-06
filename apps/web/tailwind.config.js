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
          loud "lub" then the softer "dub", and then rests for most of the
          cycle. Both keyframes below share the same 2.2s period so the ring
          and the dot stay locked together: the beats land at 0% and ~20%,
          and everything past 35% is the pause.
        */
        heartring: {
          '0%': { transform: 'scale(1)', opacity: '0.65' },
          '12%': { transform: 'scale(2.2)', opacity: '0' },
          '13%': { transform: 'scale(1)', opacity: '0' },
          '19%': { transform: 'scale(1)', opacity: '0.45' },
          '34%': { transform: 'scale(2.5)', opacity: '0' },
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
        heartring: 'heartring 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        heartdot: 'heartdot 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
