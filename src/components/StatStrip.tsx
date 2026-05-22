import { useCountUp } from '@/hooks/useCountUp'

type Stat =
  | { kind: 'count'; value: number; label: string; prefix?: string }
  | { kind: 'static'; display: string; label: string }

const STATS: Stat[] = [
  { kind: 'static', display: '8.G.A.1 → 8.G.B.8', label: 'Standards covered' },
  { kind: 'count',  value: 36,                     label: 'Rounds across the sequence' },
  { kind: 'count',  value: 20,                     label: 'Sessions with 8th graders' },
]

function StatCell(stat: Stat) {
  const countStat = stat.kind === 'count' ? stat : null
  const { value, ref } = useCountUp<HTMLSpanElement>(countStat?.value ?? 0)

  const display =
    stat.kind === 'static'
      ? stat.display
      : `${stat.prefix ?? ''}${value}`

  return (
    <div className="bg-surface px-4 py-7 flex flex-col items-center gap-[6px]">
      <span
        ref={stat.kind === 'count' ? ref : undefined}
        className={`font-display font-light italic leading-none text-amber ${
          stat.kind === 'static'
            ? 'text-[clamp(16px,2.8vw,22px)]'
            : 'text-[clamp(32px,6vw,52px)]'
        }`}
      >
        {display}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] leading-[1.3] text-muted text-center">
        {stat.label}
      </span>
    </div>
  )
}

export function StatStrip() {
  return (
    <div className="reveal-target my-10 grid grid-cols-3 gap-px bg-rule border border-rule">
      {STATS.map((stat) => (
        <StatCell key={stat.label} {...stat} />
      ))}
    </div>
  )
}
