import { useMemo } from 'react'
import clsx from 'clsx'
import type { GraphNodeId } from '@/types/api'

export type NodeStatus = 'idle' | 'running' | 'done' | 'paused' | 'error'

interface NodePos {
  id: GraphNodeId | 'END'
  label: string
  x: number
  y: number
}

interface Edge {
  from: GraphNodeId | 'START'
  to: GraphNodeId | 'END'
  label?: string
}

// 8 个节点固定坐标(SVG viewBox 360x420)
const NODES: NodePos[] = [
  { id: 'dispatch', label: 'dispatch', x: 180, y: 40 },
  { id: 'evaluator', label: 'evaluator', x: 60, y: 130 },
  { id: 'router', label: 'router', x: 60, y: 220 },
  { id: 'next_topic', label: 'next_topic', x: 300, y: 220 },
  { id: 'interviewer', label: 'interviewer', x: 180, y: 310 },
  { id: 'END', label: 'END', x: 180, y: 390 },
]

const EDGES: Edge[] = [
  { from: 'dispatch', to: 'evaluator', label: 'has answer' },
  { from: 'dispatch', to: 'next_topic', label: 'first/switch' },
  { from: 'evaluator', to: 'router' },
  { from: 'router', to: 'interviewer', label: 'drill' },
  { from: 'router', to: 'next_topic', label: 'switch' },
  { from: 'router', to: 'END', label: 'end' },
  { from: 'next_topic', to: 'interviewer' },
  { from: 'next_topic', to: 'END', label: 'all done' },
  { from: 'interviewer', to: 'END' },
]

const STATUS_FILL: Record<NodeStatus, string> = {
  idle: '#e5e7eb',
  running: '#dbeafe',
  done: '#dcfce7',
  paused: '#fed7aa',
  error: '#fecaca',
}

const STATUS_STROKE: Record<NodeStatus, string> = {
  idle: '#9ca3af',
  running: '#3b82f6',
  done: '#22c55e',
  paused: '#f97316',
  error: '#ef4444',
}

interface Props {
  status: Partial<Record<GraphNodeId, NodeStatus>>
  breakpoints: Set<string>
  pausedAt: GraphNodeId | null
  selectedNode: GraphNodeId | null
  onSelectNode: (id: GraphNodeId | null) => void
}

export default function GraphCanvas({
  status,
  breakpoints,
  pausedAt,
  selectedNode,
  onSelectNode,
}: Props) {
  const lookup = useMemo(() => {
    const m: Record<string, NodePos> = {}
    for (const n of NODES) m[n.id] = n
    return m
  }, [])

  const nodeStatus = (id: string): NodeStatus => {
    if (id === pausedAt) return 'paused'
    if (id === 'END') return 'idle'
    return status[id as GraphNodeId] ?? 'idle'
  }

  return (
    <svg viewBox="0 0 360 440" className="h-auto w-full">
      {/* 箭头标记 */}
      <defs>
        <marker
          id="arrow-grey"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#9ca3af" />
        </marker>
      </defs>

      {/* 边 */}
      {EDGES.map((e, i) => {
        const from = lookup[e.from]
        const to = lookup[e.to]
        if (!from || !to) return null
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y + 14}
              x2={to.x}
              y2={to.y - 14}
              stroke="#9ca3af"
              strokeWidth={1}
              markerEnd="url(#arrow-grey)"
              opacity={0.7}
            />
            {e.label && (
              <text
                x={mx + 4}
                y={my}
                fontSize={8}
                fill="#6b7280"
                className="select-none"
              >
                {e.label}
              </text>
            )}
          </g>
        )
      })}

      {/* 节点 */}
      {NODES.map((n) => {
        const st = nodeStatus(n.id)
        const hasBreakpoint = breakpoints.has(n.id)
        const isSelected = selectedNode === n.id
        return (
          <g
            key={n.id}
            onClick={() =>
              n.id !== 'END' &&
              onSelectNode(isSelected ? null : (n.id as GraphNodeId))
            }
            className={n.id !== 'END' ? 'cursor-pointer' : ''}
          >
            {st === 'running' && (
              <circle
                cx={n.x}
                cy={n.y}
                r={32}
                fill={STATUS_STROKE[st]}
                opacity={0.18}
              >
                <animate
                  attributeName="r"
                  values="28;38;28"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.18;0.05;0.18"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <rect
              x={n.x - 50}
              y={n.y - 14}
              width={100}
              height={28}
              rx={8}
              fill={STATUS_FILL[st]}
              stroke={
                hasBreakpoint
                  ? '#dc2626'
                  : isSelected
                    ? '#1d4ed8'
                    : STATUS_STROKE[st]
              }
              strokeWidth={hasBreakpoint || isSelected ? 2 : 1}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill="#111827"
              className="select-none pointer-events-none"
            >
              {n.label}
            </text>
            {hasBreakpoint && (
              <circle
                cx={n.x + 44}
                cy={n.y - 10}
                r={4}
                fill="#dc2626"
                stroke="#fff"
                strokeWidth={1}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export const GRAPH_NODE_IDS: GraphNodeId[] = [
  'dispatch',
  'evaluator',
  'router',
  'next_topic',
  'interviewer',
]
