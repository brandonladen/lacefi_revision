interface HeaderProps {
  onHome: () => void
  courseName?: string
}

export default function Header({ onHome, courseName }: HeaderProps) {
  return (
    <header style={{ background: '#282A35' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={onHome}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-lg font-bold" style={{ color: '#04AA6D' }}>Lacefi</span>
          <span className="text-lg font-bold text-white">Autofill</span>
        </button>
        <span className="text-gray-600 text-sm px-1">|</span>
        <button
          onClick={onHome}
          className="text-gray-400 text-sm hover:text-gray-200 transition-colors"
        >
          Past Papers
        </button>
        {courseName && (
          <>
            <span className="text-gray-600 text-sm">›</span>
            <span className="text-gray-300 text-sm truncate max-w-xs">{courseName}</span>
          </>
        )}
      </div>
    </header>
  )
}
