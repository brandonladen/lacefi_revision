import { useState } from 'react'
import type { Course } from './api/client'
import Header from './components/Header'
import CoursesPage from './pages/CoursesPage'
import QuestionsPage from './pages/QuestionsPage'
import './index.css'

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onHome={() => setSelectedCourse(null)}
        courseName={selectedCourse?.course_name}
      />
      <main>
        {selectedCourse ? (
          <QuestionsPage course={selectedCourse} />
        ) : (
          <CoursesPage onSelect={setSelectedCourse} />
        )}
      </main>
      <footer className="mt-16 border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        LaceFi Autofill &nbsp;·&nbsp; Past Papers Revision
      </footer>
    </div>
  )
}
