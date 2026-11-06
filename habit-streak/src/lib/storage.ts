export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

export type CheckIns = Record<string, string[]> // habitId -> date[]

const HABITS_KEY = 'habit-streak:habits'
const CHECKINS_KEY = 'habit-streak:checkins'

export const STORAGE_ERROR_MESSAGE = '无法访问浏览器存储，本次更改未保存。请检查存储权限或可用空间后重试。'
export const STORAGE_RECOVERY_MESSAGE = '保存的数据无法读取，原始内容已备份。你可以从当前列表重新开始。'

type StorageNotice = (message: string) => void

export class HabitStorageError extends Error {
  constructor() {
    super(STORAGE_ERROR_MESSAGE)
    this.name = 'HabitStorageError'
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') throw new HabitStorageError()
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new HabitStorageError()
  }
}

function readStorage(key: string, fallback: unknown, onRecovery?: StorageNotice): unknown {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    // Preserve the exact raw string before a later mutation replaces the cache.
    let backupKey = `${key}:corrupt`
    let index = 1
    let backup = localStorage.getItem(backupKey)
    while (backup !== null && backup !== raw) {
      backupKey = `${key}:corrupt:${index++}`
      backup = localStorage.getItem(backupKey)
    }
    if (backup !== raw) localStorage.setItem(backupKey, raw)
    onRecovery?.(STORAGE_RECOVERY_MESSAGE)
    return fallback
  }
}

export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && localDateKey(date) === value
}
function today(): string { return localDateKey() }
function shiftDay(key: string, delta: number): string {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  date.setDate(date.getDate() + delta)
  return localDateKey(date)
}

function readHabits(onRecovery?: StorageNotice): Habit[] {
  if (typeof window === 'undefined') return []
  const parsed = readStorage(HABITS_KEY, getDefaultHabits(), onRecovery)
  if (!Array.isArray(parsed)) return getDefaultHabits()
  return parsed.filter((habit): habit is Habit =>
    typeof habit === 'object' && habit !== null &&
    ['id', 'name', 'emoji', 'color', 'createdAt'].every(
      key => typeof habit[key] === 'string',
    ),
  )
}

export function loadHabits(onNotice?: StorageNotice): Habit[] {
  try {
    return readHabits(onNotice)
  } catch {
    onNotice?.(STORAGE_ERROR_MESSAGE)
    return getDefaultHabits()
  }
}

function getDefaultHabits(): Habit[] {
  const defaults: Habit[] = [
    { id: 'h1', name: '喝水 8杯', emoji: '💧', color: '#39d353', createdAt: today() },
    { id: 'h2', name: '运动 30分钟', emoji: '🏃', color: '#58a6ff', createdAt: today() },
    { id: 'h3', name: '阅读 20分钟', emoji: '📚', color: '#f78166', createdAt: today() },
  ]
  return defaults
}

export function saveHabits(habits: Habit[]): void {
  writeStorage(HABITS_KEY, habits)
}

export function updateHabits(change: (habits: Habit[]) => Habit[], onRecovery?: StorageNotice): Habit[] {
  try {
    const updated = change(readHabits(onRecovery))
    saveHabits(updated)
    return updated
  } catch {
    throw new HabitStorageError()
  }
}

function readCheckIns(onRecovery?: StorageNotice): CheckIns {
  if (typeof window === 'undefined') return {}
  const parsed = readStorage(CHECKINS_KEY, {}, onRecovery)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
  return Object.fromEntries(Object.entries(parsed)
    .filter(([, dates]) => Array.isArray(dates))
    .map(([id, dates]) => [id, [...new Set((dates as unknown[]).filter(isDateKey))].sort()]))
}

export function loadCheckIns(onNotice?: StorageNotice): CheckIns {
  try {
    return readCheckIns(onNotice)
  } catch {
    onNotice?.(STORAGE_ERROR_MESSAGE)
    return {}
  }
}

export function saveCheckIns(checkIns: CheckIns): void {
  writeStorage(CHECKINS_KEY, checkIns)
}

export function getCheckInDates(checkIns: CheckIns, habitId: string): string[] {
  return Object.prototype.hasOwnProperty.call(checkIns, habitId) && Array.isArray(checkIns[habitId])
    ? checkIns[habitId] : []
}

export function toggleCheckIn(habitId: string, date: string, onRecovery?: StorageNotice): CheckIns {
  let checkIns: CheckIns
  try {
    // Read the current cache first; access failures must never cause fallback writes.
    checkIns = readCheckIns(onRecovery)
  } catch {
    throw new HabitStorageError()
  }
  const dates = getCheckInDates(checkIns, habitId)
  const updated: CheckIns = {
    ...checkIns,
    [habitId]: dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date].sort(),
  }
  saveCheckIns(updated)
  return updated
}

export function getStreak(checkIns: string[]): number {
  if (!checkIns.length) return 0
  const sorted = [...new Set(checkIns)].sort().reverse()
  const todayStr = today()
  // Allow streak if last check-in is today or yesterday
  let current = todayStr
  if (sorted[0] !== todayStr) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const ystStr = localDateKey(yesterday)
    if (sorted[0] !== ystStr) return 0
    current = ystStr
  }
  let streak = 0
  for (const d of sorted) {
    if (d === current) {
      streak++
      current = shiftDay(current, -1)
    } else {
      break
    }
  }
  return streak
}

export function getLongestStreak(checkIns: string[]): number {
  if (!checkIns.length) return 0
  const sorted = [...new Set(checkIns)].sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    if (shiftDay(sorted[i - 1], 1) === sorted[i]) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }
  return longest
}
