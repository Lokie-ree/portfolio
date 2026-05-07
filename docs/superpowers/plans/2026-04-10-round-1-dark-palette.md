# Round 1 — Dark Palette + Token Migration Implementation Plan

**Status:** Completed (implemented)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the entire site from the light off-white palette to the warm near-black dark palette specified in `docs/CREATIVE_DIRECTION.md § Palette`.

**Architecture:** All color values originate in `src/tokens.ts`. CSS custom properties in `src/index.css` mirror those values for Tailwind and global styles. The `s` shorthand object (also in `tokens.ts`) is what components import for inline styles. Three.js scenes consume `tokens.three.*` directly. Changing `tokens.ts` cascades everywhere — no component needs color values hardcoded.

**Tech Stack:** TypeScript, React 19, Tailwind CSS v4 (`@theme` block), Three.js / React Three Fiber

---

## Files Touched

| File | Change |
|------|--------|
| `src/tokens.ts` | Replace all color values with dark palette; add new tokens (`surface`, `surfaceHi`, `amberDim`, `amberGlow`); update `three` hex equivalents; update `s` shorthand keys |
| `src/index.css` | Replace all `--color-*` values in `@theme`; update `body` background/color |
| `src/App.tsx` | Fix one hardcoded `oklch` in nav background; rename `s.amberLight` → `s.amberDim` (2 usages) |
| `src/components/ModuleCard.tsx` | Change hover background from `s.white` → `s.surfaceHi`; idle background `s.ground` → `s.surface` |

> `HeroCanvas.tsx`, `RigidMotionsPreview.tsx`, `DilationsPreview.tsx` reference `tokens.three.*` — they update automatically when `tokens.ts` changes. No edits needed.

---

## Task 1: Update `src/tokens.ts`

**Files:**
- Modify: `src/tokens.ts`

- [ ] **Step 1: Replace the `tokens` object with the dark palette**

Open `src/tokens.ts` and replace the entire file with:

```ts
// Design tokens — single source of truth
// Used in both CSS-in-JS (Three.js) and Tailwind classes

export const tokens = {
  color: {
    ground:      'oklch(12% 0.015 75)',
    surface:     'oklch(17% 0.018 75)',
    surfaceHi:   'oklch(22% 0.018 75)',
    ink:         'oklch(92% 0.010 80)',
    muted:       'oklch(55% 0.012 75)',
    rule:        'oklch(28% 0.014 75)',
    amber:       'oklch(72% 0.16 78)',
    amberDim:    'oklch(55% 0.12 78)',
    amberGlow:   'oklch(72% 0.16 78 / 0.15)',
  },
  // Three.js hex equivalents (dark palette)
  three: {
    ground:    0x1a1612,
    surface:   0x232018,
    ink:       0xede8e0,
    muted:     0x7a7268,
    amber:     0xd4962a,
    amberDim:  0x8a6018,
    amberGlow: 0xd4962a,  // use with low opacity
  },
  font: {
    display: "'Fraunces', serif",
    body:    "'DM Sans', sans-serif",
  },
} as const

// Shorthand for inline styles
export const s = {
  ground:    tokens.color.ground,
  surface:   tokens.color.surface,
  surfaceHi: tokens.color.surfaceHi,
  ink:       tokens.color.ink,
  muted:     tokens.color.muted,
  rule:      tokens.color.rule,
  amber:     tokens.color.amber,
  amberDim:  tokens.color.amberDim,
  amberGlow: tokens.color.amberGlow,
  display:   tokens.font.display,
} as const
```

- [ ] **Step 2: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build (no TS errors). The Three.js scenes will now use dark hex values automatically.

- [ ] **Step 3: Commit**

```bash
git add src/tokens.ts
git commit -m "feat: dark palette — tokens.ts full migration"
```

---

## Task 2: Update `src/index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the `@theme` block and body styles**

Replace the existing `@theme` block and `body` rule with:

```css
@theme {
  --font-display: 'Fraunces', serif;
  --font-body: 'DM Sans', sans-serif;

  --color-ground:       oklch(12% 0.015 75);
  --color-surface:      oklch(17% 0.018 75);
  --color-surface-hi:   oklch(22% 0.018 75);
  --color-ink:          oklch(92% 0.010 80);
  --color-muted:        oklch(55% 0.012 75);
  --color-rule:         oklch(28% 0.014 75);
  --color-amber:        oklch(72% 0.16 78);
  --color-amber-dim:    oklch(55% 0.12 78);
  --color-amber-glow:   oklch(72% 0.16 78 / 0.15);
}
```

And replace the `body` rule with:

```css
body {
  background-color: oklch(12% 0.015 75);
  color: oklch(92% 0.010 80);
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Run build to verify**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: dark palette — index.css @theme and body"
```

---

## Task 3: Fix hardcoded value in `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

The nav has one hardcoded `oklch` value for its semi-transparent background that won't pick up the token change. There are also two usages of `s.amberLight` that no longer exist (renamed to `s.amberDim`).

- [ ] **Step 1: Fix the nav background**

Find this line in the `App` function (inside the `<nav>` style):
```ts
background: `oklch(97% 0.012 80 / 0.92)`,
```

Replace with:
```ts
background: `oklch(12% 0.015 75 / 0.92)`,
```

- [ ] **Step 2: Rename `s.amberLight` → `s.amberDim`**

There are two usages — one in `WorkSection` (the proof block background) and one in the hero proof pill. Replace both:

```ts
// Find:
background: s.amberLight,
// Replace with:
background: s.amberDim,
```

Run this search to confirm you've caught both: look for `amberLight` in `src/App.tsx` — there should be zero remaining after replacement.

- [ ] **Step 3: Run build to verify**

```bash
npm run build
```

Expected: clean build with no TypeScript errors (the old `s.amberLight` key no longer exists — TS will catch any missed replacements).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: dark palette — App.tsx token references"
```

---

## Task 4: Update `src/components/ModuleCard.tsx`

**Files:**
- Modify: `src/components/ModuleCard.tsx`

`ModuleCard` has two color references that need updating: the idle card background and the hover background.

- [ ] **Step 1: Update idle and hover backgrounds**

Find the `<a>` element's style in `ModuleCard`:
```ts
background: hovered ? s.white : s.ground,
```

Replace with:
```ts
background: hovered ? s.surfaceHi : s.surface,
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: clean build. TypeScript will error if `s.white` is still referenced anywhere (it no longer exists in the `s` export).

- [ ] **Step 3: Visual verification**

Run the dev server and inspect visually:

```bash
npm run dev
```

Check:
- [ ] Page background is warm near-black (not white)
- [ ] Text is warm white, not black
- [ ] Amber accent color appears on labels, section markers, hero italic
- [ ] Nav background is dark and semi-transparent when scrolled
- [ ] Module cards are dark, hover state is slightly lighter
- [ ] Three.js hero polygons are visible against the dark background
- [ ] R3F previews in module cards render correctly on dark background

- [ ] **Step 4: Commit**

```bash
git add src/components/ModuleCard.tsx
git commit -m "feat: dark palette — ModuleCard surface colors"
```

---

## Task 5: Final build check

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors, no warnings beyond the known Three.js chunk size warning.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173` and do a full scroll-through. Confirm all sections render correctly in the dark palette.
