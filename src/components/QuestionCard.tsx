import { useState } from 'react'
import type { Question } from '../api/client'
import { parseQuestion, parseAnswer, isRenderableQuestion } from '../utils/parseQuestion'

interface Props {
  question: Question
  index: number
  onAnswer: (correct: boolean) => void
}

export default function QuestionCard({ question, index, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [open, setOpen] = useState(false)

  if (!isRenderableQuestion(question.question_text)) return null

  const { stem, options } = parseQuestion(question.question_text)
  const { answer, explanation } = parseAnswer(question.answer_text)
  const isMultichoice = options.length > 0
  const correctLetter = answer?.toUpperCase() ?? null

  const handleSelect = (letter: string) => {
    if (revealed) return
    setSelected(letter)
    setRevealed(true)
    onAnswer(letter === correctLetter)
  }

  const handleReveal = () => {
    setRevealed(true)
    onAnswer(false)
  }

  const handleReset = () => {
    setSelected(null)
    setRevealed(false)
  }

  // Status: unanswered | correct | wrong | revealed
  const status = !revealed ? 'unanswered' : !selected ? 'revealed' : selected === correctLetter ? 'correct' : 'wrong'

  const statusColors = {
    unanswered: { bg: '#1e293b', text: 'white' },
    revealed:   { bg: '#3b82f6', text: 'white' },
    correct:    { bg: '#04AA6D', text: 'white' },
    wrong:      { bg: '#ef4444', text: 'white' },
  }

  return (
    <div
      className="mb-3 rounded-lg overflow-hidden border transition-shadow hover:shadow-md"
      style={{ borderColor: revealed ? (status === 'correct' ? '#bbf7d0' : status === 'wrong' ? '#fecaca' : '#bfdbfe') : '#e2e8f0', background: 'white' }}
    >
      {/* Header row */}
      <button
        className="w-full text-left flex items-start gap-0 transition-colors"
        style={{ background: open ? '#f8fafc' : 'white' }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Number badge */}
        <span
          className="shrink-0 w-9 self-stretch flex items-center justify-center text-xs font-bold transition-colors"
          style={{ background: statusColors[status].bg, color: statusColors[status].text }}
        >
          {index + 1}
        </span>

        {/* Question preview */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <p className={`text-sm text-slate-700 leading-relaxed ${!open ? 'line-clamp-2' : ''}`}>{stem}</p>
          {!open && (
            <p className="text-xs text-slate-400 mt-1">
              {isMultichoice ? `${options.length} options` : question.question_type?.replace(/_/g, ' ')}
              {' · '}
              {revealed
                ? status === 'correct' ? '✓ Correct'
                : status === 'wrong' ? '✗ Wrong'
                : 'Revealed'
                : 'Click to attempt'}
            </p>
          )}
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-2 pr-4 py-3 shrink-0">
          {revealed && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: status === 'correct' ? '#dcfce7' : status === 'wrong' ? '#fee2e2' : '#dbeafe',
                color: status === 'correct' ? '#15803d' : status === 'wrong' ? '#dc2626' : '#1d4ed8',
              }}
            >
              {status === 'correct' ? '✓ Correct' : status === 'wrong' ? '✗ Wrong' : 'Revealed'}
            </span>
          )}
          <svg
            className="w-4 h-4 text-slate-400 transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-800 leading-relaxed mb-5">{stem}</p>

          {isMultichoice ? (
            <div className="space-y-2">
              {options.map(opt => {
                const isCorrect = opt.letter === correctLetter
                const isSelected = opt.letter === selected
                let optBg = 'white'
                let optBorder = '#e2e8f0'
                let optText = '#374151'
                let letterBg = '#f1f5f9'
                let letterText = '#64748b'

                if (revealed) {
                  if (isCorrect) {
                    optBg = '#f0fdf4'; optBorder = '#86efac'; optText = '#166534'
                    letterBg = '#04AA6D'; letterText = 'white'
                  } else if (isSelected) {
                    optBg = '#fef2f2'; optBorder = '#fca5a5'; optText = '#991b1b'
                    letterBg = '#ef4444'; letterText = 'white'
                  } else {
                    optText = '#9ca3af'; letterText = '#9ca3af'
                  }
                }

                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelect(opt.letter)}
                    disabled={revealed}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 rounded border text-sm transition-all"
                    style={{
                      background: optBg,
                      borderColor: optBorder,
                      color: optText,
                      cursor: revealed ? 'default' : 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!revealed) (e.currentTarget as HTMLElement).style.borderColor = '#04AA6D'
                    }}
                    onMouseLeave={e => {
                      if (!revealed) (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
                    }}
                  >
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all"
                      style={{ background: letterBg, color: letterText }}
                    >
                      {opt.letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                    {revealed && isCorrect && (
                      <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#04AA6D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {revealed && isSelected && !isCorrect && (
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="border border-slate-200 rounded bg-slate-50 px-4 py-3 text-sm text-slate-500 italic">
              {question.question_type === 'essay'
                ? 'Essay question — think through your answer, then reveal.'
                : 'Write your answer before revealing.'}
            </div>
          )}

          {/* Explanation */}
          {revealed && explanation && (
            <div
              className="mt-4 rounded px-4 py-3"
              style={{ background: '#fffbeb', borderLeft: '4px solid #fbbf24' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#92400e' }}>Explanation</p>
              <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>{explanation}</p>
            </div>
          )}

          {/* Essay answer */}
          {revealed && !isMultichoice && answer && (
            <div
              className="mt-4 rounded px-4 py-3"
              style={{ background: '#f0fdf4', borderLeft: '4px solid #04AA6D' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#14532d' }}>Model Answer</p>
              <p className="text-sm leading-relaxed text-green-900">{answer}</p>
            </div>
          )}

          {/* Actions row */}
          <div className="mt-5 flex items-center gap-3">
            {!revealed && (
              <button
                onClick={handleReveal}
                className="px-4 py-2 text-sm font-medium text-white rounded transition-opacity hover:opacity-90"
                style={{ background: '#04AA6D' }}
              >
                Show Answer
              </button>
            )}
            {revealed && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
              >
                Try Again
              </button>
            )}
            <span className="text-xs text-slate-400 capitalize">{question.question_type?.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
