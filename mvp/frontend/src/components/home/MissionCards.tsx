/**
 * MissionCards — Home 三大模式入口卡(热门岗位 / 我的 JD / Coffee Chat)。
 *
 * 设计:3 张大卡平铺,每张:图标 + 名称 + 副标 + 头像组(伪) + N 人在挑战 + →
 * 点哪张 → 跳 /missions?type=trending/jd/coffee。
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Coffee,
  FileText,
  Flame,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'

interface Card {
  type: 'trending' | 'jd' | 'coffee'
  title: string
  subtitle: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  count: string
}

const CARDS: Card[] = [
  {
    type: 'trending',
    title: '热门岗位',
    subtitle: '选择热门岗位,体验真实面试挑战',
    icon: Flame,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    count: '12.5k 人在挑战',
  },
  {
    type: 'jd',
    title: '我的 JD',
    subtitle: '粘贴或上传 JD,AI 解析生成面试任务',
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    count: '8.3k 人在挑战',
  },
  {
    type: 'coffee',
    title: 'Coffee Chat',
    subtitle: '随便聊聊,提升沟通表达与思维能力',
    icon: Coffee,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    count: '5.1k 人在挑战',
  },
]

// 静态头像组(放卡片底部装饰)
const AVATAR_FILLERS = [
  '/static/personas/zhang-qing.jpg',
  '/static/personas/lao-li.jpg',
  '/static/personas/ming-de.jpg',
]

export default function MissionCards() {
  const navigate = useNavigate()

  return (
    <section className="mt-10">
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-tighter text-[var(--text-primary)]">
            选择挑战任务
          </h2>
          <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
            Mission Driven · 三种方式,自由选择
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon
          return (
            <motion.button
              key={c.type}
              type="button"
              onClick={() => navigate(`/missions?type=${c.type}`)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="card card-hover group flex h-full flex-col gap-4 p-6 text-left"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${c.iconBg}`}>
                <Icon size={22} className={c.iconColor} />
              </div>

              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {c.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--divider)] pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {AVATAR_FILLERS.map((src, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-[var(--bg-tertiary)]"
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-[12px] text-[var(--text-tertiary)]">
                    {c.count}
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                />
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
