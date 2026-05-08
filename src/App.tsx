import { useState, useEffect } from 'react'
import { api, type Course } from './api/client'
import Sidebar from './components/Sidebar'
import QuestionsPage from './pages/QuestionsPage'
import './index.css'

export interface SessionScore {
  correct: number
  wrong: number
}

export default function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selected, setSelected] = useState<Course | null>(null)
  const [score, setScore] = useState<SessionScore>({ correct: 0, wrong: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    api.getCourses()
      .then(r => setCourses(r.courses))
      .finally(() => setCoursesLoading(false))
  }, [])

  const handleSelect = (course: Course) => {
    setSelected(course)
    setScore({ correct: 0, wrong: 0 })
    setSidebarOpen(false)
  }

  const handleAnswer = (correct: boolean) => {
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }))
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 md:static md:z-auto md:flex md:flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'flex flex-col translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          courses={courses}
          loading={coursesLoading}
          selected={selected}
          onSelect={handleSelect}
          score={score}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded hover:bg-slate-100"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm">
            <span style={{ color: '#04AA6D' }}>Lacefi</span>
            <span className="text-slate-800">Autofill</span>
          </span>
          {selected && (
            <span className="text-xs text-slate-500 truncate">· {selected.course_name}</span>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          {selected ? (
            <QuestionsPage
              course={selected}
              onBack={() => setSelected(null)}
              onAnswer={handleAnswer}
            />
          ) : (
            <WelcomeScreen
              courseCount={courses.length}
              totalQuestions={courses.reduce((s, c) => s + c.question_count, 0)}
              loading={coursesLoading}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function WelcomeScreen({ courseCount, totalQuestions, loading, onOpenSidebar }: {
  courseCount: number
  totalQuestions: number
  loading: boolean
  onOpenSidebar: () => void
}) {
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#04AA6D' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Past Paper Questions</h2>
        <p className="text-slate-500 text-sm mb-6">
          {loading
            ? 'Loading courses...'
            : `${totalQuestions.toLocaleString()} questions across ${courseCount} courses. Pick a course from the left panel to start revising.`}
        </p>
        {/* Mobile CTA */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden px-5 py-2.5 text-sm text-white font-medium rounded"
          style={{ background: '#04AA6D' }}
        >
          Browse Courses
        </button>
      </div>
    </div>
  )
}
