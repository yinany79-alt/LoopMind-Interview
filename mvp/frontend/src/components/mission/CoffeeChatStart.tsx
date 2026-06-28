/**
 * CoffeeChatStart — Mission 页 coffee tab 内容。
 *
 * 说明 + 一个开始按钮。无评分、无 KPI。
 */
import { Coffee, ArrowRight } from 'lucide-react'
import type { Persona } from '@/types/api'

interface Props {
  challenger: Persona
  submitting: boolean
  onLaunch: () => void
}

export default function CoffeeChatStart({
  challenger,
  submitting,
  onLaunch,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <article className="card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <Coffee size={26} />
        </div>

        <h2 className="mt-5 font-display text-[24px] font-semibold tracking-tighter text-[var(--text-primary)]">
          和 {challenger.name} 喝杯咖啡
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-tertiary)]">
          这不是面试,而是一次放松的对话。没有评分,没有 KPI,没有强制结束。
          <br />
          想聊技术、聊行业、聊职业规划,都可以。
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4 text-[12px] text-[var(--text-tertiary)]">
          <div className="rounded-xl bg-[var(--bg-tertiary)]/60 p-3">
            <div className="text-[var(--text-primary)]">无评分</div>
            <div className="mt-1">不计入战绩</div>
          </div>
          <div className="rounded-xl bg-[var(--bg-tertiary)]/60 p-3">
            <div className="text-[var(--text-primary)]">无追问</div>
            <div className="mt-1">你主导话题</div>
          </div>
          <div className="rounded-xl bg-[var(--bg-tertiary)]/60 p-3">
            <div className="text-[var(--text-primary)]">无结束</div>
            <div className="mt-1">随时离开</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLaunch}
          disabled={submitting}
          className="btn-primary mx-auto mt-7"
        >
          {submitting ? '正在准备 Coffee Chat…' : '开始聊聊'}{' '}
          {!submitting && <ArrowRight size={14} />}
        </button>
      </article>
    </div>
  )
}
