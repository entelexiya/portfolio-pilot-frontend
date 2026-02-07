'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    school: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Регистрация пользователя
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // 2. Создание профиля
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            school: formData.school,
            region: 'Туркестан',
          })

        if (profileError) throw profileError

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            PortfolioPilot
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Создание аккаунта</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-2xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-2xl text-center">
            ✅ Регистрация успешна! Перенаправление...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Полное имя"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-4 border rounded-2xl text-lg"
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-4 border rounded-2xl text-lg"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-4 border rounded-2xl text-lg"
            required
            minLength={6}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Школа"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="w-full p-4 border rounded-2xl text-lg"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-bold disabled:opacity-50"
          >
            {loading ? '⏳ Создание...' : '✨ Создать'}
          </button>
        </form>

        <p className="text-center mt-8">
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Уже есть аккаунт? Войти
          </Link>
        </p>
      </div>
    </div>
  )
}