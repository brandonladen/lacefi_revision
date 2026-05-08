import { useState } from 'react'
import type { Course } from './api/client'
import Header from './components/Header'
import CoursesPage from './pages/CoursesPage'
import QuestionsPage from './pages/QuestionsPage'
import './index.css'

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const handleHome = () => setSelectedCourse(null)

  return (
    <div className="min-h-screen bg-white">
      <Header onHome={handleHome} courseName={selectedCourse?.course_name} />
      <main>
        {selectedCourse ? (
          <QuestionsPage course={selectedCourse} onBack={handleHome} />
        ) : (
          <CoursesPage onSelect={setSelectedCourse} />
        )}
      </main>
      <footer className="mt-12 border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        LaceFi Autofill &nbsp;·&nbsp; Past Papers Revision
      </footer>
    </div>
  )
}
