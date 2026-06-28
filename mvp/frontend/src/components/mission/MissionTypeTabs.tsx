/**
 * MissionTypeTabs — Mission 页 3 种 type 大卡 tabs。
 *
 * 设计图(image.png Page 3):3 张大卡平铺。
 * 点击切换 active(下方内容相应展开)。
 */
import clsx from 'clsx'
import { Coffee, FileText, Flame } from 'lucide-react'

type TabType = 'trending' | 'jd' | 'coffee'

interface Tab {
  type: TabType
  title: string
  subtitle: string
  icon: typeof Flame
  iconBg: string
  iconColor: string
}

const TABS: Tab[] = [
  {
    type: 'trending',
    title: '热门岗位',
    subtitle: '选择热门岗位,体验真实面试挑战',
    icon: Flame,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    type: 'jd',
    title: '我的 JD',
    subtitle: '粘贴或上传 JD,AI 解析生成面试任务',
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    type: 'coffee',
    title: 'Coffee Chat',
    subtitle: '随便聊聊,提升沟通表达',
    icon: Coffee,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
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
        const Icon = t.icon
        const active = current === t.type
        return (
          <button
            key={t.type}
            type="button"
            onClick={() => onChange(t.type)}
            className={clsx(
              'flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all',
              active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]/30 shadow-card'
                : 'border-[var(--border)] bg-white hover:border-[var(--text-tertiary)]',
            )}
          >
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.iconBg}`}>
              <Icon size={20} className={t.iconColor} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {t.title}
              </h3>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                {t.subtitle}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
