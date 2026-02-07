'use client'
import { useEffect, useState } from 'react'

interface Achievement {
  id: number
  title: string
  desc: string
  date: string
  type: string
}

export default function Profile({ params }: { params: { id: string } }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('achievements')
      if (data) {
        const allAchievements = JSON.parse(data)
        // Фильтр по user ID (mock)
        setAchievements(allAchievements.filter((a: any) => a.userId == params.id || !a.userId))
      }
    }
  }, [params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 shadow-2xl flex items-center justify-center">
            <span className="text-4xl font-bold text-white">Ай</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Айдар • IOI Gold
          </h1>
          <p className="text-2xl text-slate-600">Kaggle Top 5%</p>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <h2 className="text-4xl font-bold mb-2">Достижения</h2>
            <p className="text-xl opacity-90">Хронология успеха</p>
          </div>
          
          <div className="p-8">
            {achievements.length > 0 ? (
              <div className="relative">
                {/* ЛИНИЯ ВРЕМЕНИ */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                
                {achievements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((achievement, index) => (
                  <div key={achievement.id} className="mb-12 flex items-start space-x-6">
                    {/* ТОЧКА */}
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-xl">
                      <span className="text-2xl">
                        {achievement.type === 'Olympiad' && '🏆'}
                        {achievement.type === 'Project' && '💻'}
                        {achievement.type === 'Kaggle' && '📊'}
                      </span>
                    </div>
                    
                    {/* КОНТЕНТ */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{achievement.title}</h3>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 font-bold text-sm px-3 py-1 rounded-lg hover:bg-blue-50">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-800 font-bold text-sm px-3 py-1 rounded-lg hover:bg-green-50">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-bold text-sm px-3 py-1 rounded-lg hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">{achievement.desc}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{achievement.date}</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                          {achievement.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Пока нет достижений</h3>
                <p className="text-gray-500">Добавь первые олимпиады и проекты</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
