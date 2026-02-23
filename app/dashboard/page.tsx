'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldQuestion, Loader2, Sparkles } from 'lucide-react'
import { supabase, getCurrentUser } from '@/lib/supabase-client'
import { Globe, ArrowRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://portfolio-pilot-api.vercel.app"

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  category: "award" | "activity"
  type: "olympiad" | "competition" | "award_other" | "project" | "research" | "internship" | "volunteering" | "leadership" | "club" | "activity_other"
  date: string
  file_url?: string
  verification_status?: VerificationStatus
  verified_by?: string | null
  verified_at?: string | null
  verifier_comment?: string | null
  verification_link?: string | null
  created_at: string
  updated_at: string
}

type AiAdvisorData = {
  portfolio_score: number
  profile_summary: string
  suggested_majors: string[]
  strengths: string[]
  gaps: string[]
  action_plan: string[]
}

type AchievementForm = {
  title: string
  description: string
  category: Achievement["category"]
  type: Achievement["type"]
  date: string
}

const typeLabels: Record<string, string> = {
  // Awards
  olympiad: "🏆 Olympiad",
  competition: "🥇 Competition",
  award_other: "⭐ Other Award",
  // Activities
  project: "💻 Project",
  research: "🔬 Research",
  internship: "💼 Internship",
  volunteering: "👥 Volunteering",
  leadership: "👑 Leadership",
  club: "🎯 Club",
  activity_other: "📌 Other Activity"
}

function buildAiDescription(form: AchievementForm): string {
  const title = form.title.trim()
  const base = form.description.trim()
  const type = form.type.replace('_', ' ')

  if (base.length >= 90) return base

  if (form.category === 'award') {
    return `${title}. Competed in ${type} and achieved strong results against regional peers. Built advanced problem-solving skills and consistent performance under pressure.`
  }

  return `${title}. Led execution in ${type}, coordinated deliverables, and shipped measurable outcomes for the team/community. Strengthened initiative, ownership, and collaboration skills.`
}

function analyzeAchievementQuality(form: AchievementForm): { score: number; tips: string[]; aiDescription: string } {
  const tips: string[] = []
  const title = form.title.trim()
  const description = form.description.trim()
  const fullText = `${title} ${description}`.toLowerCase()

  if (!title && !description) {
    return { score: 0, tips: [], aiDescription: '' }
  }

  let score = 0

  if (title.length >= 8) score += 20
  else tips.push('Make the title more specific (event/project + result).')

  if (description.length >= 60) score += 25
  else tips.push('Add more context: what you did, where, and why it mattered.')

  if (/\b(\d+|%|hours|students|participants|users|teams|rank|place|top)\b/i.test(fullText)) score += 20
  else tips.push('Add measurable impact: numbers, rank, participants, or hours.')

  if (/\b(led|built|organized|won|ranked|launched|published|implemented|managed)\b/i.test(fullText)) score += 20
  else tips.push('Use strong action verbs: led, built, organized, won, launched.')

  if (form.date) score += 5
  else tips.push('Set an exact date to make the record more credible.')

  const aiDescription = buildAiDescription(form)
  score = Math.min(100, score)

  if (tips.length === 0 && score >= 85) {
    tips.push('Great quality. This is ready for verification and sharing.')
  }

  return { score, tips, aiDescription }
}

function recommendMajors(achievements: Achievement[], gpa?: number | null, sat?: number | null): string[] {
  const text = achievements.map((a) => `${a.type} ${a.title} ${a.description || ''}`).join(' ').toLowerCase()
  const has = (pattern: RegExp) => pattern.test(text)

  const majors: string[] = []
  if (has(/\b(code|hackathon|project|software|algorithm|programming|ai|ml|research)\b/)) {
    majors.push('Computer Science')
  }
  if (has(/\b(research|biology|chemistry|physics|lab|science|olympiad)\b/)) {
    majors.push('Data Science / STEM Research')
  }
  if (has(/\b(leadership|club|volunteer|community|organi[sz]ed|managed)\b/)) {
    majors.push('Business / Management')
  }
  if (has(/\b(volunteer|social|community|ngo|impact|mentor)\b/)) {
    majors.push('Public Policy / Social Sciences')
  }
  if (has(/\b(design|media|content|marketing|brand)\b/)) {
    majors.push('Design / Communications')
  }

  if (majors.length === 0) {
    majors.push('Undeclared (Explore 2-3 tracks)')
  }

  if ((gpa || 0) >= 3.7 || (sat || 0) >= 1450) {
    majors.unshift('Highly Selective Programs Track')
  }

  return majors.slice(0, 4)
}

function portfolioActionPlan(params: {
  achievements: Achievement[]
  verifiedCount: number
  goalMajor: string
  gpa?: number | null
  sat?: number | null
}): string[] {
  const { achievements, verifiedCount, goalMajor, gpa, sat } = params
  const goal = goalMajor.trim().toLowerCase()
  const actions: string[] = []
  const text = achievements.map((a) => `${a.type} ${a.title} ${a.description || ''}`).join(' ').toLowerCase()

  if (achievements.length < 6) {
    actions.push('Increase total achievements to at least 6-8 with clear outcomes.')
  }
  if (verifiedCount < 2) {
    actions.push('Get at least 2 achievements verified by teacher/mentor to increase trust.')
  }
  if ((gpa || 0) > 0 && (gpa || 0) < 3.6) {
    actions.push('Raise GPA trend and document academic improvement semester-by-semester.')
  }
  if ((sat || 0) > 0 && (sat || 0) < 1400) {
    actions.push('Retake SAT with a target of 1450+ for stronger competitiveness.')
  }

  if (goal.includes('ai') || goal.includes('computer') || goal.includes('cs') || goal.includes('ml')) {
    if (!/\b(hackathon|project|ai|ml|programming|research)\b/.test(text)) {
      actions.push('Build 2 technical projects (one AI/ML), publish code, and join at least 1 hackathon.')
    } else {
      actions.push('Deepen AI track: add one research-style project and one competition result.')
    }
  }

  if (goal.includes('business') || goal.includes('management') || goal.includes('economics')) {
    actions.push('Show leadership + impact metrics: team size, revenue/users reached, partnerships.')
  }

  if (goal.includes('medicine') || goal.includes('bio')) {
    actions.push('Add science research, olympiad/lab exposure, and sustained community health volunteering.')
  }

  if (actions.length === 0) {
    actions.push('Keep building depth in one track and add measurable impact in every new activity.')
  }

  return actions.slice(0, 5)
}

export default function Dashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [gpa, setGpa] = useState<number | null>(null)
  const [satScore, setSatScore] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"awards" | "activities">("activities")
  const [verificationModal, setVerificationModal] = useState<Achievement | null>(null)
  const [verifierEmail, setVerifierEmail] = useState('')
  const [verificationLink, setVerificationLink] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationSending, setVerificationSending] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiScore, setAiScore] = useState<number | null>(null)
  const [aiTips, setAiTips] = useState<string[]>([])
  const [aiPreview, setAiPreview] = useState('')
  const [goalMajor, setGoalMajor] = useState('')
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorError, setAdvisorError] = useState<string | null>(null)
  const [advisorData, setAdvisorData] = useState<AiAdvisorData | null>(null)
  const router = useRouter()

  const getAuthHeaders = useCallback(async (withJson = true) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('You need to sign in')

    return {
      ...(withJson ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    }
  }, [])

  const [formData, setFormData] = useState<AchievementForm>({
    title: "",
    description: "",
    category: "activity" as Achievement["category"],
    type: "project" as Achievement["type"],
    date: "",
  })

  const verifiedCount = useMemo(
    () => achievements.filter((a) => (a.verification_status || 'unverified') === 'verified').length,
    [achievements]
  )

  const majorSuggestions = useMemo(
    () => recommendMajors(achievements, gpa, satScore),
    [achievements, gpa, satScore]
  )

  const advisorPlan = useMemo(
    () => portfolioActionPlan({ achievements, verifiedCount, goalMajor, gpa, sat: satScore }),
    [achievements, gpa, goalMajor, satScore, verifiedCount]
  )

const runAiCoach = async () => {
  setAiBusy(true)
  try {
    const result = analyzeAchievementQuality(formData)
    setAiScore(result.score)
    setAiTips(result.tips)
    setAiPreview(result.aiDescription)
  } finally {
    setAiBusy(false)
  }
}

const fetchAiAdvisor = async () => {
  if (!userId) return

  try {
    setAdvisorLoading(true)
    setAdvisorError(null)

    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/api/ai/advisor`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        achievements: achievements.map((a) => ({
          title: a.title,
          description: a.description,
          category: a.category,
          type: a.type,
          verification_status: a.verification_status || 'unverified',
        })),
        goalMajor: goalMajor.trim() || undefined,
        gpa,
        satScore,
      }),
    })

    const text = await res.text()
    const payload = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || `AI advisor failed (${res.status})`)
    }
    setAdvisorData(payload.data as AiAdvisorData)
  } catch (e: unknown) {
    setAdvisorError(e instanceof Error ? e.message : 'Failed to load AI advisor')
  } finally {
    setAdvisorLoading(false)
  }
}

  useEffect(() => {
    const result = analyzeAchievementQuality(formData)
    setAiScore(result.score)
    setAiTips(result.tips)
    setAiPreview(result.aiDescription)
  }, [formData])

const fetchAchievements = useCallback(async (uid: string) => {
  try {
    setLoading(true)
    const headers = await getAuthHeaders(false)
    const response = await fetch(`${API_URL}/api/achievements?userId=${uid}`, { headers })
    const text = await response.text()
    const data = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
    if (data.success && Array.isArray(data.data)) {
      setAchievements(data.data)
    }
  } catch (error) {
    console.error("Error loading achievements:", error)
    setNotice({ type: 'error', message: 'Failed to load achievements.' })
  } finally {
    setLoading(false)
  }
}, [getAuthHeaders])

const checkUser = useCallback(async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    router.push('/login')
    return
  }
  
  setUserId(user.id)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_public, gpa, sat_score')
    .eq('id', user.id)
    .single()

  if (profile) {
    setUsername(profile.username)
    setIsPublic(profile.is_public ?? true)
    setGpa(profile.gpa ?? null)
    setSatScore(profile.sat_score ?? null)
  }
  
  await fetchAchievements(user.id)
}, [fetchAchievements, router])

  // Check auth and load initial data
  useEffect(() => {
    void checkUser()
  }, [checkUser])

const togglePrivacy = async () => {
  if (!userId) return

  try {
    const newStatus = !isPublic
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: newStatus })
      .eq('id', userId)

    if (error) throw error

    setIsPublic(newStatus)
    setNotice({
      type: 'success',
      message: newStatus ? 'Profile is now public.' : 'Profile is now private.',
    })
  } catch (error) {
    console.error('Error:', error)
    setNotice({ type: 'error', message: 'Failed to update settings.' })
  }
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    setNotice({ type: 'error', message: 'File is too large. Maximum size is 5MB.' })
    e.target.value = ''
    return
  }
  
  setSelectedFile(file)
}

const getVerificationStatus = (a: Achievement): VerificationStatus => {
  if (a.verification_status) return a.verification_status
  return 'unverified'
}

const handleRequestVerification = async () => {
  if (!verificationModal || !verifierEmail.trim()) {
    setNotice({ type: 'error', message: 'Enter teacher email.' })
    return
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    setNotice({ type: 'error', message: 'You need to sign in.' })
    return
  }
  setVerificationSending(true)
  try {
    const res = await fetch(`${API_URL}/api/verification/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        achievementId: verificationModal.id,
        verifierEmail: verifierEmail.trim(),
        verificationLink: verificationLink.trim() || undefined,
        message: verificationMessage.trim() || undefined,
      }),
    })
    const text = await res.text()
    const data = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
    if (!res.ok) {
      const msg = data.error || (res.status === 404 ? 'Endpoint not found. Is backend deployed with /api/verification/request?' : `Error ${res.status}`)
      throw new Error(msg)
    }
    if (!data.success && !data.verifyUrl) {
      throw new Error('Server returned an empty response. Check NEXT_PUBLIC_API_URL and backend logs.')
    }
    setVerificationModal(null)
    setVerifierEmail('')
    setVerificationLink('')
    setVerificationMessage('')
    fetchAchievements(userId!)
    const emailSent = data.emailSent !== false
    if (!emailSent) {
      const fallbackLink = data.verifyUrl
        ? `\n\nManual link to send:\n${data.verifyUrl}`
        : ''
      setNotice({
        type: 'error',
        message: `Request created, but email was not sent: ${
          data.emailError || 'RESEND is not configured on backend.'
        }${fallbackLink}`,
      })
    } else {
      setNotice({
        type: 'success',
        message: 'Request sent. Teacher will receive an email with a verification link.',
      })
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to send request'
    setNotice({ type: 'error', message })
  } finally {
    setVerificationSending(false)
  }
}

const handleCreate = async () => {
  if (!formData.title || !formData.type) {
    setNotice({ type: 'error', message: 'Fill in title and type.' })
    return
  }

  if (!userId) {
    setNotice({ type: 'error', message: 'Error: user is not authorized.' })
    return
  }

  try {
    setUploading(true)
    let fileUrl = null

    // 1. Upload file if provided
    if (selectedFile) {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)
      formDataUpload.append('userId', userId)
      const uploadHeaders = await getAuthHeaders(false)

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: uploadHeaders,
        body: formDataUpload,
      })

      const uploadData = await uploadResponse.json()

      if (uploadData.success) {
        fileUrl = uploadData.data.url
      } else {
        setNotice({ type: 'error', message: `File upload error: ${uploadData.error}` })
        setUploading(false)
        return
      }
    }

    // 2. Create achievement
    const response = await fetch(`${API_URL}/api/achievements`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: formData.date || new Date().toISOString().split("T")[0],
        file_url: fileUrl,
      }),
    })

    const data = await response.json()

    if (data.success) {
      setAchievements([data.data, ...achievements])
      resetForm()
      setSelectedFile(null)
      setIsAdding(false)
      setNotice({ type: 'success', message: 'Achievement created.' })
    } else {
      setNotice({ type: 'error', message: `Error: ${data.error}` })
    }
  } catch (error) {
    console.error("Creation error:", error)
    setNotice({ type: 'error', message: 'Failed to create achievement.' })
  } finally {
    setUploading(false)
  }
}

const handleUpdate = async () => {
  if (!editingId) return

  try {
    const response = await fetch(`${API_URL}/api/achievements/${editingId}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: formData.date,
      }),
    })

    const data = await response.json()

    if (data.success) {
      setAchievements(
        achievements.map((a) => (a.id === editingId ? data.data : a))
      )
      resetForm()
      setEditingId(null)
      setNotice({ type: 'success', message: 'Achievement updated.' })
    } else {
      setNotice({ type: 'error', message: `Error: ${data.error}` })
    }
  } catch (error) {
    console.error("Update error:", error)
    setNotice({ type: 'error', message: 'Failed to update achievement.' })
  }
}

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this achievement?")) return

  try {
    const response = await fetch(`${API_URL}/api/achievements/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(false),
    })

    const data = await response.json()

    if (data.success) {
      setAchievements(achievements.filter((a) => a.id !== id))
      setNotice({ type: 'success', message: 'Achievement deleted.' })
    } else {
      setNotice({ type: 'error', message: `Error: ${data.error}` })
    }
  } catch (error) {
    console.error("Delete error:", error)
    setNotice({ type: 'error', message: 'Failed to delete achievement.' })
  }
}

const startEdit = (achievement: Achievement) => {
  setFormData({
    title: achievement.title,
    description: achievement.description || "",
    category: achievement.category,
    type: achievement.type,
    date: achievement.date,
  })
  setEditingId(achievement.id)
  setIsAdding(true)
  setAiScore(null)
  setAiTips([])
  setAiPreview('')
}

const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    category: "activity",
    type: "project",
    date: "",
  })
  setAiScore(null)
  setAiTips([])
  setAiPreview('')
}

// Filter by category
const awards = achievements.filter(a => a.category === 'award')
const activities = achievements.filter(a => a.category === 'activity')
const displayedAchievements = activeTab === 'awards' ? awards : activities

if (loading) {
  return (
    <div className="min-h-screen pp-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading your portfolio...</p>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen pp-bg py-8 px-4">
    <div className="container mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black pp-title-gradient mb-2">
              My Portfolio
            </h1>
            <p className="text-gray-600 text-lg">Manage your awards and activities</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="group inline-flex items-center gap-2 pp-primary-btn px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add Achievement
          </button>
        </div>

        {notice && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              notice.type === 'success'
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {notice.message}
          </div>
        )}
        
        {/* PROFILE CARD */}
        {username && (
          <div className="bg-gradient-to-r from-white/90 via-indigo-50/50 to-indigo-50/50 backdrop-blur-xl p-8 rounded-3xl border-2 border-blue-100 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{isPublic ? '🌐' : '🔒'}</span>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      {isPublic ? 'Public Profile' : 'Private Profile'}
                    </h3>
                    <p className="text-gray-600">
                      {isPublic 
                        ? 'Anyone can view your portfolio' 
                        : 'Only you can see your achievements'}
                    </p>
                  </div>
                </div>
                {isPublic && (
                  <a 
                    href={`/profile/${username}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold group"
                  >
                    <Globe className="w-4 h-4" />
                    View Public Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
              
              {/* TOGGLE */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={togglePrivacy}
                  className="sr-only peer"
                />
                <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-indigo-600 shadow-lg"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ADD FORM */}
      {isAdding && (
        <div className="mb-8 animate-in slide-in-from-top duration-300">
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-2xl font-black">
                {editingId ? '✏️ Edit Achievement' : '✨ New Achievement'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Category */}
              <div>
                <Label className="text-base font-bold text-gray-700">Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const category = e.target.value as Achievement["category"]
                    setFormData({ 
                      ...formData, 
                      category,
                      type: category === 'award' ? 'olympiad' : 'project'
                    })
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="award">🏆 Award</option>
                  <option value="activity">📌 Activity</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <Label className="text-base font-bold text-gray-700">Type *</Label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Achievement["type"] })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  {formData.category === 'award' ? (
                    <>
                      <option value="olympiad">🏆 Olympiad</option>
                      <option value="competition">🥇 Competition</option>
                      <option value="award_other">⭐ Other Award</option>
                    </>
                  ) : (
                    <>
                      <option value="project">💻 Project</option>
                      <option value="research">🔬 Research</option>
                      <option value="internship">💼 Internship</option>
                      <option value="volunteering">👥 Volunteering</option>
                      <option value="leadership">👑 Leadership</option>
                      <option value="club">🎯 Club</option>
                      <option value="activity_other">📌 Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <Label className="text-base font-bold text-gray-700">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., IOI Gold Medal 2025"
                  className="mt-2 h-12 text-base border-2 focus:ring-4 focus:ring-blue-200"
                />
              </div>

              {/* Date */}
              <div>
                <Label className="text-base font-bold text-gray-700">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-2 h-12 text-base border-2 focus:ring-4 focus:ring-blue-200"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-base font-bold text-gray-700">Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your achievement..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* File */}
              <div>
                <Label className="text-base font-bold text-gray-700">Certificate / Photo (Optional)</Label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-indigo-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Supported: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingId ? handleUpdate : handleCreate}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-xl"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : editingId ? (
                    'Save Changes'
                  ) : (
                    'Create Achievement'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="h-14 px-8 text-lg font-bold"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TABS */}
      <div className="mb-8">
        <div className="flex gap-3 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-8 py-4 font-black text-xl transition-all relative ${
              activeTab === 'activities'
                ? 'text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📌 Activities ({activities.length})
            {activeTab === 'activities' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`px-8 py-4 font-black text-xl transition-all relative ${
              activeTab === 'awards'
                ? 'text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Awards ({awards.length})
            {activeTab === 'awards' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      <Card className="mb-8 border-2 border-blue-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-700" />
            Portfolio AI Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">LLM-powered portfolio analysis and major-fit guidance.</p>
            <Button
              type="button"
              onClick={() => void fetchAiAdvisor()}
              disabled={advisorLoading || achievements.length === 0}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {advisorLoading ? 'Analyzing portfolio...' : 'Refresh AI Advisor'}
            </Button>
          </div>

          {advisorError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {advisorError}. Showing local advisor fallback.
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs text-gray-600">Total achievements</p>
              <p className="text-2xl font-black text-blue-800">{achievements.length}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs text-gray-600">Verified</p>
              <p className="text-2xl font-black text-blue-800">{verifiedCount}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs text-gray-600">Portfolio score</p>
              <p className="text-2xl font-black text-blue-800">
                {advisorData ? advisorData.portfolio_score : Math.min(100, 25 + achievements.length * 8 + verifiedCount * 10)}
              </p>
            </div>
          </div>

          {advisorData?.profile_summary && (
            <div className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-gray-700">
              {advisorData.profile_summary}
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Suggested major tracks</p>
            <div className="flex flex-wrap gap-2">
              {(advisorData?.suggested_majors?.length ? advisorData.suggested_majors : majorSuggestions).map((major) => (
                <span key={major} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                  {major}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-bold text-gray-700">Your target major</Label>
            <Input
              value={goalMajor}
              onChange={(e) => setGoalMajor(e.target.value)}
              placeholder="e.g. AI, Computer Science, Business, Medicine"
              className="mt-2 h-11 border-2 focus:ring-4 focus:ring-blue-200"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Action plan from AI advisor</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {(advisorData?.action_plan?.length ? advisorData.action_plan : advisorPlan).map((item, idx) => (
                <li key={`${item}-${idx}`} className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                  {idx + 1}. {item}
                </li>
              ))}
            </ul>
          </div>

          {(advisorData?.strengths?.length || advisorData?.gaps?.length) && (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <p className="text-sm font-bold text-blue-900 mb-2">Strengths</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {(advisorData?.strengths || []).map((s, idx) => (
                    <li key={`${s}-${idx}`}>- {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                <p className="text-sm font-bold text-amber-900 mb-2">Gaps to close</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {(advisorData?.gaps || []).map((g, idx) => (
                    <li key={`${g}-${idx}`}>- {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isAdding && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-indigo-900">Current draft quality</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void runAiCoach()}
                  disabled={aiBusy}
                  className="border-blue-300 text-blue-800 hover:bg-blue-100"
                >
                  {aiBusy ? 'Analyzing...' : 'Refresh draft advice'}
                </Button>
              </div>
              <p className="text-sm text-gray-700">
                Score: <span className="font-black text-indigo-800">{aiScore ?? 0}/100</span>
              </p>
              {aiTips.length > 0 && (
                <ul className="text-sm text-gray-700 space-y-1">
                  {aiTips.map((tip, i) => (
                    <li key={`${tip}-${i}`}>- {tip}</li>
                  ))}
                </ul>
              )}
              {aiPreview && (
                <div className="rounded-lg border border-indigo-200 bg-white p-3">
                  <p className="text-xs font-bold text-indigo-700 mb-1">Suggested description</p>
                  <p className="text-sm text-gray-700 mb-2">{aiPreview}</p>
                  <Button
                    type="button"
                    onClick={() => setFormData({ ...formData, description: aiPreview })}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    Use This Description
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACHIEVEMENTS GRID */}
      <div className="grid gap-6">
        {displayedAchievements.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <div className="text-8xl mb-6">
                {activeTab === 'awards' ? '🏆' : '📌'}
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                No {activeTab === 'awards' ? 'Awards' : 'Activities'} Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your portfolio by adding your first achievement!
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 pp-primary-btn px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Add Your First {activeTab === 'awards' ? 'Award' : 'Activity'}
              </button>
            </CardContent>
          </Card>
        ) : (
          displayedAchievements.map((achievement, index) => (
            <Card 
              key={achievement.id} 
              className="group border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                        {achievement.title}
                      </h3>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 rounded-full font-bold text-sm">
                        {typeLabels[achievement.type]}
                      </span>
                      {getVerificationStatus(achievement) === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </span>
                      )}
                      {getVerificationStatus(achievement) === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" /> Pending
                        </span>
                      )}
                      {getVerificationStatus(achievement) === 'rejected' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-sm">Rejected</span>
                      )}
                    </div>
                    {achievement.description && (
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {achievement.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-semibold">📅 {achievement.date}</span>
                      {achievement.file_url && (
                        
                        <a  href={achievement.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold group"
                        >
                          📎 Certificate
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(getVerificationStatus(achievement) === 'unverified' || getVerificationStatus(achievement) === 'rejected') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVerificationModal(achievement)
                          setVerifierEmail('')
                          setVerificationLink(achievement.verification_link || '')
                          setVerificationMessage('')
                        }}
                        className="hover:bg-blue-50 hover:text-blue-800 border-blue-200"
                      >
                        <ShieldQuestion className="h-4 w-4 mr-1" /> Request verification
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(achievement)}
                      className="hover:bg-blue-100 hover:text-blue-700"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(achievement.id)}
                      className="hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Request verification modal */}
      {verificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !verificationSending && setVerificationModal(null)}>
          <Card className="w-full max-w-md border-2 border-blue-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl">Request verification</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Teacher will receive an email with a link to confirm this achievement.</p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="font-semibold text-gray-700">{verificationModal.title}</p>
              <div>
                <Label>Teacher email *</Label>
                <Input
                  type="email"
                  placeholder="teacher@school.edu.kz"
                  value={verifierEmail}
                  onChange={e => setVerifierEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Proof link (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={verificationLink}
                  onChange={e => setVerificationLink(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Link to results, diploma, or project (teacher will check it)</p>
              </div>
              <div>
                <Label>Message to teacher (optional)</Label>
                <textarea
                  value={verificationMessage}
                  onChange={e => setVerificationMessage(e.target.value)}
                  placeholder="e.g. Please confirm my participation"
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl mt-1 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleRequestVerification}
                  disabled={verificationSending}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  {verificationSending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : 'Send request'}
                </Button>
                <Button variant="outline" onClick={() => setVerificationModal(null)} disabled={verificationSending}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </div>
)
}








