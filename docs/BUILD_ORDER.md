# Portfolio — Build Order Prompts

**For use with:** Claude Code  
**Prerequisite:** `CREATIVE_DIRECTION.md` is in the repo. Reference it before each round.  
**Rule:** Complete each round fully before starting the next. Run `npm run build` after every round.

---

## Round 1 — Dark Palette + Token Migration

**Goal:** Flip the entire palette to dark. Nothing else.

```
Read CREATIVE_DIRECTION.md § Palette.

Update src/tokens.ts with the full dark palette — both CSS oklch values and Three.js hex 
equivalents exactly as specified in the doc.

Update src/index.css:
- Replace all --color-* values with the dark palette
- body background: var(--color-ground)
- body color: var(--color-ink)

Update src/App.tsx:
- Replace every inline oklch value with the correct token name
- Ensure ALL text uses --color-ink or --color-muted — no raw white, no raw black

Update all three component files (HeroCanvas, RigidMotionsPreview, DilationsPreview, ModuleCard):
- Replace tokens.three.* references with the new dark hex values from CREATIVE_DIRECTION.md

Run npm run build. Fix any errors. Do not move to Round 2 until the build is clean and 
the page renders correctly in dark palette.
```

---

## Round 2 — Hero Canvas Upgrade

**Goal:** Full hero canvas as specified — entrance animation, ambient glow, performance cap.

```
Read CREATIVE_DIRECTION.md § Hero Canvas — Revised Spec and § Ambient Glow.

Update src/components/HeroCanvas.tsx:

1. Add pixelRatio cap: gl={{ pixelRatio: Math.min(window.devicePixelRatio, 2) }}

2. Vary polygon opacity by z-depth: deeper polygons (z < -2) get opacity 0.08-0.12, 
   shallower (z > -1.5) get 0.18-0.22. Encode this in the POLYS config array as an 
   'opacity' field.

3. Add load entrance: After canvas mounts, use gsap.fromTo on each polygon mesh to animate
   from { opacity: 0 } to { opacity: targetOpacity } with stagger 0.08s, duration 1.4s,
   ease 'power3.out'. Use useEffect with a 300ms delay after mount.
   Access meshes via a refs array: const polyRefs = useRef<THREE.Group[]>([])

4. Add the .hero-glow div inside HeroCanvas, exactly as specified in § Ambient Glow.
   This is a CSS div, not a Three.js element.

5. In App.tsx hero section: wrap HeroCanvas output so the glow sits behind the canvas
   in z-order.

Run npm run build. Verify entrance animation fires once on load.
```

---

## Round 3 — Module Cards Full Redesign

**Goal:** Cards match the revised spec — full-height R3F, dark surface, hover glow, pause on hover.

```
Read CREATIVE_DIRECTION.md § Module Cards — Revised Spec.

Update src/components/ModuleCard.tsx:

1. The component receives a `paused` prop (already exists). Wire it: 
   pass paused={hovered} to the preview child. The preview components already 
   accept a paused prop — this just needs to flow through.

2. Card background: --color-surface (not --color-ground). On hover: --color-surface-hi.

3. Remove the fixed 160px preview height. The R3F canvas fills the top portion of the card
   naturally — set it to 200px minimum, or use a percentage. Text overlays at bottom.

4. Add the ::after glow pseudo-element from § Ambient Glow — Module card hover.
   Since this is a React component with inline styles, implement via a CSS class in 
   index.css: .module-card { position: relative; overflow: hidden; }
   .module-card::after { ... } exactly as specified.

5. Hover state changes:
   - Border: 1px solid --color-amber (all sides, appears on hover)
   - Arrow: translateX(4px) on hover, use CSS transition

6. Add a thin amber accent line at the very top of each card (3px height, full width,
   background: --color-amber-dim). This is the card's "label" in the dark palette —
   a physical marker that something live is inside.

Run npm run build. Hover both cards and verify: glow appears, animation pauses, 
border appears, arrow shifts.
```

---

## Round 4 — Stat Strip

**Goal:** Living numbers between module grid and proof block.

```
Read CREATIVE_DIRECTION.md § The Work is Quantified — Living Numbers.

Create src/hooks/useCountUp.ts:
  A hook that takes (target: number, duration = 1.2) and returns a current value.
  Uses gsap.to on a plain object { val: 0 } with onUpdate to set state.
  Fires when an IntersectionObserver detects the element entering the viewport (threshold 0.5).
  Only fires once (disconnect after trigger).

Create src/components/StatStrip.tsx:
  Renders a 4-column grid (2×2 on mobile) of stat cells.
  Each cell: large Fraunces italic number (animated via useCountUp) + DM Sans label.
  Stats: { value: 2, label: 'Modules complete' }, { value: 14, label: 'Rounds in M2 alone' },
         { value: 4, label: 'Phases per module' }, { value: 150, label: 'Student sessions logged', prefix: '~' }
  Grid has 1px gaps with --color-rule background (same guttered-grid pattern as module cards).
  Dark surface background --color-surface on each cell.
  Number color: --color-amber. Label color: --color-muted.

Add <StatStrip /> to WorkSection in App.tsx between the module grid and the proof block.
Add className="reveal-target" to StatStrip wrapper for ScrollTrigger pickup.

Run npm run build. Scroll to the stats and verify numbers count up from 0.
```

---

## Round 5 — GSAP Scroll Choreography

**Goal:** Implement the full choreography map from CREATIVE_DIRECTION.md.

```
Read CREATIVE_DIRECTION.md § Cinematic Scroll Choreography — full table.

Update src/hooks/useScrollReveal.ts:

1. Add a useHeroEntrance() hook:
   On mount, uses gsap.timeline() to stagger in hero elements in order:
   - .hero-label (the "Interactive Learning Designer" tag)
   - h1
   - .hero-sub (the paragraph)  
   - .hero-proof (the amber pill)
   Each: fromTo { opacity: 0, y: 30 } → { opacity: 1, y: 0 }, duration 0.65, ease 'power3.out'
   Stagger 0.18s between elements. Timeline starts with delay: 0.5 (after canvas entrance).
   Use gsap.set() in a useLayoutEffect to set initial states BEFORE paint.

2. Update useScrollReveal to use gsap.set() for initial states (not CSS class):
   In useEffect, FIRST call gsap.set(targets, { opacity: 0, y: 40 }), 
   THEN register ScrollTrigger. This prevents flash.

3. Add useProofBlockReveal():
   Targets the proof block's left border. Animates scaleY from 0→1 (transform-origin: top)
   over 0.4s, then fades in the text children 0.2s later.
   Implement via a ref on the proof block div.

4. Add useISTEEntrance():
   Splits "ISTE Live 26" into individual characters using a simple split:
   const chars = "ISTE Live 26".split('').map((c, i) => <span key={i}>{c}</span>)
   Animate each span: fromTo { opacity: 0, y: 20 } → { opacity: 1, y: 0 }
   Stagger 0.04s. The "26" group (last 2 chars) has an additional 80ms delay.
   Fire on ScrollTrigger start: 'top 70%'.

Update App.tsx:
- Call useHeroEntrance() in the App component
- Apply useProofBlockReveal() ref to the proof block
- Apply useISTEEntrance() ref to the ISTE date element
- Replace the raw "ISTE Live 26" p tag with the character-split version

Run npm run build. Walk through the full page scroll and verify each entrance fires correctly.
Confirm no flash of unstyled content on load.
```

---

## Round 6 — ISTE Section + Coordinate Grid Background

**Goal:** ISTE section feels like an invitation, not a footer. Coordinate grid background.

```
Read CREATIVE_DIRECTION.md § ISTE Section — Revised Spec.

Create src/components/CoordGridBackground.tsx:
  A simple SVG component that renders a grid of lines.
  Props: { width, height, unit = 40, color = '--color-amber', opacity = 0.04 }
  Renders horizontal and vertical lines at every `unit` interval.
  Positioned absolute, inset 0, pointer-events: none, z-index: 0.
  Use viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice".
  All content inside the ISTE section gets position: relative, z-index: 1.

Update the ISTE section in App.tsx:
  1. Wrap in a position: relative container
  2. Add <CoordGridBackground /> as first child
  3. Update button: background --color-amber-dim, color --color-ink
     Hover: background --color-amber, scale 1.02 (CSS transform transition)
  4. The "ISTE Live 26" element needs id="iste-date" for useISTEEntrance to target it
  5. Increase section padding to 80px top/bottom — this section needs to breathe

Run npm run build. Verify grid is visible but subtle. Verify button hover is confident.
```

---

## Round 7 — Mobile Pass

**Goal:** Everything works and feels intentional at 375px, 520px, and 768px.

```
Read CREATIVE_DIRECTION.md § Mobile — Adapt, Don't Amputate.

Add responsive breakpoints throughout src/App.tsx and src/components/:

At ≤520px (add a useWindowWidth hook or CSS media queries in index.css):
  - Module grid: grid-template-columns: 1fr
  - About grid: grid-template-columns: 1fr (meta above body, gap: 24px)
  - Pelican row: grid-template-columns: 1fr
  - ISTE inner: grid-template-columns: 1fr, button text-align: left
  - Hero h1: font-size clamp(32px, 9vw, 44px)
  - Stat strip: grid-template-columns: 1fr 1fr (2×2)
  - HeroCanvas: reduce POLYS array to first 7 entries at mobile widths
  - HeroCanvas: disable mouse parallax on touch devices 
    (detect via: window.matchMedia('(pointer: coarse)').matches)

At ≤768px:
  - Main container padding: 0 32px

Verify on Chrome DevTools at iPhone SE (375px), standard mobile (390px), and iPad (768px).
Each section should read clearly with no overflow, no clipping, no text collision.

Run npm run build. Final production build should be clean with no TypeScript errors.
```

---

## Round 8 — Polish + Vercel Deploy

**Goal:** Lighthouse score, final copy review, deploy.

```
Performance:
  1. Add React.lazy() + Suspense for all three R3F components (HeroCanvas, 
     RigidMotionsPreview, DilationsPreview). Fallback: a div with background --color-surface.
  2. Add <link rel="preconnect" href="https://fonts.googleapis.com"> to index.html
  3. Add <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> to index.html
  4. Verify vite.config.ts has manual chunk splitting for 'three' and 'gsap'

Copy review (human task — do not automate):
  - Read every word of the About section aloud. Rewrite anything that doesn't sound like you.
  - Update both module card href values to the actual Creative Lab URL
  - Confirm email address in ISTE and Contact sections
  - Confirm ISTE dates are correct

Deploy:
  1. Push to GitHub
  2. Connect repo to Vercel
  3. Set project name to something clean (e.g. randall-lapoint or your preferred domain slug)
  4. Deploy. Get the URL. Test on a real phone via QR code.
  5. If you have a custom domain, configure it in Vercel dashboard.

Final check: open on your phone, hand it to someone who doesn't know what Creative Lab is,
watch where their eyes go and what they ask first.
```

---

## Reference: File Map After All Rounds Complete

```
src/
  components/
    HeroCanvas.tsx              # Dark palette, entrance anim, ambient glow, pixelRatio cap
    RigidMotionsPreview.tsx     # Dark materials, paused prop wired
    DilationsPreview.tsx        # Dark materials, paused prop wired
    ModuleCard.tsx              # Full redesign — dark, hover glow, pause, amber accent
    StatStrip.tsx               # Living number stats (NEW)
    CoordGridBackground.tsx     # SVG coordinate grid for ISTE section (NEW)
  hooks/
    useScrollReveal.ts          # useScrollReveal, useNavReveal, useHeroEntrance,
                                # useProofBlockReveal, useISTEEntrance
    useCountUp.ts               # IntersectionObserver + GSAP count animation (NEW)
  tokens.ts                     # Dark palette — CSS values + Three.js hex
  App.tsx                       # Full layout, all section components
  index.css                     # Dark palette @theme, .module-card CSS, global base
  r3f.d.ts                      # line_ element declaration
  main.tsx                      # Entry point
```

---

## NOT DOING (scope boundary for this repo)

- No page transitions / route animations — single page only
- No dark/light toggle — dark is the design
- No CMS or dynamic content — all copy is hardcoded
- No analytics until after ISTE
- No contact form — email link only
- No blog or writing section — that's a post-ISTE project
- No Three.js post-processing (bloom, EffectComposer) — two glows max, CSS only