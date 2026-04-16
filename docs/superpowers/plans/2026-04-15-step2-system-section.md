# Step 2: The System Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "The System" section — a two-row layer stack grid showing the interactive and lab guide repository layers across all three curriculum modules, with scroll entrance animation.

**Architecture:** One new function component (`SystemSection`) and one data constant (`SYSTEM_ROWS`) added to `src/App.tsx`, following the exact pattern established by `ABOUT_ACTS` / `AboutSection`. The section is inserted between `WorkSection` and `AboutSection` in the render tree; the act break (Step 3) will be inserted between Work and System later. No new files.

**Tech Stack:** React 19, TypeScript, Tailwind v4, GSAP via the existing `useScrollReveal` hook

**No unit tests exist in this project.** Verification is `pnpm run lint && pnpm run build`.

---

## File Map

| File | Change |
|------|--------|
| `src/App.tsx` | Add `SYSTEM_ROWS` data constant, `SystemSection` component, insert `<SystemSection />` between `WorkSection` and `AboutSection` |

---

## Task 1: Add SystemSection to App.tsx

**Files:**
- Modify: `src/App.tsx`

### What to add and where

**Step 1 — Add the `SYSTEM_ROWS` data constant**

Place this immediately before `function WorkSection()` (currently around line 27), after the `sectionClass` and `SectionLabel` definitions.

```tsx
type SystemModule = { name: string; standard: string; href?: string }
type SystemRow = { layerName: string; repoName: string; modules: SystemModule[] }

const SYSTEM_ROWS: SystemRow[] = [
  {
    layerName: 'Interactive',
    repoName: 'creative-lab',
    modules: [
      { name: 'Rigid Motions',         standard: '8.G.A.1–3', href: 'https://creative-lab-five.vercel.app' },
      { name: 'Dilations & Similarity', standard: '8.G.A.3–5', href: 'https://creative-lab-five.vercel.app' },
      { name: 'Pythagorean Theorem',    standard: '8.G.B.7–8', href: 'https://creative-lab-five.vercel.app' },
    ],
  },
  {
    layerName: 'Lab Guide',
    repoName: 'iste-26',
    modules: [
      { name: 'Rigid Motions',         standard: '8.G.A.1–3' },
      { name: 'Dilations & Similarity', standard: '8.G.A.3–5' },
      { name: 'Pythagorean Theorem',    standard: '8.G.B.7–8' },
    ],
  },
]
```

**Why `href` is absent on Lab Guide row:** Lab guide deployment URLs are not yet finalized. Cells without `href` render without the "Live →" link — they're visually complete and will gain links when the repo ships.

---

**Step 2 — Add the `SystemSection` component**

Place this immediately after `WorkSection` ends (currently around line 70), before `const ABOUT_ACTS`.

```tsx
function SystemSection() {
  const ref = useScrollReveal<HTMLElement>()
  return (
    <section ref={ref} className={sectionClass}>
      <SectionLabel>The System</SectionLabel>
      <div className="flex flex-col gap-px border border-rule bg-rule">
        {SYSTEM_ROWS.map((row) => (
          <div
            key={row.layerName}
            className="reveal-target grid grid-cols-1 gap-px bg-rule min-[521px]:grid-cols-[160px_1fr_1fr_1fr]"
          >
            {/* Layer label cell — amber left border anchors hierarchy */}
            <div className="border-l-[3px] border-l-amber bg-surface px-4 py-5">
              <p className="text-[12px] font-semibold text-amber">{row.layerName}</p>
              <p className="mt-0.5 text-[10px] text-muted">{row.repoName}</p>
            </div>

            {/* Module cells */}
            {row.modules.map((mod) => (
              <div
                key={mod.name}
                className="bg-surface px-4 py-5 transition-colors duration-150 hover:bg-surface-hi"
              >
                <p className="text-[13px] font-normal text-ink">{mod.name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{mod.standard}</p>
                {mod.href && (
                  <a
                    href={mod.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-[11px] text-amber no-underline transition-colors hover:underline"
                  >
                    Live →
                  </a>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Layout logic:**
- Outer `<div>`: `flex flex-col gap-px bg-rule border border-rule` — the `bg-rule` bleeds through `gap-px` to form visible row dividers, same technique as the module card grid
- Each row `<div>`: `reveal-target` (stagger entrance via `useScrollReveal`) + `grid grid-cols-1 gap-px bg-rule` at mobile, `min-[521px]:grid-cols-[160px_1fr_1fr_1fr]` at desktop — the label column is fixed 160px, three module columns share remaining space equally
- Mobile (≤520px): `grid-cols-1` stacks label + 3 module cells vertically per row

---

**Step 3 — Insert `<SystemSection />` in the render tree**

In the `App()` function return, `<WorkSection />` is currently followed directly by `<AboutSection />`. Change:

```tsx
<WorkSection />
<AboutSection />
```

to:

```tsx
<WorkSection />
<SystemSection />
<AboutSection />
```

Note: The act break (Step 3 of the broader spec) will be inserted between `<WorkSection />` and `<SystemSection />` later. This is intentional — the page is deployable without it.

---

- [ ] **Step 1: Add `SYSTEM_ROWS` data constant and type aliases**

Insert the `SystemModule`, `SystemRow` types and `SYSTEM_ROWS` constant immediately before `function WorkSection()` in `src/App.tsx`.

- [ ] **Step 2: Add the `SystemSection` component**

Insert the full `SystemSection` function immediately after `WorkSection` ends and before `const ABOUT_ACTS`.

- [ ] **Step 3: Mount `<SystemSection />` in App render**

Between `<WorkSection />` and `<AboutSection />` in the `App()` return.

- [ ] **Step 4: Run lint**

```bash
pnpm run lint
```

Pre-existing errors in `HeroCanvas.tsx` and `PythagoreanTheoremPreview.tsx` are expected — ignore them.
Expected: no new errors from `App.tsx`

- [ ] **Step 5: Run build**

```bash
pnpm run build
```

Expected: exits 0, no TypeScript errors

- [ ] **Step 6: Verify visually at dev server**

```bash
pnpm run dev
```

Open http://localhost:5173 and scroll to The System section. Verify:

1. Section label "THE SYSTEM" appears (11px uppercase tracking, muted)
2. Two rows render: "Interactive / creative-lab" and "Lab Guide / iste-26"
3. Each row shows 3 module cells (Rigid Motions, Dilations & Similarity, Pythagorean Theorem)
4. Row label has amber left border (3px) and amber text for layer name, muted for repo name
5. Interactive row cells show "Live →" amber links; Lab Guide row cells have no link
6. Module cells: hover shifts background to surface-hi
7. Rows animate in on scroll (fade + slide up, staggered)
8. **Mobile:** resize to ≤520px — each row collapses to label + 3 stacked cells; no horizontal overflow

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add The System section — two-row layer stack grid with scroll entrance"
```
