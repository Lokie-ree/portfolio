# Randall LaPoint — Portfolio

Interactive learning designer portfolio. Built with React 19 + Three.js + GSAP + Tailwind CSS v4.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Three Fiber** + **Three.js** — hero geometric field, module card previews
- **GSAP ScrollTrigger** — section reveal animations
- **Tailwind CSS v4** — utility classes + CSS design tokens
- **Google Fonts** — Fraunces (display) + DM Sans (body)

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

## Project Structure

```
src/
  components/
    HeroCanvas.tsx          # Three.js geometric field (parallax mouse)
    RigidMotionsPreview.tsx # Mini R3F scene — reflection animation
    DilationsPreview.tsx    # Mini R3F scene — dilation pulse animation
    ModuleCard.tsx          # Card with embedded R3F preview + hover state
  hooks/
    useScrollReveal.ts      # GSAP ScrollTrigger section reveal hook
  tokens.ts                 # Design tokens (shared CSS + Three.js hex)
  App.tsx                   # Main layout + all sections
  index.css                 # Global styles + Tailwind v4 @theme tokens
  r3f.d.ts                  # line_ element declaration for R3F/TS
```

## Design Tokens (`src/tokens.ts`)

All colors defined once in `tokens.ts` and referenced as:
- CSS: `oklch(...)` values in `index.css` `@theme` block
- Three.js: hex equivalents in `tokens.three`

## Before Deploying

1. Update module card `href` values to your actual Creative Lab URL
2. Replace placeholder about copy in `App.tsx` with your final voice
3. Verify email address in ISTE + contact sections
4. Run `npm run build` — deploy `dist/` to Vercel

## Rounds Left to Build

- [ ] Round 3: Mobile responsive pass (grid → single column at 520px)
- [ ] Round 4: Hover pause wired to ModuleCard previews (pass `paused={hovered}` into previews)
- [ ] Round 5: GSAP hero text entrance animation (stagger in on load)
- [ ] Round 6: ISTE section polish + final copy review
- [ ] Round 7: Lighthouse + Vercel deploy
