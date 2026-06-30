/**
 * PortraitWall — Hero 右侧:5 张诺奖风窄框肖像。
 *
 * 设计:
 * - 5 个不等高的窄竖条(宽 90px,高度交错)
 * - 默认状态:全部 grayscale(100%) + 70% opacity(克制)
 * - hover 单张:那张变彩色 + 上浮 + 阴影,其他张进一步暗淡到 40%
 * - 不点击,仅装饰
 *
 * 5 张图是抽象气质原型(严厉 / 引导 / 研究 / 挑战 / 视野),不指代具体大佬。
 */
import { useState } from 'react'

interface Portrait {
  id: string
  trait: string
  src: string
  offsetY: number
  height: number
  /** object-position 的 X% 和 Y%,逐张校准脸的位置 */
  focusX: string
  focusY: string
}

const PORTRAITS: Portrait[] = [
  { id: 'stern',      trait: 'sharp',    src: '/portraits/stern.png',      offsetY: 24, height: 280, focusX: '60%', focusY: '30%' },
  { id: 'mentor',     trait: 'patient',  src: '/portraits/mentor.png',     offsetY: 0,  height: 320, focusX: '55%', focusY: '35%' },
  { id: 'researcher', trait: 'curious',  src: '/portraits/researcher.png', offsetY: 40, height: 260, focusX: '50%', focusY: '30%' },
  { id: 'challenger', trait: 'bold',     src: '/portraits/challenger.png', offsetY: 12, height: 300, focusX: '50%', focusY: '32%' },
  { id: 'visionary',  trait: 'distant',  src: '/portraits/visionary.png',  offsetY: 32, height: 270, focusX: '62%', focusY: '38%' },
]

export default function PortraitWall() {
  const [hoverId, setHoverId] = useState<string | null>(null)

  return (
    <div className="relative" style={{ height: 420 }}>
      {/* 5 竖条 */}
      <div className="absolute inset-0 flex items-start justify-center gap-1.5">
        {PORTRAITS.map((p) => {
          const isHover = hoverId === p.id
          const isDim = hoverId !== null && !isHover
          return (
            <div
              key={p.id}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              className="group relative overflow-hidden border border-[var(--line)]"
              style={{
                width: 130,
                height: p.height,
                marginTop: p.offsetY,
                background: '#f5ead6',
                borderRadius: 6,
                filter: isHover ? 'none' : 'grayscale(100%)',
                opacity: isHover ? 1 : isDim ? 0.4 : 0.7,
                transform: isHover ? 'translateY(-8px)' : 'translateY(0)',
                transition:
                  'filter 600ms cubic-bezier(0.2,0.7,0.2,1), ' +
                  'opacity 400ms ease, ' +
                  'transform 500ms cubic-bezier(0.2,0.7,0.2,1), ' +
                  'box-shadow 500ms ease, ' +
                  'border-color 400ms ease',
                boxShadow: isHover
                  ? '0 20px 40px -10px rgba(60,40,20,0.18), 0 8px 16px -6px rgba(0,0,0,0.08)'
                  : 'none',
                borderColor: isHover ? 'rgba(60,40,20,0.25)' : 'var(--line)',
                cursor: 'default',
              }}
              aria-label={p.trait}
            >
              <img
                src={p.src}
                alt={p.trait}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${p.focusX} ${p.focusY}` }}
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget
                  img.style.display = 'none'
                  if (
                    img.parentElement &&
                    !img.parentElement.querySelector('.portrait-fb')
                  ) {
                    const fb = document.createElement('div')
                    fb.className =
                      'portrait-fb absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.1em]'
                    fb.style.background =
                      'linear-gradient(180deg, #f5ead6 0%, #e8d3a8 100%)'
                    fb.style.color = 'rgba(60, 40, 20, 0.45)'
                    fb.textContent = p.trait
                    img.parentElement.appendChild(fb)
                  }
                }}
              />

              {/* hover 时底部弹出 trait 字 */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 px-2 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{
                  background:
                    'linear-gradient(to top, rgba(245,234,214,0.95) 0%, rgba(245,234,214,0) 100%)',
                  color: 'rgba(40, 25, 10, 0.9)',
                  opacity: isHover ? 1 : 0,
                  transform: isHover ? 'translateY(0)' : 'translateY(8px)',
                  transition:
                    'opacity 350ms ease 100ms, transform 400ms cubic-bezier(0.2,0.7,0.2,1) 100ms',
                }}
              >
                {p.trait}
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部 caption */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
        5 interviewers · waiting
      </div>
    </div>
  )
}
