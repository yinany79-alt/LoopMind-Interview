import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'cyber-interviewer:debug'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  const url = new URL(window.location.href)
  if (url.searchParams.get('debug') === '1') return true
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

export function useDebugMode(): {
  enabled: boolean
  toggle: () => void
} {
  const [enabled, setEnabled] = useState(readInitial)
  const location = useLocation()

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('debug') === '1') setEnabled(true)
  }, [location.search])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        setEnabled((v) => {
          const next = !v
          window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return {
    enabled,
    toggle: () =>
      setEnabled((v) => {
        const next = !v
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
        return next
      }),
  }
}
