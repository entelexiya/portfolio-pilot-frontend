'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(Boolean(data.session))
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setSuccess('Password updated successfully. Redirecting to login...')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 1200)
    } catch (updateError: unknown) {
      const message = updateError instanceof Error ? updateError.message : 'Failed to reset password'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="pp-bg min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="pp-bg min-h-screen flex items-center justify-center p-4">
        <div className="pp-panel w-full max-w-md rounded-3xl p-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-3">Reset link expired</h1>
          <p className="text-slate-600 mb-6">
            Open the latest reset link from your email or request a new one on login page.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-bg min-h-screen flex items-center justify-center p-4">
      <div className="pp-panel w-full max-w-md rounded-3xl p-8">
        <h1 className="pp-title-gradient mb-2 text-center text-4xl font-black">
          Reset Password
        </h1>
        <p className="text-slate-600 text-center mb-8">Set a new password for your account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-xl text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all shadow-sm"
            required
            minLength={6}
            disabled={saving}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all shadow-sm"
            required
            minLength={6}
            disabled={saving}
          />
          <button
            type="submit"
            disabled={saving}
            className="pp-primary-btn w-full rounded-2xl py-4 text-lg font-black disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

