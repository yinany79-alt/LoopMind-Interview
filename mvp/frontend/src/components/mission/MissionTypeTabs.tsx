/**
 * MissionTypeTabs — Faceup V3.1 Mission 页 3 种 type tabs(Linear-tier)。
 *
 * 设计:
 * - 去掉色块 icon,改 mono 编号 + 纯文字 + 右下角 →
 * - active 态:墨黑细边 + 浅灰背景(不是蓝软色)
 * - inactive:1px 灰边,hover 边变深
 */
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'

type TabType = 'trending' | 'jd' | 'coffee'

interface Tab {
  type: TabType
  index: string
  title: string
  subtitle: string
}

const TABS: Tab[] = [
  {
    type: 'trending',
    index: '01',
    title: '热门岗位',
    subtitle: '从真实 JD 里挑一份开始',
  },
  {
    type: 'jd',
    index: '02',
    title: '我的 JD',
    subtitle: '粘贴 JD,AI 拆出核心技能点',
  },
  {
    type: 'coffee',
    index: '03',
    title: 'Coffee Chat',
    subtitle: '没有评分,就是和这个人聊聊',
  },
]

interface Props {
  current: TabType
  onChange: (t: TabType) => void
}

export default function MissionTypeTabs({ current, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {TABS.map((t) => {
        const active = current === t.type
        return (
          <button
            key={t.type}
            type="button"
            onClick={() => onChange(t.type)}
            className={clsx(
              'group flex flex-col gap-4 rounded-xl border p-5 text-left transition-all',
              active
                ? 'border-[var(--ink)] bg-[var(--bg-tertiary)]'
                : 'border-[var(--border)] bg-white hover:border-[var(--text-tertiary)]',
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
                Mission · {t.index}
              </span>
              <ArrowRight
                size={14}
                className={clsx(
                  'transition-all',
                  active
                    ? 'translate-x-0.5 text-[var(--text-primary)]'
                    : 'text-[var(--text-quaternary)] group-hover:translate-x-1 group-hover:text-[var(--text-primary)]',
                )}
              />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                {t.title}
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                {t.subtitle}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
