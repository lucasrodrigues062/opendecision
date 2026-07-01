// Modern color palette for OpenDecision.
// Avoids a single dominant blue by using indigo/violet as primary and
// distinct hues for each operation node type.

export const palette = {
  // Primary accent (indigo/violet instead of pure blue)
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Semantic accents
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',

  // Surfaces
  bgBase: '#020617', // slate-950
  bgElevated: '#0f172a', // slate-900
  bgCard: '#1e293b', // slate-800
  border: '#334155', // slate-700
  borderHover: '#475569', // slate-600
  textPrimary: '#f8fafc', // slate-50
  textSecondary: '#94a3b8', // slate-400
  textMuted: '#64748b', // slate-500

  // React Flow canvas
  canvas: '#0b1120',
  canvasDot: '#1e293b',
  edgeDefault: '#475569',
  edgeSelected: '#6366f1',

  // Operation node colors (border + handle)
  nodes: {
    filter: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' }, // blue
    compute: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' }, // emerald
    sort: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' }, // purple
    sort_array: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' }, // orange
    filter_array: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' }, // cyan
    delete_property: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' }, // red
    transform: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' }, // indigo
    aggregate: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' }, // pink
    group_by: { color: '#84cc16', bg: 'rgba(132, 204, 22, 0.08)' }, // lime
    distinct: { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.08)' }, // teal
    condition: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)' }, // yellow
  },
} as const;

export type NodeType = keyof typeof palette.nodes;
