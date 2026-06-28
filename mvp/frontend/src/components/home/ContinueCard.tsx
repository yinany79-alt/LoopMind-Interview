/**
 * ContinueCard — 继续上次的挑战(占位 UI)。
 *
 * 本期不接真实未完成 session resume(SSE event queue 内存,重启就丢)。
 * 显示静态示例数据:[头像] 张青 · Tech Lead · Agent PM 面试挑战 · 已完成 63% · [继续]
 *
 * 设计:左 头像 / 中 标题+副标 / 右 [继续] 按钮 + 进度条。
 */
import { ArrowRight } from 'lucide-react'

export default function ContinueCard() {
  // 占位数据
  const recent = {
    persona_name: '张青',
    persona_role: 'Tech Lead',
    persona_avatar: '/static/personas/zhang-qing.jpg',
    job_title: 'Agent PM 面试挑战',
    progress: 63,
  }

  return (
    <article className="card flex items-center gap-4 p-5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-tertiary)]">
        <img
          src={recent.persona_avatar}
          alt={recent.persona_name}
          className="h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget
            img.style.display = 'none'
            if (img.parentElement && !img.parentElement.querySelector('.fb')) {
              const fb = document.createElement('div')
              fb.className =
                'fb grid h-full w-full place-items-center text-2xl font-semibold text-[var(--text-tertiary)]'
              fb.textContent = recent.persona_name.charAt(0)
              img.parentElement.appendChild(fb)
            }
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
            继续上次的挑战
          </h3>
          <span className="text-[12px] text-[var(--text-tertiary)]">
            {recent.progress}% completed
          </span>
        </div>
        <p className="mt-1.5 truncate text-[14px] text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">
            {recent.persona_name}
          </span>
          <span className="ml-1 text-[var(--text-tertiary)]">
            · {recent.persona_role}
          </span>
          <span className="mx-1 text-[var(--text-quaternary)]">|</span>
          {recent.job_title}
        </p>
        {/* 进度条 */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${recent.progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        disabled
        className="btn-secondary shrink-0 opacity-60"
        title="即将上线"
      >
        继续挑战 <ArrowRight size={14} />
      </button>
    </article>
  )
}
