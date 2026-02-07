'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function EventsPage() {
  const [events] = useState([
    { id: 1, title: 'Олимпиада по математике', type: 'olympiad', date: '2026-03-15', location: 'Шымкент', participants: 0, max: 50 },
    { id: 2, title: 'AI Командный проект', type: 'project', date: '2026-04-10', location: 'Онлайн', participants: 2, max: 5 },
    { id: 3, title: 'Волонтёрство в приюте', type: 'volunteering', date: '2026-02-28', location: 'Шымкент', participants: 0 }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-600 hover:text-slate-900 mb-12 text-xl font-semibold block">
          ← На главную
        </Link>
        <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-16 text-center">
          🗓️ События
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="group bg-white/90 backdrop-blur-xl border border-slate-200/50 p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all">
              <div className={`text-6xl mb-6 group-hover:scale-110 transition-transform ${
                event.type === 'olympiad' ? '🏆 text-yellow-500' :
                event.type === 'project' ? '💻 text-indigo-500' : 
                '👥 text-emerald-500'
              }`}></div>
              <h3 className="font-black text-2xl mb-4 text-slate-800">{event.title}</h3>
              <div className="space-y-3 mb-8 text-sm">
                <div>📅 {new Date(event.date).toLocaleDateString('ru-RU')}</div>
                <div>📍 {event.location}</div>
                <div className="text-emerald-600 font-bold">👥 {event.participants}/{event.max || '∞'}</div>
              </div>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl">
                Записаться
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
