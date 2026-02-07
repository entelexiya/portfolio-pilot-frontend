import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Получить текущего пользователя
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}