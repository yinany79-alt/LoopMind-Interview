/**
 * BreathingDot — Hero 右侧的极简呼吸点视觉。
 *
 * 替代 OrbVisual(浮空玻璃方块 = AI 落地页公约数)。
 * Linear 风:一个中心点 + 多层同心圆呼吸,极克制。
 */
export default function BreathingDot() {
  return (
    <div className="relative grid place-items-center" style={{ height: 360 }}>
      {/* 3 层同心呼吸圈 */}
      <div className="absolute" style={{ width: 320, height: 320 }}>
        <div
          className="absolute inset-0 rounded-full border border-[var(--border)]"
          style={{
            animation: 'breathe-ring 4s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
      </div>
      <div className="absolute" style={{ width: 220, height: 220 }}>
        <div
          className="absolute inset-0 rounded-full border border-[var(--border)]"
          style={{
            animation: 'breathe-ring 4s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />
      </div>
      <div className="absolute" style={{ width: 140, height: 140 }}>
        <div
          className="absolute inset-0 rounded-full border border-[var(--border)]"
          style={{
            animation: 'breathe-ring 4s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* 中心点 */}
      <div
        className="relative h-3 w-3 rounded-full"
        style={{
          background: 'var(--accent)',
          boxShadow: '0 0 0 6px rgba(22,103,255,0.10)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
      />

      {/* 角标 - 极小 monospace */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
        the interview, alive
      </div>
    </div>
  )
}
