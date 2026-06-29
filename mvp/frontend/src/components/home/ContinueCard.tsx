/**
 * ContinueCard — Faceup V3「继续上次的挑战」(Linear-tier minimal,占位 UI)。
 *
 * 设计:
 * - 卡顶部一行 mono eyebrow"in progress · 63%"
 * - Avatar + 名字 · 角色 + 一段叙事性 quote(不是冷冰冰"Agent PM 面试挑战")
 * - 进度条:1.5px 高,墨黑色
 * - 右下角文字 link"继续 →"(不是大按钮)
 */
import { ArrowRight } from 'lucide-react'
import Avatar from '@/components/common/Avatar'

export default function ContinueCard() {
  const recent = {
    persona_name: '张青',
    persona_role: 'Tech Lead',
    persona_avatar: '/static/personas/zhang-qing.jpg',
    job_title: 'Agent PM 面试',
    progress: 63,
    narrative: '正在追问你那个被砍掉的 feature,到底是谁的判断',
  }

  return (
    <article className="card flex flex-col gap-4 p-5">
      <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
        <span>in progress · 继续上次</span>
        <span className="tabular-nums text-[var(--text-primary)]">
          {recent.progress}%
        </span>
      </header>

      <div className="flex items-start gap-3">
        <Avatar name={recent.persona_name} src={recent.persona_avatar} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-[var(--text-primary)]">
            {recent.persona_name}
            <span className="ml-1.5 text-[12px] font-normal text-[var(--text-secondary)]">
              · {recent.persona_role}
            </span>
          </h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-[var(--text-secondary)]">
            {recent.narrative}
          </p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-[3px] overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${recent.progress}%`,
            background: 'var(--ink)',
          }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
          {recent.job_title}
        </span>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-quaternary)]"
          title="即将上线"
        >
          继续 <ArrowRight size={12} />
        </button>
      </div>
    </article>
  )
}
