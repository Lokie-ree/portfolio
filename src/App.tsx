import { useRef, lazy, Suspense, useState } from 'react'
import { ModuleCard } from '@/components/ModuleCard'
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useISTEEntrance, useScrollProgress } from '@/hooks/useScrollReveal'
import { StatStrip } from '@/components/StatStrip'
import { CoordGridBackground } from '@/components/CoordGridBackground'

const HeroCanvas = lazy(() =>
  import('@/components/HeroCanvas').then(m => ({ default: m.HeroCanvas }))
)
const RigidMotionsPreview = lazy(() =>
  import('@/components/RigidMotionsPreview').then(m => ({ default: m.RigidMotionsPreview }))
)
const DilationsPreview = lazy(() =>
  import('@/components/DilationsPreview').then(m => ({ default: m.DilationsPreview }))
)
const PythagoreanTheoremPreview = lazy(() =>
  import('@/components/PythagoreanTheoremPreview').then(m => ({ default: m.PythagoreanTheoremPreview }))
)
const CrossSectionPreview = lazy(() =>
  import('@/components/CrossSectionPreview').then(m => ({ default: m.CrossSectionPreview }))
)

const sectionClass = 'border-b border-rule py-16'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="reveal-target mb-10 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
      {children}
    </p>
  )
}

function WorkSection() {
  const ref = useScrollReveal<HTMLElement>()
  const proofRef = useProofBlockReveal<HTMLDivElement>()
  return (
    <section ref={ref} id="work" className={sectionClass}>
      <SectionLabel>Creative Lab</SectionLabel>
      <div
        className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-3"
      >
        <ModuleCard
          status="Live"
          title="Rigid Motions"
          standard="8.G.A.1–3 · Grade 8 Geometry"
          description="Students predict each rigid motion, watch the image land, then reconcile with what they expected — formal vocabulary for congruence arrives after the motion is something they've already done, not a list to memorize first."
          href="https://creative-lab-five.vercel.app"
          labGuideHref="https://iste-26.vercel.app/#rigid-motions"
          preview={<RigidMotionsPreview paused={false} />}
        />
        <ModuleCard
          status="Live"
          title="Dilations & Similarity"
          standard="8.G.A.3–5 · Grade 8 Geometry"
          description="Students move from scale factor through visual argument to the AA criterion — they justify similarity from what the figures show before the textbook definition names it for them."
          href="https://creative-lab-five.vercel.app"
          labGuideHref="https://iste-26.vercel.app/#dilations"
          preview={<DilationsPreview paused={false} />}
        />
        <ModuleCard
          status="Live"
          title="Pythagorean Theorem"
          standard="8.G.B.7–8 · Grade 8 Geometry"
          description="Students build the area proof themselves — the algebraic statement only appears after they've already seen why it's true. Formula as reward, not starting point."
          href="https://creative-lab-five.vercel.app"
          labGuideHref="https://iste-26.vercel.app/#pythagorean-theorem"
          preview={<PythagoreanTheoremPreview paused={false} />}
        />
      </div>

      <StatStrip />

      <div ref={proofRef} className="relative bg-surface px-5 py-[18px]">
        <div className="proof-border absolute left-0 top-0 h-full w-0.5 bg-amber" />
        <div className="proof-content">
          <p className="font-display text-sm font-light italic leading-relaxed text-ink">
            "The STEM Club doesn't just use these tools — their behavior shapes every iteration.
            Every design decision has a student behind it."
          </p>
          <cite className="mt-2 block text-xs font-normal uppercase tracking-wide text-muted not-italic">
            IVLA STEM Club · tested twice weekly
          </cite>
        </div>
      </div>
    </section>
  )
}

function LiveDemoSection() {
  const ref = useScrollReveal<HTMLElement>()
  const [hovered, setHovered] = useState(false)

  return (
    <section ref={ref} className={sectionClass}>
      <SectionLabel>Live Demo — Cross-Section Explorer</SectionLabel>

      <div
        className="reveal-target group relative overflow-hidden border border-rule bg-surface transition-[background-color,border-color] duration-150 cursor-pointer hover:border-amber hover:bg-surface-hi"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Amber top bar */}
        <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

        {/* Horizontal split: preview (1.2fr) | text (1fr) */}
        <div className="grid grid-cols-1 min-[521px]:grid-cols-[1.2fr_1fr]">
          {/* Preview pane — above text on mobile (source order) */}
          <div className="h-[220px] min-[521px]:h-[280px] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
            <Suspense fallback={<div style={{ minHeight: 220, background: 'var(--color-surface)' }} />}>
              <CrossSectionPreview paused={hovered} />
            </Suspense>
          </div>

          {/* Text pane */}
          <div className="flex flex-col justify-center border-t border-rule px-6 py-6 min-[521px]:border-l min-[521px]:border-t-0">
            <p className="mb-2 font-display text-[22px] font-normal leading-tight text-ink">
              Cross-Section Explorer
            </p>
            <div className="mb-5 space-y-3 text-[13px] leading-relaxed text-muted">
              <p>Drag a plane through a cube. Watch the slice become a hexagon.</p>
              <p>
                Then revolve a silhouette and watch the same structure appear from a different
                direction. Two operations. One underlying geometry. That connection is the lesson.
              </p>
              <p>
                A standalone exploration of 3D-to-2D cross-sections — where intuition and formula
                diverge most sharply, and where dual representations earn their keep.
              </p>
            </div>
            <a
              href="https://creative-lab-demos.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs tracking-wide text-amber no-underline transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              Open demo →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Static data defined at module level — only used by AboutSection
const ABOUT_ACTS = [
  {
    hook: "Every student decides in the first five minutes whether math is something that happens to them.",
    body: "15 years in the classroom. The decision happened before I said a word. It happened in the moment they picked up the pencil — or didn't. I started asking what made the difference.",
    accentClass: 'bg-amber',
  },
  {
    hook: "It was never the content. It was whether they got to touch the idea first.",
    body: "Challenge before explanation. Not as a teaching trick — as a design principle. When students manipulate the idea before they're told what to think about it, the formula becomes a reward. Earned, not given.",
    accentClass: 'bg-amber',
  },
  {
    hook: "Now I build the tools that scale that insight.",
    body: "8th graders, twice a week. When a student calls it \"sick,\" the design works. That's the validation standard — not a rubric, not a survey. Behavior. Because agency shows up in what students do next, not in what they report afterward.",
    accentClass: 'bg-muted',
  },
]

function AboutSection() {
  const ref = useScrollReveal<HTMLElement>()
  return (
    <section ref={ref} id="about" className={sectionClass}>
      <SectionLabel>Origin</SectionLabel>
      <div className="flex flex-col divide-y divide-rule">
        {ABOUT_ACTS.map((act, i) => (
          <div
            key={i}
            className="reveal-target grid grid-cols-[3px_1fr] gap-6 py-8 first:pt-0 last:pb-0"
          >
            <div className={`self-stretch rounded-sm mt-1 ${act.accentClass}`} />
            <div>
              <p className="font-display text-[22px] font-light leading-[1.3] text-ink mb-4">
                {act.hook}
              </p>
              <p className="text-[14px] leading-[1.8] text-muted">
                {act.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PelicanSection() {
  const ref = useScrollReveal<HTMLElement>()
  return (
    <section ref={ref} className={sectionClass}>
      <div className="reveal-target grid grid-cols-1 items-start gap-4 min-[521px]:grid-cols-[1fr_2fr] min-[521px]:gap-8">
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Also Building
          </p>
          <span className="inline-block border border-rule px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
            Beta
          </span>
        </div>
        <div className="text-[15px] leading-[1.8] text-ink">
          <p className="mb-3 font-display text-xl font-normal">Pelican AI</p>
          <p>
            An AI coaching layer for Louisiana teachers — built on the LSSM, LER, and LEADS
            frameworks. Standards-aligned planning that works the way teachers actually think.
          </p>
          <a
            href="https://pelicanai.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-[13px] text-amber no-underline transition-colors hover:underline"
          >
            pelicanai.org →
          </a>
        </div>
      </div>
    </section>
  )
}

function ISTESection() {
  const ref = useISTEEntrance<HTMLElement>()
  return (
    <section ref={ref} className={sectionClass} style={{ position: 'relative', paddingTop: 80, paddingBottom: 80 }}>
      <CoordGridBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 items-center gap-6 min-[521px]:grid-cols-[2fr_1fr] min-[521px]:gap-12">
          <div>
            <p id="iste-date" className="mb-1 font-display text-[40px] font-light leading-tight text-ink">
              {"ISTE Live 26".split('').map((char, i) => (
                <span key={i} className="inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </p>
            <p className="mb-5 text-[13px] uppercase tracking-wide text-muted">
              Orlando · June 28 – July 1, 2026
            </p>
            <p className="text-[15px] leading-[1.75] text-ink">
              I'll be at ISTE showing what discovery-first geometry looks like when students build
              the proof themselves. This isn't AI-readiness work. It's what makes AI-readiness
              possible: students who've earned their own mathematical intuition before being handed
              tools that can think alongside them. If you're presenting on math engagement,
              immersive learning, or innovative environments — let's find 20 minutes.
            </p>
          </div>
          <div className="text-left min-[521px]:text-right">
            {/* iste-cta class is a JS selector hook for useISTEEntrance — no CSS rules */}
            <a
              href="https://calendly.com/rplapointjr/"
              target="_blank"
              rel="noopener noreferrer"
              className="iste-cta inline-block px-[22px] py-3 text-[13px] font-medium tracking-wide no-underline"
              style={{
                background: 'var(--color-amber-dim)',
                color: 'var(--color-ink)',
                transition: 'background 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'var(--color-amber)'
                el.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'var(--color-amber-dim)'
                el.style.transform = 'scale(1)'
              }}
            >
              Let's meet →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}


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
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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

export default function App() {
  const heroRef = useRef<HTMLDivElement>(null)
  useNavReveal(typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600)
  useHeroEntrance()
  useScrollProgress()

  return (
    <>
      <div
        id="scroll-progress"
        className="pointer-events-none fixed top-0 left-0 z-[60] h-0.5 w-full bg-amber"
      />

      <nav
        id="site-nav"
        className="fixed left-0 right-0 top-0 z-50 box-border w-full border-b border-rule bg-ground/45 backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="mx-auto flex min-w-0 w-full max-w-[1152px] items-center justify-between gap-3 px-8 py-4 md:px-6">
          <a href="#" aria-label="Home" className="flex min-w-0 shrink-0 items-center gap-[10px] text-ink no-underline">
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
          <ul className="flex shrink-0 list-none gap-4 min-[521px]:gap-6">
            {(['work', 'about'] as const).map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-[12px] uppercase tracking-wide text-muted no-underline transition-colors hover:text-amber min-[521px]:text-[13px]"
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="mx-auto max-w-[1152px] px-8 md:px-6">
        <div
          ref={heroRef}
          className="relative flex flex-col justify-start min-[521px]:justify-center border-b border-rule pt-24 pb-16 min-h-screen min-[521px]:pb-[72px]"
        >
          <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: 'var(--color-surface)' }} />}>
            <HeroCanvas />
          </Suspense>

          <div className="relative z-10">
            <p className="hero-label mb-7 text-xs font-medium uppercase tracking-[0.12em] text-amber">
              Interactive Learning Designer
            </p>

            <h1 className="mb-7 max-w-[720px] font-display text-[clamp(28px,8vw,44px)] font-light leading-[1.15] tracking-tight text-ink min-[521px]:text-[clamp(32px,5.2vw,52px)]">
              Geometry is built from operations students can{' '}
              <em className="text-amber italic">feel</em>
              {' '}— not formulas students inherit.
            </h1>

            <div className="hero-sub mb-9 max-w-[520px] space-y-3 text-base leading-[1.7] text-muted">
              <p>
                Mathematician. 15 years in the classroom. Now building the tools that scale what I
                learned about how students actually learn.
              </p>
              <p>
                Built around the ISTE Transformational Learning Principles — Spark Curiosity,
                Develop Expertise, and Ignite Agency aren't decorations here. They're the design spec.
              </p>
            </div>

            <div
              className="hero-proof inline-flex max-w-full items-center gap-2.5 bg-amber/12 border border-amber/50 px-4 py-2.5 text-[13px] leading-snug text-ink"
            >
              <span className="size-[7px] shrink-0 rounded-full bg-amber" />
              Every module is tested twice a week with 8th graders. Their behavior shapes every
              iteration.
            </div>
          </div>
        </div>

        <LiveDemoSection />
        <WorkSection />
        <AboutSection />
        <PelicanSection />
        <ISTESection />
        <Footer />
      </main>
    </>
  )
}
