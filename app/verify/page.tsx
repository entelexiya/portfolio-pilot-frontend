'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { getCurrentProfile, hasRequiredRole } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PendingRequest = {
  id: string
  token: string
  status: string
  created_at: string
  verifier_email: string
  studentName: string
  achievementTitle: string
}

export default function VerifyHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'student' | 'verifier' | 'counselor' | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState('')

  useEffect(() => {
    let active = true

    void (async () => {
      const profile = await getCurrentProfile()
      if (!active) return

      if (!profile?.email) {
        setEmail(null)
        setRole(null)
        setLoading(false)
        return
      }

      setEmail(profile.email)
      setRole(profile.role)

      if (!hasRequiredRole(profile.role, 'verifier')) {
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('verification_requests')
        .select('id, token, status, created_at, verifier_email, student_id, achievement_id')
        .eq('verifier_email', profile.email.toLowerCase())
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!active) return

      if (fetchError) {
        setError(fetchError.message)
        setRequests([])
        setLoading(false)
        return
      }

      const enriched = await Promise.all(
        (data || []).map(async (request) => {
          const [{ data: student }, { data: achievement }] = await Promise.all([
            supabase.from('profiles').select('name').eq('id', request.student_id).single(),
            supabase
              .from('achievements')
              .select('title')
              .eq('id', request.achievement_id)
              .single(),
          ])

          return {
            id: request.id,
            token: request.token,
            status: request.status,
            created_at: request.created_at,
            verifier_email: request.verifier_email,
            studentName: student?.name || 'Student',
            achievementTitle: achievement?.title || 'Achievement',
          } as PendingRequest
        })
      )

      if (!active) return
      setRequests(enriched)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pp-bg flex items-center justify-center">
        <p className="text-slate-600">Loading verifier workspace...</p>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen pp-bg py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>Verifier Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">Sign in with your invited email first.</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (role !== 'verifier') {
    return (
      <div className="min-h-screen pp-bg py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle>Role Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">
                This page requires <strong>verifier</strong> role. Your current role: <strong>{role}</strong>.
              </p>
              <Link href="/settings">
                <Button variant="outline">Open Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pp-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-blue-100 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-slate-900">Verifier Workspace</CardTitle>
            <p className="text-slate-600">
              Pending requests assigned to <strong>{email}</strong>
            </p>
          </CardHeader>
        </Card>

        {error && (
          <Card className="border border-red-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Pending verifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">
                  No pending requests right now for <strong>{email}</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  If a student sent you a direct verification link, paste token below.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div>
                    <p className="font-black text-slate-900">{req.studentName}</p>
                    <p className="text-slate-700">{req.achievementTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/verify/${req.token}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">Review</Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Open verification by token</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value.trim())}
              placeholder="Paste token from /verify/[token] link"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <Button
              disabled={!manualToken}
              onClick={() => router.push(`/verify/${manualToken}`)}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Open Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

