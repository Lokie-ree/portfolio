# Randall LaPoint, Jr. — Interactive Learning Designer

Portfolio site for an interactive learning designer. Built with React 19 + Three.js + GSAP + Tailwind CSS v4.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Three Fiber** + **Three.js** — hero geometric field, module card previews
- **GSAP ScrollTrigger** — section reveal animations
- **Tailwind CSS v4** — utility classes + CSS design tokens
- **Google Fonts** — Fraunces (display) + DM Sans (body)

## Current Status

- Completed: Work 3-card grid, Live Demo section, System section, About 3-act narrative, ISTE coordinate grid treatment, scroll choreography, responsive pass
- Remaining: Act Break section between Work and System, final copy review, deployment

## Getting Started

```bash
pnpm install
pnpm run dev        # http://localhost:5173
pnpm run build      # production build
pnpm run lint       # eslint
```

## Project Structure

```
src/
  components/
    HeroCanvas.tsx               # Three.js geometric field (parallax mouse)
    RigidMotionsPreview.tsx      # R3F scene — reflection animation
    DilationsPreview.tsx         # R3F scene — dilation scale animation
    PythagoreanTheoremPreview.tsx # R3F scene — three squares, unified scale pulse
    CrossSectionPreview.tsx       # R3F scene — cube slicing demo preview
    ModuleCard.tsx               # Card with embedded R3F preview + hover state
    StatStrip.tsx                # Animated stat counters (IntersectionObserver)
    CoordGridBackground.tsx      # SVG coordinate grid for ISTE section
  hooks/
    useScrollReveal.ts           # GSAP ScrollTrigger reveal + nav + hero entrance hooks
    useCountUp.ts                # Count-up animation hook
  tokens.ts                      # Design tokens (shared CSS + Three.js hex)
  App.tsx                        # Main layout + all section components
  index.css                      # Global styles + Tailwind v4 @theme tokens
```

## Design Tokens (`src/tokens.ts`)

Single source of truth for the color palette:
- **CSS**: `oklch(...)` values mirrored into `index.css` `@theme` as Tailwind custom properties
- **Three.js**: hex equivalents in `tokens.three` for material colors

## Before Deploying

1. Run `pnpm run build` — deploy `dist/` to Vercel
2. Verify copy in `App.tsx` is final
3. Confirm email address in ISTE and Contact sections
