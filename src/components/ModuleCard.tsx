import { useState, cloneElement, type ReactElement } from 'react'

interface ModuleCardProps {
  status: string
  title: string
  standard: string
  description: string
  href: string
  preview: ReactElement<{ paused: boolean }>
}

export function ModuleCard({ status, title, standard, description, href, preview }: ModuleCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="module-card group relative block cursor-pointer overflow-hidden border border-transparent bg-surface no-underline transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-surface-hi"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

      <div className="relative z-10 h-[260px] w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        {cloneElement(preview, { paused: hovered })}
      </div>

      <div className="relative z-10 border-t border-rule px-6 pt-5 pb-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-amber">{status}</p>

        <p className="mb-1.5 font-display text-[22px] font-normal leading-tight text-ink">{title}</p>

        <p className="mb-3 text-xs font-light text-muted">{standard}</p>

        <p className="text-[13px] leading-relaxed text-muted">{description}</p>

        <p className="mt-4 inline-block text-xs tracking-wide text-amber transition-transform duration-200 ease-out group-hover:translate-x-1">
          Open module →
        </p>
      </div>
    </a>
  )
}
