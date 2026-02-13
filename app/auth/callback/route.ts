import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const cookieStore = await cookies()
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesList) {
          cookiesList.forEach(({ name, value, options }) => cookiesToSet.push({ name, value, options: options as Record<string, unknown> }))
        },
      },
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin))
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, { path: '/', ...options })
  })
  return response
}
