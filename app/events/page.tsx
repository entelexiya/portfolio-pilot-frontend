'use client'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, MapPin, Users, ArrowRight, Filter, Search, Clock, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase, getCurrentUser } from '@/lib/supabase-client'

type EventType = 'olympiad' | 'competition' | 'project' | 'volunteering' | 'workshop' | 'hackathon'
type ViewFilter = 'all' | 'upcoming' | 'joined' | 'my'

type EventRow = {
  id: string
  host_id: string
  title: string
  type: EventType
  date: string
  location: string
  max_participants: number | null
  description: string
  organizer: string
  tags: string[] | null
  created_at: string
}

type ParticipantRow = {
  event_id: string
  user_id: string
}

const emptyForm = {
  title: '',
  type: 'project' as EventType,
  date: '',
  location: '',
  maxParticipants: '',
  description: '',
  organizer: '',
  tags: '',
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set())
  const [busyEventId, setBusyEventId] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: eventsError } = await supabase
        .from('events')
        .select('id, host_id, title, type, date, location, max_participants, description, organizer, tags, created_at')
        .order('date', { ascending: true })

      if (eventsError) throw eventsError
      const rows = (data || []) as EventRow[]
      setEvents(rows)

      if (rows.length === 0) {
        setParticipantCounts({})
        setJoinedEventIds(new Set())
        setLoading(false)
        return
      }

      const eventIds = rows.map((e) => e.id)
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('event_id, user_id')
        .in('event_id', eventIds)

      if (participantsError) throw participantsError

      const pRows = (participants || []) as ParticipantRow[]
      const counts: Record<string, number> = {}
      const joined = new Set<string>()

      for (const row of pRows) {
        counts[row.event_id] = (counts[row.event_id] || 0) + 1
        if (userId && row.user_id === userId) joined.add(row.event_id)
      }

      setParticipantCounts(counts)
      setJoinedEventIds(joined)
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Failed to load events. Make sure Supabase tables events/event_participants exist.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void (async () => {
      const user = await getCurrentUser()
      setUserId(user?.id || null)
    })()
  }, [])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const filteredEvents = useMemo(() => {
    const today = new Date()
    const q = searchQuery.trim().toLowerCase()

    return events.filter((event) => {
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.organizer.toLowerCase().includes(q) ||
        (event.tags || []).some((tag) => tag.toLowerCase().includes(q))

      const matchesType = typeFilter === 'all' || event.type === typeFilter

      let matchesView = true
      if (viewFilter === 'upcoming') matchesView = new Date(event.date) >= today
      if (viewFilter === 'joined') matchesView = joinedEventIds.has(event.id)
      if (viewFilter === 'my') matchesView = !!userId && event.host_id === userId

      return matchesSearch && matchesType && matchesView
    })
  }, [events, joinedEventIds, searchQuery, typeFilter, userId, viewFilter])

  const handleCreate = async () => {
    if (!userId) {
      setNotice('Sign in first to host events.')
      return
    }
    if (!form.title.trim() || !form.date || !form.location.trim() || !form.description.trim()) {
      setNotice('Fill in title, date, location and description.')
      return
    }

    setCreating(true)
    setNotice(null)
    setError(null)

    try {
      const maxParticipants = form.maxParticipants.trim() ? Number(form.maxParticipants) : null
      if (maxParticipants !== null && (!Number.isFinite(maxParticipants) || maxParticipants <= 0)) {
        throw new Error('Max participants must be a positive number.')
      }

      const tags = form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const { error: createError } = await supabase.from('events').insert({
        host_id: userId,
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        location: form.location.trim(),
        max_participants: maxParticipants,
        description: form.description.trim(),
        organizer: form.organizer.trim() || 'Community Host',
        tags,
      })

      if (createError) throw createError

      setForm(emptyForm)
      setShowCreate(false)
      setNotice('Event created successfully.')
      await loadEvents()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create event'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinLeave = async (event: EventRow) => {
    if (!userId) {
      setNotice('Sign in first to join events.')
      return
    }

    setBusyEventId(event.id)
    setNotice(null)
    setError(null)
    try {
      const joined = joinedEventIds.has(event.id)
      if (joined) {
        const { error: leaveError } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', userId)
        if (leaveError) throw leaveError
      } else {
        const currentCount = participantCounts[event.id] || 0
        if (event.max_participants && currentCount >= event.max_participants) {
          throw new Error('No available spots left for this event.')
        }
        const { error: joinError } = await supabase
          .from('event_participants')
          .insert({ event_id: event.id, user_id: userId })
        if (joinError) throw joinError
      }

      await loadEvents()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update participation'
      setError(message)
    } finally {
      setBusyEventId(null)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!userId) return
    const ok = window.confirm('Delete this event? This cannot be undone.')
    if (!ok) return

    setBusyEventId(eventId)
    setError(null)
    setNotice(null)
    try {
      const { error: deleteParticipantsError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
      if (deleteParticipantsError) throw deleteParticipantsError

      const { error: deleteEventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('host_id', userId)
      if (deleteEventError) throw deleteEventError

      setNotice('Event deleted.')
      await loadEvents()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete event'
      setError(message)
    } finally {
      setBusyEventId(null)
    }
  }

  const typeEmojis: Record<EventType, string> = {
    olympiad: '🏆',
    competition: '🥇',
    project: '💻',
    volunteering: '👥',
    workshop: '📚',
    hackathon: '⚡',
  }

  const typeColors: Record<EventType, string> = {
    olympiad: 'from-blue-500 to-indigo-500',
    competition: 'from-indigo-500 to-red-500',
    project: 'from-indigo-500 to-indigo-500',
    volunteering: 'from-blue-500 to-indigo-500',
    workshop: 'from-blue-500 to-blue-500',
    hackathon: 'from-blue-500 to-rose-500',
  }

  return (
    <div className="min-h-screen pp-bg py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black pp-title-gradient">Events & Opportunities</h1>
                <p className="text-gray-600 text-lg mt-2">Create, join and manage real events</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!userId) {
                  setNotice('Sign in first to host events.')
                  return
                }
                setShowCreate((v) => !v)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl pp-primary-btn font-bold"
            >
              <Plus className="w-4 h-4" />
              {showCreate ? 'Close Form' : 'Create Event'}
            </button>
          </div>
        </div>

        {(error || notice) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
          >
            {error || notice}
          </div>
        )}

        {showCreate && (
          <Card className="mb-8 border-2 border-blue-200 shadow-xl">
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as EventType }))}
                  className="h-10 rounded-md border border-gray-300 px-3 bg-white"
                >
                  <option value="olympiad">Olympiad</option>
                  <option value="competition">Competition</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="project">Project</option>
                  <option value="workshop">Workshop</option>
                  <option value="volunteering">Volunteering</option>
                </select>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                />
                <Input
                  value={form.organizer}
                  onChange={(e) => setForm((prev) => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Organizer name"
                />
                <Input
                  value={form.maxParticipants}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                  placeholder="Max participants (optional)"
                />
              </div>
              <Input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags, comma separated"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
              />
              <button
                disabled={creating}
                onClick={() => void handleCreate()}
                className="px-6 py-3 rounded-xl pp-primary-btn font-bold disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Publish Event'}
              </button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 border-2 border-blue-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title, organizer, tags..."
                  className="pl-10 h-12 text-base border-2 focus:ring-4 focus:ring-blue-200"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | EventType)}
                  className="w-full pl-10 h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="olympiad">Olympiads</option>
                  <option value="competition">Competitions</option>
                  <option value="hackathon">Hackathons</option>
                  <option value="project">Projects</option>
                  <option value="workshop">Workshops</option>
                  <option value="volunteering">Volunteering</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ['all', 'All'],
                ['upcoming', 'Upcoming'],
                ['joined', 'Joined'],
                ['my', 'My Events'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setViewFilter(value as ViewFilter)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    viewFilter === value
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <p className="text-gray-600 font-semibold">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {loading ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <p className="text-gray-600">Loading events...</p>
            </CardContent>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-20 text-center">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new event.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const count = participantCounts[event.id] || 0
              const joined = joinedEventIds.has(event.id)
              const mine = !!userId && event.host_id === userId
              const isFull = !!event.max_participants && count >= event.max_participants

              return (
                <Card
                  key={event.id}
                  className="group border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${typeColors[event.type]} rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-lg`}>
                        {typeEmojis[event.type]}
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold capitalize">
                        {event.type}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{count}/{event.max_participants || '∞'} participants</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">by {event.organizer}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(event.tags || []).map((tag, i) => (
                        <span key={`${event.id}:${tag}:${i}`} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={busyEventId === event.id || (!joined && isFull)}
                        onClick={() => void handleJoinLeave(event)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          joined
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'pp-primary-btn'
                        } disabled:opacity-50`}
                      >
                        {busyEventId === event.id ? 'Updating...' : joined ? 'Leave' : isFull ? 'Full' : 'Join'}
                      </button>
                      {mine && (
                        <button
                          disabled={busyEventId === event.id}
                          onClick={() => void handleDelete(event.id)}
                          className="px-4 py-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
