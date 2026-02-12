'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase, getCurrentUser } from '@/lib/supabase-client'
import { ArrowLeft, Save, User, Mail, School, Award, Link as LinkIcon } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    school: '',
    region: 'Turkistan',
    gpa: '',
    sat_score: '',
    ielts: '',
    toefl: '',
    github_url: '',
    about_me: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setUsername(data.username || '')
        setFormData({
          name: data.name || '',
          school: data.school || '',
          region: data.region || 'Turkistan',
          gpa: data.gpa?.toString() || '',
          sat_score: data.sat_score?.toString() || '',
          ielts: data.ielts?.toString() || '',
          toefl: data.toefl?.toString() || '',
          github_url: data.github_url || '',
          about_me: data.about_me || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      alert('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          school: formData.school,
          region: formData.region,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
          ielts: formData.ielts ? parseFloat(formData.ielts) : null,
          toefl: formData.toefl ? parseInt(formData.toefl) : null,
          github_url: formData.github_url || null,
          about_me: formData.about_me || null
        })
        .eq('id', userId)

      if (error) throw error

      alert('Profile updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-lg">Update your personal information and academic records</p>
        </div>

        {/* ACCOUNT INFO (READ-ONLY) */}
        <Card className="mb-6 border-2 border-indigo-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label className="text-gray-600">Email Address</Label>
              <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg border">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{email}</span>
                <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Read-only</span>
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Username</Label>
              <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg border">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">@{username}</span>
                <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Read-only</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your public profile: <a href={`/profile/${username}`} target="_blank" className="text-indigo-600 hover:underline">portfolio-pilot.vercel.app/profile/{username}</a></p>
            </div>
          </CardContent>
        </Card>

        {/* PERSONAL INFO */}
        <Card className="mb-6 border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Aidar Nurakhmetov"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="school">School / Institution *</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="NIS PhysMath Turkistan"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-md mt-2"
              >
                <option value="Turkistan">Turkistan</option>
                <option value="Almaty">Almaty</option>
                <option value="Astana">Astana</option>
                <option value="Shymkent">Shymkent</option>
                <option value="Karaganda">Karaganda</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>
           {/* ABOUT ME */}
        <Card className="mb-6 border-2 border-pink-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="about_me">Personal Statement</Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                Tell us about your interests, goals, and what drives you (200-500 words)
              </p>
              <textarea
                id="about_me"
                value={formData.about_me || ''}
                onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                placeholder="I'm passionate about computer science and solving real-world problems through technology..."
                rows={8}
                maxLength={2000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {(formData.about_me || '').length} / 2000 characters
              </p>
            </div>
          </CardContent>
        </Card>
        {/* ACADEMIC METRICS */}
        <Card className="mb-6 border-2 border-emerald-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Academic Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpa">GPA (0.00 - 4.00)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="3.85"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sat_score">SAT Score (400 - 1600)</Label>
                <Input
                  id="sat_score"
                  type="number"
                  min="400"
                  max="1600"
                  value={formData.sat_score}
                  onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                  placeholder="1450"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="ielts">IELTS (0.0 - 9.0)</Label>
                <Input
                  id="ielts"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={formData.ielts}
                  onChange={(e) => setFormData({ ...formData, ielts: e.target.value })}
                  placeholder="7.5"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="toefl">TOEFL (0 - 120)</Label>
                <Input
                  id="toefl"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.toefl}
                  onChange={(e) => setFormData({ ...formData, toefl: e.target.value })}
                  placeholder="105"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LINKS */}
        <Card className="mb-8 border-2 border-blue-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="github_url">GitHub Profile</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6 shadow-xl"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="px-8 text-lg py-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}