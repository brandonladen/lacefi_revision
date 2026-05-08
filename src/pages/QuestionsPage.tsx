import { useState, useEffect } from 'react'
import { api, type Course, type Question } from '../api/client'
import QuestionCard from '../components/QuestionCard'
import { isRenderableQuestion } from '../utils/parseQuestion'

interface Props {
  course: Course
  onBack: () => void
}

export default function QuestionsPage({ course, onBack }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getQuestions({
      course_id: course.course_id ?? undefined,
      domain: course.domain ?? undefined,
      course_name: !course.course_id ? course.course_name : undefined,
      page,
    })
      .then(r => {
        setQuestions(r.questions)
        setTotalPages(r.pages)
        setTotal(r.total)
      })
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false))
  }, [course, page])

  const renderable = questions.filter(q => isRenderableQuestion(q.question_text))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm mb-6 hover:underline"
        style={{ color: '#04AA6D' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Courses
      </button>

      {/* Course heading */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">{course.course_name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {total > 0 ? `${total} question${total !== 1 ? 's' : ''}` : ''}
          {course.domain && ` · ${course.domain}`}
        </p>
      </div>

      <hr className="border-gray-300 mb-6 mt-4" />

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
          <div>
            {renderable.map((q, i) => (
              <QuestionCard key={q.question_hash} question={q} index={(page - 1) * 20 + i} />
            ))}

            {renderable.length === 0 && (
              <div className="border border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-400">
                No questions available for this course.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                ‹ Previous
              </button>
              <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
