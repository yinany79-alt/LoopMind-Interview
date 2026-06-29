/**
 * Avatar — Faceup 统一头像组件(极简版,替代旧的"灰底+巨型汉字")。
 *
 * 设计:
 * - 圆形,带浅色渐变背景(根据姓名 hash 出固定色调)
 * - 中心一个首字母,小号 + medium weight(不张扬)
 * - 真实图片 URL 优先,加载失败 fallback 到色块
 * - 1px 极细描边
 */
import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  name: string
  src?: string
  size?: number
  className?: string
}

// 8 套浅色渐变,根据 name 第一个字符 hash 选
const GRADIENTS = [
  ['#eff4ff', '#dbe7ff'],   // blue
  ['#fef3f2', '#fde2dd'],   // red-orange
  ['#f0fdf4', '#dcfce7'],   // green
  ['#fef9c3', '#fef08a'],   // yellow
  ['#faf5ff', '#e9d5ff'],   // purple
  ['#fdf2f8', '#fbcfe8'],   // pink
  ['#f0f9ff', '#bae6fd'],   // sky
  ['#f5f5f4', '#e7e5e4'],   // stone (中性)
]

function pickGradient(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return GRADIENTS[h % GRADIENTS.length] as [string, string]
}

function initial(name: string): string {
  if (!name) return '?'
  // 中文取第一个字,英文取首字母
  const ch = name.charAt(0)
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch
}

export default function Avatar({ name, src, size = 40, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const [from, to] = pickGradient(name)
  const showImage = src && !failed
  const fontSize = Math.max(11, Math.round(size * 0.36))

  return (
    <span
      className={clsx(
        'relative inline-block shrink-0 overflow-hidden rounded-full',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
      }}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="absolute inset-0 grid place-items-center font-medium"
          style={{
            color: 'rgba(0,0,0,0.55)',
            fontSize,
            letterSpacing: '-0.02em',
          }}
        >
          {initial(name)}
        </span>
      )}
    </span>
  )
}
