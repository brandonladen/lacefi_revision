const IMAGE_HASH_RE = /\[image:\s*sha256:[a-f0-9]+\]/gi

function stripImageRefs(text: string): string {
  return text.replace(IMAGE_HASH_RE, '').replace(/\s{2,}/g, ' ').trim()
}

export function isRenderableQuestion(raw: string): boolean {
  return stripImageRefs(raw || '').length > 5
}

export interface ParsedQuestion {
  stem: string
  options: { letter: string; text: string }[]
}

export function parseQuestion(raw: string): ParsedQuestion {
  const text = stripImageRefs((raw || '').trim())

  // Try "Options:" separator
  const optSepMatch = text.match(/^([\s\S]*?)(?:\n\s*Options:\s*\n)([\s\S]*)$/i)
  let stem = text
  let optionsBlock = ''

  if (optSepMatch) {
    stem = optSepMatch[1].trim()
    optionsBlock = optSepMatch[2].trim()
  } else {
    const idx = text.search(/\n\s*[A-Da-d][\.\)]\s+/)
    if (idx > 0) {
      stem = text.substring(0, idx).trim()
      optionsBlock = text.substring(idx).trim()
    }
  }

  const options: { letter: string; text: string }[] = []
  if (optionsBlock) {
    const matches = optionsBlock.match(/(?:^|\n)\s*([A-Da-d])[\.\)]\s*([\s\S]*?)(?=(?:\n\s*[A-Da-d][\.\)])|$)/g)
    if (matches) {
      for (const m of matches) {
        const clean = m.trim()
        const letterMatch = clean.match(/^([A-Da-d])[\.\)]\s*(.*)$/s)
        if (letterMatch) {
          const optText = letterMatch[2].trim()
          if (optText.length > 0) {
            options.push({ letter: letterMatch[1].toUpperCase(), text: optText })
          }
        }
      }
    }
  }

  return { stem, options }
}

export interface ParsedAnswer {
  answer: string | null
  explanation: string | null
}

export function parseAnswer(raw: string | null): ParsedAnswer {
  if (!raw) return { answer: null, explanation: null }
  try {
    const obj = JSON.parse(raw)
    return {
      answer: obj.answer ?? null,
      explanation: obj.explanation ?? null,
    }
  } catch {
    return { answer: raw, explanation: null }
  }
}
