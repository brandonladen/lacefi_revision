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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Paper Questions</h1>
        <p className="text-gray-500 text-sm">
          {loading ? 'Loading…' : `${totalQuestions.toLocaleString()} questions across ${courses.length} courses`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((course, i) => (
            <button
              key={i}
              onClick={() => onSelect(course)}
              className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-gray-700">
                    {course.course_name}
                  </p>
                  {course.domain && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{course.domain}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {course.question_count} {course.question_count === 1 ? 'question' : 'questions'}
                </span>
              </div>
            </button>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
              No courses match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
