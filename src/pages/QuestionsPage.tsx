import { useState, useEffect } from 'react'
import { api, type Course, type Question } from '../api/client'
import QuestionCard from '../components/QuestionCard'
import { isRenderableQuestion } from '../utils/parseQuestion'

interface Props {
  course: Course
  onBack: () => void
  onAnswer: (correct: boolean) => void
}

export default function QuestionsPage({ course, onBack, onAnswer }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correct, setCorrect] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setAnswered(0)
    setCorrect(0)
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

  const handleAnswer = (isCorrect: boolean) => {
    setAnswered(a => a + 1)
    setCorrect(c => c + (isCorrect ? 1 : 0))
    onAnswer(isCorrect)
  }

  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0

  return (
    <div className="h-full flex flex-col">
      {/* Course header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs mb-2 font-medium transition-colors"
          style={{ color: '#04AA6D' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Courses
        </button>
        <h1 className="text-base font-bold text-slate-800 leading-snug">{course.course_name}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {total > 0 ? `${total} question${total !== 1 ? 's' : ''}` : ''}
          {course.domain ? ` · ${course.domain}` : ''}
        </p>
      </div>

      {/* Score bar */}
      {answered > 0 && (
        <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="flex items-center gap-6 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">{correct} correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-500">{answered - correct} wrong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400">{renderable.length - answered} remaining</span>
            </div>
            <span className="ml-auto text-xs font-bold" style={{ color: pct >= 70 ? '#04AA6D' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 70 ? '#04AA6D' : pct >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        {loading && (
          <div className="flex justify-center py-20">
            <div
              className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: '#e2e8f0', borderTopColor: '#04AA6D' }}
            />
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="max-w-3xl mx-auto">
            {renderable.map((q, i) => (
              <QuestionCard
                key={q.question_hash}
                question={q}
                index={(page - 1) * 20 + i}
                onAnswer={handleAnswer}
              />
            ))}

            {renderable.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">
                No questions available for this course.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 pb-4">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-slate-300 bg-white text-slate-600 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-slate-300 bg-white text-slate-600 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
