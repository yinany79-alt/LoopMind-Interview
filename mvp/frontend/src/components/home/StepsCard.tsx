/**
 * StepsCard — Home 底部"如何开始你的挑战"。
 *
 * 设计:3 步流程,横排,带 → 箭头。
 */
import { ArrowRight, Briefcase, FileText, Play } from 'lucide-react'

const STEPS = [
  {
    icon: Briefcase,
    title: '1. 选择面试官',
    desc: '人物决定面试风格',
  },
  {
    icon: FileText,
    title: '2. 选择任务',
    desc: '热门岗位 / 我的 JD / Coffee Chat',
  },
  {
    icon: Play,
    title: '3. 开始面试',
    desc: '实时追问与评分',
  },
]

export default function StepsCard() {
  return (
    <article className="card p-6">
      <h3 className="mb-5 font-display text-[18px] font-semibold tracking-tighter text-[var(--text-primary)]">
        如何开始你的挑战
      </h3>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="flex flex-1 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--bg-tertiary)]">
                <Icon size={18} className="text-[var(--text-secondary)]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {s.title}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                  {s.desc}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  size={16}
                  className="ml-auto hidden text-[var(--text-quaternary)] md:block"
                />
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
