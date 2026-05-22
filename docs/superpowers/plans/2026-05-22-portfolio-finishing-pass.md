# Portfolio Finishing Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four surgical copy and layout fixes to the deployed portfolio — no new features, no module files touched.

**Architecture:** All changes are in two files: `src/App.tsx` (copy edits + card grid class) and `src/components/StatStrip.tsx` (remove one stat entry, update container class). Each task is independent and commits cleanly on its own.

**Tech Stack:** React 18, Tailwind v4, Vite. No test suite — verification is `pnpm run lint` (must exit 0) and `pnpm run dev` visual confirmation.

---

## File Map

| File | Change |
|---|---|
| `src/App.tsx` | Cut "Complete" from 3 status props; trim ISTE CTA paragraph; fix card grid class |
| `src/components/StatStrip.tsx` | Remove `2 / week` stat entry; update container from `grid-cols-2 min-[521px]:grid-cols-4` to `grid-cols-3` |

---

### Task 1: Branch setup

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/portfolio-finishing-pass
```

Expected: switched to new branch `feat/portfolio-finishing-pass`

---

### Task 2: Cut "COMPLETE" from module card status badges

**Files:**
- Modify: `src/App.tsx` lines 43, 52, 61

- [ ] **Step 1: Make the change**

In `src/App.tsx`, change all three `status` props from `"Live — Complete"` to `"Live"`:

```tsx
// Line 43
status="Live"

// Line 52
status="Live"

// Line 61
status="Live"
```

The three ModuleCard calls become:

```tsx
<ModuleCard
  status="Live"
  title="Rigid Motions"
  ...
/>
<ModuleCard
  status="Live"
  title="Dilations & Similarity"
  ...
/>
<ModuleCard
  status="Live"
  title="Pythagorean Theorem"
  ...
/>
```

- [ ] **Step 2: Lint**

```bash
pnpm run lint
```

Expected: exits 0, no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "fix: cut 'Complete' from module card status badges"
```

---

### Task 3: Trim ISTE CTA — remove AI-readiness bridge sentences

**Files:**
- Modify: `src/App.tsx` lines 242–248

- [ ] **Step 1: Make the change**

Replace the paragraph at lines 242–248 in `src/App.tsx`:

```tsx
// Before
<p className="text-[15px] leading-[1.75] text-ink">
  I'll be at ISTE showing what discovery-first geometry looks like when students build
  the proof themselves. This isn't AI-readiness work. It's what makes AI-readiness
  possible: students who've earned their own mathematical intuition before being handed
  tools that can think alongside them. If you're presenting on math engagement,
  immersive learning, or innovative environments — let's find 20 minutes.
</p>

// After
<p className="text-[15px] leading-[1.75] text-ink">
  I'll be at ISTE showing what discovery-first geometry looks like when students build
  the proof themselves. If you're presenting on math engagement,
  immersive learning, or innovative environments — let's find 20 minutes.
</p>
```

- [ ] **Step 2: Lint**

```bash
pnpm run lint
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "fix: remove AI-readiness bridge sentences from ISTE CTA"
```

---

### Task 4: Stat strip — remove `2 / week`, go to three-stat row

**Files:**
- Modify: `src/components/StatStrip.tsx`

- [ ] **Step 1: Remove the stat entry**

In `src/components/StatStrip.tsx`, remove the last entry in `STATS`. The array goes from four entries to three:

```tsx
const STATS: Stat[] = [
  { kind: 'static', display: '8.G.A.1 → 8.G.B.8', label: 'Standards covered' },
  { kind: 'count',  value: 36,                     label: 'Rounds across the sequence' },
  { kind: 'count',  value: 20,                     label: 'Sessions with 8th graders' },
]
```

- [ ] **Step 2: Update container class**

In `StatStrip`, change the container class on the `<div>` wrapping the stat cells. The current class is:

```tsx
"reveal-target my-10 grid grid-cols-2 min-[521px]:grid-cols-4 gap-px bg-rule border border-rule"
```

Change it to:

```tsx
"reveal-target my-10 grid grid-cols-3 gap-px bg-rule border border-rule"
```

The full updated `StatStrip` function:

```tsx
export function StatStrip() {
  return (
    <div className="reveal-target my-10 grid grid-cols-3 gap-px bg-rule border border-rule">
      {STATS.map((stat) => (
        <StatCell key={stat.label} {...stat} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Lint**

```bash
pnpm run lint
```

Expected: exits 0.

- [ ] **Step 4: Visual check**

```bash
pnpm run dev
```

Open http://localhost:5173. Confirm:
- Stat strip shows exactly three cells in a single row.
- `2 / week` / "Testing cadence" cell is gone.
- The `bg-rule` hairlines appear between the three remaining cells as before.
- No layout shift in the section below.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatStrip.tsx
git commit -m "fix: remove redundant 2/week stat, go to three-stat row"
```

---

### Task 5: Fix module card grid — mobile layout and 900px breakpoint

**Files:**
- Modify: `src/App.tsx` line 40

- [ ] **Step 1: Make the change**

In `src/App.tsx` line 40, update the wrapper `<div>` class. Replace:

```tsx
<div
  className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-3"
>
```

With:

```tsx
<div
  className="reveal-target mb-10 flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-px min-[900px]:border min-[900px]:border-rule min-[900px]:bg-rule"
>
```

- [ ] **Step 2: Lint**

```bash
pnpm run lint
```

Expected: exits 0.

- [ ] **Step 3: Visual check — mobile**

```bash
pnpm run dev
```

Open http://localhost:5173. In browser devtools, set viewport to 390px (iPhone 14) or 375px. Confirm:
- The three module cards stack vertically.
- There is ~40px breathing room between cards (no hairline touching).
- Each card's 3px amber top-rule is present (not a grid artifact — it should travel with the card).
- No amber/rule-color bars between cards (the `bg-rule` bleed should not be visible).

- [ ] **Step 4: Visual check — intermediate viewport**

Set viewport to 600px (landscape phone / narrow tablet). Confirm:
- Cards still stack vertically, not forced into a 3-col grid.
- This is correct — the grid should not appear until 900px.

- [ ] **Step 5: Visual check — desktop**

Set viewport to 1024px or wider. Confirm:
- Cards are in a 3-column row.
- `gap-px` column dividers (hairline rule color) appear between cards.
- Top amber rules on all three cards are visible.
- Layout looks correct.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "fix: fix module card grid — flex-col on mobile, grid at 900px breakpoint"
```

---

### Task 6: PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/portfolio-finishing-pass
```

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --title "fix: portfolio finishing pass" \
  --body "$(cat <<'EOF'
## Summary

- Cut \`— Complete\` from all three module card status badges (keep \`Live\`)
- Remove two AI-readiness bridge sentences from ISTE CTA paragraph
- Drop \`2 / week\` stat, stat strip goes from 4-cell 2×2 to 3-cell row
- Fix module card grid: \`flex-col gap-10\` on mobile, \`grid-cols-3\` at \`min-[900px]\` — fixes hairline-touching cards on mobile and prevents cramped 3-col layout at 521px–899px

## Test plan

- [ ] \`pnpm run lint\` exits 0
- [ ] Mobile (390px): cards stack with ~40px gap, amber top-rules intact, no rule-color bleed bars
- [ ] Intermediate (600px): cards still stack (not 3-col)
- [ ] Desktop (1024px+): 3-col grid with hairline dividers intact
- [ ] Stat strip shows 3 cells, no Testing Cadence cell
- [ ] ISTE CTA is two sentences only
- [ ] All module badges read \`LIVE\` without \`COMPLETE\`

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```
