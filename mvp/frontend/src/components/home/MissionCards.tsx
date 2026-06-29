/**
 * MissionCards — Faceup V3 三大模式入口卡(Linear 风,无 emoji 无大 icon)。
 *
 * 设计:
 * - 3 张卡纯文字 + mono 编号 + 右下角 →
 * - hover 时背景微变
 * - 文案克制,无 SEO 味
 */
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface Card {
  type: 'trending' | 'jd' | 'coffee'
  index: string
  title: string
  desc: string
  meta: string
}

const CARDS: Card[] = [
  {
    type: 'trending',
    index: '01',
    title: '热门岗位',
    desc: '从 DeepSeek、字节、腾讯等真实 JD 中挑一份开始。',
    meta: '12.5k 已挑战',
  },
  {
    type: 'jd',
    index: '02',
    title: '我的 JD',
    desc: '粘贴你正在投递的 JD,AI 拆出 4-6 个核心技能点。',
    meta: '8.3k 已挑战',
  },
  {
    type: 'coffee',
    index: '03',
    title: 'Coffee Chat',
    desc: '没有评分、没有 KPI,就是和这个人聊聊。',
    meta: '5.1k 已聊过',
  },
]

export default function MissionCards() {
  const navigate = useNavigate()

  return (
    <section className="mt-12 pt-6">
      <div className="hairline mb-6" />
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">missions · 选择挑战</div>
          <h2 className="section-title mt-2">三种方式开始</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <button
            key={c.type}
            type="button"
            onClick={() => navigate(`/missions?type=${c.type}`)}
            className="card card-hover group flex h-full flex-col gap-5 p-6 text-left"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
                Mission · {c.index}
              </span>
              <ArrowRight
                size={16}
                className="text-[var(--text-quaternary)] transition-all group-hover:translate-x-1 group-hover:text-[var(--text-primary)]"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-[20px] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
                {c.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {c.desc}
              </p>
            </div>

            <div className="border-t border-[var(--line)] pt-3 font-mono text-[10px] tabular-nums uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
              {c.meta}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
