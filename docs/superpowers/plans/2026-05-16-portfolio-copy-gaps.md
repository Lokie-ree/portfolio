# Portfolio Copy Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply three targeted copy edits to `src/App.tsx` that fix a paragraph duplication, anchor the CSE demo structurally, and add an AI-readiness positioning sentence to the ISTE section.

**Architecture:** Pure JSX text content edits — no new components, no layout changes, no new files. All three edits are in `src/App.tsx` and are fully independent.

**Tech Stack:** React/TypeScript, Vite, pnpm. Lint via ESLint (`pnpm run lint`).

**Spec:** `docs/superpowers/specs/2026-05-16-portfolio-copy-gaps-design.md`

---

### File Map

| File | Change |
|---|---|
| `src/App.tsx` | Three copy edits (lines ~187–197, ~145–151, ~339–342) |

No files created. No other files modified.

---

### Task 1: Fix SystemSection paragraph duplication

**Files:**
- Modify: `src/App.tsx:187–197` (`SystemSection`, the `<div className="reveal-target mb-8 max-w-xl...">` block)

- [ ] **Step 1: Locate the target block**

In `src/App.tsx`, find `SystemSection`. The copy block starts around line 187:

```tsx
<div className="reveal-target mb-8 max-w-xl space-y-3 text-[14px] leading-relaxed text-muted">
  <p>
    Three modules covering 8.G.A.1–8.G.B.8. Each shares the same interactional vocabulary —
    students who've been through Rigid Motions already know how to be in Dilations. The
    consistency is part of the design.
  </p>
  <p>
    Three modules. Each pairs a browser-based interactive with a printed lab guide — students
    manipulate the geometry first, the formula arrives as confirmation.
  </p>
</div>
```

- [ ] **Step 2: Replace both paragraphs with the merged single paragraph**

Replace the entire `<div className="reveal-target mb-8 max-w-xl space-y-3 ...">` block with:

```tsx
<div className="reveal-target mb-8 max-w-xl space-y-3 text-[14px] leading-relaxed text-muted">
  <p>
    Three modules covering 8.G.A.1–8.G.B.8. Each pairs a browser-based interactive with a
    printed lab guide — students manipulate the geometry first, the formula arrives as
    confirmation. Each shares the same interactional vocabulary: students who've been
    through Rigid Motions already know how to be in Dilations. The consistency is part of
    the design.
  </p>
</div>
```

Note: Use literal apostrophes throughout — the existing file does not HTML-escape them, and JSX handles them fine.

- [ ] **Step 3: Run lint**

```bash
pnpm run lint
```

Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "fix: merge duplicate SystemSection paragraphs into one"
```

---

### Task 2: Add CSE anchor sentence in LiveDemoSection

**Files:**
- Modify: `src/App.tsx` — `LiveDemoSection`, the description `<div className="mb-5 space-y-3 ...">` block

- [ ] **Step 1: Locate the target block**

In `LiveDemoSection`, find the description block (around line 145):

```tsx
<div className="mb-5 space-y-3 text-[13px] leading-relaxed text-muted">
  <p>Drag a plane through a cube. Watch the slice become a hexagon.</p>
  <p>
    Then revolve a silhouette and watch the same structure appear from a different
    direction. Two operations. One underlying geometry. That connection is the lesson.
  </p>
</div>
```

- [ ] **Step 2: Add the anchor sentence as a third paragraph**

```tsx
<div className="mb-5 space-y-3 text-[13px] leading-relaxed text-muted">
  <p>Drag a plane through a cube. Watch the slice become a hexagon.</p>
  <p>
    Then revolve a silhouette and watch the same structure appear from a different
    direction. Two operations. One underlying geometry. That connection is the lesson.
  </p>
  <p>
    Built as a standalone demo — the geometry that lives outside the 8.G sequence and
    demanded its own exploration.
  </p>
</div>
```

- [ ] **Step 3: Run lint**

```bash
pnpm run lint
```

Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "copy: anchor CSE as standalone demo in LiveDemoSection"
```

---

### Task 3: Insert AI-readiness sentence in ISTESection

**Files:**
- Modify: `src/App.tsx` — `ISTESection`, the body `<p>` element

- [ ] **Step 1: Locate the target paragraph**

In `ISTESection`, find the body paragraph (around line 339):

```tsx
<p className="text-[15px] leading-[1.75] text-ink">
  I'll be at ISTE showing what discovery-first geometry looks like when students build
  the proof themselves. If you're presenting on math engagement, immersive learning, or
  innovative environments — let's find 20 minutes.
</p>
```

- [ ] **Step 2: Insert Draft C between the two existing sentences**

```tsx
<p className="text-[15px] leading-[1.75] text-ink">
  I'll be at ISTE showing what discovery-first geometry looks like when students build
  the proof themselves. This isn't AI-readiness work. It's what makes AI-readiness
  possible: students who've earned their own mathematical intuition before being handed
  tools that can think alongside them. If you're presenting on math engagement,
  immersive learning, or innovative environments — let's find 20 minutes.
</p>
```

Note: Use literal apostrophes throughout — the existing file does not HTML-escape them, and JSX handles them fine.

- [ ] **Step 3: Run lint**

```bash
pnpm run lint
```

Expected: exit 0, no errors.

- [ ] **Step 4: Verify visually**

```bash
pnpm run dev
```

Navigate to the ISTE section. Confirm the three sentences read as one coherent paragraph. The AI-readiness sentence should sit between the proof-building sentence and the meeting-ask sentence.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "copy: add AI-readiness positioning sentence to ISTE section"
```

---

### Final verification

- [ ] Run `pnpm run lint` — must exit 0
- [ ] Confirm three commits are on the branch, each clean
- [ ] Optionally run `pnpm run build` to confirm no TypeScript or build errors introduced
