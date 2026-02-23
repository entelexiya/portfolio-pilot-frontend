'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Filter, MapPin, School, TrendingUp, Trophy } from 'lucide-react'

interface Profile {
  id: string
  name: string
  username: string
  school: string
  region: string
  gpa?: number
  sat_score?: number
  ielts?: number
  toefl?: number
  about_me?: string
  created_at: string
}

type AchievementLite = {
  user_id: string
  category: 'award' | 'activity' | string
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | string
  created_at: string
}

interface ProfileWithStats extends Profile {
  awards_count: number
  activities_count: number
  verified_count: number
  total_count: number
  leaderboard_score: number
  last_activity_at: string | null
}

function computeLeaderboardScore(profile: Profile, awards: number, activities: number, verified: number): number {
  const total = awards + activities
  const verifiedRatio = total > 0 ? verified / total : 0
  const gpaScore = profile.gpa ? Math.min(Math.max((profile.gpa / 4) * 100, 0), 100) : 0
  const satScore = profile.sat_score ? Math.min(Math.max((profile.sat_score / 1600) * 100, 0), 100) : 0

  return Math.round(total * 8 + verified * 14 + gpaScore * 0.35 + satScore * 0.15 + verifiedRatio * 20)
}

export default function CommunityPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [academicFilter, setAcademicFilter] = useState<'all' | 'gpa' | 'sat' | 'verified'>('all')
  const [minAchievements, setMinAchievements] = useState<'all' | '1' | '3' | '5'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'achievements' | 'verified' | 'gpa' | 'sat'>('score')

  useEffect(() => {
    void fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const baseProfiles = (profilesData || []) as Profile[]
      if (baseProfiles.length === 0) {
        setProfiles([])
        return
      }

      const profileIds = baseProfiles.map((p) => p.id)
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('user_id, category, verification_status, created_at')
        .in('user_id', profileIds)

      if (achievementsError) throw achievementsError

      const statsByUser = new Map<
        string,
        { awards: number; activities: number; verified: number; lastActivityAt: string | null }
      >()

      for (const row of (achievementsData || []) as AchievementLite[]) {
        const current = statsByUser.get(row.user_id) || {
          awards: 0,
          activities: 0,
          verified: 0,
          lastActivityAt: null,
        }

        if (row.category === 'award') current.awards += 1
        if (row.category === 'activity') current.activities += 1
        if (row.verification_status === 'verified') current.verified += 1
        if (!current.lastActivityAt || row.created_at > current.lastActivityAt) {
          current.lastActivityAt = row.created_at
        }

        statsByUser.set(row.user_id, current)
      }

      const profilesWithStats = baseProfiles.map((profile) => {
        const stats = statsByUser.get(profile.id) || {
          awards: 0,
          activities: 0,
          verified: 0,
          lastActivityAt: null,
        }

        return {
          ...profile,
          awards_count: stats.awards,
          activities_count: stats.activities,
          verified_count: stats.verified,
          total_count: stats.awards + stats.activities,
          leaderboard_score: computeLeaderboardScore(profile, stats.awards, stats.activities, stats.verified),
          last_activity_at: stats.lastActivityAt,
        }
      })

      setProfiles(profilesWithStats)
    } catch (e: unknown) {
      console.error('Error loading profiles:', e)
      setError(e instanceof Error ? e.message : 'Failed to load community profiles')
    } finally {
      setLoading(false)
    }
  }

  const filteredProfiles = useMemo(() => {
    let filtered = [...profiles]

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((p) =>
        [p.name, p.school, p.username, p.region]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter((p) => p.region === regionFilter)
    }

    if (academicFilter === 'gpa') {
      filtered = filtered.filter((p) => !!p.gpa && p.gpa > 0)
    }
    if (academicFilter === 'sat') {
      filtered = filtered.filter((p) => !!p.sat_score && p.sat_score > 0)
    }
    if (academicFilter === 'verified') {
      filtered = filtered.filter((p) => p.verified_count > 0)
    }

    if (minAchievements !== 'all') {
      const threshold = Number(minAchievements)
      filtered = filtered.filter((p) => p.total_count >= threshold)
    }

    if (sortBy === 'score') {
      filtered.sort((a, b) => b.leaderboard_score - a.leaderboard_score)
    }
    if (sortBy === 'achievements') {
      filtered.sort((a, b) => b.total_count - a.total_count)
    }
    if (sortBy === 'verified') {
      filtered.sort((a, b) => b.verified_count - a.verified_count)
    }
    if (sortBy === 'gpa') {
      filtered.sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
    }
    if (sortBy === 'sat') {
      filtered.sort((a, b) => (b.sat_score || 0) - (a.sat_score || 0))
    }
    if (sortBy === 'recent') {
      filtered.sort((a, b) => {
        const aDate = a.last_activity_at || a.created_at
        const bDate = b.last_activity_at || b.created_at
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
    }

    return filtered
  }, [academicFilter, minAchievements, profiles, regionFilter, searchQuery, sortBy])

  const regions = ['all', 'Almaty', 'Astana', 'Turkistan', 'Shymkent', 'Karaganda', 'Aktobe', 'Atyrau', 'Other']

  if (loading) {
    return (
      <div className="min-h-screen pp-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pp-bg py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black pp-title-gradient">Community</h1>
              <p className="text-gray-600 text-lg">
                Discover portfolios from {profiles.length} students across Kazakhstan
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8 border-2 border-blue-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, school, region, or username..."
                    className="pl-10 h-12 text-base border-2 focus:ring-4 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Regions</option>
                  {regions.slice(1).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={academicFilter}
                  onChange={(e) => setAcademicFilter(e.target.value as 'all' | 'gpa' | 'sat' | 'verified')}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Academics</option>
                  <option value="gpa">Has GPA</option>
                  <option value="sat">Has SAT</option>
                  <option value="verified">Has Verified Items</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={minAchievements}
                  onChange={(e) => setMinAchievements(e.target.value as 'all' | '1' | '3' | '5')}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Any Achievement Count</option>
                  <option value="1">1+ achievements</option>
                  <option value="3">3+ achievements</option>
                  <option value="5">5+ achievements</option>
                </select>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Sort by:</span>
                {[
                  ['score', 'Leaderboard'],
                  ['recent', 'Recent'],
                  ['achievements', 'Achievements'],
                  ['verified', 'Verified'],
                  ['gpa', 'GPA'],
                  ['sat', 'SAT'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSortBy(value as 'score' | 'recent' | 'achievements' | 'verified' | 'gpa' | 'sat')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      sortBy === value
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="mb-6">
          <p className="text-gray-600 font-semibold">
            Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
          </p>
        </div>

        {filteredProfiles.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <div className="text-8xl mb-6">{String.fromCodePoint(0x1F50D)}</div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">No profiles found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <Card
                key={profile.id}
                className="group border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/profile/${profile.username}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0">
                        {(profile.name || '?').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                          {profile.name || 'Unnamed student'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">@{profile.username}</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <School className="w-4 h-4" />
                      <span className="truncate">{profile.school || 'School not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.region || 'Region not set'}</span>
                    </div>
                  </div>

                  {profile.about_me && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{profile.about_me}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-2xl font-black text-indigo-600">{profile.awards_count}</div>
                      <div className="text-xs text-gray-600">Awards</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-2xl font-black text-blue-700">{profile.activities_count}</div>
                      <div className="text-xs text-gray-600">Activities</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-2xl font-black text-indigo-700">{profile.verified_count}</div>
                      <div className="text-xs text-gray-600">Verified</div>
                    </div>
                  </div>

                  {(profile.gpa || profile.sat_score) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <TrendingUp className="w-3 h-3" />
                      {profile.gpa && <span>GPA: {profile.gpa.toFixed(2)}</span>}
                      {profile.gpa && profile.sat_score && <span>|</span>}
                      {profile.sat_score && <span>SAT: {profile.sat_score}</span>}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2">
                    <span className="text-xs font-semibold text-blue-800">Leaderboard score</span>
                    <span className="text-lg font-black text-blue-700">{profile.leaderboard_score}</span>
                  </div>

                  <button className="mt-4 w-full py-2 pp-primary-btn rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
