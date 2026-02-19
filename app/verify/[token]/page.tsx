'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-pilot-api.vercel.app'

type VerifyData = {
  request: { id: string; verifier_email: string; status: string }
  achievement: {
    title: string
    description: string
    date: string
    verification_link?: string
    file_url?: string
    category: string
    type: string
  }
  studentName: string
}

export default function VerifyPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<VerifyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  useEffect(() => {
    load()
  }, [token])

  async function load() {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/verification/verify?token=${encodeURIComponent(token)}`)
      const text = await res.text()
      const json = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
      if (!res.ok) {
        setError(json.error || 'Link not found')
        if (res.status === 410) setError('This link has already been used.')
        setLoading(false)
        return
      }
      setData((json.data ?? json) as VerifyData)
    } catch {
      setError('Failed to load')
    }

    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email?.toLowerCase() ?? null)
    setLoading(false)
  }

  const sendMagicLink = async () => {
    if (!data?.request?.verifier_email) return
    setSendingLink(true)
    try {
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(`/verify/${token}`)}`
      const { error: err } = await supabase.auth.signInWithOtp({
        email: data.request.verifier_email,
        options: { emailRedirectTo: redirectTo },
      })
      if (err) throw err
      setLinkSent(true)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to send link'
      alert(message)
    } finally {
      setSendingLink(false)
    }
  }

  const handleRespond = async (action: 'approve' | 'reject') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/verification/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token, action, comment: comment.trim() || undefined }),
      })
      const text = await res.text()
      const json = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
      if (!res.ok) throw new Error(json.error || 'Request failed')
      setDone(action === 'approve' ? 'approved' : 'rejected')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong'
      alert(message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-gray-800 mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">Go to PortfolioPilot</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            {done === 'approved' ? (
              <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            ) : (
              <ShieldX className="w-16 h-16 text-red-600 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold mb-2">
              {done === 'approved' ? 'Achievement verified' : 'Verification declined'}
            </h2>
            <p className="text-gray-600 mb-6">
              {done === 'approved'
                ? 'Thank you. The student\'s achievement is now marked as verified.'
                : 'You have declined this verification request.'}
            </p>
            <Link href="/">
              <Button>Go to PortfolioPilot</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isVerifierEmail = userEmail === data.request.verifier_email.toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-indigo-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-xl">Verify student achievement</CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Student <strong>{data.studentName}</strong> asked you to confirm this achievement.
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{data.achievement.title}</h3>
              {data.achievement.description && (
                <p className="text-gray-600 text-sm mb-2">{data.achievement.description}</p>
              )}
              <p className="text-sm text-gray-500">Date: {data.achievement.date}</p>
              {data.achievement.verification_link && (
                <a
                  href={data.achievement.verification_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline block mt-2"
                >
                  View proof / link →
                </a>
              )}
              {data.achievement.file_url && (
                <a
                  href={data.achievement.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline block mt-1"
                >
                  Certificate / file →
                </a>
              )}
            </div>

            {!userEmail ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Sign in with <strong>{data.request.verifier_email}</strong> to confirm or decline.
                </p>
                <Button
                  onClick={sendMagicLink}
                  disabled={sendingLink || linkSent}
                  className="w-full"
                >
                  {sendingLink ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                  ) : linkSent ? (
                    'Check your email for the sign-in link'
                  ) : (
                    'Send sign-in link to my email'
                  )}
                </Button>
              </div>
            ) : !isVerifierEmail ? (
              <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-xl">
                This link was sent to <strong>{data.request.verifier_email}</strong>. You are signed in as <strong>{userEmail}</strong>. Please sign out and use the email that received the request, or ask the student to resend to your email.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="e.g. Confirmed participation in the competition."
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRespond('approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRespond('reject')}
                    disabled={actionLoading}
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
