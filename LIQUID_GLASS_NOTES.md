# Liquid Glass UI — Implementation Notes

Target aesthetic: iOS 26 / Apple Liquid Glass — light refraction borders, frosted glass panels, fluid morphing cards, glassy nav bars and widgets.

---

## Candidate libraries

### 1. `rdev/liquid-glass-react`
- React-native component wrapping the liquid glass shader effect.
- Usage: wrap any card, panel, or nav element with `<LiquidGlass>`.
- Install: `npm install liquid-glass-react`
- Best for: hero cards, floating nav, modal overlays.

### 2. `dashersw/liquid-glass-js`
- Vanilla JS / framework-agnostic. Applies a WebGL-based refraction shader to a DOM element.
- Can be wired into React via a `useEffect` + `ref`.
- Install: `npm install liquid-glass-js`
- Best for: full-bleed hero backgrounds, section dividers.

### 3. `numbing/apple-liquid-glass-ui`
- Tailwind-compatible utility classes and CSS variables that replicate Apple's glass surfaces from WWDC 2026.
- Drop-in replacement for existing `glass-panel` classes already used in this project.
- Install: `npm install apple-liquid-glass-ui`
- Best for: the easiest migration path — this project already uses `glass-panel` and `backdrop-blur-xl` classes that map closely.

---

## Recommended path for this project

1. **Start with `apple-liquid-glass-ui`** — it's Tailwind-compatible and the existing `glass-panel` / `glass-glow` / `backdrop-blur-xl` classes in `HeroSection.jsx`, the nav, and cards can be swapped incrementally without restructuring.
2. Add `liquid-glass-react` for the hero image frame and any floating widgets where the refraction border effect is most visible.
3. Use `liquid-glass-js` only if a full-bleed shader background is desired.

## Components to target first (in order)

| Component | Current class | Liquid Glass target |
|-----------|--------------|---------------------|
| Nav / header | `glass-panel` | Refraction border + blur |
| Hero caption card | `glass-panel backdrop-blur-xl` | Morphing glass widget |
| Case study cards | standard card border | Light-refraction border |
| Section badges | `glass-panel rounded-full` | Pill glass with shimmer |

## Do not apply until approved
No library has been installed and no UI has been changed. Approval required before proceeding.
