import type { ReactNode } from 'react'

interface Props {
  value: unknown
  collapsed?: boolean
}

/** 极简 JSON 高亮:keys / strings / numbers / booleans */
export default function JsonView({ value, collapsed = false }: Props): ReactNode {
  const text = JSON.stringify(value, null, 2) ?? 'undefined'
  if (collapsed) {
    return (
      <details className="rounded-md bg-[var(--bg-tertiary)]/40 p-2">
        <summary className="cursor-pointer select-none text-xs text-[var(--text-tertiary)]">
          展开 JSON
        </summary>
        <pre className="mt-1 max-h-[400px] overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">
          {colorize(text)}
        </pre>
      </details>
    )
  }
  return (
    <pre className="max-h-full overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">
      {colorize(text)}
    </pre>
  )
}

function colorize(json: string): ReactNode[] {
  // 简单的语法高亮,不引入额外依赖
  const tokens: ReactNode[] = []
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) tokens.push(<span key={`t-${i++}`}>{json.slice(last, m.index)}</span>)
    if (m[1]) {
      const isKey = !!m[2]
      tokens.push(
        <span
          key={`s-${i++}`}
          style={{ color: isKey ? 'var(--accent)' : 'var(--good)' }}
        >
          {m[1]}
        </span>,
      )
      if (m[2]) tokens.push(<span key={`c-${i++}`}>{m[2]}</span>)
    } else if (m[3]) {
      tokens.push(
        <span key={`n-${i++}`} style={{ color: 'var(--mid)' }}>
          {m[3]}
        </span>,
      )
    } else if (m[4]) {
      tokens.push(
        <span key={`b-${i++}`} style={{ color: 'var(--bad)' }}>
          {m[4]}
        </span>,
      )
    }
    last = re.lastIndex
  }
  if (last < json.length) tokens.push(<span key={`t-${i++}`}>{json.slice(last)}</span>)
  return tokens
}
