import { useState, cloneElement, Suspense, type ReactElement } from 'react'

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

  return (
    <div
      data-disabled={disabled ? 'true' : undefined}
      className={[
        'module-card group relative flex flex-col overflow-hidden border border-transparent bg-surface transition-[background-color,border-color] duration-150',
        disabled ? 'cursor-default' : 'cursor-pointer hover:border-amber hover:bg-surface-hi',
      ].join(' ')}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => !disabled && setHovered(false)}
    >
      <div className="h-[3px] w-full shrink-0 bg-amber-dim" />

      <div className="relative z-10 h-[260px] w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        {preview ? (
          <Suspense fallback={<div style={{ height: '100%', background: 'var(--color-surface)' }} />}>
            {cloneElement(preview, { paused: hovered })}
          </Suspense>
        ) : (
          <div className="min-h-[200px] bg-surface" />
        )}
      </div>

      <div className="relative z-10 flex-1 border-t border-rule px-6 pt-5 pb-5">
        <p className={`mb-2 text-[11px] font-medium uppercase tracking-wide ${disabled ? 'text-muted' : 'text-amber'}`}>
          {status}
        </p>

        <p className={`mb-1.5 font-display text-[22px] font-normal leading-tight ${disabled ? 'text-muted' : 'text-ink'}`}>
          {title}
        </p>

        <p className="mb-3 text-xs font-light text-muted">{standard}</p>

        <p className="text-[13px] leading-relaxed text-muted">{description}</p>
      </div>

      {(href || labGuideHref) && (
        <div className="relative z-10 grid border-t border-rule" style={{ gridTemplateColumns: href && labGuideHref ? '1fr 1fr' : '1fr' }}>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-amber no-underline transition-colors duration-150 hover:bg-amber/5',
                labGuideHref ? 'border-r border-rule' : '',
              ].join(' ')}
            >
              View module →
            </a>
          )}
          {labGuideHref && (
            <a
              href={labGuideHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted no-underline transition-colors duration-150 hover:bg-surface-hi hover:text-amber"
            >
              Lab guide →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
