/**
 * ChallengerTabs — Challenger Detail 4 tab(介绍 / 面试风格 / 代表问题 / 用户评价)。
 */
import { useState } from 'react'
import clsx from 'clsx'
import type { Persona } from '@/types/api'

const TABS = [
  { key: 'about', label: '介绍' },
  { key: 'style', label: '面试风格' },
  { key: 'questions', label: '代表问题' },
  { key: 'reviews', label: '用户评价' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface Props {
  persona: Persona
}

// 静态:每位面试官的代表问题(占位)
const REPRESENTATIVE_QUESTIONS: Record<string, string[]> = {
  cold_techlead: [
    '你简历里写 "主导设计了 XX 系统",具体到模块和接口,是你设计的还是抄的?',
    '一个高并发场景里,你用了 Redis 做 cache,缓存击穿你怎么解决?给个真实场景。',
    '你说你 "推动了团队效率提升",量化一下:节省多少工时?怎么测?',
  ],
  product_mentor: [
    '说说你最自豪的一个产品决策,当时是怎么权衡的?',
    '如果让你重做一次,你会怎么做?',
    '你怎么判断 PMF 的?用什么数据?',
  ],
  researcher: [
    '你说用过 RLHF,具体说说你的 reward model 怎么训的?',
    '一个 Transformer 在长上下文场景下的 attention 退化问题,你的工程化解法是?',
    '为什么 GPT-4 比 GPT-3.5 强?请只说技术原因,不要营销话术。',
  ],
  vision_master: [
    '3 年后,你认为 AI 行业最大的变化会是什么?为什么是这个,而不是其他?',
    'Scaling Law 在 100 万亿参数后会失效吗?为什么?',
    '如果你是 OpenAI 的 CEO,接下来 18 个月你会怎么布局?',
  ],
  'liang-wenfeng': [
    '中国 AI 跟随者心态的根本原因是什么?用一句话说。',
    '为什么 DeepSeek 选择开源?这是策略还是信念?',
    '面对算力封锁,你的第一性原理是什么?',
  ],
  'yang-zhilin': [
    'Kimi 的长上下文是壁垒还是 commodity?',
    '5 年后,大模型创业还会有新机会吗?来自哪里?',
    '你怎么看 Scaling Law 撞墙这件事?',
  ],
  'zhang-yiming': [
    '字节为什么不优先 ChatGPT 路线,而走 Doubao?',
    '"Context not Control" 在 AI 团队里怎么落地?',
    '你怎么定义"长期主义"?给个具体例子,不要套话。',
  ],
  karpathy: [
    'Software 3.0 在 2026 年的实际落地是什么?',
    'LLM 能完全替代 Software 2.0 的神经网络吗?',
    '你说"prompt engineering will be a real job",现在你还这么认为吗?',
  ],
  'elon-musk': [
    '为什么 xAI 要建 100k+ H100 集群?第一性原理是什么?',
    '你怎么定义 AGI?给一个 measurable definition。',
    '5 年内火星殖民地的 GPU 算力会比地球少多少?为什么?',
  ],
}

const REVIEWS = [
  {
    user: '王同学 · 字节算法',
    text: '追问真的很狠,讲完技术细节立刻问你为什么这么设计,简历包装的我应该没命。',
    rating: 5,
  },
  {
    user: '李同学 · 字节产品',
    text: '原以为是普通面试,结果第一题就被打回去重答 3 次,但确实查漏补缺。',
    rating: 5,
  },
  {
    user: '陈同学 · DeepSeek',
    text: '题目质量高,而且 follow-up 很自然,不像在跟 AI 对话。',
    rating: 4,
  },
]

export default function ChallengerTabs({ persona }: Props) {
  const [tab, setTab] = useState<TabKey>('about')

  return (
    <section className="mt-10">
      {/* Tab 头 */}
      <nav className="flex gap-1 border-b border-[var(--divider)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              'border-b-2 px-4 py-3 text-[14px] font-medium transition-colors',
              tab === t.key
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab 内容 */}
      <div className="py-6">
        {tab === 'about' && (
          <p className="max-w-3xl text-[15px] leading-[1.8] text-[var(--text-secondary)]">
            {persona.description ?? persona.one_liner}
          </p>
        )}
        {tab === 'style' && <StyleContent persona={persona} />}
        {tab === 'questions' && (
          <ul className="space-y-3">
            {(REPRESENTATIVE_QUESTIONS[persona.id] ?? [
              '本面试官的代表问题暂未收录。',
            ]).map((q, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-[var(--divider)] bg-white p-4 text-[14px] leading-relaxed text-[var(--text-primary)]"
              >
                <span className="shrink-0 font-mono text-[12px] text-[var(--text-quaternary)]">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                {q}
              </li>
            ))}
          </ul>
        )}
        {tab === 'reviews' && (
          <ul className="space-y-3">
            {REVIEWS.map((r, i) => (
              <li
                key={i}
                className="rounded-xl border border-[var(--divider)] bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                    {r.user}
                  </span>
                  <span className="text-[12px] text-amber-500">
                    {'★'.repeat(r.rating)}
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function StyleContent({ persona }: { persona: Persona }) {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          风格关键词
        </h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {persona.tags.map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          一句话风格
        </h4>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-primary)]">
          {persona.one_liner}
        </p>
      </div>
      <div className="md:col-span-2">
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          人格类型
        </h4>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-primary)]">
          <span className="pill mr-2 bg-[var(--accent-soft)] text-[var(--accent)]">
            {persona.trait_label}
          </span>
          {persona.tier === 'legend'
            ? '行业大佬人格,无法调节人格维度,体验原汁原味的提问风格。'
            : '导师人格,可在 Mission 配置滑块调节温度/深度/节奏/视野。'}
        </p>
      </div>
    </div>
  )
}
