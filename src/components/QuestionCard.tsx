import { useState } from 'react'
import type { Question } from '../api/client'
import { parseQuestion, parseAnswer } from '../utils/parseQuestion'

interface Props {
  question: Question
  index: number
}

export default function QuestionCard({ question, index }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [open, setOpen] = useState(false)

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

  const optionStyle = (letter: string) => {
    if (!revealed) return 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
    if (letter === correctLetter) return 'border-emerald-400 bg-emerald-50 text-emerald-800'
    if (letter === selected && letter !== correctLetter) return 'border-red-300 bg-red-50 text-red-700'
    return 'border-gray-200 text-gray-400'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Question header */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-gray-800 leading-relaxed ${!open ? 'line-clamp-2' : ''}`}>{stem}</p>
          {!open && isMultichoice && (
            <p className="text-xs text-gray-400 mt-1">{options.length} options · click to attempt</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {revealed && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              !selected ? 'bg-blue-50 text-blue-600' :
              selected === correctLetter ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {!selected ? 'revealed' : selected === correctLetter ? 'correct' : 'incorrect'}
            </span>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="mt-4">
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{stem}</p>

            {isMultichoice ? (
              <div className="space-y-2">
                {options.map(opt => (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelect(opt.letter)}
                    disabled={revealed}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border rounded-lg text-sm transition-colors ${optionStyle(opt.letter)}`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${
                      revealed && opt.letter === correctLetter ? 'border-emerald-500 bg-emerald-500 text-white' :
                      revealed && opt.letter === selected && opt.letter !== correctLetter ? 'border-red-400 bg-red-400 text-white' :
                      'border-current'
                    }`}>
                      {opt.letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {revealed && opt.letter === correctLetter && (
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 italic">
                {question.question_type === 'essay' ? 'Essay question — think through your answer before revealing.' : 'Write your answer before revealing.'}
              </div>
            )}

            {/* Explanation */}
            {revealed && explanation && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Explanation</p>
                <p className="text-sm text-amber-900 leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Essay answer reveal */}
            {revealed && !isMultichoice && answer && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Answer</p>
                <p className="text-sm text-blue-900 leading-relaxed">{answer}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              {!revealed && (
                <button
                  onClick={handleReveal}
                  className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Show answer
                </button>
              )}
              {revealed && (
                <button
                  onClick={handleReset}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                >
                  Try again
                </button>
              )}
              <span className="text-xs text-gray-400 capitalize">{question.question_type?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
