import { Link, NavLink } from 'react-router-dom'
import { useDebugMode } from '@/hooks/useDebugMode'
import clsx from 'clsx'

export default function TopNav() {
  const { enabled: debug, toggle } = useDebugMode()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--divider)] bg-[var(--bg-primary)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--accent)] font-serif text-sm font-bold text-white">
            赛
          </span>
          <span className="font-serif text-base font-semibold tracking-tight">
            赛博面试官
          </span>
          <span className="ml-2 hidden text-xs text-[var(--text-tertiary)] sm:inline">
            Cyber Interviewer · MVP
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                'rounded-md px-3 py-1.5 transition-colors',
                isActive
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
              )
            }
          >
            首页
          </NavLink>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md px-3 py-1.5 text-[var(--text-tertiary)]"
            title="MVP 下一版本开放"
          >
            面试历史
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md px-3 py-1.5 text-[var(--text-tertiary)]"
            title="MVP 下一版本开放"
          >
            设置
          </button>
          <button
            type="button"
            onClick={toggle}
            className={clsx(
              'ml-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              debug
                ? 'border-[var(--bad)] bg-[var(--bad)]/10 text-[var(--bad)]'
                : 'border-[var(--border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]',
            )}
            title="Cmd/Ctrl+Shift+D"
          >
            {debug ? 'DEBUG ON' : 'Debug'}
          </button>
        </nav>
      </div>
    </header>
  )
}
