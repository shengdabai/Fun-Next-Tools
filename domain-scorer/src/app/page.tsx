'use client'

import { useState, useCallback } from 'react'
import { scoreDomain, scoreBatch, DomainScore } from '@/lib/scorer'

type Mode = 'single' | 'batch'
type SortKey = 'score' | 'domain' | 'grade'

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" width="110" height="110" viewBox="0 0 110 110">
        <circle className="score-ring-bg" cx="55" cy="55" r={r} />
        <circle
          className={`score-ring-fill ${grade}`}
          cx="55" cy="55" r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-inner">
        <span className={`score-number ${grade}`}>{score}</span>
        <span className="score-max">/100</span>
      </div>
    </div>
  )
}

function barClass(val: number) {
  if (val >= 75) return 'bar-high'
  if (val >= 50) return 'bar-mid'
  if (val >= 30) return 'bar-low'
  return 'bar-bad'
}

function DimBars({ dimensions, labels }: { dimensions: DomainScore['dimensions']; labels: Record<string, string> }) {
  const WEIGHTS: Record<string, number> = {
    length: 25, memorability: 20, tldValue: 20, seoPotential: 15,
    brandPotential: 10, extensibility: 5, marketHeat: 5,
  }
  return (
    <div className="dimensions">
      <div className="dim-title">Dimension Breakdown</div>
      {(Object.keys(dimensions) as Array<keyof typeof dimensions>).map(key => {
        const val = dimensions[key]
        return (
          <div className="dim-row" key={key}>
            <div className="dim-label">{labels[key]} <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>×{WEIGHTS[key]}%</span></div>
            <div className="dim-bar-track">
              <div
                className={`dim-bar-fill ${barClass(val)}`}
                style={{ width: `${val}%` }}
              />
            </div>
            <div className="dim-val">{val}</div>
          </div>
        )
      })}
    </div>
  )
}

function MiniBars({ dimensions }: { dimensions: DomainScore['dimensions'] }) {
  const vals = Object.values(dimensions)
  const max = Math.max(...vals)
  return (
    <div className="mini-bars">
      {vals.map((v, i) => (
        <div
          key={i}
          className="mini-bar"
          style={{ height: `${Math.round((v / max) * 20)}px`, opacity: v >= 60 ? 0.8 : 0.35 }}
        />
      ))}
    </div>
  )
}

function ResultCard({ result }: { result: DomainScore }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <ScoreRing score={result.total} grade={result.grade} />
        <div className="domain-info">
          <div className="domain-name mono">{result.domain}</div>
          <div className={`grade-label ${result.grade}`}>{result.gradeLabel}</div>
        </div>
      </div>

      <DimBars dimensions={result.dimensions} labels={result.dimensionLabels} />

      <div className="result-cols">
        <div className="info-block">
          <div className="info-block-title">Suggestions</div>
          {result.suggestions.length === 0
            ? <div className="suggestion-item" style={{ color: 'var(--success)' }}>Excellent domain — no major issues found.</div>
            : result.suggestions.map((s, i) => (
                <div className="suggestion-item" key={i}>{s}</div>
              ))
          }
        </div>
        <div className="info-block">
          <div className="info-block-title">Similar Alternatives</div>
          {result.alternates.map((a, i) => (
            <div className="alternate-item" key={i}>{a}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BatchTable({ results }: { results: DomainScore[] }) {
  const [sort, setSort] = useState<SortKey>('score')
  const [asc, setAsc] = useState(false)

  const sorted = [...results].sort((a, b) => {
    let cmp = 0
    if (sort === 'score') cmp = a.total - b.total
    else if (sort === 'domain') cmp = a.domain.localeCompare(b.domain)
    else if (sort === 'grade') cmp = a.total - b.total
    return asc ? cmp : -cmp
  })

  const toggleSort = (key: SortKey) => {
    if (sort === key) setAsc(p => !p)
    else { setSort(key); setAsc(false) }
  }

  return (
    <div className="batch-table-wrap">
      <div className="batch-sort-bar">
        <span>Sort by:</span>
        {(['score', 'domain', 'grade'] as SortKey[]).map(k => (
          <button
            key={k}
            className={`sort-btn ${sort === k ? 'active' : ''}`}
            onClick={() => toggleSort(k)}
          >
            {k} {sort === k ? (asc ? '↑' : '↓') : ''}
          </button>
        ))}
        <span style={{ marginLeft: 'auto' }}>{results.length} domains</span>
      </div>
      <table className="batch-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Dimensions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.domain}>
              <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{i + 1}</td>
              <td><span className="batch-domain">{r.domain}</span></td>
              <td>
                <span className={`batch-score ${r.grade}`} style={{
                  color: r.grade === 'diamond' ? '#a78bfa'
                    : r.grade === 'premium' ? 'var(--success)'
                    : r.grade === 'standard' ? 'var(--accent)'
                    : r.grade === 'weak' ? 'var(--warning)'
                    : 'var(--danger)'
                }}>
                  {r.total}
                </span>
              </td>
              <td><span className={`batch-grade ${r.grade}`}>{r.gradeLabel}</span></td>
              <td><MiniBars dimensions={r.dimensions} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('single')
  const [singleInput, setSingleInput] = useState('')
  const [batchInput, setBatchInput] = useState('')
  const [singleResult, setSingleResult] = useState<DomainScore | null>(null)
  const [batchResults, setBatchResults] = useState<DomainScore[]>([])
  const [analyzed, setAnalyzed] = useState(false)

  const analyze = useCallback(() => {
    try {
    if (mode === 'single') {
      const val = singleInput.trim()
      if (!val) return
      setSingleResult(scoreDomain(val))
    } else {
      const lines = batchInput.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 10)
      if (lines.length === 0) return
      setBatchResults(scoreBatch(lines))
    }
    setAnalyzed(true)
    } catch (error) {
      setAnalyzed(false)
      setSingleResult(null)
      setBatchResults([])
      alert(error instanceof Error ? error.message : 'Unable to score this domain.')
    }
  }, [mode, singleInput, batchInput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mode === 'single') analyze()
  }

  const hasInput = mode === 'single' ? singleInput.trim().length > 0
    : batchInput.split('\n').some(l => l.trim().length > 0)

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div>
              <div className="logo">DOMAIN SCORER</div>
              <div className="logo-sub">Instant Domain Value Analysis</div>
            </div>
            <div className="badge">v1.0 BETA</div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Section */}
          <div className="input-section">
            <div className="section-label">Analysis Mode</div>
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => { setMode('single'); setAnalyzed(false) }}>
                Single Domain
              </button>
              <button className={`mode-btn ${mode === 'batch' ? 'active' : ''}`} onClick={() => { setMode('batch'); setAnalyzed(false) }}>
                Batch (up to 10)
              </button>
            </div>

            {mode === 'single' ? (
              <>
                <div className="input-row">
                  <input
                    type="text"
                    className="domain-input"
                    placeholder="e.g. stripe.com, notion.so, openai.com"
                    value={singleInput}
                    onChange={e => setSingleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  <button className="analyze-btn" onClick={analyze} disabled={!hasInput}>
                    Analyze ›
                  </button>
                </div>
                <div className="hint">Supports: domain.com · www.domain.io · https://domain.ai</div>
              </>
            ) : (
              <>
                <div className="input-row">
                  <textarea
                    className="domain-textarea"
                    placeholder={"stripe.com\nnotion.so\nopenai.com\n(one domain per line, max 10)"}
                    value={batchInput}
                    onChange={e => setBatchInput(e.target.value)}
                    spellCheck={false}
                  />
                  <button className="analyze-btn" onClick={analyze} disabled={!hasInput}>
                    Analyze ›
                  </button>
                </div>
                <div className="hint">Results sorted by score. Click column headers to re-sort.</div>
              </>
            )}
          </div>

          {/* Results */}
          {!analyzed && (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <div className="empty-state-text">Enter a domain name above to begin analysis</div>
            </div>
          )}

          {analyzed && mode === 'single' && singleResult && (
            <ResultCard result={singleResult} />
          )}

          {analyzed && mode === 'batch' && batchResults.length > 0 && (
            <BatchTable results={batchResults} />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <span>Domain Scorer</span> — 7-dimension domain value analysis engine · Free single queries · Pro batch coming soon
        </div>
      </footer>
    </>
  )
}
