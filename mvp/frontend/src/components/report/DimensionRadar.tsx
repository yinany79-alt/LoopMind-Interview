import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  scores: Record<string, number>
}

const LABEL_MAP: Record<string, string> = {
  agent_product_taste: 'Agent 品味',
  tech_understanding: '技术理解',
  product_methodology: '产品方法论',
  user_empathy: '用户同理心',
  first_hand_experience: '一手实战',
}

export default function DimensionRadar({ scores }: Props) {
  const data = Object.entries(scores).map(([key, value]) => ({
    dimension: LABEL_MAP[key] ?? key,
    score: value,
  }))

  return (
    <div className="card p-5">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-serif text-base font-semibold">5 维度雷达</h3>
        <span className="text-xs text-[var(--text-tertiary)]">满分 100</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid stroke="var(--divider)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
              stroke="var(--divider)"
            />
            <Radar
              dataKey="score"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.28}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {data.map((d) => (
          <li
            key={d.dimension}
            className="flex items-center justify-between rounded-md bg-[var(--bg-tertiary)]/60 px-3 py-1.5"
          >
            <span className="text-[var(--text-secondary)]">{d.dimension}</span>
            <span className="font-mono tabular-nums text-[var(--text-primary)]">
              {d.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
