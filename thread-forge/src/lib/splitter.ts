export interface SplitOptions {
  maxChars: number
  numberingStyle: 'fraction' | 'emoji' | 'none'
  intro: string
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '• ')
    .replace(/^\s*\d+\.\s/gm, '')
}

function addNumbering(tweet: string, index: number, total: number, style: SplitOptions['numberingStyle']): string {
  if (style === 'none') return tweet
  const suffix = style === 'fraction' ? `${index + 1}/${total}` : `🧵${index + 1}`
  return `${tweet}\n\n${suffix}`
}

// Slice exact source spans. Boundary preferences must never discard punctuation.
function splitPreserving(text: string, max: number): string[] {
  if (!Number.isSafeInteger(max) || max <= 0) throw new RangeError('Invalid chunk size')
  const chunks: string[] = []
  for (let start = 0; start < text.length;) {
    let end = Math.min(start + max, text.length)
    if (end < text.length) {
      const window = text.slice(start, end)
      const boundaries = [...window.matchAll(/[.!?。！？,，]\s*|\s+/g)]
      const last = boundaries[boundaries.length - 1]
      if (last && last.index! + last[0].length >= max / 2) end = start + last.index! + last[0].length
      const previous = text.charCodeAt(end - 1), next = text.charCodeAt(end)
      if (previous >= 0xd800 && previous <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) end--
      if (end <= start) throw new RangeError('Chunk size cannot fit a Unicode character')
    }
    chunks.push(text.slice(start, end))
    start = end
  }
  return chunks
}

export function splitIntoThread(text: string, options: SplitOptions): string[] {
  const { maxChars, numberingStyle, intro } = options
  if (!Number.isSafeInteger(maxChars) || maxChars <= 0) throw new RangeError('maxChars must be a positive integer')
  const cleaned = stripMarkdown(text).trim()
  if (!cleaned) return []
  let reserved = numberingStyle === 'none' ? 0 : 5
  while (true) {
    const available = maxChars - reserved
    if (available <= 0) throw new RangeError('maxChars is too small for numbering')
    const chunks = [...splitPreserving(intro.trim(), available), ...splitPreserving(cleaned, available)]
    const digits = String(chunks.length).length
    const needed = numberingStyle === 'fraction' ? 2 * digits + 3 : numberingStyle === 'emoji' ? digits + 4 : 0
    if (needed > reserved) { reserved = needed; continue }
    return chunks.map((chunk, i) => addNumbering(chunk, i, chunks.length, numberingStyle))
  }
}
