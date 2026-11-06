'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IDLE_TIMER,
  TimerState,
  elapsedMs,
  parsePeopleParam,
  parseSalaryInput,
  parseSalaryParam,
  pauseTimer,
  resumeTimer,
  startTimer,
} from '@/lib/meeting'

// ===== Types =====
type Currency = 'USD' | 'EUR' | 'GBP'

interface Preset {
  label: string
  salary: number
}

// ===== Constants =====
const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' }

const PRESETS: Preset[] = [
  { label: 'Junior Dev', salary: 70000 },
  { label: 'Senior Dev', salary: 120000 },
  { label: 'Manager', salary: 100000 },
  { label: 'VP', salary: 200000 },
  { label: 'Mixed Team', salary: 95000 },
]

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP']

// Fun tips template — {cost} and {symbol} replaced at render time
const FUN_TIPS = [
  (cost: number, sym: string) =>
    `That's a team lunch at a nice restaurant — every ${Math.ceil(120 / Math.max(cost / 60, 0.01)).toFixed(0)} minutes.`,
  (cost: number, sym: string) =>
    cost >= 5
      ? `You've already spent enough for ${Math.floor(cost / 5)} cups of ☕ coffee.`
      : `Tick tock — every second counts here.`,
  (cost: number, sym: string) =>
    `This meeting costs more per hour than a round-trip economy flight to NYC.`,
  (cost: number, sym: string) =>
    cost >= 100
      ? `${sym}${cost.toFixed(0)} spent. That's ${Math.floor(cost / 15)} Netflix subscriptions.`
      : `At this rate, you'll spend ${sym}${(cost * 60).toFixed(0)} in the next hour.`,
  (cost: number, sym: string) =>
    `Was an email not an option? 🤔`,
  (cost: number, sym: string) =>
    `The most expensive thing in this room: everyone's time.`,
  (cost: number, sym: string) =>
    cost >= 50
      ? `${sym}${cost.toFixed(0)} and counting. This could've been a Loom video.`
      : `Pro tip: shorter meetings = higher quality decisions.`,
  (cost: number, sym: string) =>
    `Meetings cost US companies over $37 billion a year. You're contributing.`,
]

// Cost formula: (avgSalary * people) / (250 * 8 * 3600) per second
function costPerSecond(salary: number, people: number): number {
  return (salary * people) / (250 * 8 * 3600)
}

function formatCost(amount: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency]
  if (amount < 1000) {
    return `${sym}${amount.toFixed(2)}`
  }
  if (amount < 1000000) {
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${sym}${(amount / 1000).toFixed(1)}k`
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// ===== Inner component (uses useSearchParams) =====
function MeetingCostApp() {
  const searchParams = useSearchParams()

  // Config state
  const [people, setPeople] = useState<number>(() => parsePeopleParam(searchParams.get('people')))
  const [salary, setSalary] = useState<number>(() => parseSalaryParam(searchParams.get('salary')))
  const [currency, setCurrency] = useState<Currency>('USD')
  const [activePreset, setActivePreset] = useState<number | null>(null)

  // Timer state
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [totalCost, setTotalCost] = useState(0)

  // UI state
  const [tipIndex, setTipIndex] = useState(0)
  const [showToast, setShowToast] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<TimerState>(IDLE_TIMER)
  const tipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cps = costPerSecond(salary, people)
  const sym = CURRENCY_SYMBOLS[currency]

  // Timer tick: derive elapsed time and cost from wall-clock timestamps so
  // throttled background tabs do not under-count the meeting.
  const tick = useCallback(() => {
    const ms = elapsedMs(timerRef.current, Date.now())
    setElapsed(Math.floor(ms / 1000))
    setTotalCost((cps * ms) / 1000)
  }, [cps])

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(tick, 1000)
      document.addEventListener('visibilitychange', tick)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [running, paused, tick])

  // Tip rotation (every 60 seconds or every 10 if cost changes a lot)
  useEffect(() => {
    if (running && !paused) {
      tipIntervalRef.current = setInterval(() => {
        setTipIndex((i) => (i + 1) % FUN_TIPS.length)
      }, 45000)
    } else {
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current)
    }
    return () => {
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current)
    }
  }, [running, paused])

  // Rotate tip also on milestone costs
  useEffect(() => {
    if (totalCost > 0 && Number.isInteger(Math.floor(totalCost)) && Math.floor(totalCost) % 25 === 0) {
      setTipIndex((i) => (i + 1) % FUN_TIPS.length)
    }
  }, [Math.floor(totalCost)])

  function handleStart() {
    timerRef.current = startTimer(Date.now())
    setRunning(true)
    setPaused(false)
    setElapsed(0)
    setTotalCost(0)
    setTipIndex(0)
  }

  function handlePause() {
    const now = Date.now()
    timerRef.current = paused ? resumeTimer(timerRef.current, now) : pauseTimer(timerRef.current, now)
    tick()
    setPaused(!paused)
  }

  function handleReset() {
    timerRef.current = IDLE_TIMER
    setRunning(false)
    setPaused(false)
    setElapsed(0)
    setTotalCost(0)
  }

  function handlePreset(index: number) {
    setActivePreset(index === activePreset ? null : index)
    if (index !== activePreset) {
      setSalary(PRESETS[index].salary)
    }
  }

  function handleSalaryChange(val: string) {
    const n = parseSalaryInput(val)
    if (n !== null) {
      setSalary(n)
      setActivePreset(null)
    }
  }

  function handleShare() {
    const minutes = Math.floor(elapsed / 60)
    const text = `Our ${minutes}-min meeting just cost ${formatCost(totalCost, currency)}. Was it worth it? 🤔 Calculate yours → ${window.location.origin}?people=${people}&salary=${salary}`
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    })
  }

  // Equivalents
  const coffeeCount = Math.floor(totalCost / 5)
  const lunchCount = Math.floor(totalCost / 15)
  const hourlyRate = cps * 3600

  const currentTip = FUN_TIPS[tipIndex](totalCost, sym)

  return (
    <div className="container">
      {/* Header */}
      <div className="app-header">
        <div className="logo-row">
          <div className={`logo-dot${running && !paused ? '' : ' paused'}`} />
          <h1>Meeting Cost Clock</h1>
        </div>
        {running && <span className="badge">{paused ? 'paused' : 'live'}</span>}
      </div>

      {/* === SETUP PANEL === */}
      {!running && (
        <div className="card">
          <h2>Configure your meeting</h2>

          {/* People */}
          <div className="form-group">
            <label>Attendees</label>
            <div className="people-row">
              <input
                type="range"
                min={1}
                max={100}
                value={people}
                onChange={(e) => setPeople(parseInt(e.target.value))}
                className="people-slider"
              />
              <span className="people-count">{people}</span>
            </div>
          </div>

          {/* Salary */}
          <div className="form-group">
            <label>Average Annual Salary</label>
            <div className="salary-row">
              <span className="salary-prefix">{sym}</span>
              <input
                type="number"
                value={salary}
                min={10000}
                max={2000000}
                step={5000}
                onChange={(e) => handleSalaryChange(e.target.value)}
                className="salary-input"
              />
            </div>
            <div className="presets" style={{ marginTop: '0.75rem' }}>
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className={`preset-btn${activePreset === i ? ' active' : ''}`}
                  onClick={() => handlePreset(i)}
                >
                  {p.label} ({sym}{(p.salary / 1000).toFixed(0)}k)
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Currency</label>
            <div className="currency-tabs">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  className={`currency-tab${currency === c ? ' active' : ''}`}
                  onClick={() => setCurrency(c)}
                >
                  {CURRENCY_SYMBOLS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="card-sm" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Burning rate
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              {formatCost(hourlyRate, currency)}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/hr</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {sym}{cps.toFixed(4)}/sec · {people} {people === 1 ? 'person' : 'people'}
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleStart}>
            Start the Clock →
          </button>
        </div>
      )}

      {/* === TIMER PANEL === */}
      {running && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            {/* Big cost */}
            <div className={`cost-display${!paused ? ' pulse' : ''}`}>
              {formatCost(totalCost, currency)}
            </div>

            {/* Timer */}
            <div className="timer-display">{formatTime(elapsed)}</div>

            {/* Subtitle */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {people} {people === 1 ? 'person' : 'people'} · avg {sym}{(salary / 1000).toFixed(0)}k/yr · {sym}{hourlyRate.toFixed(2)}/hr
            </div>

            {/* Stats row */}
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-value">{formatTime(elapsed)}</div>
                <div className="stat-label">Duration</div>
              </div>
              <div className="stat-box">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>
                  {sym}{cps.toFixed(4)}/s
                </div>
                <div className="stat-label">Cost per second</div>
              </div>
            </div>

            {/* Equivalents strip */}
            {totalCost >= 5 && (
              <div className="equiv-strip">
                {coffeeCount > 0 && (
                  <span className="equiv-chip">☕ {coffeeCount} coffee{coffeeCount !== 1 ? 's' : ''}</span>
                )}
                {lunchCount > 0 && (
                  <span className="equiv-chip">🍽️ {lunchCount} lunch{lunchCount !== 1 ? 'es' : ''}</span>
                )}
                {totalCost >= 15 && (
                  <span className="equiv-chip">
                    📺 {Math.floor(totalCost / 15)} Netflix month{Math.floor(totalCost / 15) !== 1 ? 's' : ''}
                  </span>
                )}
                {totalCost >= 50 && (
                  <span className="equiv-chip">
                    ✈️ {(totalCost / 400).toFixed(1)} flight hrs
                  </span>
                )}
              </div>
            )}

            {/* Fun tip */}
            <div className="fun-tip">{currentTip}</div>

            {/* Buttons */}
            <div className="btn-row-3">
              <button
                className={`btn ${paused ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handlePause}
              >
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                ↺ Reset
              </button>
              <button className="btn btn-success" onClick={handleShare}>
                ↗ Share
              </button>
            </div>
          </div>

          {/* End meeting recap hint */}
          <div className="card-sm" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Hit <strong style={{ color: 'var(--text)' }}>Reset</strong> to configure a new meeting ·
            <strong style={{ color: 'var(--text)' }}> Share</strong> copies a viral-ready message to clipboard
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
        Assumes 250 working days × 8 hrs/day · For entertainment & awareness
      </div>

      {/* Toast */}
      <div className={`toast${showToast ? ' show' : ''}`}>
        ✓ Copied to clipboard!
      </div>
    </div>
  )
}

// ===== Page export with Suspense boundary =====
export default function Page() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>}>
      <MeetingCostApp />
    </Suspense>
  )
}
