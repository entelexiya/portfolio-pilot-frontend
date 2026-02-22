'use client'
import Link from 'next/link'
import { ArrowRight, FileCheck2, School, ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="pp-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="animate-float-delay absolute right-[-80px] top-10 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="animate-float-slow absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
        <section className="mb-16 text-center lg:mb-20">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-5 py-2 text-sm font-extrabold text-slate-700 shadow-lg backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
            PortfolioPilot
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
            One Profile.
            <br />
            <span className="pp-title-gradient animate-shimmer">
              Real Student Impact.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-600 md:text-xl">
            Build a clean academic profile, keep achievements structured, and share one link that
            actually represents your work.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-black text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl"
            >
              Start Building
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-8 py-4 text-base font-black text-slate-900 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Users className="h-5 w-5" />
              Community
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 text-sm font-bold text-slate-600 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm">
              Structured achievements
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm">
              Clean public profile
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm">
              Ready for school workflows
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          <Link
            href="/dashboard"
            className="group rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <UserRound className="mb-5 h-10 w-10 text-blue-700" />
            <h2 className="mb-2 text-2xl font-black text-slate-900">Student Workspace</h2>
            <p className="mb-4 text-slate-600">
              Add achievements, documents, and milestones in one consistent profile.
            </p>
            <span className="font-black text-blue-700 group-hover:underline">Open dashboard</span>
          </Link>

          <Link
            href="/verify"
            className="group rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <FileCheck2 className="mb-5 h-10 w-10 text-blue-600" />
            <h2 className="mb-2 text-2xl font-black text-slate-900">Verification Flow</h2>
            <p className="mb-4 text-slate-600">
              Confirm key claims when needed, without slowing down student progress.
            </p>
            <span className="font-black text-blue-600 group-hover:underline">Open verify page</span>
          </Link>

          <Link
            href="/school-dashboard"
            className="group rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <School className="mb-5 h-10 w-10 text-blue-700" />
            <h2 className="mb-2 text-2xl font-black text-slate-900">School Overview</h2>
            <p className="mb-4 text-slate-600">
              Track student readiness and identify profile gaps before application deadlines.
            </p>
            <span className="font-black text-blue-700 group-hover:underline">Open school dashboard</span>
          </Link>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute -bottom-16 left-20 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600">
                <Sparkles className="h-4 w-4 text-blue-700" />
                Product Focus
              </div>
              <h3 className="mb-3 text-3xl font-black text-slate-900 md:text-4xl">
                Less noise. More proof.
              </h3>
              <p className="max-w-xl text-slate-600">
                PortfolioPilot helps students present real work in a format that is easy to review
                and easy to trust.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Profile Snapshot
              </p>
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Physics Olympiad</p>
                  <p className="text-xs text-slate-500">Regional Winner - 2025</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Community Initiative</p>
                  <p className="text-xs text-slate-500">Led 18 volunteers - 70+ hours</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Research Project</p>
                  <p className="text-xs text-slate-500">Mentored lab contribution</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

