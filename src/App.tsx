import { useRef, lazy, Suspense } from 'react'
import { ModuleCard } from '@/components/ModuleCard'

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
import { useScrollReveal, useNavReveal, useHeroEntrance, useProofBlockReveal, useISTEEntrance, useContactUnderline, useScrollProgress } from '@/hooks/useScrollReveal'
import { StatStrip } from '@/components/StatStrip'
import { CoordGridBackground } from '@/components/CoordGridBackground'

const sectionClass = 'border-b border-rule py-16'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="reveal-target mb-10 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
      {children}
    </p>
  )
}

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

function WorkSection() {
  const ref = useScrollReveal<HTMLElement>()
  const proofRef = useProofBlockReveal<HTMLDivElement>()
  return (
    <section ref={ref} id="work" className={sectionClass}>
      <SectionLabel>The Work — Creative Lab</SectionLabel>
      <div
        className="reveal-target mb-10 grid grid-cols-1 gap-px border border-rule bg-rule min-[521px]:grid-cols-3"
      >
        <ModuleCard
          status="Live — Complete"
          title="Rigid Motions"
          standard="8.G.A.1–3 · Grade 8 Geometry"
          description="Translations, reflections, and rotations through a predict-and-reveal loop. Formula appears after demonstrated understanding — never before."
          href="https://creative-lab-five.vercel.app"
          preview={<Suspense fallback={<div style={{ minHeight: 200, background: 'var(--color-surface)' }} />}><RigidMotionsPreview paused={false} /></Suspense>}
        />
        <ModuleCard
          status="Live — Complete"
          title="Dilations & Similarity"
          standard="8.G.A.3–5 · Grade 8 Geometry"
          description="Scale factor to AA criterion across 14 rounds and 4 phases. Students prove triangle similarity before they're told what similarity means."
          href="https://creative-lab-five.vercel.app"
          preview={<Suspense fallback={<div style={{ minHeight: 200, background: 'var(--color-surface)' }} />}><DilationsPreview paused={false} /></Suspense>}
        />
        <ModuleCard
          status="Live — Complete"
          title="Pythagorean Theorem"
          standard="8.G.B.7–8 · Grade 8 Geometry"
          description="Area-first proof of the theorem. Students discover a² + b² = c² through three animated squares before the algebraic statement appears."
          href="https://creative-lab-five.vercel.app"
          preview={
            <Suspense fallback={<div style={{ minHeight: 200, background: 'var(--color-surface)' }} />}>
              <PythagoreanTheoremPreview paused={false} />
            </Suspense>
          }
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
    body: "React Three Fiber. GSAP. Real 8th graders twice a week. Every module is tested until the behavior confirms the design. The goal: interactive experiences that make hard ideas feel obvious — in retrospect.",
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
              I'll be at ISTE this summer showing what discovery-first, student-tested interactive
              math looks like in practice. If you're building in this space — or just curious —
              I'd like to talk.
            </p>
          </div>
          <div className="text-left min-[521px]:text-right">
            {/* iste-cta class is a JS selector hook for useISTEEntrance — no CSS rules */}
            <a
              href="mailto:rplapointjr@gmail.com"
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

function ContactSection() {
  const ref = useScrollReveal<HTMLElement>()  // handles "Contact" label
  useContactUnderline(ref)                    // handles underline draw (shares same ref)
  return (
    <section ref={ref} id="contact" className="pt-14 pb-20">
      <p className="reveal-target mb-10 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Contact
      </p>
      <div className="reveal-target inline-block relative">
        <a
          href="mailto:rplapointjr@gmail.com"
          className="font-display text-[clamp(24px,4vw,36px)] font-light text-ink no-underline transition-colors hover:text-amber"
        >
          rplapointjr@gmail.com
        </a>
        <span className="contact-underline absolute bottom-0 left-0 h-px w-full bg-amber" />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="flex items-center justify-between py-6 text-[11px] text-muted border-t border-rule">
      <span>© 2026 Randall LaPoint, Jr.</span>
      <a href="#" className="text-muted no-underline transition-colors hover:text-amber">↑ Top</a>
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
        className="fixed top-0 left-1/2 z-50 flex w-full max-w-[1152px] -translate-x-1/2 items-center justify-between gap-3 border-b border-rule bg-ground/92 px-8 py-4 backdrop-blur-md md:px-6"
      >
        <span className="shrink-0 font-display text-[15px] font-normal max-[380px]:text-sm">
          Randall LaPoint, Jr.
        </span>
        <ul className="flex list-none gap-4 min-[521px]:gap-6">
          {(['work', 'about', 'contact'] as const).map((id) => (
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

            <h1 className="mb-7 max-w-[640px] font-display text-[clamp(32px,9vw,44px)] font-light leading-[1.15] tracking-tight text-ink min-[521px]:text-[clamp(36px,6vw,58px)]">
              I build experiences that help people understand things they{' '}
              <em className="text-amber italic">thought were hard</em>
            </h1>

            <p className="hero-sub mb-9 max-w-[480px] text-base leading-[1.7] text-muted">
              Mathematician. 15 years in the classroom. Now building the tools that scale
              what I learned about how students actually learn.
            </p>

            <div
              className="hero-proof inline-flex max-w-full items-center gap-2.5 bg-amber/12 border border-amber/50 px-4 py-2.5 text-[13px] leading-snug text-ink"
            >
              <span className="size-[7px] shrink-0 rounded-full bg-amber" />
              Every module is tested twice a week with real students. Their behavior shapes every
              iteration.
            </div>
          </div>
        </div>

        <WorkSection />
        <SystemSection />
        <AboutSection />
        <PelicanSection />
        <ISTESection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
