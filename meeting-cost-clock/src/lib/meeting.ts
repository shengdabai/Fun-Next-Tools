export const DEFAULT_PEOPLE = 5
export const MIN_PEOPLE = 1
export const MAX_PEOPLE = 100
export const DEFAULT_SALARY = 80000
export const MIN_SHARED_SALARY = 1000
export const MAX_SALARY = 100_000_000

function parseWholeNumber(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null
  const cleaned = raw.replace(/,/g, '').trim()
  if (!/^\d+$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isSafeInteger(n) ? n : null
}

// `?people=` from a shared link. Anything that is not a whole number falls
// back to the default instead of becoming NaN.
export function parsePeopleParam(raw: string | null): number {
  const n = parseWholeNumber(raw)
  if (n === null) return DEFAULT_PEOPLE
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, n))
}

// `?salary=` from a shared link.
export function parseSalaryParam(raw: string | null): number {
  const n = parseWholeNumber(raw)
  if (n === null) return DEFAULT_SALARY
  return Math.min(MAX_SALARY, Math.max(MIN_SHARED_SALARY, n))
}

// Salary typed into the form. Returns null when the value must be ignored
// (empty, negative, fractional garbage); caps absurd values.
export function parseSalaryInput(raw: string): number | null {
  const n = parseWholeNumber(raw)
  if (n === null) return null
  return Math.min(MAX_SALARY, n)
}

// Wall-clock based timer. The elapsed time is derived from timestamps, not
// from how many interval callbacks fired, so throttled background tabs and
// delayed timers cannot under-count the meeting.
export interface TimerState {
  accumulatedMs: number
  startedAt: number | null
}

export const IDLE_TIMER: TimerState = { accumulatedMs: 0, startedAt: null }

export function startTimer(now: number): TimerState {
  return { accumulatedMs: 0, startedAt: now }
}

export function elapsedMs(state: TimerState, now: number): number {
  const running = state.startedAt === null ? 0 : Math.max(0, now - state.startedAt)
  return state.accumulatedMs + running
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  return { accumulatedMs: elapsedMs(state, now), startedAt: null }
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.startedAt !== null) return state
  return { accumulatedMs: state.accumulatedMs, startedAt: now }
}
