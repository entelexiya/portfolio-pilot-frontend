'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { Home, Users, LayoutDashboard, Settings, Calendar, LogOut, Menu, X } from 'lucide-react'

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  // Hide navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              PortfolioPilot
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : user ? (
              // Authenticated
              <>
                <Link 
                  href="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/dashboard' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/settings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/settings' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                
                <Link 
                  href="/events"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/events' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link 
  href="/community"
  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
    pathname === '/community' 
      ? 'bg-indigo-100 text-indigo-700' 
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <Users className="w-4 h-4" />
  Community
</Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              // Not authenticated
              <>
                <Link 
                  href="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/events"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === '/events' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link 
  href="/community"
  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
    pathname === '/community' 
      ? 'bg-indigo-100 text-indigo-700' 
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <Users className="w-4 h-4" />
  Community
</Link>
                <Link 
                  href="/login"
                  className="px-5 py-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                
                <Link 
                  href="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link 
  href="/community"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
>
  <Users className="w-4 h-4" />
  Community
</Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
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
