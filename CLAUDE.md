# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev       # dev server at http://localhost:5173
pnpm run build     # tsc -b && vite build → dist/
pnpm run lint      # eslint .
pnpm run preview   # preview the dist/ build
```

Package manager is pnpm (pnpm-lock.yaml present), but the scripts above work with npm as well.

## Architecture

Single-page portfolio app. All content lives in `src/App.tsx` as self-contained section components (`WorkSection`, `AboutSection`, `PelicanSection`, `ISTESection`, `ContactSection`). No router.

**Three.js layer** — Three separate React Three Fiber `<Canvas>` roots (R3F 9 + Three.js ~0.183):
- `HeroCanvas` — full-viewport canvas positioned `absolute inset-0` behind hero text; animated wireframe polygons with parallax mouse tracking via `ParallaxCamera`; GSAP entrance on polygon opacity and z; CSS `.hero-glow`; DPR capped with `dpr={Math.min(window.devicePixelRatio, 2)}` on `<Canvas>`.
- `RigidMotionsPreview` / `DilationsPreview` — embedded in `ModuleCard` with `minHeight: 200px` preview region, `opacity` 0.35 → 1 on hover. `ModuleCard` passes `paused={hovered}` via `cloneElement` so `useFrame` animations stop while the pointer is over the card.

**Scroll animations** — `useScrollReveal` attaches a GSAP ScrollTrigger to a section ref; any child with class `reveal-target` fades+slides in on scroll. `useNavReveal` slides the fixed nav in after the hero clears the viewport. The `.reveal-target` class sets `opacity: 0; transform: translateY(40px)` in CSS — this initial state is required for the animation to work.

**Design tokens** — `src/tokens.ts` is the single source of truth. Colors are defined twice: as `oklch(...)` strings for inline styles/CSS, and as hex values under `tokens.three` for Three.js materials. `src/index.css` mirrors these into Tailwind v4 `@theme` CSS custom properties. The `s` object duplicated at the top of `App.tsx` and `ModuleCard.tsx` is a local shorthand — changes to the palette should go to `tokens.ts` first.

**Path alias** — `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

**R3F wireframe primitives** — Wire loops use the built-in JSX primitive `<line>` (maps to `THREE.Line`), with `<bufferGeometry>`, `<bufferAttribute attach="attributes-position" … />`, and `<lineBasicMaterial>`. Do not use `<threeLine>`; R3F 9 rejects it at runtime (“not part of the THREE namespace”). Types come from `@react-three/fiber`; no local `r3f.d.ts` shim is required.

**Module card styling** — Cards use the `module-card` class in `index.css` (`::after` hover glow). Inline styles in `ModuleCard.tsx` handle surface / surface-hi, amber hover border, and arrow `translateX(4px)`.

## Build status

All 8 rounds in `docs/BUILD_ORDER.md` are complete:

- Round 1: Dark palette + token migration
- Round 2: Hero canvas — entrance animation, ambient glow, pixelRatio cap
- Round 3: Module cards — dark surface, hover glow, pause on hover, amber accent
- Round 4: Stat strip (`StatStrip`, `useCountUp`) with IntersectionObserver count-up
- Round 5: GSAP scroll choreography — `useHeroEntrance`, FOUC-free reveal, proof block + ISTE char animation
- Round 6: ISTE section + `CoordGridBackground` SVG grid
- Round 7: Mobile pass — 520px/768px breakpoints, hero poly reduction, touch parallax off
- Round 8: Lazy R3F components (`React.lazy` + `Suspense`), font preconnect, Vite manual chunks for `three` and `gsap`

**Remaining:** Vercel deploy (copy review is a manual human task before deploy)
