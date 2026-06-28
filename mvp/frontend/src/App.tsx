import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import TopNav from '@/components/layout/TopNav'
import PageContainer from '@/components/layout/PageContainer'
import HomePage from '@/pages/HomePage'
import ChallengerPage from '@/pages/ChallengerPage'
import MissionPage from '@/pages/MissionPage'
import InterviewPage from '@/pages/InterviewPage'
import ReportPage from '@/pages/ReportPage'
import DebugDrawer from '@/components/debug/DebugDrawer'

// Home / Challenger / Mission 等"展示页"用宽布局
const WIDE_PATTERNS = [/^\/$/, /^\/challengers\//, /^\/missions/]

function isWidePath(path: string): boolean {
  return WIDE_PATTERNS.some((re) => re.test(path))
}

function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const wide = isWidePath(loc.pathname)
  return (
    <div className="min-h-full bg-[var(--bg-app)]">
      <TopNav />
      <PageContainer wide={wide}>{children}</PageContainer>
      <DebugDrawer />
    </div>
  )
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/challengers/:id" element={<ChallengerPage />} />
        <Route path="/missions" element={<MissionPage />} />
        <Route path="/prepare" element={<Navigate to="/" replace />} />
        <Route path="/interview/:sessionId" element={<InterviewPage />} />
        <Route path="/report/:sessionId" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
