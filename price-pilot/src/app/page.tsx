'use client'

import { useState, useEffect } from 'react'
import { CITY_LIST } from '@/data/markets'
import { calculatePrice, formatCurrency, sanitizeSavedInput, PropertyInput, PriceAnalysis } from '@/lib/calculator'

const ROOM_TYPES = [
  { value: 'entire', label: 'Entire Home' },
  { value: 'private', label: 'Private Room' },
  { value: 'shared', label: 'Shared Room' },
]

const BEDROOM_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedrooms' },
  { value: '3br', label: '3 Bedrooms' },
  { value: '4br+', label: '4+ Bedrooms' },
]

const AMENITY_OPTIONS = [
  { key: 'WiFi', icon: '📶' },
  { key: 'Kitchen', icon: '🍳' },
  { key: 'AC', icon: '❄️' },
  { key: 'Pool', icon: '🏊' },
  { key: 'Gym', icon: '🏋️' },
  { key: 'Parking', icon: '🅿️' },
  { key: 'Workspace', icon: '💻' },
  { key: 'Pet-friendly', icon: '🐾' },
  { key: 'Balcony', icon: '🏡' },
  { key: 'Beach Access', icon: '🏖️' },
]

const STORAGE_KEY = 'price-pilot-last-input'

function loadSavedInput(): Partial<PropertyInput> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeSavedInput(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

function saveInput(input: PropertyInput) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
  } catch {}
}

export default function HomePage() {
  const [city, setCity] = useState('New York')
  const [roomType, setRoomType] = useState<PropertyInput['roomType']>('entire')
  const [bedrooms, setBedrooms] = useState<PropertyInput['bedrooms']>('1br')
  const [maxGuests, setMaxGuests] = useState(4)
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'Kitchen'])
  const [qualityRating, setQualityRating] = useState(3)
  const [hoverStar, setHoverStar] = useState(0)
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = loadSavedInput()
    if (saved.city) setCity(saved.city)
    if (saved.roomType) setRoomType(saved.roomType)
    if (saved.bedrooms) setBedrooms(saved.bedrooms)
    if (saved.maxGuests) setMaxGuests(saved.maxGuests)
    if (saved.amenities) setAmenities(saved.amenities)
    if (saved.qualityRating) setQualityRating(saved.qualityRating)
    setHydrated(true)
  }, [])

  function toggleAmenity(key: string) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    )
  }

  function handleAnalyze() {
    const input: PropertyInput = { city, roomType, bedrooms, maxGuests, amenities, qualityRating }
    saveInput(input)
    const result = calculatePrice(input)
    setAnalysis(result)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const sym = analysis?.currencySymbol ?? '$'

  return (
    <>
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">✈️</span>
          Price Pilot
        </div>
        <span className="header-badge">Free Beta</span>
      </header>

      <main className="main-container">
        <div className="hero">
          <h1>Find the Perfect Nightly Rate</h1>
          <p>Enter your property details and get instant pricing recommendations + revenue projections.</p>
        </div>

        {/* ── Input Card ── */}
        <div className="card">
          <div className="card-title">
            <span className="step-badge">1</span>
            Property Details
          </div>

          <div className="form-grid">
            {/* City */}
            <div className="form-group">
              <label>Market / City</label>
              <select
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITY_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Room type */}
            <div className="form-group">
              <label>Room Type</label>
              <select
                className="form-control"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as PropertyInput['roomType'])}
              >
                {ROOM_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div className="form-group">
              <label>Bedrooms</label>
              <select
                className="form-control"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value as PropertyInput['bedrooms'])}
              >
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Max guests */}
            <div className="form-group">
              <label>Max Guests: {maxGuests}</label>
              <input
                type="range"
                min={1}
                max={16}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="form-control"
                style={{ padding: '8px 0', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="divider" />

          {/* Amenities */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Amenities</label>
            <div className="amenities-grid">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a.key} className={`amenity-chip${amenities.includes(a.key) ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={amenities.includes(a.key)}
                    onChange={() => toggleAmenity(a.key)}
                  />
                  {a.icon} {a.key}
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Quality rating */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Property Quality</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`star-btn${n <= (hoverStar || qualityRating) ? ' active' : ''}`}
                  onClick={() => setQualityRating(n)}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                {['', 'Needs work', 'Below average', 'Average', 'Above average', 'Exceptional'][qualityRating]}
              </span>
            </div>
          </div>

          <button className="btn-analyze" onClick={handleAnalyze}>
            🔍 Analyze My Pricing
          </button>
        </div>

        {/* ── Results ── */}
        {analysis && (
          <div id="results" className="result-section">
            {/* Price hero */}
            <div className="price-hero-card">
              <div className="price-hero-label">Recommended Nightly Rate</div>
              <div className="price-hero-amount">
                {formatCurrency(analysis.recommendedNightly, sym)}
              </div>
              <div className="price-hero-unit">per night · {analysis.currency}</div>
              <div className="price-range-row">
                <div className="price-range-item">
                  <span className="label">Conservative</span>
                  <span className="value">{formatCurrency(analysis.conservativeNightly, sym)}</span>
                </div>
                <div className="price-range-item">
                  <span className="label">Aggressive</span>
                  <span className="value">{formatCurrency(analysis.aggressiveNightly, sym)}</span>
                </div>
              </div>
            </div>

            {/* Seasonal adjustments */}
            <div className="price-adjustments">
              <div className="adjustment-card">
                <div className="adj-label">Weekend Rate</div>
                <div className="adj-value">{formatCurrency(analysis.weekendPrice, sym)}</div>
                <div className="adj-sub">Fri–Sat nights</div>
              </div>
              <div className="adjustment-card">
                <div className="adj-label">Peak Season</div>
                <div className="adj-value">{formatCurrency(analysis.peakSeasonPrice, sym)}</div>
                <div className="adj-sub">High demand months</div>
              </div>
              <div className="adjustment-card">
                <div className="adj-label">Off-Season</div>
                <div className="adj-value">{formatCurrency(analysis.offSeasonPrice, sym)}</div>
                <div className="adj-sub">Low demand months</div>
              </div>
            </div>

            {/* Revenue scenarios */}
            <div className="card">
              <div className="card-title">
                <span className="step-badge">2</span>
                Annual Revenue Projection
              </div>
              <div className="scenarios-grid">
                {analysis.occupancyScenarios.map((s) => (
                  <div key={s.rate} className={`scenario-card${s.rate === 0.7 ? ' moderate' : ''}`}>
                    <div className="scenario-label">{s.label}</div>
                    <div className="scenario-rate">{Math.round(s.rate * 100)}% occupancy</div>
                    <div className="scenario-revenue">
                      <div className="rev-row">
                        <span className="rev-label">Monthly</span>
                        <span className="rev-amount">{formatCurrency(s.monthlyRevenue, sym)}</span>
                      </div>
                      <div className="rev-row">
                        <span className="rev-label">Annual</span>
                        <span className="rev-amount">{formatCurrency(s.annualRevenue, sym)}</span>
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${s.rate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitiveness radar */}
            <div className="card">
              <div className="card-title">
                <span className="step-badge">3</span>
                Competitiveness Score
              </div>
              <div className="radar-bars">
                {analysis.radarScores.map((r) => (
                  <div key={r.dimension} className="radar-row">
                    <div className="radar-label">{r.dimension}</div>
                    <div className="radar-bar-track">
                      <div className="radar-bar-fill" style={{ width: `${r.score}%` }} />
                    </div>
                    <div className="radar-score">{r.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-title">
                <span className="step-badge">4</span>
                Pricing Strategy Tips
              </div>
              <div className="tips-list">
                {analysis.tips.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <span className="tip-icon">{tip.icon}</span>
                    <span className="tip-text">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro CTA */}
            <div className="pro-cta">
              <h3>🚀 Unlock Pro Market Report</h3>
              <p>Compare your listing against 500+ nearby competitors, get dynamic pricing calendars, and revenue optimization alerts.</p>
              <button className="btn-pro">Get Pro — $19/mo</button>
              <div className="pro-features">
                <span className="pro-feature">✓ Competitor analysis</span>
                <span className="pro-feature">✓ Dynamic pricing calendar</span>
                <span className="pro-feature">✓ Revenue alerts</span>
                <span className="pro-feature">✓ Cancel anytime</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
