import { useState, useEffect } from 'react'
import { api, type Course, type Question } from '../api/client'
import QuestionCard from '../components/QuestionCard'

interface Props {
  course: Course
}

export default function QuestionsPage({ course }: Props) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Course title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{course.course_name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {total > 0 ? `${total} question${total !== 1 ? 's' : ''}` : ''}
          {course.domain && ` · ${course.domain}`}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      )}

      {error && <div className="text-center py-12 text-red-500 text-sm">{error}</div>}

      {!loading && !error && (
        <>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={q.question_hash} question={q} index={(page - 1) * 20 + i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
