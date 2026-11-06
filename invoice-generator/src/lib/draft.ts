import type { InvoiceData, LineItem } from '@/components/InvoicePreview'

export const MAX_QUANTITY = 1_000_000
export const MAX_UNIT_PRICE = 1_000_000_000
export const MAX_TAX_RATE = 100

// Local calendar date (YYYY-MM-DD). toISOString() is UTC and yields the wrong
// day for users whose local date differs from the UTC date.
export function localDateStr(base: Date = new Date(), addDays = 0): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + addDays, 12)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// Parse a numeric form value into a finite number inside [0, max].
// Empty / non-numeric input becomes 0 (same as the previous `|| 0` behaviour).
export function clampAmount(value: unknown, max: number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(n, max)
}

const STRING_FIELDS = [
  'senderName', 'senderAddress', 'senderEmail',
  'clientName', 'clientAddress', 'clientEmail',
  'invoiceNumber', 'issueDate', 'dueDate', 'currency', 'notes',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseLineItem(value: unknown, index: number): LineItem | null {
  if (!isRecord(value)) return null
  return {
    id: typeof value.id === 'string' && value.id ? value.id : `restored-${index}`,
    description: typeof value.description === 'string' ? value.description : '',
    quantity: clampAmount(value.quantity, MAX_QUANTITY),
    unitPrice: clampAmount(value.unitPrice, MAX_UNIT_PRICE),
  }
}

// Validate a stored draft. Returns null when the payload is not a usable draft
// so the caller keeps its defaults instead of rendering `undefined` state.
export function parseDraft(
  raw: string | null,
  fallback: InvoiceData,
): { data: InvoiceData; savedAt: string | null } | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed) || !isRecord(parsed.data)) return null
  const stored = parsed.data
  if (!Array.isArray(stored.lineItems)) return null

  const seen = new Set<string>()
  const lineItems: LineItem[] = []
  stored.lineItems.forEach((entry, index) => {
    const item = parseLineItem(entry, index)
    if (!item) return
    const id = seen.has(item.id) ? `${item.id}-${index}` : item.id
    seen.add(id)
    lineItems.push({ ...item, id })
  })

  const data: InvoiceData = { ...fallback }
  for (const key of STRING_FIELDS) {
    const value = stored[key]
    if (typeof value === 'string') data[key] = value
  }
  data.taxRate = clampAmount(stored.taxRate, MAX_TAX_RATE)
  data.lineItems = lineItems.length > 0 ? lineItems : fallback.lineItems

  return { data, savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null }
}
