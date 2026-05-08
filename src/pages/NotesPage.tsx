import { useState, useEffect } from 'react'

// Swap to your fork URL in VITE_NOTES_REPO env var
const NOTES_REPO = import.meta.env.VITE_NOTES_REPO || 'kennedy467/past-papers'
const API_URL = `https://api.github.com/repos/${NOTES_REPO}/contents/`

interface GithubFile {
  name: string
  size: number
  download_url: string
  html_url: string
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/[-_]/g, ' ')            // dashes/underscores → spaces
    .replace(/\s+/g, ' ')
    .trim()
}

// Simple category guess from filename
function getCategory(name: string): string {
  const n = name.toLowerCase()
  if (/nursing|nurs/i.test(n)) return 'Nursing'
  if (/medicine|medic/i.test(n)) return 'Medicine'
  if (/math|calculus|algebra|discrete|geometry|statistic/i.test(n)) return 'Mathematics'
  if (/computer|software|database|data struct|it |programming|pascal|system/i.test(n)) return 'Computer Science'
  if (/english|literature|french|kiswahili|phonet|language/i.test(n)) return 'Languages'
  if (/account|finance|economics|business|tax|baf|aab|bec|bfm/i.test(n)) return 'Business & Finance'
  if (/biology|chemistry|physics|biochem|botany|zoology|cell|animal/i.test(n)) return 'Sciences'
  if (/history|geography|cre|religion|ethics/i.test(n)) return 'Humanities'
  if (/electric|electronics|engineering/i.test(n)) return 'Engineering'
  if (/actuari/i.test(n)) return 'Actuarial Science'
  if (/agri/i.test(n)) return 'Agriculture'
  return 'General'
}

const CATEGORY_COLORS: Record<string, string> = {
  'Nursing':          '#0891b2',
  'Medicine':         '#dc2626',
  'Mathematics':      '#7c3aed',
  'Computer Science': '#2563eb',
  'Languages':        '#d97706',
  'Business & Finance':'#059669',
  'Sciences':         '#0d9488',
  'Humanities':       '#b45309',
  'Engineering':      '#475569',
  'Actuarial Science':'#9333ea',
  'Agriculture':      '#65a30d',
  'General':          '#64748b',
}

export default function NotesPage() {
  const [files, setFiles] = useState<GithubFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch(API_URL, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
      .then(r => r.json())
      .then((items: GithubFile[]) => {
        const pdfs = items.filter((f: GithubFile) =>
          f.download_url && /\.(pdf|docx|pptx)$/i.test(f.name)
        )
        setFiles(pdfs)
      })
      .catch(() => setError('Could not load notes from GitHub.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || getCategory(f.name) === activeCategory
    return matchSearch && matchCat
  })

  // Build category counts
  const categories = Array.from(new Set(files.map(f => getCategory(f.name)))).sort()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <h1 className="text-base font-bold text-slate-800">Study Notes</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {loading ? 'Loading...' : `${files.length} documents · direct from GitHub`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        <div className="max-w-4xl mx-auto">

          {/* Search */}
          <div className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2.5 rounded mb-4">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Category filter pills */}
          {!loading && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs px-3 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: !activeCategory ? '#04AA6D' : '#e2e8f0',
                  background: !activeCategory ? '#04AA6D' : 'white',
                  color: !activeCategory ? 'white' : '#64748b',
                }}
              >
                All ({files.length})
              </button>
              {categories.map(cat => {
                const count = files.filter(f => getCategory(f.name) === cat).length
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className="text-xs px-3 py-1 rounded-full border transition-colors"
                    style={{
                      borderColor: isActive ? CATEGORY_COLORS[cat] : '#e2e8f0',
                      background: isActive ? CATEGORY_COLORS[cat] : 'white',
                      color: isActive ? 'white' : '#64748b',
                    }}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 rounded-full animate-spin"
                style={{ borderColor: '#e2e8f0', borderTopColor: '#04AA6D' }} />
            </div>
          )}

          {error && (
            <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(file => {
                  const category = getCategory(file.name)
                  const color = CATEGORY_COLORS[category]
                  const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF'
                  return (
                    <div
                      key={file.name}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    >
                      {/* Color top bar */}
                      <div className="h-1" style={{ background: color }} />

                      <div className="p-4 flex-1 flex flex-col">
                        {/* Category + ext badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{ background: `${color}18`, color }}
                          >
                            {category}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{ext}</span>
                        </div>

                        {/* Filename */}
                        <p className="text-sm font-semibold text-slate-800 leading-snug mb-1 flex-1">
                          {cleanName(file.name)}
                        </p>
                        <p className="text-xs text-slate-400 mb-4">{formatSize(file.size)}</p>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <a
                            href={file.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white rounded transition-opacity hover:opacity-90"
                            style={{ background: '#04AA6D' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Open
                          </a>
                          <a
                            href={file.download_url}
                            download={file.name}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Save
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No notes match your search.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
