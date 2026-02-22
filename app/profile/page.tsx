'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, supabase } from '@/lib/supabase-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-pilot-api.vercel.app'

type AchievementType = 'olympiad' | 'project' | 'volunteering' | 'other'

interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  date: string
  type: AchievementType
  file_url?: string
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

export default function Profile() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()

  const fetchAchievements = useCallback(async (uid: string) => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${API_URL}/api/achievements?userId=${uid}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await response.json()

      if (data.success) {
        setAchievements(data.data)
      }
    } catch (error) {
      console.error('Error loading:', error)
      setNotice({ type: 'error', message: 'Failed to load profile achievements.' })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void (async () => {
      const user = await getCurrentUser()

      if (!user) {
        router.push('/login')
        return
      }

      await fetchAchievements(user.id)
    })()
  }, [fetchAchievements, router])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice({ type: 'success', message: 'Profile link copied.' })
    } catch {
      setNotice({ type: 'error', message: 'Failed to copy profile link.' })
    }
  }

  const showPdfNotice = () => {
    setNotice({ type: 'error', message: 'PDF export is still in development.' })
  }

  const stats = {
    olympiads: achievements.filter((a) => a.type === 'olympiad').length,
    projects: achievements.filter((a) => a.type === 'project').length,
    total: achievements.length,
  }

  const typeEmoji = {
    olympiad: '🏆',
    project: '💻',
    volunteering: '❤️',
    other: '📌',
  }

  const typeColor = {
    olympiad: 'bg-blue-500',
    project: 'bg-blue-500',
    volunteering: 'bg-blue-500',
    other: 'bg-slate-500',
  }

  const typeLabel = {
    olympiad: 'Olympiad',
    project: 'Project',
    volunteering: 'Volunteering',
    other: 'Other',
  }

  if (loading) {
    return (
      <div className="min-h-screen pp-bg flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pp-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-12 text-xl font-semibold"
        >
          {'<-'} Dashboard
        </Link>

        {notice && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              notice.type === 'success'
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full mx-auto mb-8 shadow-2xl" />
          <h1 className="text-6xl font-black text-gray-800 mb-4">PortfolioPilot</h1>
          <p className="text-2xl text-gray-600 mb-12">Turkistan - 2026</p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 max-w-2xl mx-auto">
            <button
              onClick={() => void copyLink()}
              className="flex items-center gap-3 pp-primary-btn px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all"
            >
              🔗 Share
            </button>
            <button
              onClick={showPdfNotice}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-red-500 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all"
            >
              📄 PDF
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">🏆</div>
            <div className="text-5xl font-black text-blue-600">{stats.olympiads}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Olympiads</p>
          </div>
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">💻</div>
            <div className="text-5xl font-black text-blue-700">{stats.projects}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Projects</p>
          </div>
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-5xl font-black text-slate-700">{stats.total}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Total</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border shadow-2xl">
          <h2 className="text-5xl font-black text-gray-800 mb-12 text-center">📋 Timeline</h2>
          {achievements.length > 0 ? (
            achievements
              .slice()
              .reverse()
              .map((a) => (
                <div
                  key={a.id}
                  className="flex gap-6 p-8 bg-slate-50 rounded-2xl border mb-8 hover:shadow-xl transition-all"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${typeColor[a.type]} text-white`}
                  >
                    {typeEmoji[a.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{a.title}</h3>
                      {a.verification_status === 'verified' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{a.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="px-3 py-1 bg-white rounded-full font-bold">{a.date}</span>
                      <span className="px-4 py-2 bg-slate-200 rounded-xl font-bold">{typeLabel[a.type]}</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-24">
              <div className="text-8xl mb-8 opacity-30">📭</div>
              <h3 className="text-3xl font-bold text-gray-500">No achievements yet</h3>
              <p className="text-gray-400 mt-4">
                <Link href="/dashboard" className="text-blue-700 hover:underline">
                  Add achievement {'->'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
