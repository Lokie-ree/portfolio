import { useState, cloneElement, type ReactElement } from 'react'

interface ModuleCardProps {
  status: string
  title: string
  standard: string
  description: string
  href?: string
  labGuideHref?: string
  preview?: ReactElement<{ paused: boolean }>
  disabled?: boolean
}

export function ModuleCard({
  status,
  title,
  standard,
  description,
  href,
  labGuideHref,
  preview,
  disabled = false,
}: ModuleCardProps) {
  const [hovered, setHovered] = useState(false)

  const previewEl = preview
    ? cloneElement(preview, { paused: hovered })
    : <div className="min-h-[200px] bg-surface" />

  return (
    <div
      data-disabled={disabled ? 'true' : undefined}
      className={[
        'module-card group relative block overflow-hidden border border-transparent bg-surface transition-[background-color,border-color] duration-150',
        disabled ? 'cursor-default' : 'cursor-pointer hover:border-amber hover:bg-surface-hi',
      ].join(' ')}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => !disabled && setHovered(false)}
    >
      <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

      <div className="relative z-10 h-[260px] w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        {previewEl}
      </div>

      <div className="relative z-10 border-t border-rule px-6 pt-5 pb-6">
        <p className={`mb-2 text-[11px] font-medium uppercase tracking-wide ${disabled ? 'text-muted' : 'text-amber'}`}>
          {status}
        </p>

        <p className={`mb-1.5 font-display text-[22px] font-normal leading-tight ${disabled ? 'text-muted' : 'text-ink'}`}>
          {title}
        </p>

        <p className="mb-3 text-xs font-light text-muted">{standard}</p>

        <p className="text-[13px] leading-relaxed text-muted">{description}</p>

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-xs tracking-wide text-amber no-underline transition-transform duration-200 ease-out group-hover:translate-x-1"
          >
            view module →
          </a>
        )}

        {labGuideHref && (
          <a
            href={labGuideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs tracking-wide text-muted no-underline transition-colors hover:text-amber"
          >
            Lab guide →
          </a>
        )}
      </div>
    </div>
  )
}
