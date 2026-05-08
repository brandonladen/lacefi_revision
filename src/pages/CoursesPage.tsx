import { useState, useEffect } from 'react'
import { api, type Course } from '../api/client'

interface Props {
  onSelect: (course: Course) => void
}

export default function CoursesPage({ onSelect }: Props) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getCourses()
      .then(r => setCourses(r.courses))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c =>
    c.course_name.toLowerCase().includes(search.toLowerCase())
  )

  const totalQuestions = courses.reduce((s, c) => s + c.question_count, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Past Paper Questions</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading
            ? 'Loading courses...'
            : `${totalQuestions.toLocaleString()} questions across ${courses.length} courses`}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 mb-6" />

      {/* Search */}
      <div className="mb-6 flex items-center border border-gray-300 bg-white">
        <svg className="ml-3 w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: '#04AA6D' }} />
        </div>
      )}

      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-0 sm:grid-cols-2 border border-gray-300">
            {filtered.map((course, i) => (
              <button
                key={i}
                onClick={() => onSelect(course)}
                className="text-left px-5 py-4 border-b border-r border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
                      {course.course_name}
                    </p>
                    {course.domain && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{course.domain}</p>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-xs font-bold text-white px-2 py-0.5 mt-0.5"
                    style={{ background: '#04AA6D' }}
                  >
                    {course.question_count}
                  </span>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
                No courses match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
