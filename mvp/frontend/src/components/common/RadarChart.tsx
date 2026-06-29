/**
 * RadarChart — 极简多维雷达图(用于 BattleStats / Challenger Detail / Report)。
 *
 * 设计:
 * - SVG 纯几何,4-6 维度
 * - 灰色背景多边形 + 蓝色实色填充 + 1.5px 描边
 * - 维度标签可选 hide(用作小图)
 */
interface Props {
  /** 维度数据:[{label, value 0-100}, ...] */
  data: { label: string; value: number }[]
  size?: number
  /** 是否显示外圈标签;false = 只画图形,适合小尺寸 */
  showLabels?: boolean
  /** 主色,默认蓝 */
  color?: string
}

function polar(angle: number, r: number, cx: number, cy: number): [number, number] {
  // 12 点钟方向为 0°,顺时针
  const rad = ((angle - 90) * Math.PI) / 180
  return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r]
}

export default function RadarChart({
  data,
  size = 140,
  showLabels = false,
  color = '#1667ff',
}: Props) {
  const cx = size / 2
  const cy = size / 2
  const maxR = (size / 2) * (showLabels ? 0.72 : 0.85)
  const n = data.length || 5
  const step = 360 / n

  // 背景多边形(5 层同心)
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const points = Array.from({ length: n }, (_, i) => {
      const [x, y] = polar(i * step, maxR * ratio, cx, cy)
      return `${x},${y}`
    }).join(' ')
    return points
  })

  // 数据多边形
  const dataPoints = data
    .map((d, i) => {
      const [x, y] = polar(i * step, maxR * (Math.max(0, Math.min(100, d.value)) / 100), cx, cy)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {/* 背景同心多边形 */}
      {rings.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e5e5e7"
          strokeWidth={0.75}
        />
      ))}

      {/* 轴线 */}
      {data.map((_, i) => {
        const [x, y] = polar(i * step, maxR, cx, cy)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#ececef"
            strokeWidth={0.75}
          />
        )
      })}

      {/* 数据多边形 */}
      <polygon
        points={dataPoints}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* 数据顶点 */}
      {data.map((d, i) => {
        const [x, y] = polar(
          i * step,
          maxR * (Math.max(0, Math.min(100, d.value)) / 100),
          cx,
          cy,
        )
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />
      })}

      {/* 标签(可选) */}
      {showLabels &&
        data.map((d, i) => {
          const [x, y] = polar(i * step, maxR * 1.15, cx, cy)
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="10"
              fill="#6b6b70"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {d.label}
            </text>
          )
        })}
    </svg>
  )
}
