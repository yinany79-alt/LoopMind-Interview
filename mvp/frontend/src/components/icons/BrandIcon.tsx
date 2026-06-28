/**
 * BrandIcon — 渲染 simple-icons 公司 logo。
 *
 * 用法:<BrandIcon slug="deepseek" size={24} />
 *
 * simple-icons 的 raw SVG 是单 path,我们用 dangerouslySetInnerHTML 注入。
 * 没有命中 slug 时回退到字母首字母方块,保持视觉占位。
 */
import { useEffect, useState } from 'react'

interface Props {
  slug: string
  size?: number
  className?: string
  /** 单色 fill,默认继承当前文字颜色 */
  color?: string
}

// 内存缓存,避免每次重复 fetch
const CACHE: Record<string, string | null> = {}

async function loadSvg(slug: string): Promise<string | null> {
  if (slug in CACHE) return CACHE[slug]
  try {
    // 用 fetch /node_modules 在 dev 不可用,改用 dynamic import
    // simple-icons 的 .svg 文件在 vite 里被当 asset 处理,需要用 ?raw 后缀
    const mod = await import(
      /* @vite-ignore */ `simple-icons/icons/${slug}.svg?raw`
    )
    const raw = (mod as { default: string }).default
    CACHE[slug] = raw
    return raw
  } catch {
    CACHE[slug] = null
    return null
  }
}

function extractPath(rawSvg: string): string | null {
  // simple-icons 的 raw 是 <svg ...><title>...</title><path d="..."/></svg>
  const m = rawSvg.match(/<path[^>]+d="([^"]+)"/)
  return m ? m[1] : null
}

export default function BrandIcon({
  slug,
  size = 20,
  className = '',
  color,
}: Props) {
  const [path, setPath] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadSvg(slug).then((raw) => {
      if (cancelled) return
      if (!raw) {
        setFailed(true)
        return
      }
      const p = extractPath(raw)
      if (p) setPath(p)
      else setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  // Fallback:首字母方块
  if (failed) {
    return (
      <span
        className={`inline-grid place-items-center rounded-md bg-[var(--bg-tertiary)] text-[10px] font-bold text-[var(--text-tertiary)] ${className}`}
        style={{ width: size, height: size }}
        aria-label={slug}
      >
        {slug.charAt(0).toUpperCase()}
      </span>
    )
  }

  if (!path) {
    return (
      <span
        className={`inline-block rounded-md bg-[var(--bg-tertiary)] ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={color ?? 'currentColor'}
      className={className}
      role="img"
      aria-label={slug}
    >
      <path d={path} />
    </svg>
  )
}
