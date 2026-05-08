import { useState } from 'react'
import type { Course } from '../api/client'
import type { SessionScore } from '../App'

interface Props {
  courses: Course[]
  loading: boolean
  selected: Course | null
  onSelect: (course: Course) => void
  score: SessionScore
}

function institutionName(domain: string | null): string {
  if (!domain) return 'Other'
  const known: Record<string, string> = {
    'maseno.ac.ke':       'Maseno University',
    'ueab.ac.ke':         'UEAB',
    'uon.ac.ke':          'University of Nairobi',
    'strathmore.edu':     'Strathmore University',
    'ku.ac.ke':           'Kenyatta University',
    'egerton.ac.ke':      'Egerton University',
    'mku.ac.ke':          'Mount Kenya University',
    'dkut.ac.ke':         'Dedan Kimathi University',
  }
  for (const [key, name] of Object.entries(known)) {
    if (domain.includes(key)) return name
  }
  // Fallback: extract readable slug from domain
  const match = domain.match(/([a-z0-9-]+)\.(ac\.ke|edu|com|org)/)
  if (match) {
    const slug = match[1].replace(/-/g, ' ')
    return slug.charAt(0).toUpperCase() + slug.slice(1)
  }
  return domain
}

export default function Sidebar({ courses, loading, selected, onSelect, score }: Props) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = courses.filter(c =>
    c.course_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.domain || '').toLowerCase().includes(search.toLowerCase())
  )

  // Group by institution
  const groups: Record<string, Course[]> = {}
  for (const c of filtered) {
    const inst = institutionName(c.domain)
    if (!groups[inst]) groups[inst] = []
    groups[inst].push(c)
  }
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))

  const answered = score.correct + score.wrong
  const pct = answered > 0 ? Math.round((score.correct / answered) * 100) : 0

  const isActive = (c: Course) =>
    selected?.course_name === c.course_name && selected?.course_id === c.course_id

  const toggleGroup = (name: string) =>
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }))

  return (
    <aside className="flex flex-col h-full w-64" style={{ background: '#1e293b' }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #334155' }}>
        <div className="text-lg font-bold leading-none">
          <span style={{ color: '#04AA6D' }}>Lacefi</span>
          <span className="text-white">Autofill</span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#64748b' }}>Past Paper Revision</p>
      </div>

      {/* Search */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: '#0f172a' }}>
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ color: '#cbd5e1' }}
            className="flex-1 text-xs bg-transparent outline-none placeholder-slate-600"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#475569' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Course list grouped by institution */}
      <nav className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: '#334155', borderTopColor: '#04AA6D' }}
            />
          </div>
        ) : sortedGroups.length === 0 ? (
          <p className="text-xs px-4 py-6 text-center" style={{ color: '#475569' }}>
            No courses match &ldquo;{search}&rdquo;
          </p>
        ) : (
          sortedGroups.map(([institution, institutionCourses]) => {
            const isOpen = !collapsed[institution]
            return (
              <div key={institution}>
                {/* Institution header */}
                <button
                  onClick={() => toggleGroup(institution)}
                  className="w-full flex items-center justify-between px-4 py-2 mt-1 transition-colors"
                  style={{ color: '#64748b' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  <span className="text-xs font-bold uppercase tracking-wider truncate">{institution}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs" style={{ color: '#475569' }}>{institutionCourses.length}</span>
                    <svg
                      className="w-3 h-3 transition-transform"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Courses under institution */}
                {isOpen && institutionCourses.map((course, i) => {
                  const active = isActive(course)
                  return (
                    <button
                      key={i}
                      onClick={() => onSelect(course)}
                      className="w-full text-left flex items-center justify-between gap-2 py-2 pr-3 transition-colors"
                      style={{
                        paddingLeft: '24px',
                        borderLeft: active ? '3px solid #04AA6D' : '3px solid transparent',
                        background: active ? '#0f172a' : 'transparent',
                        color: active ? '#f1f5f9' : '#94a3b8',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#263347' }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <span className="text-sm leading-snug truncate">{course.course_name}</span>
                      <span
                        className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-sm"
                        style={{
                          background: active ? '#04AA6D' : '#1e3a5f',
                          color: active ? 'white' : '#64748b',
                          minWidth: '24px',
                          textAlign: 'center',
                        }}
                      >
                        {course.question_count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </nav>

      {/* Session score */}
      <div style={{ borderTop: '1px solid #334155' }} className="px-4 py-4">
        {answered > 0 ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Session Score</p>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-bold" style={{ color: '#4ade80' }}>{score.correct} correct</span>
              <span className="text-sm font-bold" style={{ color: '#f87171' }}>{score.wrong} wrong</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#334155' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct >= 70 ? '#04AA6D' : pct >= 50 ? '#f59e0b' : '#ef4444' }}
              />
            </div>
            <p className="text-xs mt-1.5 text-right" style={{ color: '#64748b' }}>{pct}%</p>
          </>
        ) : (
          <p className="text-xs" style={{ color: '#475569' }}>Attempt questions to track your score.</p>
        )}
      </div>
    </aside>
  )
}
