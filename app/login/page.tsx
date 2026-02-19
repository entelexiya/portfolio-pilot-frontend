'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PortfolioPilot
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-2xl text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 border-2 border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all shadow-sm"
            required 
            disabled={loading}
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 border-2 border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 transition-all shadow-sm"
            required 
            disabled={loading}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 rounded-2xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-8 space-y-2">
          <Link href="/register" className="block text-indigo-600 hover:text-indigo-700 font-bold text-lg hover:underline">
            Create an account
          </Link>
          <p className="text-sm text-slate-500">test@example.com / password123</p>
        </div>
      </div>
    </div>
  )
}
