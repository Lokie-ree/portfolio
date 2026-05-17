# Randall LaPoint, Jr. — Interactive Learning Designer

Portfolio site for an interactive learning designer. Built with React 19 + Three.js + GSAP + Tailwind CSS v4.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Three Fiber** + **Three.js** — hero geometric field, module card previews
- **GSAP ScrollTrigger** — section reveal animations
- **Tailwind CSS v4** — utility classes + CSS design tokens
- **Google Fonts** — Fraunces (display) + DM Sans (body)

## Current Status

Feature-complete. All sections implemented and passing lint + build.

- Completed: Work 3-card grid (hover-pause), Live Demo section (live intersection geometry), Act Break, System section, About 3-act narrative, ISTE coordinate grid, scroll choreography, responsive pass, Pelican AI link
- Remaining: final copy review (About narrative, Act Break quote), Vercel deploy

## Getting Started

```bash
pnpm install
pnpm run dev        # http://localhost:5173
pnpm run build      # generate OG assets + production build
pnpm run lint       # eslint
```

`pnpm run build` executes `scripts/gen-og.mjs` before TypeScript/Vite bundling. That script reads `src/assets/logo-hexagon.svg` to generate `public/og-image.png` and `public/apple-touch-icon.png`.

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
4. Confirm `src/assets/logo-hexagon.svg` is tracked in git (`git ls-files src/assets/logo-hexagon.svg`)

## Troubleshooting Vercel Build ENOENT

If Vercel reports:

`ENOENT: no such file or directory, open '/vercel/path0/src/assets/logo-hexagon.svg'`

then the OG generation script cannot find a committed copy of the logo SVG. Fix:

```bash
git add src/assets/logo-hexagon.svg
git commit -m "track logo asset used by OG generation"
git push
```

Redeploy after push.
