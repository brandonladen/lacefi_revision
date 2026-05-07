interface HeaderProps {
  onHome: () => void
  courseName?: string
}

export default function Header({ onHome, courseName }: HeaderProps) {
  return (
    <header className="bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl font-bold">
            <span style={{ color: '#F5A623' }}>Lacefi</span>
            <span>Autofill</span>
          </span>
        </button>
        <span className="text-gray-600 text-sm">|</span>
        <span className="text-gray-400 text-sm">Past Papers</span>
        {courseName && (
          <>
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-300 text-sm truncate max-w-xs">{courseName}</span>
          </>
        )}
      </div>
    </header>
  )
}
