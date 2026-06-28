import { Link, NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useDebugMode } from '@/hooks/useDebugMode'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/journey', label: '面试历史', disabled: true },
  { to: '/battle-record', label: '战绩', disabled: true },
  { to: '/settings', label: '设置', disabled: true },
]

export default function TopNav() {
  const { enabled: debug, toggle } = useDebugMode()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--divider)] bg-[var(--bg-app)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-page-wide items-center justify-between px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#eaf0ff] to-[#4378ff] font-bold text-white shadow-sm">
            赛
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              赛博面试官
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Cyber interviewer
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <button
                key={item.label}
                type="button"
                disabled
                className="cursor-not-allowed rounded-md px-4 py-2 text-[var(--text-tertiary)]"
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
                    'rounded-md px-4 py-2 font-medium transition-colors',
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Right: debug + avatar */}
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={toggle}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              'hidden rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all md:inline-flex',
              debug
                ? 'border-[var(--bad)] bg-[var(--bad)] text-white shadow-sm hover:bg-[var(--bad)]/90'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
            )}
            title="Cmd/Ctrl+Shift+D"
            aria-pressed={debug}
          >
            {debug ? '调试中 · 关闭' : 'Debug'}
          </motion.button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-[var(--bg-tertiary)]"
            disabled
            title="账号 (即将上线)"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#eaf0ff] to-[#bcd2ff]" />
            <span className="hidden text-sm font-medium text-[var(--text-secondary)] md:inline">
              小张同学
            </span>
            <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>
    </header>
  )
}
