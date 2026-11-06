'use client'

import { useState, useEffect, useRef } from 'react'
import { CHARACTER_DB, POPULAR_CHARS, getCharData, type CharacterData } from '@/data/characters'
import StrokeCanvas from '@/components/StrokeCanvas'
import FourLayer from '@/components/FourLayer'

export default function Home() {
  const [input, setInput] = useState('')
  const [charData, setCharData] = useState<CharacterData | null>(null)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function loadChar(char: string) {
    const data = getCharData(char)
    if (data) {
      setCharData(data)
      setCurrentStroke(0)
      setIsAnimating(false)
      setAutoPlay(false)
      setNotFound(false)
    } else {
      setCharData(null)
      setNotFound(true)
    }
  }

  function handleSearch() {
    const c = input.trim()[0]
    if (c) loadChar(c)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function nextStroke() {
    if (!charData) return
    if (currentStroke >= charData.strokes.length) return
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      setCurrentStroke(s => s + 1)
    }, 700)
  }

  function prevStroke() {
    setCurrentStroke(s => Math.max(0, s - 1))
    setIsAnimating(false)
  }

  function reset() {
    setCurrentStroke(0)
    setIsAnimating(false)
    setAutoPlay(false)
  }

  function showAll() {
    if (!charData) return
    setCurrentStroke(charData.strokes.length)
    setIsAnimating(false)
    setAutoPlay(false)
  }

  // Auto-play mode
  useEffect(() => {
    if (!autoPlay || !charData) return
    if (currentStroke >= charData.strokes.length) {
      setAutoPlay(false)
      return
    }
    setIsAnimating(true)
    autoRef.current = setTimeout(() => {
      setIsAnimating(false)
      setCurrentStroke(s => s + 1)
    }, 900)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoPlay, currentStroke, charData])

  const progress = charData ? (currentStroke / charData.strokes.length) * 100 : 0

  return (
    <main className="container">
      <h1>汉字笔顺练习器</h1>
      <p className="subtitle">Chinese Stroke Order Trainer — learn how every character is written</p>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入汉字 / Type a character…"
            maxLength={1}
          />
          <button className="btn-primary" onClick={handleSearch} style={{ whiteSpace: 'nowrap' }}>
            查字 →
          </button>
        </div>

        <div className="popular-chars">
          {POPULAR_CHARS.map(c => (
            <button
              key={c}
              className="char-chip"
              onClick={() => { setInput(c); loadChar(c) }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {notFound && (
        <div className="card animate-in" style={{ textAlign: 'center', color: '#888899', marginBottom: '1rem' }}>
          暂无此字的笔顺数据。请试试推荐字符。
        </div>
      )}

      {charData && (
        <div className="animate-in">
          <div className="grid-2">
            {/* Left: Canvas */}
            <div className="card">
              <StrokeCanvas
                strokes={charData.strokes}
                currentStroke={currentStroke}
                isAnimating={isAnimating}
              />

              <div className="stroke-counter">
                笔画 <span>{currentStroke}</span> / {charData.strokes.length}
                <span className="badge">HSK {charData.hsk}</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              <div className="controls" style={{ marginTop: '1rem' }}>
                <button className="btn-secondary" onClick={reset}>↺ 重置</button>
                <button className="btn-secondary" onClick={prevStroke} disabled={currentStroke === 0}>← 上一笔</button>
                <button
                  className="btn-primary"
                  onClick={() => setAutoPlay(true)}
                  disabled={autoPlay || currentStroke >= charData.strokes.length}
                >
                  ▶ 动画
                </button>
                <button
                  className="btn-secondary"
                  onClick={nextStroke}
                  disabled={currentStroke >= charData.strokes.length || isAnimating}
                >
                  下一笔 →
                </button>
                <button className="btn-secondary" onClick={showAll}>全部显示</button>
              </div>
            </div>

            {/* Right: Four-layer translation */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ color: '#888899', fontSize: '0.8rem', marginBottom: '0.5rem' }}>四层翻译法 Four-Layer Translation</p>
              <FourLayer data={charData} />

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0f0f1a', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: '#888899', marginBottom: '0.5rem' }}>笔画说明 Stroke Guide</p>
                {charData.strokes.map((_, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0',
                    color: i < currentStroke ? '#4ecca3' : i === currentStroke ? '#e94560' : '#444466',
                    fontSize: '0.85rem',
                  }}>
                    <span style={{ fontWeight: 700, minWidth: '1.5rem' }}>
                      {i < currentStroke ? '✓' : i === currentStroke ? '▶' : String(i + 1)}
                    </span>
                    第 {i + 1} 笔
                    {i < currentStroke && <span style={{ color: '#4ecca3' }}> ✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!charData && !notFound && (
        <div className="card animate-in" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖌️</div>
          <p style={{ color: '#888899', fontSize: '1rem', lineHeight: 1.6 }}>
            输入任意汉字，查看正确笔顺动画<br />
            配合四层翻译法，深入理解每个字
          </p>
        </div>
      )}
    </main>
  )
}
