'use client'

import { useState, useCallback } from 'react'
import { generateTitles, generateThumbnailText, type TitleResult } from '@/lib/generator'
import { copyText } from '@/lib/clipboard'

const AUDIENCES = ['General', 'Tech', 'Gaming', 'Business', 'Lifestyle', 'DIY']
const TONES = ['Curious', 'Shocking', 'Inspiring', 'Educational', 'Entertaining']

function charCountClass(n: number): string {
  if (n >= 50 && n <= 70) return 'good'
  if (n >= 40 && n < 50) return 'ok'
  if (n > 70 && n <= 80) return 'ok'
  return 'long'
}

function charCountLabel(n: number): string {
  if (n >= 50 && n <= 70) return `${n} chars ✓`
  if (n < 50) return `${n} chars (short)`
  if (n > 80) return `${n} chars (too long)`
  return `${n} chars`
}

export default function Home() {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('General')
  const [tone, setTone] = useState('Curious')
  const [results, setResults] = useState<TitleResult[]>([])
  const [thumbnailTexts, setThumbnailTexts] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({})
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return
    const titles = generateTitles({ topic: topic.trim(), audience, tone })
    setResults(titles)
    setEditedTitles({})
    setHasGenerated(true)
    // Use the "best CTR" title (index 0 = curiosity gap) for thumbnail text
    const bestTitle = titles[0]?.title ?? topic
    setThumbnailTexts(generateThumbnailText(bestTitle))
  }, [topic, audience, tone])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGenerate()
  }

  const getTitle = (index: number, result: TitleResult) =>
    editedTitles[index] ?? result.title

  const handleCopy = async (index: number, text: string) => {
    if (!(await copyText(text))) return
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = async () => {
    const all = results.map((r, i) => getTitle(i, r)).join('\n')
    if (!(await copyText(all))) return
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleTitleEdit = (index: number, value: string) => {
    setEditedTitles((prev) => ({ ...prev, [index]: value }))
  }

  // Best picks: CTR = curiosity gap titles (indices 0, 2, 7), SEO = how-to titles (4, 8)
  const bestCtrIndex = results.findIndex((r) => r.ctrTag === 'Curiosity Gap')
  const bestSeoIndex = results.findIndex((r) => r.ctrTag === 'How-To')

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <a href="/" className="logo">
              <span className="logo-icon">▶</span>
              Clip Title Gen
            </a>
            <span className="pro-badge">PRO $10/mo</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Card */}
          <div className="input-card">
            <h1>Generate High-CTR YouTube Titles</h1>
            <p className="subtitle">
              Enter your video topic and get 10 proven title formulas instantly — free, no signup.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="topic">
                Video Topic / Keywords
              </label>
              <input
                id="topic"
                className="form-input"
                type="text"
                placeholder="e.g. how to make pasta, stock investing, gaming setup"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
            </div>

            <div className="select-grid">
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <div className="chip-group">
                  {AUDIENCES.map((a) => (
                    <button
                      key={a}
                      className={`chip${audience === a ? ' active' : ''}`}
                      onClick={() => setAudience(a)}
                      type="button"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tone</label>
                <div className="chip-group">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      className={`chip${tone === t ? ' active' : ''}`}
                      onClick={() => setTone(t)}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={!topic.trim()}
              type="button"
            >
              Generate 10 Titles →
            </button>
          </div>

          {/* Results */}
          {hasGenerated && results.length > 0 ? (
            <>
              {/* Title Cards */}
              <div className="results-header">
                <div>
                  <p className="section-label">Generated Titles</p>
                  <span className="results-count">
                    {results.length} titles · Click any title to edit
                  </span>
                </div>
                <button
                  className="btn-copy-all"
                  onClick={handleCopyAll}
                  type="button"
                >
                  {copiedAll ? '✓ Copied!' : 'Copy All'}
                </button>
              </div>

              <div className="titles-grid">
                {results.map((result, i) => {
                  const isBestCtr = i === bestCtrIndex
                  const isBestSeo = i === bestSeoIndex
                  const currentTitle = getTitle(i, result)
                  const count = currentTitle.length

                  return (
                    <div
                      key={i}
                      className={`title-card${isBestCtr ? ' best-ctr' : isBestSeo ? ' best-seo' : ''}`}
                    >
                      <span className="card-rank">#{i + 1}</span>
                      <div className="card-body">
                        <div
                          className="card-title"
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) =>
                            handleTitleEdit(i, (e.target as HTMLDivElement).innerText)
                          }
                        >
                          {result.title}
                        </div>
                        <div className="card-meta">
                          <span className={`char-count ${charCountClass(count)}`}>
                            {charCountLabel(count)}
                          </span>
                          <span className="ctr-tag">{result.ctrTag}</span>
                          {isBestCtr && (
                            <span className="best-label ctr">Best for CTR</span>
                          )}
                          {isBestSeo && (
                            <span className="best-label seo">Best for SEO</span>
                          )}
                          <span className="formula-tag">{result.formula}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className={`btn-copy${copiedIndex === i ? ' copied' : ''}`}
                          onClick={() => handleCopy(i, currentTitle)}
                          type="button"
                        >
                          {copiedIndex === i ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* A/B Recommendation */}
              {bestCtrIndex >= 0 && bestSeoIndex >= 0 && (
                <div className="ab-section">
                  <h2>A/B Test Recommendation</h2>
                  <div className="ab-grid">
                    <div className="ab-card ctr">
                      <p className="ab-card-label">Test A — Best for CTR</p>
                      <p className="ab-card-title">
                        {getTitle(bestCtrIndex, results[bestCtrIndex])}
                      </p>
                      <p className="ab-card-reason">
                        Curiosity gap triggers clicks. Use for new audiences &amp; cold traffic.
                      </p>
                    </div>
                    <div className="ab-card seo">
                      <p className="ab-card-label">Test B — Best for SEO</p>
                      <p className="ab-card-title">
                        {getTitle(bestSeoIndex, results[bestSeoIndex])}
                      </p>
                      <p className="ab-card-reason">
                        How-To keywords rank on search. Use for long-term organic discovery.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail Text */}
              {thumbnailTexts.length > 0 && (
                <div className="thumbnail-section">
                  <h2>Thumbnail Text Ideas</h2>
                  <p className="subtitle">
                    Click a thumbnail to copy the text. Keep it 2–4 words for maximum impact.
                  </p>
                  <div className="thumbnail-previews">
                    {thumbnailTexts.map((text, i) => (
                      <button
                        key={i}
                        className={`thumbnail-preview thumbnail-${i + 1}`}
                        onClick={() => { void copyText(text) }}
                        type="button"
                        title="Click to copy"
                      >
                        <span className="thumbnail-text">{text}</span>
                        <span className="thumbnail-copy-hint">click to copy</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : hasGenerated ? null : (
            <div className="empty-state">
              <div className="empty-icon">▶</div>
              <p>Enter your video topic above and click Generate to get 10 high-CTR title ideas.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
