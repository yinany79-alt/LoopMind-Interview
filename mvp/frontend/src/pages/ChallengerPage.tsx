/**
 * ChallengerPage — /challengers/:id 人物详情页。
 *
 * 设计:
 * - 顶部"< 返回"
 * - Hero(大头像 + 名字 + role + 评分 + 引语 + 标签 + 双 CTA)
 * - 4 tab 横排 + 右侧"擅长领域/职业经历"
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ChallengerStats, Persona } from '@/types/api'
import {
  fetchChallengerStats,
  fetchPersonas,
} from '@/api/rest'
import ChallengerHero from '@/components/challenger/ChallengerHero'
import ChallengerTabs from '@/components/challenger/ChallengerTabs'
import ChallengerSidebar from '@/components/challenger/ChallengerSidebar'

export default function ChallengerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [stats, setStats] = useState<ChallengerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchPersonas(),
      id ? fetchChallengerStats(id) : Promise.resolve(null),
    ])
      .then(([ps, s]) => {
        setPersonas(ps.personas)
        setStats(s)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [id])

  const persona = useMemo(
    () => personas.find((p) => p.id === id) ?? null,
    [personas, id],
  )

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center text-[var(--text-tertiary)]">
        加载中…
      </div>
    )
  }

  if (!persona) {
    return (
      <div className="grid h-[60vh] place-items-center text-[var(--text-tertiary)]">
        <div className="text-center">
          <p>未找到该面试官</p>
          <Link to="/" className="mt-3 inline-block text-[var(--accent)]">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost mb-6"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <ChallengerHero persona={persona} stats={stats} />
          <ChallengerTabs persona={persona} />
        </div>
        <ChallengerSidebar persona={persona} />
      </div>
    </div>
  )
}
