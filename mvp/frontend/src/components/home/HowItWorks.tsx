const STEPS = [
  {
    n: '①',
    title: '投递 JD',
    body: '粘贴目标岗位的 JD,AI 把它拆成 4-6 个核心技能点。',
  },
  {
    n: '②',
    title: 'AI 解构追问',
    body: '面试官按技能点出开放题,你说空话就被追问,直到逼出真东西。',
  },
  {
    n: '③',
    title: '拿到内推级报告',
    body: '5 维雷达图 + 刻薄点评 + 逐题回放,准 P6+ / T6 的诚实评价。',
  },
]

export default function HowItWorks() {
  return (
    <div className="card grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      {STEPS.map((s, idx) => (
        <div key={s.title} className="flex gap-4">
          <div className="font-serif text-3xl font-semibold text-[var(--accent)]">
            {s.n}
          </div>
          <div>
            <div className="font-serif text-base font-semibold">{s.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {s.body}
            </p>
          </div>
          {idx < STEPS.length - 1 && (
            <div className="hidden h-full w-px shrink-0 self-stretch bg-[var(--divider)] md:block" />
          )}
        </div>
      ))}
    </div>
  )
}
