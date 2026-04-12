// src/components/CoordGridBackground.tsx
import type { ReactElement } from 'react'

interface Props {
  width?: number
  height?: number
  unit?: number
  color?: string
  opacity?: number
}

export function CoordGridBackground({
  width = 1200,
  height = 600,
  unit = 40,
  color = 'var(--color-amber)',
  opacity = 0.04,
}: Props) {
  const hLines: ReactElement[] = []
  const vLines: ReactElement[] = []

  for (let y = 0; y <= height; y += unit) {
    hLines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} />)
  }

  for (let x = 0; x <= width; x += unit) {
    vLines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} />)
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <g stroke={color} strokeOpacity={opacity} strokeWidth={1}>
        {hLines}
        {vLines}
      </g>
    </svg>
  )
}
