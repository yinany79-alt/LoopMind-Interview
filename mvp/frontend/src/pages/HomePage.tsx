/**
 * HomePage — Cyber Interview V2 首页。
 *
 * 按 image.png 设计图 1:1 布局:
 * - Hero(左字右 Orb)
 * - 双卡:继续上次的挑战 + 我的战绩
 * - 推荐面试官(4 张)
 * - 大佬挑战(5 张 legend)
 * - 选择挑战任务(3 张 Mission)
 * - 热门挑战(4 张 trending)
 * - 双卡:如何开始 + 最高成就
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

  // 进入首页清掉上一次的面试态(避免污染下次创建)
  useEffect(() => {
    resetInterview()
  }, [resetInterview])

  return (
    <div className="flex flex-col">
      <Hero />

      {/* 双卡:继续 + 战绩 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContinueCard />
        <BattleStatsCard />
      </div>

      <RecommendedChallengers />
      <LegendGrid />
      <MissionCards />
      <TrendingMissions />

      {/* 底部双卡 */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.8fr]">
        <StepsCard />
        <AchievementCard />
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}
