---
title: Portfolio Finishing Pass
date: 2026-05-22
status: approved
---

# Portfolio Finishing Pass

Four targeted changes identified by screenshot review. No new features. No module files touched.

---

## 1. ISTE CTA — remove AI-readiness bridge sentences

**File:** `src/App.tsx` · `ISTESection` · lines 243–247

**Current:**

> I'll be at ISTE showing what discovery-first geometry looks like when students build the proof themselves. This isn't AI-readiness work. It's what makes AI-readiness possible: students who've earned their own mathematical intuition before being handed tools that can think alongside them. If you're presenting on math engagement, immersive learning, or innovative environments — let's find 20 minutes.

**New:**

> I'll be at ISTE showing what discovery-first geometry looks like when students build the proof themselves. If you're presenting on math engagement, immersive learning, or innovative environments — let's find 20 minutes.

**Rationale:** The two removed sentences are a bridge to a frame the work doesn't sit in natively (AI-readiness). They serve a Tier 2 audience. The trimmed version is two load-bearing sentences — both earn their place for Tier 1 targets (math engagement, immersive learning, innovative environments). The Calendly CTA immediately follows; every word before it should be doing work.

---

## 2. Module card status badges — cut "COMPLETE"

**File:** `src/App.tsx` · `WorkSection` · lines 43, 52, 61

Change all three instances:

```
status="Live — Complete"  →  status="Live"
```

**Rationale:** "LIVE" signals clickable and working — useful to a visitor. "COMPLETE" answers a question no visitor asked; it refers to a 45-day sprint plan the visitor can't see. Three instances of `LIVE` alone reads as clean confidence.

---

## 3. Stat strip — remove `2 / week`, go to three-stat row

**File:** `src/components/StatStrip.tsx` · `STATS` array

Remove the entry: `{ kind: 'static', display: '2 / week', label: 'Testing cadence' }`

The STATS array becomes three entries:

1. `8.G.A.1 → 8.G.B.8` — Standards covered
2. `36` — Rounds across the sequence
3. `20` — Sessions with 8th graders

Also update the container class in `StatStrip` from:
```
grid grid-cols-2 min-[521px]:grid-cols-4 gap-px bg-rule border border-rule
```
to:
```
grid grid-cols-3 gap-px bg-rule border border-rule
```

Three stats need no responsive column switching — `grid-cols-3` works at all widths and keeps the divider pattern intact.

**Rationale:** The `2 / week` stat is ~250px above the IVLA quote whose attribution reads "TESTED TWICE WEEKLY." Same fact, two elements, one redundant. The cadence evidence survives in the quote where it reads as proof, not as a metric. Three stats in a row is stronger than a 2×2 grid with a weak fourth cell.

---

## 4. Module card grid — fix mobile layout and breakpoint

**File:** `src/App.tsx` · `WorkSection` · line 40

**Current class string:**

```
reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-3
```

**New class string:**

```
reveal-target mb-10 flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-px min-[900px]:border min-[900px]:border-rule min-[900px]:bg-rule
```

**Why `gap-10` not `gap-12`:** Section padding is `py-16` (64px). The grid's `mb-10` (40px) separates cards from the stat strip below. Matching inter-card gap to `mb-10` keeps both at 40px — a consistent sub-section rhythm, well below the 64px section boundary. If you want more air, change both to `gap-12` / `mb-12` together.

**Why `min-[900px]` not `min-[521px]`:** At 521px, three cards in a row are ~165px each — too narrow for an R3F canvas plus multi-line description plus a two-column CTA strip. The 521px breakpoint was inherited from a 2×2 button selector designed for small controls; it is not suitable for content-dense module cards. At 900px, each card has ~280px minimum — enough for the canvas and copy to breathe.

**Why naive `gap-12` fails below 900px:** The `bg-rule` / `gap-px` trick works by letting rule color bleed through a 1px gap to draw hairline dividers. Widening that gap widens the bleed — a `gap-12` grid would render 48px amber/rule-colored bars between cards, not spacing. The fix is to exit the grid entirely on mobile and use flex with a normal gap.

**Amber top-rule verification:** The 3px amber rule at the top of each card is `<div className="h-[3px] w-full shrink-0 bg-amber-dim" />` — first child of the card root div, card-internal. It is not a grid bleed artifact. It travels correctly in flex layout.

---

## Not in scope

- **Imperative-verb voice gap** (CSE "Drag a plane" vs. card "Students predict…"): real seam, real copy pass across three cards. Parked for after ISTE. Do not touch this week.
- **R3F frameloop gate** (`IntersectionObserver` toggling `frameloop`): optional. Only pursue if demo device shows thermal/performance issues on the actual floor.
