/**
 * StepsCard — Faceup V3「如何开始」(Linear-tier minimal)。
 *
 * 设计:无 icon 框、纯文字 + mono 编号 + 极细横线
 */
const STEPS = [
  {
    n: '01',
    title: '选择面试官',
    desc: '人物决定面试风格',
  },
  {
    n: '02',
    title: '选择任务',
    desc: '热门岗位 / 我的 JD / Coffee Chat',
  },
  {
    n: '03',
    title: '接受挑战',
    desc: '实时追问与评分',
  },
]

export default function StepsCard() {
  return (
    <article className="card p-6">
      <header className="mb-6">
        <div className="section-eyebrow">getting started · 如何开始</div>
        <h3 className="section-title mt-2">三步,十分钟。</h3>
      </header>

      <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="border-t border-[var(--line)] pt-4">
            <div className="font-mono text-[10px] tabular-nums uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
              Step {s.n}
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[var(--text-primary)]">
              {s.title}
            </div>
            <div className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
              {s.desc}
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
