'use client'
import Link from 'next/link'
import { ArrowRight, Award, Users, FileText, Sparkles, TrendingUp, Globe, Check, Zap, Crown, Star, Rocket, Clock } from 'lucide-react'
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-indigo-200 mb-8 shadow-lg">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-sm font-bold text-indigo-600">🇰🇿 Built for Kazakhstan Students</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Portfolio,
            </span>
            <br />
            <span className="text-gray-900">Your Future</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create a stunning portfolio that gets you into{' '}
            <span className="font-black text-indigo-600">MIT</span>,{' '}
            <span className="font-black text-purple-600">Stanford</span>,{' '}
            <span className="font-black text-pink-600">Harvard</span>
            {' '}and top universities worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/register" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl text-xl font-black shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
            >
              <Rocket className="w-6 h-6" />
              Start Building Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/community" 
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-12 py-6 rounded-2xl text-xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-gray-200"
            >
              <Users className="w-6 h-6" />
              Browse Community
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">100% Free to Start</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">2 Min Setup</span>
            </div>
          </div>
        </div>

        {/* DEMO PREVIEW */}
        <div className="relative mb-32">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-100 p-8 hover:shadow-3xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-gray-100">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-500 font-mono">portfolio-pilot.vercel.app/profile/amir_2025</div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl">
                <Award className="w-12 h-12 text-orange-600 mb-4" />
                <div className="text-3xl font-black text-gray-900">12</div>
                <div className="text-sm text-gray-600">Awards</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
                <Users className="w-12 h-12 text-indigo-600 mb-4" />
                <div className="text-3xl font-black text-gray-900">18</div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                <TrendingUp className="w-12 h-12 text-emerald-600 mb-4" />
                <div className="text-3xl font-black text-gray-900">3.98</div>
                <div className="text-sm text-gray-600">GPA</div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">Powerful features to showcase your achievements</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-orange-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-orange-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Track Awards</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Olympiad medals, competitions, hackathons. Organize all achievements with certificates.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">IOI</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">IMO</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">ISEF</span>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-indigo-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Show Activities</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Projects, research, internships, leadership. Build a comprehensive profile.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Research</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Projects</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Internships</span>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-emerald-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Export to PDF</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Download professional PDF portfolio ready for college applications.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Common App</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Ready</span>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-purple-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-purple-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Public Profile</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Get a beautiful public URL to share with universities and recruiters.
              </p>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">
                portfolio-pilot.vercel.app/you
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Create your complete portfolio in under 5 minutes. No design skills needed.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Average: 2 min setup</span>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-pink-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-pink-300 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Success Stories</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Learn from students who got into MIT, Stanford, Harvard using PortfolioPilot.
              </p>
              <Link href="/success-stories" className="text-pink-600 font-bold hover:underline text-sm">
                View Success Stories →
              </Link>
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* FREE PLAN */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-gray-200 shadow-xl p-10">
              <div className="mb-6">
                <div className="text-gray-600 font-bold mb-2">FREE</div>
                <div className="text-5xl font-black text-gray-900 mb-4">
                  $0
                  <span className="text-xl text-gray-500 font-normal">/forever</span>
                </div>
                <p className="text-gray-600">Perfect to get started</p>
              </div>

              <Link 
                href="/register"
                className="block w-full text-center bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all mb-8"
              >
                Get Started Free
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 20 achievements</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Public portfolio profile</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">PDF export (with watermark)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Community access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Certificate uploads</span>
                </div>
              </div>
            </div>

            {/* PRO PLAN */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-black text-sm shadow-lg">
                ⭐ MOST POPULAR
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-yellow-300" />
                  <div className="font-bold">PRO</div>
                </div>
                <div className="text-5xl font-black mb-4">
                  $5
                  <span className="text-xl font-normal opacity-90">/month</span>
                </div>
                <p className="opacity-90">For serious applicants</p>
              </div>

              <button 
                className="block w-full text-center bg-white text-indigo-600 py-4 rounded-xl font-black hover:shadow-2xl hover:-translate-y-1 transition-all mb-8"
              >
                Upgrade to PRO
              </button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ Unlimited achievements</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ PDF without watermark</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ Custom themes (5 designs)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ Profile analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ Priority in Success Stories</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>✨ AI essay writing assistant</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            💳 <span className="font-semibold">All plans include:</span> Lifetime updates • 24/7 support • No hidden fees
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-xl text-gray-600">Your portfolio ready in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                1
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-indigo-100 h-full pt-14 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <h3 className="text-2xl font-black mb-4 text-gray-900">Create Account</h3>
                <p className="text-gray-600 leading-relaxed">Sign up with your email in 30 seconds. No credit card required.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                2
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-purple-100 h-full pt-14 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <h3 className="text-2xl font-black mb-4 text-gray-900">Add Content</h3>
                <p className="text-gray-600 leading-relaxed">Fill in your awards, projects, research, and upload certificates.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                3
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-pink-100 h-full pt-14 hover:shadow-2xl hover:-translate-y-2 transition-all">
                <h3 className="text-2xl font-black mb-4 text-gray-900">Share & Apply</h3>
                <p className="text-gray-600 leading-relaxed">Get your public link, download PDF, and impress universities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border-2 border-indigo-100 shadow-2xl mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Join Successful Students
            </h2>
            <p className="text-lg text-gray-600">Students using PortfolioPilot got into:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                MIT
              </div>
              <div className="text-sm text-gray-500">Computer Science</div>
            </div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Stanford
              </div>
              <div className="text-sm text-gray-500">Engineering</div>
            </div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                Harvard
              </div>
              <div className="text-sm text-gray-500">Biology</div>
            </div>
            <div>
              <div className="text-4xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Berkeley
              </div>
              <div className="text-sm text-gray-500">Math & CS</div>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-center text-white shadow-2xl">
            <Rocket className="w-20 h-20 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Ready to Stand Out?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of Kazakhstan students building portfolios that get them into top universities worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/register" 
                className="group inline-flex items-center gap-3 bg-white text-indigo-600 px-12 py-6 rounded-2xl text-xl font-black hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <Sparkles className="w-6 h-6" />
                Start Free Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/community" 
                className="inline-flex items-center gap-3 border-2 border-white text-white px-12 py-6 rounded-2xl text-xl font-black hover:bg-white hover:text-indigo-600 transition-all duration-300"
              >
                <Globe className="w-6 h-6" />
                View Examples
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-white/80">
              <Check className="w-5 h-5" />
              <span className="text-sm">No credit card required • Set up in 2 minutes • Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
