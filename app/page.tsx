'use client'
import Link from 'next/link'
import { ArrowRight, Award, Users, FileText, Sparkles, TrendingUp, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-200 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Build Your Future</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Portfolio
            </span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create a stunning portfolio in minutes. Showcase your{' '}
            <span className="font-bold text-orange-600">awards</span>,{' '}
            <span className="font-bold text-indigo-600">projects</span>, and{' '}
            <span className="font-bold text-emerald-600">achievements</span>.
            <br />
            Perfect for college applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/register" 
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-5 rounded-2xl text-xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-gray-200"
            >
              Browse Events
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            🎓 Trusted by students applying to MIT, Stanford, Harvard & more
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-orange-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Track Awards</h3>
            <p className="text-gray-600 leading-relaxed">
              Olympic medals, competitions, hackathons. Keep all your achievements organized in one place.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-indigo-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Show Activities</h3>
            <p className="text-gray-600 leading-relaxed">
              Projects, research, internships, leadership roles. Build a comprehensive profile.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-emerald-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Export to PDF</h3>
            <p className="text-gray-600 leading-relaxed">
              Download a professional PDF portfolio ready for college applications.
            </p>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border-2 border-indigo-100 shadow-2xl mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-semibold">Free Forever</div>
            </div>
            <div>
              <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                2 min
              </div>
              <div className="text-gray-600 font-semibold">Setup Time</div>
            </div>
            <div>
              <div className="text-5xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <div className="text-gray-600 font-semibold">Achievements</div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Three Simple Steps
          </h2>
          <p className="text-xl text-gray-600 mb-12">Create your portfolio in minutes</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                1
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-gray-200 h-full pt-10">
                <h3 className="text-2xl font-black mb-4">Sign Up</h3>
                <p className="text-gray-600">Create your free account in seconds</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                2
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-gray-200 h-full pt-10">
                <h3 className="text-2xl font-black mb-4">Add Content</h3>
                <p className="text-gray-600">Fill in your awards, projects & activities</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                3
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-gray-200 h-full pt-10">
                <h3 className="text-2xl font-black mb-4">Share & Export</h3>
                <p className="text-gray-600">Get a public link or download PDF</p>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Stand Out?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join students from Kazakhstan applying to top universities worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-2xl text-xl font-black hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Create Portfolio Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 border-2 border-white text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-white hover:text-indigo-600 transition-all"
            >
              <Globe className="w-5 h-5" />
              Explore Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}