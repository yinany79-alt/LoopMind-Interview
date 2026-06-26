import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'

const STORAGE_KEY = 'cyber-interviewer:debug'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  const url = new URL(window.location.href)
  if (url.searchParams.get('debug') === '1') return true
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

interface DebugStore {
  enabled: boolean
  setEnabled: (v: boolean) => void
  toggle: () => void
}

const useDebugStore = create<DebugStore>((set, get) => ({
  enabled: readInitial(),
  setEnabled: (v) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
    }
    set({ enabled: v })
  },
  toggle: () => {
    const next = !get().enabled
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    }
    set({ enabled: next })
  },
}))

/**
 * 全局 debug 模式开关。所有调用方共享同一份 enabled 状态。
 * 切换方式:点击 TopNav 「调试面板」按钮、按 Cmd/Ctrl+Shift+D、或 URL 加 ?debug=1。
 */
export function useDebugMode(): {
  enabled: boolean
  toggle: () => void
} {
  const enabled = useDebugStore((s) => s.enabled)
  const toggle = useDebugStore((s) => s.toggle)
  const setEnabled = useDebugStore((s) => s.setEnabled)
  const location = useLocation()

  // URL ?debug=1 → 开启
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('debug') === '1' && !enabled) {
      setEnabled(true)
    }
  }, [location.search, enabled, setEnabled])

  // 键盘快捷键(只挂一次,全局生效)
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        useDebugStore.getState().toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { enabled, toggle }
}
