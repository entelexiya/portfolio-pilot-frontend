'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Calendar, MapPin, Users, ArrowRight, Filter, Search, Clock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Event {
  id: number
  title: string
  type: 'olympiad' | 'competition' | 'project' | 'volunteering' | 'workshop' | 'hackathon'
  date: string
  location: string
  participants: number
  maxParticipants?: number
  description: string
  organizer: string
  tags: string[]
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const events: Event[] = [
    {
      id: 1,
      title: 'Kazakhstan Math Olympiad 2026',
      type: 'olympiad',
      date: '2026-03-15',
      location: 'Shymkent, NIS PhysMath',
      participants: 47,
      maxParticipants: 100,
      description: 'Regional mathematics olympiad for high school students. 4 hours, 6 problems covering algebra, geometry, number theory.',
      organizer: 'NIS Turkistan',
      tags: ['Math', 'Competition', 'Certificate']
    },
    {
      id: 2,
      title: 'AI & ML Student Hackathon',
      type: 'hackathon',
      date: '2026-04-10',
      location: 'Online (Zoom)',
      participants: 23,
      maxParticipants: 50,
      description: '48-hour online hackathon. Build AI-powered applications. Prizes: $500 first place, $300 second, $200 third.',
      organizer: 'TechHub Almaty',
      tags: ['AI', 'ML', 'Coding', 'Prizes']
    },
    {
      id: 3,
      title: 'Community Service: Animal Shelter',
      type: 'volunteering',
      date: '2026-02-28',
      location: 'Shymkent Animal Shelter',
      participants: 8,
      maxParticipants: 15,
      description: 'Help care for rescue animals. Activities include feeding, cleaning, walking dogs. Great for community service hours.',
      organizer: 'Shymkent Volunteers',
      tags: ['Volunteering', 'Community', 'Animals']
    },
    {
      id: 4,
      title: 'ISEF Preparation Workshop',
      type: 'workshop',
      date: '2026-03-20',
      location: 'Almaty, Nazarbayev University',
      participants: 12,
      maxParticipants: 30,
      description: 'Learn how to prepare research projects for Intel ISEF. Workshop led by ISEF Grand Award winner.',
      organizer: 'NU Science Club',
      tags: ['Research', 'ISEF', 'Science']
    },
    {
      id: 5,
      title: 'Web Development Team Project',
      type: 'project',
      date: '2026-04-05',
      location: 'Online (Discord)',
      participants: 3,
      maxParticipants: 5,
      description: 'Looking for team members to build an e-commerce platform using Next.js. 3-month project, portfolio piece.',
      organizer: 'Amir Seitkali',
      tags: ['Web Dev', 'Team', 'Next.js']
    },
    {
      id: 6,
      title: 'National Chemistry Olympiad',
      type: 'competition',
      date: '2026-03-25',
      location: 'Astana, BIL',
      participants: 62,
      maxParticipants: 120,
      description: 'Compete for a spot on Kazakhstan national team for IChO. Theoretical and practical rounds.',
      organizer: 'Ministry of Education',
      tags: ['Chemistry', 'IChO', 'National']
    },
    {
      id: 7,
      title: 'Mobile App Hackathon',
      type: 'hackathon',
      date: '2026-05-12',
      location: 'Almaty, Astana Hub',
      participants: 31,
      maxParticipants: 60,
      description: 'Build mobile apps in 36 hours. iOS or Android. Mentorship from Kaspi.kz engineers. Cash prizes!',
      organizer: 'Astana Hub',
      tags: ['Mobile', 'iOS', 'Android', 'Prizes']
    },
    {
      id: 8,
      title: 'Tree Planting Initiative',
      type: 'volunteering',
      date: '2026-04-22',
      location: 'Turkistan Region',
      participants: 5,
      description: 'Plant 500 trees for Earth Day. Transportation and meals provided. Volunteer hours certificate.',
      organizer: 'EcoKazakhstan',
      tags: ['Environment', 'Earth Day', 'Volunteering']
    }
  ]

  const typeEmojis: Record<string, string> = {
    olympiad: '🏆',
    competition: '🥇',
    project: '💻',
    volunteering: '👥',
    workshop: '📚',
    hackathon: '⚡'
  }

  const typeColors: Record<string, string> = {
    olympiad: 'from-yellow-500 to-orange-500',
    competition: 'from-orange-500 to-red-500',
    project: 'from-indigo-500 to-purple-500',
    volunteering: 'from-emerald-500 to-teal-500',
    workshop: 'from-blue-500 to-cyan-500',
    hackathon: 'from-pink-500 to-rose-500'
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = typeFilter === 'all' || event.type === typeFilter
    return matchesSearch && matchesType
  })

  const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Events & Opportunities
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Find competitions, projects, and volunteering opportunities
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <Card className="mb-8 border-2 border-indigo-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title, tags..."
                  className="pl-10 h-12 text-base border-2 focus:ring-4 focus:ring-indigo-200"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="olympiad">🏆 Olympiads</option>
                  <option value="competition">🥇 Competitions</option>
                  <option value="hackathon">⚡ Hackathons</option>
                  <option value="project">💻 Projects</option>
                  <option value="workshop">📚 Workshops</option>
                  <option value="volunteering">👥 Volunteering</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS COUNT */}
        <div className="mb-6">
          <p className="text-gray-600 font-semibold">
            Showing {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* EVENTS GRID */}
        {sortedEvents.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event, index) => (
              <Card
                key={event.id}
                className="group border-2 border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-6">
                  {/* Type Badge & Emoji */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${typeColors[event.type]} rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-lg`}>
                      {typeEmojis[event.type]}
                    </div>
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold capitalize">
                      {event.type}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {event.participants}/{event.maxParticipants || '∞'} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">by {event.organizer}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:shadow-xl">
                    Register →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA SECTION */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <Calendar className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Share your competition, project, or volunteering opportunity with the community
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-4 rounded-2xl text-lg font-black hover:shadow-2xl hover:-translate-y-1 transition-all">
            <Tag className="w-5 h-5" />
            Post an Event
          </button>
        </div>
      </div>
    </div>
  )
}