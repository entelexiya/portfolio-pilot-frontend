'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldQuestion, Loader2 } from 'lucide-react'
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

export default function Dashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"awards" | "activities">("activities")
  const [verificationModal, setVerificationModal] = useState<Achievement | null>(null)
  const [verifierEmail, setVerifierEmail] = useState('')
  const [verificationLink, setVerificationLink] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationSending, setVerificationSending] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "activity" as Achievement["category"],
    type: "project" as Achievement["type"],
    date: "",
  })

  // Check auth and load initial data
  useEffect(() => {
    checkUser()
  }, [])

 const checkUser = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    router.push('/login')
    return
  }
  
  setUserId(user.id)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_public')
    .eq('id', user.id)
    .single()

  if (profile) {
    setUsername(profile.username)
    setIsPublic(profile.is_public ?? true)
  }
  
  fetchAchievements(user.id)
}

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
    alert(newStatus ? 'Profile is now public' : 'Profile is now private')
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to update settings')
  }
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    alert('File is too large! Maximum size is 5MB')
    e.target.value = ''
    return
  }
  
  setSelectedFile(file)
}

const getVerificationStatus = (a: Achievement): VerificationStatus => {
  if (a.verification_status) return a.verification_status
  return 'unverified'
}

const fetchAchievements = async (uid: string) => {
  try {
    setLoading(true)
    const response = await fetch(`${API_URL}/api/achievements?userId=${uid}`)
    const text = await response.text()
    const data = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
    if (data.success && Array.isArray(data.data)) {
      setAchievements(data.data)
    }
  } catch (error) {
    console.error("Error loading achievements:", error)
    alert("Failed to load achievements")
  } finally {
    setLoading(false)
  }
}

const handleRequestVerification = async () => {
  if (!verificationModal || !verifierEmail.trim()) {
    alert('Enter teacher email')
    return
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    alert('You need to sign in')
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
      alert(`Request created, but email was not sent: ${data.emailError || 'RESEND is not configured on backend.'}${fallbackLink}`)
    } else {
      alert('Request sent. Teacher will receive an email with a verification link.')
        }
  } catch (e: any) {
    alert(e.message || 'Failed to send request')
  } finally {
    setVerificationSending(false)
  }
}

const handleCreate = async () => {
  if (!formData.title || !formData.type) {
    alert("Fill in title and type")
    return
  }

  if (!userId) {
    alert("Error: user is not authorized")
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

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formDataUpload,
      })

      const uploadData = await uploadResponse.json()

      if (uploadData.success) {
        fileUrl = uploadData.data.url
      } else {
        alert("File upload error: " + uploadData.error)
        setUploading(false)
        return
      }
    }

    // 2. Create achievement
    const response = await fetch(`${API_URL}/api/achievements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      alert("Achievement created!")
    } else {
      alert("Error: " + data.error)
    }
  } catch (error) {
    console.error("Creation error:", error)
    alert("Failed to create achievement")
  } finally {
    setUploading(false)
  }
}

const handleUpdate = async () => {
  if (!editingId) return

  try {
    const response = await fetch(`${API_URL}/api/achievements/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
      alert("Achievement updated!")
    } else {
      alert("Error: " + data.error)
    }
  } catch (error) {
    console.error("Update error:", error)
    alert("Failed to update achievement")
  }
}

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this achievement?")) return

  try {
    const response = await fetch(`${API_URL}/api/achievements/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (data.success) {
      setAchievements(achievements.filter((a) => a.id !== id))
      alert("Achievement deleted")
    } else {
      alert("Error: " + data.error)
    }
  } catch (error) {
    console.error("Delete error:", error)
    alert("Failed to delete achievement")
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
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
}

const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    category: "activity",
    type: "project",
    date: "",
  })
}

// Filter by category
const awards = achievements.filter(a => a.category === 'award')
const activities = achievements.filter(a => a.category === 'activity')
const displayedAchievements = activeTab === 'awards' ? awards : activities

 if (loading) {
  return (
    <div className="container mx-auto p-6">
      <p className="text-center">Loading...</p>
    </div>
  )
}

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading your portfolio...</p>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
    <div className="container mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              My Portfolio
            </h1>
            <p className="text-gray-600 text-lg">Manage your awards and activities</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add Achievement
          </button>
        </div>
        
        {/* PROFILE CARD */}
        {username && (
          <div className="bg-gradient-to-r from-white/90 via-indigo-50/50 to-purple-50/50 backdrop-blur-xl p-8 rounded-3xl border-2 border-indigo-100 shadow-2xl">
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
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group"
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
                <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 shadow-lg"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ADD FORM */}
      {isAdding && (
        <div className="mb-8 animate-in slide-in-from-top duration-300">
          <Card className="border-2 border-indigo-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
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
                  className="mt-2 h-12 text-base border-2 focus:ring-4 focus:ring-indigo-200"
                />
              </div>

              {/* Date */}
              <div>
                <Label className="text-base font-bold text-gray-700">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-2 h-12 text-base border-2 focus:ring-4 focus:ring-indigo-200"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* File */}
              <div>
                <Label className="text-base font-bold text-gray-700">Certificate / Photo (Optional)</Label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Supported: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingId ? handleUpdate : handleCreate}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl"
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
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📌 Activities ({activities.length})
            {activeTab === 'activities' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`px-8 py-4 font-black text-xl transition-all relative ${
              activeTab === 'awards'
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Awards ({awards.length})
            {activeTab === 'awards' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
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
              className="group border-2 border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {achievement.title}
                      </h3>
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full font-bold text-sm">
                        {typeLabels[achievement.type]}
                      </span>
                      {getVerificationStatus(achievement) === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">
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
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold group"
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
                        className="hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200"
                      >
                        <ShieldQuestion className="h-4 w-4 mr-1" /> Request verification
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(achievement)}
                      className="hover:bg-emerald-100 hover:text-emerald-700"
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
          <Card className="w-full max-w-md border-2 border-indigo-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
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







