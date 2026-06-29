/**
 * HomePage — Faceup V3 首页(Linear-tier minimal)。
 */
import { useEffect } from 'react'
import { useInterviewStore } from '@/store/interviewStore'
import Hero from '@/components/home/Hero'
import ContinueCard from '@/components/home/ContinueCard'
import BattleStatsCard from '@/components/home/BattleStatsCard'
import RecommendedChallengers from '@/components/home/RecommendedChallengers'
import LegendGrid from '@/components/home/LegendGrid'
import MissionCards from '@/components/home/MissionCards'
import TrendingMissions from '@/components/home/TrendingMissions'
import StepsCard from '@/components/home/StepsCard'
import AchievementCard from '@/components/home/AchievementCard'

export default function HomePage() {
  const resetInterview = useInterviewStore((s) => s.resetInterview)

  useEffect(() => {
    resetInterview()
  }, [resetInterview])

  return (
    <div className="flex flex-col">
      <Hero />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContinueCard />
        <BattleStatsCard />
      </div>

      <RecommendedChallengers />
      <LegendGrid />
      <MissionCards />
      <TrendingMissions />

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
        <StepsCard />
        <AchievementCard />
      </div>

      <div className="h-24" />
    </div>
  )
}
