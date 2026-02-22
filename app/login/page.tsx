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
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
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

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetMessage('')
    setError('')
    setResetLoading(true)

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      })

      if (resetError) throw resetError
      setResetMessage('Password reset email sent. Check your inbox.')
    } catch (resetError: unknown) {
      const message =
        resetError instanceof Error ? resetError.message : 'Failed to send password reset email'
      setError(message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="pp-bg min-h-screen flex items-center justify-center p-4">
      <div className="pp-panel w-full max-w-md rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="pp-title-gradient text-5xl font-black">
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
            className="w-full p-5 border-2 border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all shadow-sm"
            required 
            disabled={loading}
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 border-2 border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all shadow-sm"
            required 
            disabled={loading}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="pp-primary-btn w-full rounded-2xl py-6 text-xl font-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setShowReset((prev) => !prev)
              setResetMessage('')
              setError('')
            }}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
          >
            {showReset ? 'Back to login' : 'Forgot password?'}
          </button>
        </div>

        {showReset && (
          <form onSubmit={handleResetPassword} className="mt-5 space-y-3 border-t pt-5">
            <input
              type="email"
              placeholder="Enter your email for password reset"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all shadow-sm"
              required
              disabled={resetLoading}
            />
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {resetLoading ? 'Sending reset email...' : 'Send reset email'}
            </button>
            {resetMessage && <p className="text-sm text-blue-700 text-center">{resetMessage}</p>}
          </form>
        )}
        
        <div className="text-center mt-8 space-y-2">
          <Link href="/register" className="block text-blue-700 hover:text-blue-800 font-bold text-lg hover:underline">
            Create an account
          </Link>
          <p className="text-sm text-slate-500">test@example.com / password123</p>
        </div>
      </div>
    </div>
  )
}

