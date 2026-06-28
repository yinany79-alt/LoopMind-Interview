/**
 * ChallengerSidebar — Challenger Detail 右侧"擅长领域 + 职业经历"。
 *
 * 设计图(image.png Page 2)右下角小卡。
 * 静态内容,本期不接真数据。
 */
import { Briefcase, Sparkles } from 'lucide-react'
import type { Persona } from '@/types/api'

// 静态 mapping
const EXPERTISE: Record<string, string[]> = {
  cold_techlead: ['系统架构', '高并发', '分布式'],
  product_mentor: ['产品方法论', 'PMF', '用户研究'],
  researcher: ['LLM', 'RLHF', '训练'],
  vision_master: ['AI 战略', '行业判断', '商业化'],
  'liang-wenfeng': ['第一性原理', '原创', 'LLM 训练'],
  'yang-zhilin': ['长上下文', 'Scaling Law', '大模型创业'],
  'zhang-yiming': ['长期主义', '全球化', '组织'],
  karpathy: ['Software 2.0/3.0', '神经网络', '教育'],
  'elon-musk': ['第一性原理', '航天', 'AGI'],
}

const TIMELINE: Record<string, { role: string; org: string; period: string }[]> = {
  cold_techlead: [
    { role: 'Tech Lead', org: '某大厂', period: '2020 - 至今' },
    { role: 'Senior Engineer', org: 'Google', period: '2015 - 2020' },
  ],
  'liang-wenfeng': [
    { role: 'Founder & CEO', org: 'DeepSeek', period: '2023 - 至今' },
    { role: 'Founder', org: '幻方量化', period: '2008 - 2023' },
  ],
  'yang-zhilin': [
    { role: 'Founder', org: '月之暗面 / Moonshot', period: '2023 - 至今' },
    { role: 'Researcher', org: 'Google Brain / FAIR', period: '2019 - 2022' },
  ],
  'zhang-yiming': [
    { role: 'Founder', org: 'ByteDance', period: '2012 - 至今' },
    { role: 'CTO', org: '99房 / 酷讯', period: '2008 - 2012' },
  ],
  karpathy: [
    { role: 'Founder', org: 'Eureka Labs', period: '2024 - 至今' },
    { role: 'Sr. Director of AI', org: 'Tesla', period: '2017 - 2022' },
    { role: 'Founding Member', org: 'OpenAI', period: '2016 - 2017' },
  ],
  'elon-musk': [
    { role: 'CEO', org: 'Tesla / xAI', period: '2008 - 至今' },
    { role: 'CEO', org: 'SpaceX', period: '2002 - 至今' },
  ],
}

interface Props {
  persona: Persona
}

export default function ChallengerSidebar({ persona }: Props) {
  const expertise = EXPERTISE[persona.id] ?? persona.tags
  const timeline = TIMELINE[persona.id] ?? []

  return (
    <aside className="space-y-4">
      {/* 擅长领域 */}
      <section className="card p-5">
        <header className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--text-tertiary)]" />
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            擅长领域
          </h3>
        </header>
        <div className="flex flex-wrap gap-2">
          {expertise.map((e) => (
            <span key={e} className="pill bg-[var(--accent-soft)] text-[var(--accent)]">
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* 职业经历 */}
      {timeline.length > 0 && (
        <section className="card p-5">
          <header className="mb-4 flex items-center gap-2">
            <Briefcase size={14} className="text-[var(--text-tertiary)]" />
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              职业经历
            </h3>
          </header>
          <ul className="space-y-3.5">
            {timeline.map((t, i) => (
              <li
                key={i}
                className="border-l-2 border-[var(--divider)] pl-3 leading-tight"
              >
                <div className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {t.role}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--text-secondary)]">
                  {t.org}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
                  {t.period}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
