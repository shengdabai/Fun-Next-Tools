'use client'

import { useState, useEffect, useCallback } from 'react'
import { getDailyWords, getRandomWords, TONE_INFO, type ToneWord } from '@/data/words'
import { loadBest as readBest, saveBest as writeBest } from '@/lib/best'
import { copyText } from '@/lib/clipboard'

type Mode = 'daily' | 'practice'
type GameState = 'playing' | 'answered' | 'complete'

const TONES = [1, 2, 3, 4] as const

function getToneShape(tone: 1 | 2 | 3 | 4) {
  return { 1: '—', 2: '↗', 3: '↘↗', 4: '↘' }[tone]
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function loadBest(): number {
  return readBest(browserStorage())
}

function saveBest(val: number) {
  writeBest(browserStorage(), val)
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('daily')
  const [words, setWords] = useState<ToneWord[]>([])
  const [index, setIndex] = useState(0)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [allTimeBest, setAllTimeBest] = useState(0)
  const [showPinyin, setShowPinyin] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => { setAllTimeBest(loadBest()) }, [])

  const loadWords = useCallback((m: Mode) => {
    const w = m === 'daily' ? getDailyWords() : getRandomWords(10)
    setWords(w)
    setIndex(0)
    setScore(0)
    setStreak(0)
    setSelected(null)
    setGameState('playing')
    setShowPinyin(false)
    setResults([])
  }, [])

  useEffect(() => { loadWords('daily') }, [loadWords])

  const current = words[index]

  const answer = useCallback((tone: number) => {
    if (gameState !== 'playing' || !current) return
    setSelected(tone)
    setShowPinyin(true)
    const correct = tone === current.tone
    setResults(r => [...r, correct])
    if (correct) {
      setStreak(s => {
        const ns = s + 1
        setBestStreak(b => Math.max(b, ns))
        return ns
      })
      setScore(s => s + (streak >= 3 ? 20 : 10))
    } else {
      setStreak(0)
    }
    setGameState('answered')
  }, [gameState, current, streak])

  // Keyboard shortcuts: 1-4 to answer, Enter/Space to advance
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (['1','2','3','4'].includes(e.key)) {
        answer(parseInt(e.key, 10))
      } else if ((e.key === 'Enter' || e.key === ' ') && gameState === 'answered') {
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  function next() {
    if (index + 1 >= words.length) {
      setGameState('complete')
      const newBest = Math.max(bestStreak, allTimeBest)
      setAllTimeBest(newBest)
      saveBest(newBest)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
      setShowPinyin(false)
      setGameState('playing')
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    loadWords(m)
  }

  const accuracy = results.length > 0
    ? Math.round((results.filter(Boolean).length / results.length) * 100)
    : 0

  const shareText = `声调闯关 Tone Trainer\n今日: ${score}分 | 准确率: ${accuracy}% | 连击: ${bestStreak}\n每天练习，声调不再难！`

  async function handleShare() {
    if (await copyText(shareText)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (gameState === 'complete') {
    return (
      <main className="container">
        <h1>今日完成！</h1>
        <p className="subtitle">Daily challenge complete</p>

        <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: '总分', value: score, color: '#ffd93d' },
              { label: '准确率', value: `${accuracy}%`, color: '#6bcb77' },
              { label: '最长连击', value: bestStreak, color: '#ff6b6b' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0a0a0f', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#7777aa', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {allTimeBest > 0 && (
            <p style={{ color: '#7777aa', fontSize: '0.8rem', marginTop: '1rem' }}>
              历史最佳连击: {allTimeBest}
            </p>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {results.map((r, i) => (
              <span key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: r ? '#6bcb77' : '#ff6b6b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: 'white', fontWeight: 700,
              }}>
                {r ? '✓' : '✗'}
              </span>
            ))}
          </div>
        </div>

        <button
          className="btn-share"
          onClick={handleShare}
          aria-label="复制成绩到剪贴板"
        >
          {copied ? '已复制！' : '复制成绩分享'}
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => loadWords(mode)}>
            再来一轮
          </button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => switchMode(mode === 'daily' ? 'practice' : 'daily')}>
            换模式
          </button>
        </div>
      </main>
    )
  }

  if (!current) return null

  return (
    <main className="container">
      <h1>声调闯关</h1>
      <p className="subtitle">Tone Trainer — 按 1-4 键快速答题，Space/Enter 下一题</p>

      <div className="mode-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'daily'}
          className={`mode-tab ${mode === 'daily' ? 'active' : ''}`}
          onClick={() => switchMode('daily')}
        >
          每日挑战
        </button>
        <button
          role="tab"
          aria-selected={mode === 'practice'}
          className={`mode-tab ${mode === 'practice' ? 'active' : ''}`}
          onClick={() => switchMode('practice')}
        >
          随机练习
        </button>
      </div>

      <div className="stats-bar" aria-label="当前成绩">
        <div className="stat-box">
          <span className="stat-value" style={{ color: '#ffd93d' }}>{score}</span>
          <span className="stat-label">分数</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">
            {streak > 0 && <span aria-hidden="true">🔥</span>}
            {streak}
          </span>
          <span className="stat-label">连击</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{index + 1}/{words.length}</span>
          <span className="stat-label">进度</span>
        </div>
      </div>

      <div className="daily-progress" aria-label={`进度：${index} / ${words.length}`}>
        <div className="progress-label">
          <span>今日进度</span>
          <span>{index}/{words.length}</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={index} aria-valuemax={words.length}>
          <div className="progress-fill" style={{ width: `${(index / words.length) * 100}%` }} />
        </div>
      </div>

      <div className="char-display" aria-label={`汉字：${current.char}，请判断声调`}>
        <span className={`char-big tone-${current.tone}`} aria-hidden="true">{current.char}</span>
        <div className={`pinyin-hint ${showPinyin ? 'pinyin-reveal' : ''}`} aria-live="polite">
          {showPinyin ? current.pinyin : current.pinyinBase.replace(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/gi, '_')}
        </div>
        {showPinyin && (
          <div style={{ marginTop: '0.5rem', color: '#7777aa', fontSize: '0.85rem' }}>
            {current.wordByWord} — {current.english}
          </div>
        )}
        {streak >= 3 && gameState === 'playing' && (
          <div
            aria-live="polite"
            style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,107,107,0.2)', borderRadius: '8px',
              padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#ff6b6b',
            }}
          >
            {streak}连击 +20分
          </div>
        )}
      </div>

      {gameState === 'answered' && selected !== null && (
        <div
          className={`feedback ${selected === current.tone ? 'correct' : 'wrong'}`}
          role="alert"
          aria-live="assertive"
        >
          {selected === current.tone
            ? `正确！${streak >= 3 ? ` ${streak}连击！` : ''}`
            : `应该是第${current.tone}声（${TONE_INFO[current.tone].name}）`
          }
          {!results[results.length - 1] && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              例句：{current.example}
            </div>
          )}
        </div>
      )}

      <div className="tone-buttons" role="group" aria-label="选择声调">
        {TONES.map(t => {
          const info = TONE_INFO[t]
          const isSelected = selected === t
          const isCorrect = t === current.tone
          let extraStyle: React.CSSProperties = {}
          if (gameState === 'answered') {
            if (isCorrect) extraStyle = { background: info.color, color: t === 2 || t === 3 ? '#111' : 'white', borderColor: info.color }
            else if (isSelected && !isCorrect) extraStyle = { background: '#ff6b6b22', borderColor: '#ff6b6b' }
          }
          return (
            <button
              key={t}
              className={`tone-btn t${t}`}
              onClick={() => answer(t)}
              disabled={gameState === 'answered'}
              style={extraStyle}
              aria-label={`第${t}声，${info.name}，${info.description}（快捷键 ${t}）`}
              aria-pressed={isSelected || undefined}
            >
              {getToneShape(t)}
              <span style={{ fontSize: '0.9rem' }}>第{t}声</span>
              <span className="tone-label">{info.name}</span>
            </button>
          )
        })}
      </div>

      {gameState === 'answered' && (
        <button
          className="btn-share"
          onClick={next}
          style={{ background: 'linear-gradient(135deg, #6bcb77, #4d96ff)' }}
          aria-label={index + 1 >= words.length ? '查看成绩' : '下一个字'}
        >
          {index + 1 >= words.length ? '查看成绩 →' : '下一个 →（Space）'}
        </button>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#7777aa', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          声调速查 Tone Reference
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {TONES.map(t => (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem', borderRadius: '8px', background: '#0a0a0f',
            }}>
              <span style={{ fontSize: '1.2rem', color: TONE_INFO[t].color, fontWeight: 800 }} aria-hidden="true">
                {getToneShape(t)}
              </span>
              <div>
                <div style={{ fontSize: '0.8rem' }}>{TONE_INFO[t].name}</div>
                <div style={{ fontSize: '0.7rem', color: '#7777aa' }}>{TONE_INFO[t].description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
