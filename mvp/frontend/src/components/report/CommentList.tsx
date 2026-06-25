import type { Report } from '@/types/api'

interface Props {
  comments: NonNullable<Report['comments']>
}

export default function CommentList({ comments }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-serif text-base font-semibold">刻薄点评</h3>
      <ul className="mt-3 space-y-2">
        {comments.map((c, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            <span
              className={
                c.type === 'strength'
                  ? 'mt-0.5 font-bold text-[var(--good)]'
                  : 'mt-0.5 font-bold text-[var(--bad)]'
              }
            >
              {c.type === 'strength' ? '✓' : '✗'}
            </span>
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
