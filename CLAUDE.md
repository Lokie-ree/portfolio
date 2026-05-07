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

Single-page portfolio app. All content lives in `src/App.tsx` as self-contained section components (`WorkSection`, `LiveDemoSection`, `SystemSection`, `AboutSection`, `PelicanSection`, `ISTESection`, `ContactSection`, `Footer`). No router.

**Three.js layer** — Three separate React Three Fiber `<Canvas>` roots (R3F 9 + Three.js ~0.183):
- `HeroCanvas` — full-viewport canvas positioned `absolute inset-0` behind hero text; animated wireframe polygons with parallax mouse tracking via `ParallaxCamera`; GSAP entrance on polygon opacity and z; CSS `.hero-glow`; DPR capped with `dpr={Math.min(window.devicePixelRatio, 2)}` on `<Canvas>`.
- `RigidMotionsPreview` — `useRef<THREE.Group>`, animates `position.x` in `useFrame`. Two triangles (pre-image ink + reflected amber) oscillating across a reflection axis.
- `DilationsPreview` — `useRef<THREE.Group>`, animates `scale.setScalar(k)`. Origin dot + dilation rays + pre-image + dilated amber image.
- `PythagoreanTheoremPreview` — single `useRef<THREE.Group>` wrapping all geometry (triangle, right angle marker, three squares). Scale animation pulses the whole composition. Canvas sprite labels (a², b², c²) via `THREE.Sprite` + `CanvasTexture` — no troika-three-text dependency.
- `CrossSectionPreview` — live plane-cube intersection geometry (plane `x+y+z=k` sweeps through unit cube); 12 individual edge lines with per-edge amber highlight on intersection; convex polygon fill + outline + vertex dots; 6s orchestrated animation cycle (triangle → hexagon hold → triangle). `paused` freezes the cycle at current `k`.

All preview components are lazy-loaded via `React.lazy` + `Suspense`. Each is embedded in `ModuleCard` which wraps the preview in `<Suspense>` and passes `paused={hovered}` via `cloneElement`. The `Suspense` boundary lives inside `ModuleCard` — do not add it to the `preview` prop at the call site.

**Scroll animations** — `useScrollReveal` attaches a GSAP ScrollTrigger to a section ref; any child with class `reveal-target` fades+slides in on scroll. `useNavReveal` slides the fixed nav in after the hero clears the viewport. The `.reveal-target` class sets `opacity: 0; transform: translateY(40px)` in CSS — this initial state is required for the animation to work.

**Design tokens** — `src/tokens.ts` is the single source of truth. Colors are defined twice: as `oklch(...)` strings for inline styles/CSS, and as hex values under `tokens.three` for Three.js materials. `src/index.css` mirrors these into Tailwind v4 `@theme` CSS custom properties.

**Path alias** — `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

**R3F wireframe primitives** — Wire loops use the built-in JSX primitive `<line>` (maps to `THREE.Line`), with `<bufferGeometry>`, `<bufferAttribute attach="attributes-position" … />`, and `<lineBasicMaterial>`. Do not use `<threeLine>`; R3F 9 rejects it at runtime ("not part of the THREE namespace"). Types come from `@react-three/fiber`; no local `.d.ts` shim is required.

**Module card styling** — Cards use the `module-card` class in `index.css` (`::after` hover glow). Disabled cards pass `data-disabled="true"` to suppress the glow via a CSS attribute rule. Hover classes are conditionally applied via Tailwind template literals (not inline styles). `ModuleCard` root is always `<div>`; navigation is via inner `<a>` elements to avoid nested-anchor violations.

**SystemSection** — Two-row layer stack grid (`SYSTEM_ROWS` data constant + `SystemSection` component in `App.tsx`). Outer `flex flex-col gap-px bg-rule border border-rule` with inner `gap-px bg-rule` rows — the rule color bleeds through `gap-px` to form visible cell dividers. Label column is fixed `160px`; three module columns share remaining space equally at `min-[521px]:grid-cols-[160px_1fr_1fr_1fr]`.

## Build status

Pre-ISTE implementation is near-final. Branch strategy: feature branches → PR → merge to master.

**Completed:**
- Rounds 1–8 (initial commit): dark palette, hero canvas, module cards, stat strip, GSAP scroll choreography, ISTE section, mobile pass, lazy R3F + Vite chunking
- Step 1: Work section 3-card grid — Pythagorean Theorem card, `ModuleCard` refactor, stat strip update
- Step 2: The System section — two-row layer stack grid with scroll entrance
- Step 4: Live Demo section — `LiveDemoSection` + `CrossSectionPreview`
- Step 5: Act Break section + `CrossSectionPreview` live intersection geometry overhaul
- Spec-gap items implemented in app: scroll progress bar, footer, hero proof pill glow, nav hover color transition, 3-act About narrative
- Polish: hover-pause fix on Work cards, Hero lint errors resolved, System section enriched with descriptions + status dots, Pelican AI link added

**Remaining:**
- Vercel deploy (copy review is a manual human task before deploy)

## Lint status

`pnpm run lint` exits with code 0 — no errors. Do not introduce new errors.

## Git workflow

- Feature branches: `feat/<description>` or `docs/<description>`
- One branch per implementation step
- Commit on branch → PR → merge to master
