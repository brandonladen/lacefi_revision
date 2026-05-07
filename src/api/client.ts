const _apiUrl = import.meta.env.VITE_API_URL || 'https://lacefi-autofill-api.onrender.com/api'
const BASE = _apiUrl.replace(/\/api\/?$/, '') + '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export interface Course {
  course_name: string
  course_id: string | null
  domain: string | null
  question_count: number
}

export interface Question {
  question_hash: string
  question_text: string
  question_type: string
  answer_text: string | null
  course_name: string | null
  course_id: string | null
  domain: string | null
  synced_at: string
}

export interface CoursesResponse {
  courses: Course[]
}

export interface QuestionsResponse {
  questions: Question[]
  total: number
  page: number
  pages: number
}

export const api = {
  getCourses: () => get<CoursesResponse>('/public/revision/courses'),
  getQuestions: (params: { course_id?: string; domain?: string; course_name?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params.course_id) q.set('course_id', params.course_id)
    if (params.domain) q.set('domain', params.domain)
    if (params.course_name) q.set('course_name', params.course_name)
    if (params.page) q.set('page', String(params.page))
    return get<QuestionsResponse>(`/public/revision/questions?${q}`)
  },
}
