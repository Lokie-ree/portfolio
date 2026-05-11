# Nav Logo, Footer Social Links & Favicon — Design Spec

**Date:** 2026-05-10  
**Status:** Approved

## Overview

Consolidate the portfolio's brand identity in the nav (add the hexagon logo mark), remove the thin standalone contact section, surface social links in the footer, and fix the favicon legibility at small sizes.

## Asset Inventory

Three SVG files are relevant:

| File | ViewBox | Runtime role |
|------|---------|--------------|
| `src/assets/logo-hexagon.svg` | 100×100 | Nav brand mark — inlined as JSX; displayed at 26px |
| `public/favicon.svg` | 48×48 | **Loaded by the browser tab** (`index.html` references `/favicon.svg`) |
| `src/assets/favicon-hexagon.svg` | 48×48 | Version-controlled source copy of the favicon; not imported by any module — kept in sync with `public/favicon.svg` manually |

The codebase does not use `vite-plugin-svgr`. SVG markup is pasted inline as JSX. Do not use `?react` imports.

## Scope of Changes

### 1. Nav — Responsive Logo Lockup

**Current:** `<span className="shrink-0 font-display text-[15px] font-normal max-[380px]:text-sm">Randall LaPoint, Jr.</span>` on the left.

**New:** Replace that `<span>` with:

```jsx
<a href="#" aria-label="Home" className="flex items-center gap-[10px] text-ink no-underline">
  {/* hexagon SVG inlined here — copy markup from src/assets/logo-hexagon.svg, width="26" height="26" */}
  <span className="hidden min-[521px]:inline font-display text-[15px] font-normal">
    Randall LaPoint, Jr.
  </span>
</a>
```

- Drop the old `max-[380px]:text-sm` class entirely — the `hidden min-[521px]:inline` pattern replaces it.
- `text-ink no-underline` on the `<a>` prevents browser default blue/underline from bleeding onto the icon.
- `href="#"` matches the existing ↑ Top footer behavior — instant scroll to top, no custom handler.
- Nav links: `(['work', 'about', 'contact'] as const)` → `(['work', 'about'] as const)`.

### 2. Contact Section — Remove Entirely

At the start of this session, `useContactUnderline` was already removed from the `App.tsx` import line and its call was removed from `ContactSection`. The function's named export still remains in `src/hooks/useScrollReveal.ts` with no callers anywhere in the codebase.

- Delete the `ContactSection` function component from `App.tsx`.
- Remove its `<ContactSection />` render call from the App layout.
- Delete the `useContactUnderline` function body and its `export` keyword from `src/hooks/useScrollReveal.ts`.

**Note:** `ContactSection` currently contains GitHub and LinkedIn inline SVG icon elements (added earlier in this session). Those SVG `<path>` strings are reused in the footer (Section 3 below) — migrate them rather than retyping.

### 3. Footer — Social Icons Grouped Right

**Current:** `<span>© 2026 Randall LaPoint, Jr.</span>` left, `<a href="#">↑ Top</a>` right.

**New:**

```jsx
<footer className="flex items-center justify-between py-6 text-[11px] text-muted border-t border-rule">
  <span>© 2026 Randall LaPoint, Jr.</span>
  <div className="flex items-center gap-4">
    <a href="https://github.com/Lokie-ree" target="_blank" rel="noopener noreferrer"
       aria-label="GitHub" className="text-muted hover:text-amber transition-colors flex items-center">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        {/* reuse path from ContactSection */}
      </svg>
    </a>
    <a href="https://www.linkedin.com/in/lapointwebdev" target="_blank" rel="noopener noreferrer"
       aria-label="LinkedIn" className="text-muted hover:text-amber transition-colors flex items-center">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        {/* reuse path from ContactSection */}
      </svg>
    </a>
    <a href="#" className="text-muted no-underline transition-colors hover:text-amber">↑ Top</a>
  </div>
</footer>
```

**Critical:** The existing SVG icons in `ContactSection` have `width="28" height="28"` hard-coded as SVG attributes. **Remove those attributes** when migrating to the footer — size is controlled entirely by `className="w-4 h-4"` on the `<svg>` element. Leaving the SVG attributes in place will override the Tailwind sizing.

### 4. Favicon — Legibility Fix

Edit **both** files (they must stay identical):
- `public/favicon.svg` ← primary; what browsers actually load
- `src/assets/favicon-hexagon.svg` ← source copy

**Changes to each file:**
1. Insert `<rect width="48" height="48" fill="#0d0d0d" rx="4"/>` as the **first child** of `<svg>`, before all other geometry.
2. Change `stroke-width` on the `<polygon>` from `"2.2"` to `"3"`.

All other geometry unchanged.

## Files Touched

| File | Change |
|------|--------|
| `src/App.tsx` | Nav lockup, remove `'contact'` from nav array, delete `ContactSection`, update `Footer` |
| `src/hooks/useScrollReveal.ts` | Delete `useContactUnderline` function and export |
| `public/favicon.svg` | Background `<rect>` + `stroke-width="3"` |
| `src/assets/favicon-hexagon.svg` | Same as above (keep in sync) |

## What Is Not Changing

- `src/assets/logo-hexagon.svg` — inlined as JSX in the nav; file itself not edited.
- `index.html` — favicon `<link href="/favicon.svg">` already correct.
- Hero canvas, all other section components, GSAP hooks, Three.js previews — untouched.

## Acceptance Criteria

- [ ] Nav shows hexagon + "Randall LaPoint, Jr." on viewports ≥521px.
- [ ] Nav shows hexagon only (name hidden) on viewports <521px.
- [ ] Nav lockup is an `<a href="#" aria-label="Home">` with `text-ink no-underline` — no browser-default blue or underline on the icon.
- [ ] Nav links are "work" and "about" only.
- [ ] `ContactSection` is absent from `App.tsx`; no `id="contact"` element in the DOM.
- [ ] `useContactUnderline` is neither exported nor defined in `src/hooks/useScrollReveal.ts`.
- [ ] Footer right side: GitHub → LinkedIn → ↑ Top in one `flex` container.
- [ ] GitHub and LinkedIn links: `target="_blank" rel="noopener noreferrer"`.
- [ ] Footer icons render at ~16px (Tailwind `w-4 h-4`); no SVG `width`/`height` attributes present.
- [ ] `public/favicon.svg` contains `<rect … fill="#0d0d0d"` as first child and `stroke-width="3"` on the polygon. *(manual SVG source check)*
- [ ] `src/assets/favicon-hexagon.svg` is identical to `public/favicon.svg`. *(manual diff)*
- [ ] Favicon legible against light browser tab at ~16px after hard-refresh. *(manual visual check)*
- [ ] `pnpm run lint` exits 0.
- [ ] `pnpm run build` succeeds with no TypeScript errors.
