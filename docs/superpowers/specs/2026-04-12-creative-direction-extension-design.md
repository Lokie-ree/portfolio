# Creative Direction Extension
**Date:** April 12, 2026  
**Status:** Approved for implementation  
**Phases:** Pre-ISTE (ships before June 28) · Post-ISTE (specced now, built after)

---

## What Changed and Why

The original `CREATIVE_DIRECTION.md` was written for a single product. The portfolio now represents an ecosystem: three interconnected repositories, a coherent three-module curriculum arc, teacher and student lab guides, and sandboxed single interactives. This document extends the creative direction to reflect that reality and introduces two new structural concepts — the Two-Act page structure and The System section.

**The positioning shift:** The portfolio is not a résumé. It is a door. The business card is the key. By the time the visitor reaches The System, they have already been inside the work.

**The pedagogical signature:** The portfolio performs the same methodology as the modules it showcases. The visitor experiences before they understand — exactly as students do in Creative Lab. This is not a UX trick. It is a design identity. No one in EdTech is doing this with the same depth and intentionality.

---

## New Design Principle: The Two-Act Structure

The page is organized in two acts, separated by a directed moment — the act break.

```
ACT 1 — EXPERIENCE
  Hero
  Live Demo
  Work (module cards)

  ── act break ──

ACT 2 — UNDERSTAND  
  The System
  Stat Strip
  About
  Pelican
  ISTE
  Contact
  Footer
```

**Act 1** puts the visitor inside the work before they know what it is. They experience a mind-blowing interactive, then see three module cards. Feelings first.

**Act 2** reveals the system behind what they just felt. The curriculum arc, the repo layers, the quantified evidence, the person behind it.

**The act break is not a divider. It is a reveal.** It is the moment the formula appears — after the student has already been inside the idea. It uses the same GSAP choreography present throughout the page.

### Act Break Specification

```
Type: typographic beat
Font: Fraunces, font-weight 300, italic
Color: --color-amber
Size: clamp(20px, 3vw, 28px)
Alignment: center
Copy (working): "Now you know what it feels like. Here's how it works."
Animation: GSAP fromTo { opacity: 0, y: 20 } → { opacity: 1, y: 0 }
           duration: 0.7s, ease: power3.out
           ScrollTrigger start: 'top 80%'
           delay: 0.6s (passed to gsap.to delay option, not ScrollTrigger)
           (the delay is the beat of silence — it confirms rather than explains)
Rule below: 40px wide, 1px, --color-rule, centered, fades in 0.3s after text
```

**Hook:** Add a `useActBreakReveal()` hook in `useScrollReveal.ts`. Do not extend `useScrollReveal` with a delay param — the act break is a one-off and the delay behavior is semantically different from section entrances. The hook attaches to a ref on the act break wrapper div and runs its own `gsap.context()` block.

Copy note: "Silence is the new philosophy." The line should confirm what the visitor already feels, not announce it. Final copy is a human task before deploy — this is a placeholder that captures the intent.

---

## Spec Gap Closure

These were built during Rounds 1–8 but are not documented in `CREATIVE_DIRECTION.md`. They are now part of the canonical spec.

### Scroll Progress Bar
A thin amber bar fixed at the very top of the viewport, behind the nav (`z-index: 60`). Driven by `useScrollProgress()` — GSAP `scaleX` from 0→1, `transformOrigin: left center`, `scrub: true` tied to full document scroll. Height: 2px (`h-0.5`). Color: `bg-amber` Tailwind class on the element. GSAP sets `scaleX: 0` as the initial state — the Tailwind class provides the color; GSAP drives the scale.

```html
<div id="scroll-progress" class="pointer-events-none fixed top-0 left-0 z-[60] h-0.5 w-full bg-amber" />
```

**Rule:** This is the only scroll-driven element that is not a ScrollTrigger entrance. It tracks scroll position, not section visibility.

### Footer
Simple two-column footer. Copyright left, back-to-top right.

```tsx
<footer className="flex items-center justify-between py-6 text-[11px] text-muted border-t border-rule">
  <span>© 2026 Randall LaPoint, Jr.</span>
  <a href="#" className="text-muted no-underline transition-colors hover:text-amber">↑ Top</a>
</footer>
```

### Contact Underline Animation
The email address in the Contact section has an amber underline (`--color-amber`, 1px) that draws left-to-right via `scaleX: 0 → 1` on scroll. Implemented in `useContactUnderline()`, which shares the section's existing `ref` rather than creating a new one.

### Hero Proof Pill — Updated Style
The amber pill in the hero uses an amber-glow fill instead of `--color-amber-dim`:

```tsx
style={{
  background: 'oklch(72% 0.16 78 / 0.12)',
  border: '1px solid oklch(72% 0.16 78 / 0.5)',
}}
```

This is more luminous than the original `border-rule + bg-amber-dim` treatment. It reads as a live indicator, not a badge.

### Nav Link Hover State
Nav links add `transition-colors hover:text-amber` — a simple color transition on hover, consistent with other interactive text elements on the page.

### Page Title + Meta Description
```html
<title>Randall LaPoint, Jr. — Interactive Learning Designer</title>
<meta name="description" content="15 years in the classroom. Now building interactive math experiences tested with real students twice a week." />
```

---

## Pre-ISTE Additions

### 1. Live Demo Section

**Section ID:** `id="demo"` — required for the "Embedded above ↑" back-link in The System section.

**Position:** Between Hero and Work (Act 1, first section the visitor reaches after the hero).

**Purpose:** To stop an ISTE educator in their tracks before a single word of copy has been read. The embed should look like it came from a reality outside of what educators typically see in their curriculum. This is the one place on the page where the work does all the talking.

**Implementation:**
- Single full-width interactive experience
- Housed in this repo as a React component (`src/components/DemoInteractive.tsx` or named for the specific experience)
- Lazy-loaded via `React.lazy()` + `Suspense`, same pattern as `HeroCanvas` and module previews
- Suspense fallback: `<div style={{ background: 'var(--color-surface)', height: '600px' }} />`
- No fixed height cap — the demo defines its own height, minimum 500px
- The section has no label, no copy, no framing. Just the experience.

**Design mandate:** This is not a preview strip. It is not a card. It is a window. The interactive must be complete enough to be understood without instructions and compelling enough to provoke a question.

**Performance contract:**
- Lazy-loaded — zero cost until viewport approaches
- If the demo uses Three.js / R3F: reuse the existing lazy chunk (`three` manual chunk in `vite.config.ts`)
- DPR capped at 2 (`dpr={Math.min(window.devicePixelRatio, 2)}` on `<Canvas>`)

**Mobile (≤520px):** Demo scales to full viewport width. If interaction requires mouse/touch precision, add a touch-friendly interaction mode or reduce to a static preview at ≤520px — TBD when the specific demo is known.

---

### 2. Work Section — Updated

**Three module cards:** Rigid Motions, Dilations & Similarity, Pythagorean Theorem. All three cards are live — no "In Development" card.

### ModuleCard — Updated Interface

`ModuleCard` requires interface changes to support both the "In Development" card and lab guide links. Update the props as follows:

```ts
interface ModuleCardProps {
  status: string
  title: string
  standard: string
  description: string
  href?: string          // optional — omit for "In Development" cards
  labGuideHref?: string  // optional — shows lab guide link when present
  preview?: ReactElement<{ paused: boolean }> // optional — omit for placeholder surface
  disabled?: boolean     // true for "In Development" cards
}
```

**HTML structure change — no nested anchors.** The current `ModuleCard` renders as a top-level `<a>` element. When `disabled` is true OR `href` is absent, the outer element must be a `<div>` (not `<a>`). The "view module →" arrow link becomes an inner `<a>` only when `href` is present. The `labGuideHref` link is always a sibling `<a>` to the arrow link — never nested inside another `<a>`. Nesting `<a>` inside `<a>` is invalid HTML.

```
Card structure (non-disabled, with labGuideHref):
<div class="module-card ...">          ← outer: always a div now
  [R3F preview]
  <div class="text content">
    [status badge]
    [title]
    [standard]
    [description]
    <a href={href}>view module →</a>   ← inner link, amber arrow
    <a href={labGuideHref}>Lab guide →</a>  ← sibling link, muted
  </div>
</div>

Card structure (disabled, no href):
<div class="module-card ..." style={{ cursor: 'default' }}>
  [placeholder surface — a div with background --color-surface, min-height 200px]
  <div class="text content">
    [status badge — color: --color-muted]
    [title — color: --color-muted]
    [standard]
    [description]
    {/* no arrow link */}
  </div>
</div>
```

**Disabled card hover behavior:** No amber border. No `--color-surface-hi` background. No `::after` glow. No arrow translate. Suppress at two levels:

1. **JSX level (Tailwind classes):** Conditionally omit `hover:border-amber` and `hover:bg-surface-hi` from the className when `disabled` is true. Tailwind `hover:` utilities cannot be overridden by CSS data-attribute rules without specificity conflicts — the correct fix is to not apply them in JSX.
2. **CSS level (glow pseudo-element):** Add `data-disabled="true"` to the outer div and update `index.css` to exclude the `::after` glow: `.module-card[data-disabled="true"]:hover::after { opacity: 0; }`.

**Pythagorean Theorem card preview:** Until the R3F scene exists, render a plain `<div style={{ minHeight: 200, background: 'var(--color-surface)' }} />` as the preview. This is the same fallback used by the `<Suspense>` boundaries on other cards — visually consistent with the loading state.

**Module grid:** Updates from 2-col to accommodate 3 cards. At ≥521px: `grid-template-columns: repeat(3, 1fr)`. At ≤520px: 1 column (existing mobile behavior unchanged).

---

### 3. The System Section

**Position:** First section of Act 2, immediately after the act break.

**Purpose:** To show the full scope of what has been built — not just the interactive, but the curriculum system behind it. Three modules × two repository layers. The visitor understands that what they just felt in Act 1 is one layer of a coherent, standards-grounded system.

**Scope note:** The `creative-lab-demos` repo (standalone interactives like the Cross-Section Explorer) is **not** part of this grid. Featured demos are unrelated to the M1–M3 module arc — they are complete standalone experiences that live in Act 1 as the Live Demo embed. The System grid shows only the curriculum-arc repositories.

**Layout:** Layer Stack (B)

Two rows, one per curriculum repository layer. Modules read left-to-right within each row. An amber left-border (3px, `--color-amber`) on each row label anchors the visual hierarchy — consistent with the proof block treatment in the Work section.

```
┌──────────────────┬──────────────┬──────────────┬──────────────────┐
│ Interactive      │ Rigid        │ Dilations    │ Pythagorean      │
│ creative-lab     │ Motions      │              │ Theorem          │
│ [amber border]   │ Live →       │ Live →       │ Live →           │
├──────────────────┼──────────────┼──────────────┼──────────────────┤
│ Lab Guide        │ Rigid        │ Dilations    │ Pythagorean      │
│ iste-26          │ Motions      │              │ Theorem          │
│ [amber border]   │ Live →       │ Live →       │ Live →           │
└──────────────────┴──────────────┴──────────────┴──────────────────┘
```

**Row label column:** 160px min-width. Contains the layer name (amber, 12px, font-weight 600) and the repo name (muted, 10px). Left-border is `3px solid --color-amber`.

**Module cells:** Background `--color-surface`. On hover: `--color-surface-hi`. Module name in `--color-ink`, standard in `--color-muted`. Status link in `--color-amber`.

**Section label:** "The System" — same 11px uppercase tracking style as other section labels.

**Scroll entrance:** Use `useScrollReveal` on the section ref. Each row element carries `className="reveal-target"`. The existing hook uses `y: 40` and `stagger: 0.1` — use those values unchanged. Do not create a bespoke hook for this section.

**Mobile (≤520px):** Collapses to a single-column list. Layer rows stack vertically. Module cells within each row stack beneath the layer label. Links remain tappable.

---

### 4. Stat Strip — Updated

**Anchor stat change:** "2 Modules complete" → "3 Modules in the sequence" — reflecting the full arc from congruence to distance.

**Remaining stats:** Rounds, phases, and session counts are subject to copy review before deploy. The quantities presented should reflect real, defensible numbers. The `useCountUp` hook and layout are unchanged.

**Candidate replacement stats to consider at copy review:**
```
3      modules in the sequence (firm)
2      audiences per guide (teacher + student)
??     rounds in M2 alone (keep or update)
??     student sessions logged (keep or update)
```

---

## Post-ISTE Chapter (Specced Now, Built Later)

These are fully designed in intent but receive no build plan until after June 28, 2026.

### Writing / Reflections Section
A place for long-form design thinking — not a blog with dates and categories, but a small set of essays on the methodology. Discovery-first design. What testing with real students teaches you. The difference between a lesson and an experience.

**Positioning:** Between ISTE and Contact, or as a separate page linked from the nav.  
**Copy:** Human task. Not automated.

### Richer Ecosystem Visualization
A post-ISTE evolution of The System section — possibly an interactive node graph where modules and repos are live nodes the visitor can explore. Powered by R3F or a lightweight SVG/canvas implementation.

**Constraint:** Must remain within the two-glow rule (hero canvas ambient + module card hover). Any new interactive element in this section uses structural animation, not glow.

### Analytics
Added after ISTE once there are real visitors to measure. No analytics until after the conference — the tool would measure too-early noise.

### Nav Evolution
Post-ISTE the nav may need a fourth item if Writing becomes its own section. Hold at three items (work / about / contact) until then.

---

## Updated "What This Is NOT"

Additions to the original list:

- Not a GitHub showcase. Repo names appear in The System section as product labels, not as code links. The work is the product; the code is the implementation.
- Not a demo reel. The single embedded interactive is not a sampler — it is a complete experience chosen deliberately. If it requires explanation, choose a different one.
- Not a soft launch. By the time it ships, every section on the page should be something you'd hand an ISTE keynote speaker without apologizing for.

---

## Implementation Sequence (Pre-ISTE)

Build in this order to maintain a deployable state at each step:

0. **Spec gap closure** — document-only; commit updated CREATIVE_DIRECTION.md (no app changes)
1. **Work section: 3-card grid** — ModuleCard interface update, Pythagorean Theorem card, lab guide links, 3-col grid, stat strip anchor stat → "3 Modules in the sequence"
2. **The System section** — new section, layer stack layout, scroll entrance
3. **Act break** — `useActBreakReveal` hook, typographic beat between Work and The System
4. **Live Demo section** — single full-width embed (depends on demo component being ready)
5. **Deploy to Vercel** — after copy review (human task)

Step 6 is intentionally last because the demo component is the most open-ended piece. Steps 1–5 ship to production independently.
