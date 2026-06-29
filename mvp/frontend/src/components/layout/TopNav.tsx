import { Link, NavLink } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useDebugMode } from '@/hooks/useDebugMode'

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/journey', label: '面试历史', disabled: true },
  { to: '/battle-record', label: '战绩', disabled: true },
  { to: '/settings', label: '设置', disabled: true },
]

export default function TopNav() {
  const { enabled: debug, toggle } = useDebugMode()

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--divider)]"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="mx-auto flex h-14 max-w-page-wide items-center justify-between px-8">
        {/* Brand — Faceup wordmark */}
        <Link to="/" className="group flex items-baseline gap-2.5">
          <div
            className="grid h-6 w-6 place-items-center rounded-[5px] text-white"
            style={{ background: 'var(--ink)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="3" cy="5" r="1.5" fill="currentColor" />
              <circle cx="7" cy="5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Faceup
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] sm:inline">
            照面
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <button
                key={item.label}
                type="button"
                disabled
                className="cursor-not-allowed rounded-[6px] px-3 py-1.5 text-[13px] font-medium text-[var(--text-quaternary)]"
                title="即将上线"
              >
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            disabled
            title="搜索(即将上线)"
          >
            <Search size={14} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={toggle}
            className={clsx(
              'hidden rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-colors md:inline-flex',
              debug
                ? 'bg-[var(--ink)] text-white'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Cmd/Ctrl+Shift+D"
            aria-pressed={debug}
          >
            {debug ? 'Debug on' : 'Debug'}
          </button>

          <button
            type="button"
            className="hidden rounded-[6px] px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] md:inline-flex"
            disabled
          >
            Sign in
          </button>

          <Link
            to="/"
            className="btn-primary !py-1.5 !px-3"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById('challengers')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Start →
          </Link>
        </div>
      </div>
    </header>
  )
}
