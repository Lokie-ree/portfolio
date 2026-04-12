// Design tokens — single source of truth
// Used in both CSS-in-JS (Three.js) and Tailwind classes

export const tokens = {
  color: {
    ground:      'oklch(12% 0.015 75)',
    surface:     'oklch(17% 0.018 75)',
    surfaceHi:   'oklch(22% 0.018 75)',
    ink:         'oklch(92% 0.010 80)',
    muted:       'oklch(55% 0.012 75)',
    rule:        'oklch(28% 0.014 75)',
    amber:       'oklch(72% 0.16 78)',
    amberDim:    'oklch(55% 0.12 78)',
    amberGlow:   'oklch(72% 0.16 78 / 0.15)',
  },
  // Three.js hex equivalents (dark palette)
  three: {
    ground:    0x1a1612,
    surface:   0x232018,
    ink:       0xede8e0,
    muted:     0x7a7268,
    amber:     0xd4962a,
    amberDim:  0x8a6018,
    amberGlow: 0xd4962a,  // use with low opacity
  },
  font: {
    display: "'Fraunces', serif",
    body:    "'DM Sans', sans-serif",
  },
} as const

// Shorthand for inline styles
export const s = {
  ground:    tokens.color.ground,
  surface:   tokens.color.surface,
  surfaceHi: tokens.color.surfaceHi,
  ink:       tokens.color.ink,
  muted:     tokens.color.muted,
  rule:      tokens.color.rule,
  amber:     tokens.color.amber,
  amberDim:  tokens.color.amberDim,
  amberGlow: tokens.color.amberGlow,
  display:   tokens.font.display,
} as const
