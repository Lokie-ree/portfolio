# Portfolio — Creative Direction

**Last updated:** May 2026  
**Status:** In implementation. Core sections and live demo are shipped; act break + deploy copy review remain.

---

## The Mandate

This is not a portfolio. It's a proof of concept. The visitor should feel the work before they read about it. By the time they reach the About section, they should already believe.

**One sentence brief:** Make an ISTE educator stop walking.

### Build Progress Snapshot

- Completed: dark palette migration, hero canvas upgrades, scroll choreography, stat strip, ISTE grid treatment, responsive pass, Work 3-card grid, System section, Live Demo section
- Remaining before deployment: Act Break between Work and System, final copy review, Vercel deploy

---

## Palette — Dark, Warm, Theatrical

The ground shifts from off-white to near-black. Every light source is earned.

```
--color-ground:      oklch(12% 0.015 75)   /* warm near-black — not cold dark */
--color-surface:     oklch(17% 0.018 75)   /* elevated surfaces */
--color-surface-hi:  oklch(22% 0.018 75)   /* card hover states */
--color-ink:         oklch(92% 0.010 80)   /* primary text — warm white */
--color-muted:       oklch(55% 0.012 75)   /* secondary text */
--color-rule:        oklch(28% 0.014 75)   /* dividers */
--color-amber:       oklch(72% 0.16 78)    /* primary accent — gold, not orange */
--color-amber-dim:   oklch(55% 0.12 78)    /* subdued amber for large fills */
--color-amber-glow:  oklch(72% 0.16 78 / 0.15) /* ambient glow fill */
```

**Three.js hex equivalents for scene materials:**
```ts
three: {
  ground:     0x1a1612,
  surface:    0x232018,
  ink:        0xede8e0,
  muted:      0x7a7268,
  amber:      0xd4962a,
  amberDim:   0x8a6018,
  amberGlow:  0xd4962a,  // use with low opacity
}
```

**Rules:**
- No pure black (#000). No pure white (#fff). Everything tinted warm.
- The amber is a *light source*, not a color. Treat it like a candle in a dark room.
- Text on dark surfaces uses `--color-ink`, never raw white.
- Glow effects are permitted exactly twice: hero canvas ambient, and module card hover. Nowhere else.

---

## Typography — Same Bones, More Presence

Fraunces + DM Sans stays. The dark palette amplifies both.

```css
/* Hero h1 */
font-family: 'Fraunces', serif;
font-size: clamp(44px, 7vw, 72px);   /* bigger on dark — it can hold it */
font-weight: 300;
line-height: 1.1;
letter-spacing: -0.025em;
color: var(--color-ink);

/* The italic em in the h1 */
font-style: italic;
color: var(--color-amber);

/* Section labels */
font-size: 11px;
font-weight: 500;
letter-spacing: 0.16em;
text-transform: uppercase;
color: var(--color-muted);

/* Body */
font-size: 16px;
line-height: 1.85;   /* slightly looser on dark — easier to track */
color: var(--color-ink);
```

---

## Three Pillars of "Wow"

### 1. The Geometry IS the Portfolio

The shapes in Creative Lab — the triangle, the reflection axis, the dilation rings — are not decoration. They are characters. They travel through the page.

**Hero:**
A sparse field of wireframe polygons drifts in 3D space. Camera parallax follows the mouse — slow, weighted, inevitable. When the page loads, the shapes fade in with a staggered GSAP entrance (opacity 0→1, z -2→0, duration 1.4s, stagger 0.08s, ease `power3.out`).

**Scroll transition into Work section:**
As the user scrolls toward `#work`, a large canonical triangle (the same A(1,1) B(4,2) C(2,4) from Creative Lab) drifts in from the right edge of the viewport. It's large — nearly full section height — wireframe amber, opacity 0.06. It *anchors* the Work section without competing with text. It is the pre-image waiting to be transformed.

**Module card backgrounds:**
Each card's R3F preview fills the entire card top-to-bottom (not just a 160px strip). The animation plays behind the text at low opacity when idle, full opacity in the preview zone. The card is a window into the module.

**ISTE section:**
A coordinate grid — faint amber lines, low opacity — fills the background. The word "Orlando" grows from the grid intersection like a point being plotted.

### 2. Cinematic Scroll Choreography

Every section entrance is a directed moment, not just a fade.

**ScrollTrigger choreography map:**

| Section | Trigger | Animation |
|---------|---------|-----------|
| Hero text | Page load | GSAP stagger: label → h1 → sub → proof pill. Delay 0.3s after canvas loads. |
| Nav | Scroll 80vh | Slide down from -60px, opacity 0→1. |
| #work label | top 85% | Fade + slide up (y: 30→0). |
| Module grid | top 75% | Cards stagger in from y: 60, 0.15s apart. |
| Proof block | top 80% | Border-left grows from 0→100% height first, then text fades in. |
| #about | top 80% | Meta column slides from left (x: -20→0), body slides from right (x: 20→0). Simultaneous. |
| #pelican | top 80% | Standard stagger. |
| #iste date | top 70% | "ISTE Live 26" counts up via SplitText or manual char split. Each character staggers in 0.04s apart. |
| #iste CTA button | top 70% | Scale 0.8→1.0, opacity 0→1, after date finishes. |
| #contact email | top 75% | The underline draws itself (scaleX 0→1 on a pseudo-element). |

**Implementation note:** All `reveal-target` initial states set with `gsap.set()` in a `useLayoutEffect` before ScrollTrigger registers. This prevents flash of unstyled content.

### 3. The Work is Quantified — Living Numbers

Numbers build trust with educators faster than prose. Make them animate.

**Stats to surface (with animation):**

```
2      modules complete
14     rounds in Dilations alone
4      phases per module
2×     weekly student testing sessions
8.G    standards covered (8.G.A.1 through 8.G.A.5)
~150   student interactions logged
```

**Implementation:** A `useCountUp` hook that fires when the stat enters the viewport. Counts from 0 to target over 1.2s with `power2.out` easing. Numbers rendered in Fraunces italic. Labels in DM Sans uppercase. Displayed in a horizontal strip between the module grid and the proof block.

```tsx
// Stat strip layout
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: s.rule }}>
  <Stat value={2}   label="Modules complete" />
  <Stat value={14}  label="Rounds in M2 alone" />
  <Stat value={4}   label="Phases per module" />
  <Stat value={150} label="Student sessions logged" prefix="~" />
</div>
```

---

## Hero Canvas — Revised Spec

**Geometry:** 10–14 wireframe polygons. Mix of triangles (3 sides), quadrilaterals (4), and hexagons (6). No circles — circles aren't in the math. Sizes vary from 0.5 to 1.8 world units.

**Material:** `lineBasicMaterial`, color `tokens.three.amber`, opacity range 0.08–0.22. Deeper z = lower opacity. Creates natural depth without fog.

**Motion:**
- Each polygon has its own drift speed (0.015–0.05 rad/s rotation, 0.2–0.4 world units oscillation)
- Mouse parallax: camera tilts ±0.5 units on x/y, lerp factor 0.04 (weighted, not snappy)
- On load: `gsap.fromTo` each polygon mesh `{ opacity: 0, z: mesh.position.z - 2 }` → `{ opacity: target, z: mesh.position.z }`, stagger 0.08s

**Performance:** All geometries created once in `useMemo`. No geometry recreation on re-render. `pixelRatio` capped at `Math.min(window.devicePixelRatio, 2)`.

---

## Module Cards — Revised Spec

Cards fill their container. No fixed-height preview strip.

```
Card layout (dark):
┌─────────────────────────────────┐
│                                 │
│   R3F scene — full card height  │  ← z-index: 0
│   idle: opacity 0.35            │
│   hover: preview zone = full    │
│                                 │
├─────────────────────────────────│  ← border-top: 1px solid --rule
│  STATUS    [amber uppercase]    │  ← z-index: 1, text overlaid
│  Title     [Fraunces 24px]      │
│  Standard  [DM Sans 12px muted] │
│  Desc      [DM Sans 13px]       │
│  → arrow   [amber]              │
└─────────────────────────────────┘
```

**Hover state:**
- Background: `--color-surface-hi`
- R3F scene opacity: 0.35 → 1.0 (transition 0.3s)
- Scene animation: **pauses** on hover — student looking at a frozen diagram
- Amber arrow: translates right 4px, letter-spacing increases slightly
- Thin amber border appears (1px, all sides)

**The pause on hover is pedagogically correct.** In Creative Lab, the student controls the pace. The card mirrors that: motion stops when you look at it.

---

## ISTE Section — Revised Spec

This section needs to feel like an invitation, not a footer item.

**Background:** Faint coordinate grid (same grid pattern as Dilations module). Amber lines at `opacity: 0.04`. Grid unit = 40px. Origin at center of section.

**Layout:**
```
┌────────────────────────────────────────┐
│  [coordinate grid background]          │
│                                        │
│  ISTE Live 26              [button]    │
│  Orlando · June 28–July 1              │
│                                        │
│  "I'll be at ISTE..."                  │
│                                        │
└────────────────────────────────────────┘
```

**"ISTE Live 26" entrance:** Characters split and stagger in (0.04s apart), `y: 20→0`, `opacity: 0→1`. The number "26" lands last, 80ms after the rest — a beat of emphasis.

**Button:** Dark amber fill (`--color-amber-dim`), ink text. On hover: full amber fill, scale 1.0→1.02. Small, confident. Not desperate.

---

## Ambient Glow — Two Uses Only

**1. Hero canvas:** A radial gradient in CSS behind the canvas element.
```css
.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 40% at 30% 60%,
    oklch(72% 0.16 78 / 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

**2. Module card hover:** A radial glow from the card's center on hover.
```css
.module-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 80% at 50% 50%,
    oklch(72% 0.16 78 / 0.08) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.module-card:hover::after { opacity: 1; }
```

No other glow anywhere. These are the two candles in the room.

---

## Mobile — Adapt, Don't Amputate

At ≤520px:
- Module grid: 1 column
- About grid: 1 column, meta above body
- Pelican + ISTE: 1 column
- Hero h1: `clamp(32px, 8vw, 44px)`
- Stat strip: 2×2 grid instead of 4×1
- HeroCanvas: reduce polygon count to 7, disable mouse parallax (performance)
- Module card R3F preview height: 120px (not full card)

At ≤768px (tablet):
- Max-width container: `padding: 0 32px`
- Module grid stays 2-col but cards slightly shorter

---

## Performance Contracts

| Concern | Contract |
|---------|----------|
| Hero canvas FPS | 60fps on modern hardware. Cap `pixelRatio` at 2. |
| R3F per card | Two canvases max on screen simultaneously. Others are `visibility: hidden` when off-screen. |
| GSAP bundle | Import only `gsap/ScrollTrigger`, `gsap/SplitText` (if used). No full-bundle import. |
| Three.js chunk | Lazy-load R3F components with `React.lazy()` + `Suspense`. |
| Font load | Preconnect to Google Fonts. Use `display=swap`. |
| LCP target | Hero h1 renders within 1.2s on fast 3G. Canvas is below h1 in z-order — text is never blocked. |

---

## What This Is NOT

- Not a dark mode toggle. Dark is the design. There is no light mode.
- Not glassmorphism. No blur cards, no frosted panels.
- Not gradient text. The amber is used for the italic word and accents. Not as a text gradient.
- Not a loading spinner. If the canvas takes a moment, the text is already visible. Canvas fades in when ready.
- Not scroll-jacking. ScrollTrigger animates elements on scroll — it never controls scroll speed or position.