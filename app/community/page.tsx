'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Filter, GraduationCap, MapPin, School, TrendingUp } from 'lucide-react'

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

interface ProfileWithStats extends Profile {
  awards_count: number
  activities_count: number
}

export default function CommunityPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'achievements'>('recent')

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [profiles, searchQuery, regionFilter, sortBy])

  const fetchProfiles = async () => {
    try {
      setLoading(true)

      // Получаем все публичные профили
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Для каждого профиля получаем статистику достижений
      const profilesWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: achievements } = await supabase
            .from('achievements')
            .select('category')
            .eq('user_id', profile.id)

          const awards_count = achievements?.filter(a => a.category === 'award').length || 0
          const activities_count = achievements?.filter(a => a.category === 'activity').length || 0

          return {
            ...profile,
            awards_count,
            activities_count,
          }
        })
      )

      setProfiles(profilesWithStats)
      setFilteredProfiles(profilesWithStats)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...profiles]

    // Поиск по имени или школе
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по региону
    if (regionFilter !== 'all') {
      filtered = filtered.filter((p) => p.region === regionFilter)
    }

    // Сортировка
    if (sortBy === 'achievements') {
      filtered.sort((a, b) => {
        const aTotal = a.awards_count + a.activities_count
        const bTotal = b.awards_count + b.activities_count
        return bTotal - aTotal
      })
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredProfiles(filtered)
  }

  const regions = ['all', 'Almaty', 'Astana', 'Turkistan', 'Shymkent', 'Karaganda', 'Aktobe', 'Atyrau', 'Other']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-gray-600 text-lg">
                Discover portfolios from {profiles.length} students across Kazakhstan
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <Card className="mb-8 border-2 border-indigo-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, school, or username..."
                    className="pl-10 h-12 text-base border-2 focus:ring-4 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Region Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Regions</option>
                  {regions.slice(1).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="mt-4 flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Sort by:</span>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === 'recent'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('achievements')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === 'achievements'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Most Achievements
              </button>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS COUNT */}
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">
            Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
          </p>
        </div>

        {/* PROFILES GRID */}
        {filteredProfiles.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">No profiles found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <Card
                key={profile.id}
                className="group border-2 border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/profile/${profile.username}`)}
              >
                <CardContent className="pt-6">
                  {/* Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                        {profile.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {profile.name}
                        </h3>
                        <p className="text-sm text-gray-500">@{profile.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* School & Region */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <School className="w-4 h-4" />
                      <span className="truncate">{profile.school}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.region}</span>
                    </div>
                  </div>

                  {/* About Me Preview */}
                  {profile.about_me && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {profile.about_me}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <div className="text-2xl font-black text-orange-600">{profile.awards_count}</div>
                      <div className="text-xs text-gray-600">Awards</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                      <div className="text-2xl font-black text-indigo-600">{profile.activities_count}</div>
                      <div className="text-xs text-gray-600">Activities</div>
                    </div>
                  </div>

                  {/* Academic Metrics */}
                  {(profile.gpa || profile.sat_score) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <TrendingUp className="w-3 h-3" />
                      {profile.gpa && <span>GPA: {profile.gpa.toFixed(2)}</span>}
                      {profile.gpa && profile.sat_score && <span>•</span>}
                      {profile.sat_score && <span>SAT: {profile.sat_score}</span>}
                    </div>
                  )}

                  {/* View Profile */}
                  <button className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile →
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