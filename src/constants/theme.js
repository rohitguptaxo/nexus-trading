export const C = {
  bg:      '#0a0c0f',
  bg2:     '#111318',
  bg3:     '#181c22',
  border:  '#1e2330',
  border2: '#252d3d',
  text:    '#e2e8f0',
  muted:   '#64748b',
  blue:    '#3b82f6',
  green:   '#10b981',
  warn:    '#f59e0b',
  red:     '#ef4444',
  purple:  '#8b5cf6',
  teal:    '#06b6d4',
}

export const badge = (variant) => {
  const map = {
    blue:   [C.blue,   'rgba(59,130,246,.15)',  'rgba(59,130,246,.25)'],
    green:  [C.green,  'rgba(16,185,129,.12)',  'rgba(16,185,129,.25)'],
    warn:   [C.warn,   'rgba(245,158,11,.12)',  'rgba(245,158,11,.25)'],
    red:    [C.red,    'rgba(239,68,68,.12)',   'rgba(239,68,68,.25)'],
    purple: [C.purple, 'rgba(139,92,246,.12)',  'rgba(139,92,246,.25)'],
    gray:   [C.muted,  'rgba(100,116,139,.1)',  C.border],
  }
  const [color, background, border] = map[variant] ?? map.gray
  return { display:'inline-flex', padding:'2px 7px', borderRadius:3, fontSize:9,
           fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase',
           color, background, border:`1px solid ${border}` }
}

export const card = (extra = {}) => ({
  background: C.bg2,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: 12,
  ...extra,
})

export const input = {
  width: '100%',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  padding: '6px 8px',
  color: C.text,
  fontFamily: 'inherit',
  fontSize: 10,
  outline: 'none',
  marginBottom: 8,
}

export const select = { ...input }

export const btn = (variant = 'blue') => {
  const map = {
    blue:  [C.blue,  'rgba(59,130,246,.18)', 'rgba(59,130,246,.4)'],
    green: [C.green, 'rgba(16,185,129,.12)', 'rgba(16,185,129,.3)'],
    ghost: [C.muted, 'transparent',           C.border],
    red:   [C.red,   'rgba(239,68,68,.12)',   'rgba(239,68,68,.3)'],
  }
  const [color, background, borderColor] = map[variant] ?? map.blue
  return {
    padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 10, fontWeight: 500,
    border: `1px solid ${borderColor}`, background, color,
    transition: 'all .15s', width: '100%', marginBottom: 6,
  }
}
