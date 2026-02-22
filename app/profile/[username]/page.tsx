 'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { generateProfilePDF } from '@/lib/generatePDF'

interface Profile {
  id: string
  name: string
  username: string
  school: string
  region: string
  is_public: boolean
  gpa?: number
  sat_score?: number
  ielts?: number
  toefl?: number
  github_url?: string
  about_me?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  type: string
  date: string
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
  verifier_comment?: string | null
  file_url?: string
}

export default function PublicProfile() {
  const params = useParams()
  const username = params.username as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'awards' | 'activities'>('activities')

  const fetchProfile = useCallback(async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!profileData.is_public) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(profileData)

      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', profileData.id)
        .order('date', { ascending: false })

      setAchievements(achievementsData || [])
    } catch (error) {
      console.error('Error loading profile:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const typeLabels: Record<string, string> = {
    olympiad: '🏆 Olympiad',
    competition: '🥇 Competition',
    award_other: '⭐ Other Award',
    project: '💻 Project',
    research: '🔬 Research',
    internship: '💼 Internship',
    volunteering: '👥 Volunteering',
    leadership: '👑 Leadership',
    club: '🎯 Club',
    activity_other: '📌 Other'
  }

  const typeEmojis: Record<string, string> = {
    olympiad: '🏆',
    competition: '🥇',
    award_other: '⭐',
    project: '💻',
    research: '🔬',
    internship: '💼',
    volunteering: '👥',
    leadership: '👑',
    club: '🎯',
    activity_other: '📌'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold">Loading profile...</div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6">😕</div>
          <h1 className="text-4xl font-black text-gray-800 mb-4">Profile Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            User @{username} doesn&apos;t exist or profile is private
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const awards = achievements.filter(a => a.category === 'award')
  const activities = achievements.filter(a => a.category === 'activity')
  const displayedAchievements = activeTab === 'awards' ? awards : activities

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-8 border border-slate-200/50">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent mb-2">
              {profile.name}
            </h1>
            <p className="text-xl text-gray-600">@{profile.username}</p>
            <p className="text-lg text-gray-500 mt-2">
              {profile.school} • {profile.region}
            </p>
 {/* ABOUT ME */}
{profile.about_me && (
  <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
    <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
      <span>💭</span>
      About Me
    </h3>
    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
      {profile.about_me}
    </p>
  </div>
)}
            {/* PDF BUTTON */}
            <button
              onClick={() => generateProfilePDF(profile, achievements)}
              className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Portfolio
            </button>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-3xl font-black text-indigo-600">{awards.length}</div>
              <div className="text-sm text-gray-600">Awards</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-3xl font-black text-blue-700">{activities.length}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </div>

          {/* ACADEMIC METRICS */}
          {(profile.gpa || profile.sat_score || profile.ielts || profile.toefl) && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.gpa && profile.gpa > 0 && (
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl">
                  <div className="text-2xl font-black text-blue-600">{profile.gpa.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">GPA</div>
                </div>
              )}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <div className="text-2xl font-black text-indigo-600">
                  {profile.sat_score && profile.sat_score > 0 ? profile.sat_score : 'Not taken'}
                </div>
                <div className="text-sm text-gray-600">SAT</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl">
                <div className="text-2xl font-black text-blue-600">
                  {profile.ielts && profile.ielts > 0 ? profile.ielts.toFixed(1) : 'Not taken'}
                </div>
                <div className="text-sm text-gray-600">IELTS</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-red-50 rounded-2xl">
                <div className="text-2xl font-black text-indigo-600">
                  {profile.toefl && profile.toefl > 0 ? profile.toefl : 'Not taken'}
                </div>
                <div className="text-sm text-gray-600">TOEFL</div>
              </div>
            </div>
          )}

          {/* GITHUB */}
          {profile.github_url && (
            <div className="mt-4 text-center">
              
               <a href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Profile
              </a>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 font-bold text-lg transition-all ${
                activeTab === 'activities'
                  ? 'border-b-2 border-indigo-600 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📌 Activities ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`px-6 py-3 font-bold text-lg transition-all ${
                activeTab === 'awards'
                  ? 'border-b-2 border-indigo-600 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏆 Awards ({awards.length})
            </button>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-slate-200/50">
          {displayedAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl">No {activeTab === 'awards' ? 'awards' : 'activities'} yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {displayedAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="p-6 rounded-2xl border border-slate-200/50 bg-white/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{typeEmojis[achievement.type] || '⭐'}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                  {achievement.description && (
                    <p className="text-gray-600 mb-3 text-sm">{achievement.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                    <span className="text-gray-500">{achievement.date}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
                      {typeLabels[achievement.type]}
                    </span>
                    {achievement.verification_status === 'verified' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {achievement.verification_status === 'verified' && achievement.verifier_comment && (
                    <div className="mb-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Verified</p>
                      <p className="text-sm text-slate-700">{achievement.verifier_comment}</p>
                    </div>
                  )}
                  {achievement.file_url && (
                    <a
                      href={achievement.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-semibold"
                    >
                      📎 Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block text-blue-700 hover:text-blue-800 font-bold text-lg"
          >
            ← Create your portfolio on PortfolioPilot
          </Link>
        </div>
      </div>
    </div>
  )
}

