import { useState } from 'react'
import type { Question } from '../api/client'
import { parseQuestion, parseAnswer, isRenderableQuestion } from '../utils/parseQuestion'

interface Props {
  question: Question
  index: number
}

export default function QuestionCard({ question, index }: Props) {
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
  }

  const handleReveal = () => setRevealed(true)

  const handleReset = () => {
    setSelected(null)
    setRevealed(false)
  }

  const optionClass = (letter: string) => {
    const base = 'w-full text-left flex items-start gap-3 px-4 py-2.5 border text-sm transition-colors'
    if (!revealed) return `${base} border-gray-300 hover:border-[#04AA6D] hover:bg-green-50 cursor-pointer`
    if (letter === correctLetter) return `${base} border-[#04AA6D] bg-green-50 text-green-900`
    if (letter === selected && letter !== correctLetter) return `${base} border-red-400 bg-red-50 text-red-800`
    return `${base} border-gray-200 text-gray-400`
  }

  return (
    <div className="border border-gray-300 bg-white mb-3">
      {/* Question header row */}
      <button
        className="w-full text-left flex items-start gap-0 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span
          className="shrink-0 w-10 self-stretch flex items-center justify-center text-sm font-bold text-white"
          style={{ background: '#04AA6D' }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 px-4 py-3">
          <p className={`text-sm text-gray-800 leading-relaxed ${!open ? 'line-clamp-2' : ''}`}>{stem}</p>
          {!open && (
            <p className="text-xs text-gray-400 mt-1">
              {isMultichoice ? `${options.length} options · click to attempt` : 'Click to attempt'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-3 shrink-0">
          {revealed && (
            <span className={`text-xs font-medium px-2 py-0.5 border ${
              !selected ? 'border-blue-300 text-blue-600 bg-blue-50' :
              selected === correctLetter ? 'border-green-400 text-green-700 bg-green-50' :
              'border-red-300 text-red-600 bg-red-50'
            }`}>
              {!selected ? 'revealed' : selected === correctLetter ? 'correct' : 'wrong'}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-800 leading-relaxed mb-4">{stem}</p>

          {isMultichoice ? (
            <div className="space-y-2">
              {options.map(opt => (
                <button
                  key={opt.letter}
                  onClick={() => handleSelect(opt.letter)}
                  disabled={revealed}
                  className={optionClass(opt.letter)}
                >
                  <span className={`shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold border mt-0.5 ${
                    revealed && opt.letter === correctLetter
                      ? 'border-[#04AA6D] bg-[#04AA6D] text-white'
                      : revealed && opt.letter === selected && opt.letter !== correctLetter
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-current'
                  }`}>
                    {opt.letter}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {revealed && opt.letter === correctLetter && (
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#04AA6D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 italic">
              {question.question_type === 'essay' ? 'Essay — think through your answer first.' : 'Write your answer before revealing.'}
            </div>
          )}

          {/* Explanation */}
          {revealed && explanation && (
            <div className="mt-4 border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3">
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Explanation</p>
              <p className="text-sm text-gray-800 leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Essay answer */}
          {revealed && !isMultichoice && answer && (
            <div className="mt-4 border-l-4 px-4 py-3" style={{ borderColor: '#04AA6D', background: '#f0fdf4' }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: '#04AA6D' }}>Answer</p>
              <p className="text-sm text-gray-800 leading-relaxed">{answer}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            {!revealed && (
              <button
                onClick={handleReveal}
                className="text-sm px-4 py-2 text-white font-medium"
                style={{ background: '#04AA6D' }}
              >
                Show Answer
              </button>
            )}
            {revealed && (
              <button
                onClick={handleReset}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Try Again
              </button>
            )}
            <span className="text-xs text-gray-400 capitalize">{question.question_type?.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
