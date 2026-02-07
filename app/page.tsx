'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Hero */}
        <div className="mb-20">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            Portfolio<span className="text-indigo-600">Pilot</span>
          </h1>
          <p className="text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Создай портфолио за 2 минуты. Покажи жюри свои 
            <span className="font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"> олимпиады</span>, 
            <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"> проекты</span> 
            и <span className="font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">достижения</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
            >
              🚀 Начать сейчас
            </Link>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
            >
              🗓️ События и проекты
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
            <div className="text-5xl mb-6">🏆</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Олимпиады</h3>
            <p className="text-slate-600">Республиканские, международные, казахстанские</p>
          </div>
          <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
            <div className="text-5xl mb-6">💻</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Проекты</h3>
            <p className="text-slate-600">GitHub, Kaggle, личные проекты</p>
          </div>
          <div className="group p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
            <div className="text-5xl mb-6">📱</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">QR код</h3>
            <p className="text-slate-600">Один QR = всё портфолио для жюри</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-3xl border border-slate-200/50 shadow-2xl">
          <h2 className="text-4xl font-black text-slate-800 mb-6">Готов показать свои достижения?</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
            >
              ✨ Создать портфолио
            </Link>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
            >
              🗓️ Посмотреть события
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
