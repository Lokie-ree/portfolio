import { useCountUp } from '@/hooks/useCountUp'

type Stat = { value: number; label: string; prefix?: string }

const STATS: Stat[] = [
  { value: 3,   label: 'Modules in the sequence' },
  { value: 14,  label: 'Rounds in M2 alone' },
  { value: 4,   label: 'Phases per module' },
  { value: 150, label: 'Student sessions logged', prefix: '~' },
]

function StatCell({ value: target, label, prefix }: Stat) {
  const { value, ref } = useCountUp<HTMLSpanElement>(target)
  return (
    <div className="bg-surface px-4 py-7 flex flex-col items-center gap-[6px]">
      <span
        ref={ref}
        className="font-display text-[clamp(48px,8vw,64px)] font-light italic leading-none text-amber"
      >
        {prefix ?? ''}{value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] leading-[1.3] text-muted text-center">
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
