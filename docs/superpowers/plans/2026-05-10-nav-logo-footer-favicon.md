# Nav Logo, Footer Social Links & Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive hexagon logo lockup to the nav, remove the contact section, move social links to the footer, and fix favicon legibility.

**Architecture:** All changes are in `src/App.tsx` (nav + footer + remove ContactSection), `src/hooks/useScrollReveal.ts` (dead export cleanup), and two SVG files for the favicon fix. No new components, no new dependencies.

**Tech Stack:** React 18, TypeScript, Tailwind v4, Vite. Inline SVG JSX (no icon library, no vite-plugin-svgr).

---

## File Map

| File | What changes |
|------|-------------|
| `public/favicon.svg` | Add `<rect>` background, bump polygon `stroke-width` |
| `src/assets/favicon-hexagon.svg` | Same as above — kept in sync |
| `src/App.tsx` | Nav lockup, nav array, delete `ContactSection`, update `Footer` |
| `src/hooks/useScrollReveal.ts` | Delete `useContactUnderline` function + export |

---

## Task 1: Fix favicon legibility

**Files:**
- Modify: `public/favicon.svg`
- Modify: `src/assets/favicon-hexagon.svg`

Both files are currently identical. Edit each to add a dark background and heavier stroke.

- [ ] **Step 1: Edit `public/favicon.svg`**

Open `public/favicon.svg`. After the opening `<svg …>` tag and before the first `<polygon>`, insert:

```svg
<rect width="48" height="48" fill="#0d0d0d" rx="4"/>
```

Then find `stroke-width="2.2"` on the `<polygon>` element and change it to `stroke-width="3"`.

Final file should look like:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <rect width="48" height="48" fill="#0d0d0d" rx="4"/>
  <polygon points="42,24 33,39.59 15,39.59 6,24 15,8.41 33,8.41" stroke="#d4962a" stroke-width="3" stroke-linejoin="round" fill="#d4962a" fill-opacity="0.12"></polygon>
  <line x1="39" y1="24" x2="9" y2="24" stroke="#d4962a" stroke-width="0.9" opacity="0.45"></line>
  <line x1="31.5" y1="37.2" x2="16.5" y2="10.8" stroke="#d4962a" stroke-width="0.9" opacity="0.45"></line>
  <line x1="16.5" y1="37.2" x2="31.5" y2="10.8" stroke="#d4962a" stroke-width="0.9" opacity="0.45"></line>
  <circle cx="42" cy="24" r="1.4" fill="#d4962a" opacity="0.85"></circle>
  <circle cx="33" cy="39.59" r="1.4" fill="#d4962a" opacity="0.85"></circle>
  <circle cx="15" cy="39.59" r="1.4" fill="#d4962a" opacity="0.85"></circle>
  <circle cx="6" cy="24" r="1.4" fill="#d4962a" opacity="0.85"></circle>
  <circle cx="15" cy="8.41" r="1.4" fill="#d4962a" opacity="0.85"></circle>
  <circle cx="33" cy="8.41" r="1.4" fill="#d4962a" opacity="0.85"></circle>
</svg>
```

- [ ] **Step 2: Apply the same changes to `src/assets/favicon-hexagon.svg`**

Copy the final content from Step 1 exactly into `src/assets/favicon-hexagon.svg`. Both files must be identical.

- [ ] **Step 3: Verify favicon in browser**

Run `pnpm run dev`, open `http://localhost:5173`, and do a hard refresh (Ctrl+Shift+R). Check the browser tab — the favicon should show a dark rounded square with the amber hexagon visible at ~16px.

- [ ] **Step 4: Commit**

```bash
git add public/favicon.svg src/assets/favicon-hexagon.svg
git commit -m "fix: add dark background and heavier stroke to favicon for tab legibility"
```

---

## Task 2: Remove ContactSection and dead hook export

**Files:**
- Modify: `src/App.tsx` — delete `ContactSection` component and its render call
- Modify: `src/hooks/useScrollReveal.ts` — delete `useContactUnderline`

> **Before deleting:** The `ContactSection` component contains the GitHub and LinkedIn `<svg>` `<path>` strings that will be reused in the footer (Task 3). Copy those two path strings out before deleting the component.

The GitHub path:
```
M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z
```

The LinkedIn path:
```
M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z
```

- [ ] **Step 1: Delete `ContactSection` from `src/App.tsx`**

Find and delete the entire `ContactSection` function (roughly 40 lines starting with `function ContactSection()`). Also remove the `<ContactSection />` line from the App layout (it sits between `<ISTESection />` and `<Footer />`).

- [ ] **Step 2: Delete `useContactUnderline` from `src/hooks/useScrollReveal.ts`**

Find the `useContactUnderline` function — it starts with the JSDoc comment `/** Draw the contact email underline…` and ends with the closing `}` of the function body. Delete the entire block including the JSDoc. Also remove `useContactUnderline` from the `export` statement / named export if it appears there separately.

- [ ] **Step 3: Run lint**

```bash
pnpm run lint
```

Expected: exit code 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/hooks/useScrollReveal.ts
git commit -m "refactor: remove ContactSection and dead useContactUnderline hook"
```

---

## Task 3: Update Footer with social icon links

**Files:**
- Modify: `src/App.tsx` — `Footer` function only

- [ ] **Step 1: Replace the `Footer` function**

Find the current `Footer` function in `src/App.tsx`:

```tsx
function Footer() {
  return (
    <footer className="flex items-center justify-between py-6 text-[11px] text-muted border-t border-rule">
      <span>© 2026 Randall LaPoint, Jr.</span>
      <a href="#" className="text-muted no-underline transition-colors hover:text-amber">↑ Top</a>
    </footer>
  )
}
```

Replace it with:

```tsx
function Footer() {
  return (
    <footer className="flex items-center justify-between py-6 text-[11px] text-muted border-t border-rule">
      <span>© 2026 Randall LaPoint, Jr.</span>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/Lokie-ree"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="flex items-center text-muted transition-colors hover:text-amber"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/lapointwebdev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="flex items-center text-muted transition-colors hover:text-amber"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a href="#" className="text-muted no-underline transition-colors hover:text-amber">↑ Top</a>
      </div>
    </footer>
  )
}
```

Note: No `width`/`height` SVG attributes — sizing is handled entirely by Tailwind `w-4 h-4`.

- [ ] **Step 2: Run lint**

```bash
pnpm run lint
```

Expected: exit code 0.

- [ ] **Step 3: Visually verify in browser**

Check the footer: GitHub icon → LinkedIn icon → ↑ Top should appear on the right, all turning amber on hover. Icons should be ~16px.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add GitHub and LinkedIn icon links to footer"
```

---

## Task 4: Nav responsive logo lockup

**Files:**
- Modify: `src/App.tsx` — nav section only

- [ ] **Step 1: Replace the nav brand span with the logo lockup**

In `src/App.tsx`, find this nav element (inside the `<nav>` returned by `App`):

```tsx
<span className="shrink-0 font-display text-[15px] font-normal max-[380px]:text-sm">
  Randall LaPoint, Jr.
</span>
```

Replace it with:

```tsx
<a href="#" aria-label="Home" className="flex shrink-0 items-center gap-[10px] text-ink no-underline">
  <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <polygon points="90,50 70,84.64 30,84.64 10,50 30,15.36 70,15.36" stroke="#d4962a" strokeWidth="2.5" strokeLinejoin="round" fill="#d4962a" fillOpacity="0.07" />
    <line x1="90" y1="50" x2="10" y2="50" stroke="#d4962a" strokeWidth="0.9" opacity="0.35" />
    <line x1="70" y1="84.64" x2="30" y2="15.36" stroke="#d4962a" strokeWidth="0.9" opacity="0.35" />
    <line x1="30" y1="84.64" x2="70" y2="15.36" stroke="#d4962a" strokeWidth="0.9" opacity="0.35" />
    <circle cx="90" cy="50" r="2.6" fill="#d4962a" opacity="0.8" />
    <circle cx="70" cy="84.64" r="2.6" fill="#d4962a" opacity="0.8" />
    <circle cx="30" cy="84.64" r="2.6" fill="#d4962a" opacity="0.8" />
    <circle cx="10" cy="50" r="2.6" fill="#d4962a" opacity="0.8" />
    <circle cx="30" cy="15.36" r="2.6" fill="#d4962a" opacity="0.8" />
    <circle cx="70" cy="15.36" r="2.6" fill="#d4962a" opacity="0.8" />
  </svg>
  <span className="hidden min-[521px]:inline font-display text-[15px] font-normal">
    Randall LaPoint, Jr.
  </span>
</a>
```

> **SVG attribute note:** JSX uses camelCase — `strokeWidth`, `strokeLinejoin`, `fillOpacity` (not `stroke-width`, `stroke-linejoin`, `fill-opacity`). The source SVG file uses kebab-case; convert when pasting into JSX.

- [ ] **Step 2: Remove `'contact'` from the nav links array**

Find:
```tsx
{(['work', 'about', 'contact'] as const).map((id) => (
```

Change to:
```tsx
{(['work', 'about'] as const).map((id) => (
```

- [ ] **Step 3: Run lint**

```bash
pnpm run lint
```

Expected: exit code 0.

- [ ] **Step 4: Run build**

```bash
pnpm run build
```

Expected: completes with no TypeScript errors.

- [ ] **Step 5: Visually verify in browser**

Run `pnpm run dev`. Check:
- At full width (≥521px): hexagon icon + "Randall LaPoint, Jr." visible in nav; nav links are "work" and "about" only.
- Narrow the browser below 521px: name disappears, hexagon icon remains.
- Click the hexagon: page scrolls to top.
- Scroll to bottom: no contact section exists.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add responsive hexagon logo lockup to nav, remove contact link"
```

---

## Task 5: Final acceptance check

- [ ] **Step 1: Run lint**

```bash
pnpm run lint
```

Expected: exit code 0, no errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```

Expected: no TypeScript errors, dist/ produced.

- [ ] **Step 3: Manual acceptance criteria sweep**

Check each item from the spec:
- [ ] Nav shows hexagon + name on ≥521px
- [ ] Nav shows hexagon only below 521px
- [ ] Nav `<a>` has `aria-label="Home"`, no blue/underline bleed
- [ ] Nav links: work and about only
- [ ] No `id="contact"` in the DOM (inspect → Ctrl+F "contact")
- [ ] `useContactUnderline` absent from `useScrollReveal.ts`
- [ ] Footer: GitHub → LinkedIn → ↑ Top in one flex group, all hover amber
- [ ] GitHub/LinkedIn links open in new tab
- [ ] Footer icons ~16px, no SVG `width`/`height` attributes
- [ ] `public/favicon.svg` has `<rect fill="#0d0d0d"` as first child, `stroke-width="3"`
- [ ] `src/assets/favicon-hexagon.svg` matches `public/favicon.svg`
- [ ] Favicon legible in browser tab after hard-refresh (Ctrl+Shift+R)
