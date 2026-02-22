'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { getCurrentProfile } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StudentRow = {
  id: string
  name: string
  username: string
  school: string | null
  region: string | null
}

type StudentStatus = StudentRow & {
  achievements: number
  verified: number
  readiness: 'low' | 'medium' | 'high'
}

function readiness(achievements: number, verified: number): 'low' | 'medium' | 'high' {
  if (achievements >= 8 && verified >= 3) return 'high'
  if (achievements >= 4) return 'medium'
  return 'low'
}

export default function SchoolDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentStatus[]>([])
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'student' | 'verifier' | 'counselor' | null>(null)
  const [school, setSchool] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    let active = true

    void (async () => {
      const profile = await getCurrentProfile()
      if (!active) return

      if (!profile) {
        setRole(null)
        setLoading(false)
        return
      }

      setRole(profile.role)
      setSchool(profile.school)

      if (profile.role !== 'counselor') {
        setLoading(false)
        return
      }

      let query = supabase
        .from('profiles')
        .select('id, name, username, school, region')
        .eq('is_public', true)
        .neq('role', 'counselor')
        .limit(50)

      if (profile.school) {
        query = query.eq('school', profile.school)
      }

      const { data: profiles, error: profilesError } = await query
      if (!active) return

      if (profilesError) {
        setError(profilesError.message)
        setStudents([])
        setLoading(false)
        return
      }

      const rows = (profiles || []) as StudentRow[]
      const computed = await Promise.all(
        rows.map(async (student) => {
          const [{ count: achCount }, { count: verifiedCount }] = await Promise.all([
            supabase
              .from('achievements')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', student.id),
            supabase
              .from('achievements')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', student.id)
              .eq('verification_status', 'verified'),
          ])

          const achievements = achCount || 0
          const verified = verifiedCount || 0

          return {
            ...student,
            achievements,
            verified,
            readiness: readiness(achievements, verified),
          } as StudentStatus
        })
      )

      if (!active) return
      setStudents(computed)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const high = students.filter((s) => s.readiness === 'high').length
    const medium = students.filter((s) => s.readiness === 'medium').length
    const low = students.filter((s) => s.readiness === 'low').length
    return { high, medium, low }
  }, [students])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesReadiness = readinessFilter === 'all' || student.readiness === readinessFilter
      const matchesQuery =
        !query ||
        [student.name, student.username, student.school]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesReadiness && matchesQuery
    })
  }, [students, search, readinessFilter])

  if (loading) {
    return (
      <div className="min-h-screen pp-bg flex items-center justify-center">
        <p className="text-slate-600">Loading school dashboard...</p>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen pp-bg py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle>School Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">Sign in first to access this page.</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (role !== 'counselor') {
    return (
      <div className="min-h-screen pp-bg py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle>Role Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">
                This page requires <strong>counselor</strong> role. Current role: <strong>{role}</strong>.
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-black text-blue-700 mb-2">COUNSELOR VIEW</p>
          <h1 className="text-4xl font-black text-slate-900 mb-3">School Dashboard</h1>
          <p className="text-slate-600">
            {school
              ? `Showing students for ${school}.`
              : 'No school set in profile. Showing public students.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white border border-blue-200 p-5">
            <p className="text-sm text-slate-500">High readiness</p>
            <p className="text-3xl font-black text-blue-600">{stats.high}</p>
          </div>
          <div className="rounded-2xl bg-white border border-amber-200 p-5">
            <p className="text-sm text-slate-500">Medium readiness</p>
            <p className="text-3xl font-black text-amber-600">{stats.medium}</p>
          </div>
          <div className="rounded-2xl bg-white border border-rose-200 p-5">
            <p className="text-sm text-slate-500">Low readiness</p>
            <p className="text-3xl font-black text-rose-600">{stats.low}</p>
          </div>
        </div>

        {error && <p className="text-red-700 text-sm mb-4">{error}</p>}

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username or school..."
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <select
            value={readinessFilter}
            onChange={(e) =>
              setReadinessFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All readiness</option>
            <option value="high">High only</option>
            <option value="medium">Medium only</option>
            <option value="low">Low only</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p className="font-black text-slate-900">{student.name || 'Unnamed student'}</p>
                <p className="text-sm text-slate-600">
                  @{student.username} - {student.school || 'School not set'}
                </p>
              </div>

              <div className="flex items-center gap-5 text-sm">
                <div>
                  <p className="text-slate-500">Achievements</p>
                  <p className="font-black text-slate-900">{student.achievements}</p>
                </div>
                <div>
                  <p className="text-slate-500">Verified</p>
                  <p className="font-black text-slate-900">{student.verified}</p>
                </div>
                <div>
                  <p className="text-slate-500">Readiness</p>
                  <p
                    className={`font-black ${
                      student.readiness === 'high'
                        ? 'text-blue-600'
                        : student.readiness === 'medium'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                    }`}
                  >
                    {student.readiness.toUpperCase()}
                  </p>
                </div>
              </div>

              <Link
                href={`/profile/${student.username}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors"
              >
                Open Profile
              </Link>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-slate-600 text-sm">No students match current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

