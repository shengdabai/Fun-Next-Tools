'use client'

import { copyText } from '@/lib/clipboard'

import { useState, useCallback, useRef } from 'react'
import { splitIntoThread, SplitOptions } from '@/lib/splitter'

type NumberingStyle = SplitOptions['numberingStyle']

interface TweetCard {
  id: string
  content: string
}

function CharCount({ count, max }: { count: number; max: number }) {
  const remaining = max - count
  const pct = count / max
  let cls = 'char-count'
  if (pct >= 1) cls += ' danger'
  else if (pct >= 0.9) cls += ' warning'
  return (
    <span className={cls}>
      {count}/{max}
      {pct >= 1 && ' ⚠'}
    </span>
  )
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (await copyText(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [text])

  return (
    <button
      className={`btn btn-copy${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      type="button"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [maxChars, setMaxChars] = useState<number>(280)
  const [numberingStyle, setNumberingStyle] = useState<NumberingStyle>('fraction')
  const [intro, setIntro] = useState('')
  const [tweets, setTweets] = useState<TweetCard[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)

  // Drag state
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleGenerate = useCallback(() => {
    if (!inputText.trim()) return
    const options: SplitOptions = { maxChars, numberingStyle, intro }
    const parts = splitIntoThread(inputText, options)
    const cards: TweetCard[] = parts.map((content, i) => ({
      id: `tweet-${Date.now()}-${i}`,
      content,
    }))
    setTweets(cards)
    setHasGenerated(true)
  }, [inputText, maxChars, numberingStyle, intro])

  const handleCopyAll = useCallback(async () => {
    const all = tweets.map((t) => t.content).join('\n\n---\n\n')
    await copyText(all)
  }, [tweets])

  // Drag handlers
  const onDragStart = useCallback((index: number) => {
    dragIndex.current = index
  }, [])

  const onDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      const from = dragIndex.current
      if (from === null || from === dropIndex) {
        setDragOverIndex(null)
        dragIndex.current = null
        return
      }
      setTweets((prev) => {
        const next = [...prev]
        const [item] = next.splice(from, 1)
        next.splice(dropIndex, 0, item)
        return next
      })
      dragIndex.current = null
      setDragOverIndex(null)
    },
    []
  )

  const onDragEnd = useCallback(() => {
    dragIndex.current = null
    setDragOverIndex(null)
  }, [])

  const overLimitCount = tweets.filter((t) => t.content.length > maxChars).length

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="header-logo">🧵</div>
            <span className="header-title">Thread Forge</span>
            <span className="header-subtitle">Long post → Twitter thread</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="container">
          <div className="workspace">
            {/* ===== Left: Input panel ===== */}
            <div className="panel">
              <div className="panel-header">
                ✍️ Input
              </div>
              <div className="panel-body">
                {/* Text input */}
                <div className="field">
                  <label htmlFor="input-text">Paste your article or post</label>
                  <textarea
                    id="input-text"
                    placeholder="Paste your long-form content here. Markdown is supported — bold, italic, headers, and lists will be cleaned up automatically."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={10}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span className="char-count">{inputText.length} chars</span>
                  </div>
                </div>

                {/* Options row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label htmlFor="max-chars">Max chars per tweet</label>
                    <select
                      id="max-chars"
                      value={maxChars}
                      onChange={(e) => setMaxChars(Number(e.target.value))}
                    >
                      <option value={280}>280 (standard)</option>
                      <option value={240}>240 (safe zone)</option>
                      <option value={200}>200 (compact)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="numbering">Numbering style</label>
                    <select
                      id="numbering"
                      value={numberingStyle}
                      onChange={(e) => setNumberingStyle(e.target.value as NumberingStyle)}
                    >
                      <option value="fraction">1/n (e.g. 1/12)</option>
                      <option value="emoji">🧵1 (emoji)</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                {/* Intro */}
                <div className="field">
                  <label htmlFor="intro">Thread intro (optional)</label>
                  <input
                    type="text"
                    id="intro"
                    placeholder="E.g. 🧵 Here's everything I learned about..."
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                  />
                </div>

                {/* Generate button */}
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={!inputText.trim()}
                  type="button"
                >
                  🧵 Generate Thread
                </button>
              </div>
            </div>

            {/* ===== Right: Output panel ===== */}
            <div className="panel">
              <div className="panel-header">
                📋 Thread Preview
                {tweets.length > 0 && (
                  <span className="badge" style={{ marginLeft: 'auto' }}>
                    {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}
                  </span>
                )}
                {overLimitCount > 0 && (
                  <span className="badge" style={{ background: 'rgba(244,33,46,0.15)', color: 'var(--danger)' }}>
                    {overLimitCount} over limit
                  </span>
                )}
              </div>

              {tweets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🧵</div>
                  <div className="empty-state-text">
                    {hasGenerated
                      ? 'No content to split. Try pasting some text.'
                      : 'Paste your content on the left and click Generate Thread.'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="thread-scroll">
                    <div className="thread-list">
                      {tweets.map((tweet, index) => {
                        const isOver = dragOverIndex === index
                        const isOverLimit = tweet.content.length > maxChars
                        return (
                          <div
                            key={tweet.id}
                            className={`tweet-card${isOver ? ' drag-over' : ''}`}
                            draggable
                            onDragStart={() => onDragStart(index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDrop={(e) => onDrop(e, index)}
                            onDragEnd={onDragEnd}
                            style={isOverLimit ? { borderLeft: '3px solid var(--danger)' } : undefined}
                          >
                            <div className="tweet-card-inner">
                              {/* Avatar */}
                              <div className="tweet-avatar">T</div>

                              {/* Body */}
                              <div className="tweet-body">
                                <div className="tweet-meta">
                                  <span className="tweet-name">You</span>
                                  <span className="tweet-handle">@yourhandle</span>
                                  <span className="drag-handle" title="Drag to reorder">⠿</span>
                                </div>

                                <div className="tweet-content">{tweet.content}</div>

                                <div className="tweet-footer">
                                  <CharCount count={tweet.content.length} max={maxChars} />
                                  <CopyButton text={tweet.content} />
                                </div>
                              </div>
                            </div>

                            {/* Thread connector line */}
                            {index < tweets.length - 1 && (
                              <div className="tweet-connector" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="stats-bar">
                    <div className="stats-bar-left">
                      <span className="badge badge-dim">{tweets.length} tweets</span>
                      <span className="char-count">
                        ~{tweets.reduce((acc, t) => acc + t.content.length, 0)} total chars
                      </span>
                    </div>
                    <CopyButton
                      text={tweets.map((t) => t.content).join('\n\n---\n\n')}
                      label="Copy All"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
