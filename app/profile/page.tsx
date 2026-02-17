'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://portfolio-pilot-api.vercel.app";

type AchievementType = 'olympiad' | 'project' | 'volunteering' | 'other'

interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  date: string
  type: AchievementType
  file_url?: string
  created_at: string
  updated_at: string
}

export default function Profile() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  const checkUserAndFetch = async () => {
    const user = await getCurrentUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUserId(user.id)
    fetchAchievements(user.id)
  }

  const fetchAchievements = async (uid: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/achievements?userId=${uid}`)
      const data = await response.json()
      
      if (data.success) {
        setAchievements(data.data)
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    olympiads: achievements.filter(a => a.type === 'olympiad').length,
    projects: achievements.filter(a => a.type === 'project').length,
    total: achievements.length
  }

  const typeEmoji = {
    olympiad: '🏆',
    project: '💻',
    volunteering: '❤️',
    other: '📌'
  }

  const typeColor = {
    olympiad: 'bg-yellow-500',
    project: 'bg-indigo-500',
    volunteering: 'bg-emerald-500',
    other: 'bg-slate-500'
  }

  const typeLabel = {
    olympiad: 'Олимпиада',
    project: 'Проект',
    volunteering: 'Волонтерство',
    other: 'Другое'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-600">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-12 text-xl font-semibold">
          ← Dashboard
        </Link>

        {/* Profile Header */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mx-auto mb-8 shadow-2xl"></div>
          <h1 className="text-6xl font-black text-gray-800 mb-4">PortfolioPilot</h1>
          <p className="text-2xl text-gray-600 mb-12">Туркестан • 2026</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 max-w-2xl mx-auto">
            <button 
              onClick={() => {
                const url = window.location.href
                navigator.clipboard.writeText(url)
                alert('✅ Ссылка скопирована!')
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all"
            >
              🔗 Поделиться
            </button>
            <button 
              onClick={() => alert('PDF экспорт в разработке!')}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all"
            >
              📄 PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">🏆</div>
            <div className="text-5xl font-black text-yellow-600">{stats.olympiads}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Олимпиады</p>
          </div>
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">💻</div>
            <div className="text-5xl font-black text-indigo-600">{stats.projects}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Проекты</p>
          </div>
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border shadow-2xl text-center">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-5xl font-black text-slate-700">{stats.total}</div>
            <p className="text-xl font-semibold text-gray-800 mt-2">Всего</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border shadow-2xl">
          <h2 className="text-5xl font-black text-gray-800 mb-12 text-center">📋 Timeline</h2>
          {achievements.length > 0 ? (
            achievements.slice().reverse().map(a => (
              <div key={a.id} className="flex gap-6 p-8 bg-slate-50 rounded-2xl border mb-8 hover:shadow-xl transition-all">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${typeColor[a.type]} text-white`}>
                  {typeEmoji[a.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{a.title}</h3>
                    {(a as any).verification_status === 'verified' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        ✓ Проверено
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
              <h3 className="text-3xl font-bold text-gray-500">Пока пусто</h3>
              <p className="text-gray-400 mt-4">
                <Link href="/dashboard" className="text-indigo-600 hover:underline">
                  Добавить достижение →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


