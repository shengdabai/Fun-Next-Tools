export const STORAGE_KEY = 'tone-trainer-best'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

// Stored best streak -> non-negative integer. Corrupted values ("NaN", "abc",
// negatives) become 0 instead of poisoning every later Math.max() with NaN.
export function parseBest(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw.trim())) return 0
  const n = Number(raw.trim())
  return Number.isSafeInteger(n) ? n : 0
}

// Storage access can throw (blocked cookies / private mode). A failure to
// read means "no record"; a failure to write is reported to the caller.
export function loadBest(storage: StorageLike | null): number {
  if (!storage) return 0
  try {
    return parseBest(storage.getItem(STORAGE_KEY))
  } catch {
    return 0
  }
}

export function saveBest(storage: StorageLike | null, value: number): boolean {
  if (!storage || !Number.isSafeInteger(value) || value < 0) return false
  try {
    storage.setItem(STORAGE_KEY, String(value))
    return true
  } catch {
    return false
  }
}
