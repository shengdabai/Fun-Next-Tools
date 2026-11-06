'use client'

import { useState, useCallback } from 'react'
import { HSK_WORDS, HSK_COLORS, HSK_LABELS, PRESET_SETS, lookupWords, parseInput, type VocabWord } from '@/data/hsk-words'
import StarMap from '@/components/StarMap'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [words, setWords] = useState<VocabWord[]>([])
  const [filter, setFilter] = useState<number | null>(null)

  const generate = useCallback(() => {
    const chars = parseInput(inputText)
    if (chars.length === 0) {
      // show all if empty
      setWords(HSK_WORDS)
      return
    }
    const found = lookupWords(chars)
    const notFound = chars.filter(c => !HSK_WORDS.find(w => w.char === c))
    setWords(found)
    if (notFound.length > 0) {
      console.info('未找到：', notFound)
    }
  }, [inputText])

  function loadPreset(name: string) {
    const chars = PRESET_SETS[name]
    setInputText(chars.join('\n'))
    const found = lookupWords(chars)
    setWords(found)
  }

  function showAll() {
    setInputText('')
    setWords(HSK_WORDS)
    setFilter(null)
  }

  const displayed = filter ? words.filter(w => w.hsk === filter) : words

  const stats = {
    total: words.length,
    byHsk: [1,2,3,4,5,6].map(h => ({ hsk: h, count: words.filter(w => w.hsk === h).length })),
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>🌌 词汇星图</h1>
        <p className="subtitle">HSK Vocabulary Constellation Map</p>

        <p className="section-title">输入词汇</p>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={'你好\n谢谢\n是\n我\n...\n\n每行一个词，或用逗号分隔'}
        />
        <button className="btn-primary" onClick={generate}>生成星图 ✦</button>

        <p className="section-title" style={{ marginTop: '1rem' }}>快捷预设</p>
        <div className="preset-chips">
          {Object.keys(PRESET_SETS).map(name => (
            <button key={name} className="preset-chip" onClick={() => loadPreset(name)}>
              {name}
            </button>
          ))}
          <button className="preset-chip" onClick={showAll} style={{ borderColor: '#4d96ff', color: '#4d96ff' }}>
            全部词汇
          </button>
        </div>

        {words.length > 0 && (
          <>
            <p className="section-title">词汇统计</p>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-num" style={{ color: '#4d96ff' }}>{stats.total}</span>
                <span className="stat-lbl">总词数</span>
              </div>
              <div className="stat-card">
                <span className="stat-num" style={{ color: '#ffd700' }}>
                  {stats.byHsk.filter(s => s.count > 0).length}
                </span>
                <span className="stat-lbl">HSK 等级</span>
              </div>
            </div>

            <p className="section-title">按等级筛选</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                className="preset-chip"
                onClick={() => setFilter(null)}
                style={filter === null ? { borderColor: '#4d96ff', color: '#4d96ff' } : {}}
              >
                全部显示
              </button>
              {stats.byHsk.filter(s => s.count > 0).map(({ hsk, count }) => (
                <button
                  key={hsk}
                  className="preset-chip"
                  onClick={() => setFilter(hsk)}
                  style={filter === hsk ? { borderColor: HSK_COLORS[hsk], color: HSK_COLORS[hsk] } : {}}
                >
                  <span style={{ color: HSK_COLORS[hsk], fontWeight: 700 }}>●</span>{' '}
                  HSK {hsk} — {count} 词
                </button>
              ))}
            </div>
          </>
        )}

        <p className="section-title">HSK 等级图例</p>
        <div className="legend">
          {[1,2,3,4,5,6].map(h => (
            <div key={h} className="legend-item">
              <div className="legend-dot" style={{ background: HSK_COLORS[h] }} />
              {HSK_LABELS[h]}
            </div>
          ))}
        </div>
      </aside>

      {/* Star map canvas */}
      <div className="canvas-area">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">✨</span>
            <p>
              在左侧输入你已学的汉字词汇<br />
              点击「生成星图」查看你的词汇星座图<br />
              <span style={{ fontSize: '0.85rem', color: '#444466', marginTop: '0.5rem', display: 'block' }}>
                或选择右侧预设词表快速体验
              </span>
            </p>
          </div>
        ) : (
          <StarMap words={displayed} />
        )}
      </div>
    </div>
  )
}
