import { useCountUp } from '@/hooks/useCountUp'

type Stat = { value: number; label: string; prefix?: string }

const STATS: Stat[] = [
  { value: 2,   label: 'Modules complete' },
  { value: 14,  label: 'Rounds in M2 alone' },
  { value: 4,   label: 'Phases per module' },
  { value: 150, label: 'Student sessions logged', prefix: '~' },
]

function StatCell({ value: target, label, prefix }: Stat) {
  const { value, ref } = useCountUp<HTMLSpanElement>(target)
  return (
    <div className="bg-surface p-6 flex flex-col items-center gap-2">
      <span
        ref={ref}
        className="font-display text-[clamp(36px,6vw,52px)] font-light italic text-amber"
      >
        {prefix ?? ''}{value}
      </span>
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted text-center">
        {label}
      </span>
    </div>
  )
}

export function StatStrip() {
  return (
    <div className="reveal-target my-10 grid grid-cols-2 min-[521px]:grid-cols-4 gap-px bg-rule border border-rule">
      {STATS.map((stat) => (
        <StatCell key={stat.label} {...stat} />
      ))}
    </div>
  )
}
