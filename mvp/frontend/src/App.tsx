import { Routes, Route, Navigate } from 'react-router-dom'
import TopNav from '@/components/layout/TopNav'
import PageContainer from '@/components/layout/PageContainer'
import HomePage from '@/pages/HomePage'
import PreparePage from '@/pages/PreparePage'
import InterviewPage from '@/pages/InterviewPage'
import ReportPage from '@/pages/ReportPage'

export default function App() {
  return (
    <div className="min-h-full">
      <TopNav />
      <PageContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prepare" element={<PreparePage />} />
          <Route path="/interview/:sessionId" element={<InterviewPage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageContainer>
    </div>
  )
}
