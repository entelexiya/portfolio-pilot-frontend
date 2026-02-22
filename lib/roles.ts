import { supabase } from '@/lib/supabase-client'

export type AppRole = 'student' | 'verifier' | 'counselor'

export type CurrentProfile = {
  id: string
  email: string | null
  role: AppRole
  school: string | null
  name: string | null
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, school, name')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return {
      id: user.id,
      email: user.email || null,
      role: 'student',
      school: null,
      name: null,
    }
  }

  const role = (data.role as AppRole | null) || 'student'

  return {
    id: user.id,
    email: user.email || null,
    role,
    school: (data.school as string | null) || null,
    name: (data.name as string | null) || null,
  }
}

export function hasRequiredRole(userRole: AppRole, required: AppRole) {
  return userRole === required
}
