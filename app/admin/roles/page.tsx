'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Role = 'student' | 'verifier' | 'counselor'
type VerificationStatus = 'pending' | 'approved' | 'rejected'

type ProfileRow = {
  id: string
  email: string | null
  name: string | null
  username: string | null
  school: string | null
  role: Role
  is_public: boolean
}

type VerificationRow = {
  id: string
  status: VerificationStatus
  created_at: string
  verifier_email: string
  student_name: string | null
  student_username: string | null
  student_school: string | null
  achievement_title: string | null
  verifier_comment: string | null
}

type AdminMeResponse = {
  adminEmail: string | null
  stats: {
    profiles: number
    achievements: number
    verificationPending: number
    verificationTotal: number
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-pilot-api.vercel.app'

export default function AdminPanelPage() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'verification'>('users')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [me, setMe] = useState<AdminMeResponse | null>(null)

  const [users, setUsers] = useState<ProfileRow[]>([])
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending')
  const [verificationRows, setVerificationRows] = useState<VerificationRow[]>([])
  const [savingVerificationId, setSavingVerificationId] = useState<string | null>(null)

  async function getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) return null
    return { Authorization: `Bearer ${session.access_token}` }
  }

  async function requestAdmin<T>(path: string, init?: RequestInit): Promise<T | null> {
    const authHeaders = await getAuthHeaders()
    if (!authHeaders) {
      setError('Sign in required')
      return null
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...authHeaders,
      },
    })
    const json = (await res.json()) as { success?: boolean; data?: T; error?: string }

    if (res.status === 403) {
      setIsAdmin(false)
      setError('Admin access required')
      return null
    }
    if (!res.ok || !json.success) {
      setError(json.error || 'Admin request failed')
      return null
    }

    return (json.data || null) as T | null
  }

  async function loadAdminHome() {
    const meData = await requestAdmin<AdminMeResponse>('/api/admin/me')
    if (!meData) return false
    setMe(meData)
    setIsAdmin(true)
    return true
  }

  async function loadUsers() {
    const data = await requestAdmin<ProfileRow[]>('/api/admin/roles')
    if (!data) return
    setUsers(data)
  }

  async function loadVerification(status: VerificationStatus) {
    const data = await requestAdmin<VerificationRow[]>(`/api/admin/verification?status=${status}`)
    if (!data) return
    setVerificationRows(data)
  }

  useEffect(() => {
    let active = true

    void (async () => {
      const authHeaders = await getAuthHeaders()
      if (!active) return
      if (!authHeaders) {
        setError('Sign in required')
        setLoading(false)
        return
      }

      const meRes = await fetch(`${API_URL}/api/admin/me`, { headers: authHeaders })
      const meJson = (await meRes.json()) as {
        success?: boolean
        data?: AdminMeResponse
        error?: string
      }
      if (!active) return

      if (!meRes.ok || !meJson.success || !meJson.data) {
        setError(meJson.error || 'Admin access required')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)
      setMe(meJson.data)
      setError(null)

      const [usersRes, verificationRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/roles`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/verification?status=pending`, {
          headers: authHeaders,
        }),
      ])

      const usersJson = (await usersRes.json()) as {
        success?: boolean
        data?: ProfileRow[]
        error?: string
      }
      const verificationJson = (await verificationRes.json()) as {
        success?: boolean
        data?: VerificationRow[]
        error?: string
      }
      if (!active) return

      if (!usersRes.ok || !usersJson.success) {
        setError(usersJson.error || 'Failed to load users')
      } else {
        setUsers(usersJson.data || [])
      }

      if (!verificationRes.ok || !verificationJson.success) {
        setError((prev) => prev || verificationJson.error || 'Failed to load verification queue')
      } else {
        setVerificationRows(verificationJson.data || [])
      }

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  async function refreshAll() {
    setError(null)
    const ok = await loadAdminHome()
    if (!ok) {
      setLoading(false)
      return
    }

    await Promise.all([loadUsers(), loadVerification(verificationStatus)])
    setLoading(false)
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((row) => {
      const source = [row.name, row.email, row.username, row.school, row.role].join(' ').toLowerCase()
      return source.includes(q)
    })
  }, [users, query])

  async function saveUser(userId: string, payload: Partial<Pick<ProfileRow, 'role' | 'school' | 'is_public'>>) {
    setSavingUserId(userId)
    const data = await requestAdmin<ProfileRow>('/api/admin/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...payload }),
    })

    if (data) {
      setUsers((prev) => prev.map((row) => (row.id === userId ? { ...row, ...data } : row)))
    }
    setSavingUserId(null)
  }

  async function saveVerification(
    id: string,
    status: VerificationStatus,
    verifier_comment: string | null
  ) {
    setSavingVerificationId(id)
    const data = await requestAdmin<VerificationRow>('/api/admin/verification', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, verifier_comment }),
    })

    if (data) {
      setVerificationRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...data } : row)))
    }
    setSavingVerificationId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen pp-bg flex items-center justify-center">
        <p className="text-slate-600">Loading admin panel...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pp-bg py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">
                Your account is not in `ADMIN_EMAILS` allowlist on backend.
              </p>
              <Link href="/settings">
                <Button variant="outline">Back to Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pp-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="border-2 border-slate-200 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-slate-900">Admin Control Center</CardTitle>
            <p className="text-slate-600">Signed in as {me?.adminEmail || 'admin'}.</p>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Profiles" value={me?.stats.profiles || 0} />
            <StatCard label="Achievements" value={me?.stats.achievements || 0} />
            <StatCard label="Verifications Pending" value={me?.stats.verificationPending || 0} />
            <StatCard label="Verifications Total" value={me?.stats.verificationTotal || 0} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')}>
            Users
          </Button>
          <Button
            variant={tab === 'verification' ? 'default' : 'outline'}
            onClick={() => setTab('verification')}
          >
            Verification Queue
          </Button>
          <Button variant="outline" onClick={() => void refreshAll()}>
            Refresh
          </Button>
          <Link href="/settings">
            <Button variant="outline">Back to Settings</Button>
          </Link>
        </div>

        {error && <p className="text-red-700 mb-4">{error}</p>}

        {tab === 'users' ? (
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, username, school..."
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredUsers.map((row) => (
                <UserRow
                  key={`${row.id}:${row.role}:${row.school || ''}:${row.is_public}`}
                  row={row}
                  saving={savingUserId === row.id}
                  onSave={saveUser}
                />
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-slate-600 text-sm">No users found.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Verification Moderation</CardTitle>
              <select
                value={verificationStatus}
                onChange={(e) => {
                  const nextStatus = e.target.value as VerificationStatus
                  setVerificationStatus(nextStatus)
                  void loadVerification(nextStatus)
                }}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
            </CardHeader>
            <CardContent className="space-y-3">
              {verificationRows.map((row) => (
                <VerificationRowItem
                  key={row.id}
                  row={row}
                  saving={savingVerificationId === row.id}
                  onSave={saveVerification}
                />
              ))}
              {verificationRows.length === 0 && (
                <p className="text-slate-600 text-sm">No verification requests for this status.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function UserRow({
  row,
  saving,
  onSave,
}: {
  row: ProfileRow
  saving: boolean
  onSave: (
    userId: string,
    payload: Partial<Pick<ProfileRow, 'role' | 'school' | 'is_public'>>
  ) => Promise<void>
}) {
  const [role, setRole] = useState<Role>(row.role)
  const [school, setSchool] = useState(row.school || '')
  const [isPublic, setIsPublic] = useState(row.is_public)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
      <div>
        <p className="font-black text-slate-900">{row.name || 'Unnamed user'}</p>
        <p className="text-sm text-slate-600">
          {row.email || 'no-email'} - @{row.username || 'no-username'}
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="student">student</option>
          <option value="verifier">verifier</option>
          <option value="counselor">counselor</option>
        </select>
        <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School" />
        <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public
        </label>
        <Button
          disabled={saving}
          onClick={() =>
            void onSave(row.id, {
              role,
              school: school.trim() || null,
              is_public: isPublic,
            })
          }
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

function VerificationRowItem({
  row,
  saving,
  onSave,
}: {
  row: VerificationRow
  saving: boolean
  onSave: (id: string, status: VerificationStatus, verifier_comment: string | null) => Promise<void>
}) {
  const [status, setStatus] = useState<VerificationStatus>(row.status)
  const [comment, setComment] = useState(row.verifier_comment || '')

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
      <div>
        <p className="font-black text-slate-900">
          {row.student_name || 'Student'} - {row.achievement_title || 'Achievement'}
        </p>
        <p className="text-sm text-slate-600">
          @{row.student_username || 'unknown'} - {row.student_school || 'No school'}
        </p>
        <p className="text-xs text-slate-500 mt-1">{new Date(row.created_at).toLocaleString()}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VerificationStatus)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
        <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Admin note" />
        <Button
          disabled={saving}
          onClick={() => void onSave(row.id, status, comment.trim() || null)}
        >
          {saving ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </div>
  )
}
