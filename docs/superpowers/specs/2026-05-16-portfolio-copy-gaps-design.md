# Portfolio Copy Gaps — Design Spec
Date: 2026-05-16

## Summary

Three targeted copy edits identified by mentor review. No structural changes to components or layout — pure copy. All changes are in `src/App.tsx`.

---

## Gap 1 — SystemSection copy duplication

**Problem:** Two consecutive paragraphs both open with "Three modules." The second is a weaker restatement of the first.

**File / lines:** `src/App.tsx`, `SystemSection`, lines 188–196

**Change:** Replace both paragraphs with one merged paragraph. Lead with the interactive/lab-guide pairing (concrete), close with the cross-module-consistency claim (strategic).

**Approved copy:**
> Three modules covering 8.G.A.1–8.G.B.8. Each pairs a browser-based interactive with a printed lab guide — students manipulate the geometry first, the formula arrives as confirmation. Each shares the same interactional vocabulary: students who've been through Rigid Motions already know how to be in Dilations. The consistency is part of the design.

---

## Gap 2 — CSE structural framing

**Problem:** `LiveDemoSection` has no copy that locates the Cross-Section Explorer relative to the three-module system. A reader who reaches `SystemSection` and counts three modules may wonder where CSE fits.

**File / lines:** `src/App.tsx`, `LiveDemoSection`, description block (the `<p>` tags inside the text pane)

**Change:** Add one sentence after the existing last paragraph ("Two operations. One underlying geometry. That connection is the lesson."):

**Approved copy (new sentence):**
> Built as a standalone demo — the geometry that lives outside the 8.G sequence and demanded its own exploration.

---

## Gap 3 — AI-readiness positioning (ISTE section)

**Problem:** No copy addresses the AI-readiness conversation that will dominate ISTE 26. Silence reads as absence, not deliberate non-claim.

**Decision:** Add one owning sentence that positions Creative Lab as *upstream* of AI-readiness work — not an AI-readiness tool, but the conceptual grounding AI-readiness takes for granted.

**File / lines:** `src/App.tsx`, `ISTESection`, body paragraph

**Change:** Insert Draft C between the existing two sentences.

**Approved copy (full paragraph after edit):**
> I'll be at ISTE showing what discovery-first geometry looks like when students build the proof themselves. This isn't AI-readiness work. It's what makes AI-readiness possible: students who've earned their own mathematical intuition before being handed tools that can think alongside them. If you're presenting on math engagement, immersive learning, or innovative environments — let's find 20 minutes.

---

## Constraints

- No new components, no layout changes
- `pnpm run lint` must exit 0 after edits
- All three edits are independent and can be applied in any order
