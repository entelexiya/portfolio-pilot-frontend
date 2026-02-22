'use client'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { Home, Users, LayoutDashboard, Settings, Calendar, LogOut, Menu, X } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon?: ReactNode
}

const publicItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { href: '/events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
  { href: '/community', label: 'Community', icon: <Users className="w-4 h-4" /> },
]

const privateItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { href: '/events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
  { href: '/community', label: 'Community', icon: <Users className="w-4 h-4" /> },
]

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const items = user ? privateItems : publicItems

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              PortfolioPilot
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-lg" />
            ) : (
              <>
                {items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                        active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                })}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="ml-2 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white transition-all hover:bg-slate-900 hover:shadow-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-5 py-2 text-blue-700 font-bold hover:bg-blue-50 rounded-xl transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={() => {
                  void handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center text-blue-700 font-bold hover:bg-blue-50 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl font-bold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

