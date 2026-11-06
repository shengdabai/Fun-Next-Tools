'use client'

import { useEffect, useState, useCallback } from 'react'
import HeatMap from '@/components/HeatMap'
import {
  localDateKey,
  Habit,
  CheckIns,
  loadHabits,
  updateHabits,
  STORAGE_ERROR_MESSAGE,
  loadCheckIns,
  getCheckInDates,
  toggleCheckIn,
  getStreak,
  getLongestStreak,
} from '@/lib/storage'

const EMOJIS = ['💧', '🏃', '📚', '🧘', '🍎', '😴', '✍️', '🎯', '🏋️', '🌿']
const COLORS = ['#39d353', '#58a6ff', '#f78166', '#ffa657', '#d2a8ff', '#79c0ff', '#56d364', '#e3b341', '#ff7b72', '#89d4f5']

function todayStr() {
  return localDateKey()
}

function formatDate(d: Date) {
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIns>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState(EMOJIS[0])
  const [newColor, setNewColor] = useState(COLORS[0])
  const [mounted, setMounted] = useState(false)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    setHabits(loadHabits(setStorageError))
    setCheckIns(loadCheckIns(setStorageError))
    setMounted(true)
  }, [])

  const today = todayStr()

  const handleToggle = useCallback((habitId: string) => {
    setStorageError('')
    try {
      const updated = toggleCheckIn(habitId, today, setStorageError)
      setCheckIns({ ...updated })
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
    }
  }, [today])

  const handleExpand = useCallback((habitId: string) => {
    setExpandedId((prev) => (prev === habitId ? null : habitId))
  }, [])

  const handleDelete = useCallback((habitId: string) => {
    setStorageError('')
    try {
      const next = updateHabits((current) => current.filter((h) => h.id !== habitId), setStorageError)
      setHabits(next)
      setExpandedId((prev) => (prev === habitId ? null : prev))
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
    }
  }, [])

  const handleAddHabit = useCallback(() => {
    if (!newName.trim()) return
    const habit: Habit = {
      id: `h${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      createdAt: today,
    }
    setStorageError('')
    try {
      const next = updateHabits((current) => [...current, habit], setStorageError)
      setHabits(next)
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
      return
    }
    setShowModal(false)
    setNewName('')
    setNewEmoji(EMOJIS[0])
    setNewColor(COLORS[0])
  }, [newName, newEmoji, newColor, today])

  const openModal = useCallback(() => {
    setNewName('')
    setNewEmoji(EMOJIS[0])
    setNewColor(COLORS[0])
    setShowModal(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: 'center', color: '#8b949e' }}>
        加载中…
      </div>
    )
  }

  const todayPending = habits.filter((h) => !getCheckInDates(checkIns, h.id).includes(today)).length

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>
          <span>🔥</span> Habit Streak
          {todayPending > 0 && <span className="badge">{todayPending} 待完成</span>}
        </h1>
        <div className="header-meta">
          <div className="date">{formatDate(new Date())}</div>
          <div style={{ marginTop: 2 }}>
            {habits.length - todayPending}/{habits.length} 已完成
          </div>
        </div>
      </div>

      {storageError && !showModal && <p className="storage-error" role="alert">{storageError}</p>}

      {/* Habit list */}
      {habits.length === 0 && (
        <div className="empty">
          <div className="emoji">🌱</div>
          <p>还没有习惯，点击下方添加第一个吧！</p>
        </div>
      )}

      {habits.map((habit) => {
        const habitCheckIns = getCheckInDates(checkIns, habit.id)
        const isDone = habitCheckIns.includes(today)
        const streak = getStreak(habitCheckIns)
        const longest = getLongestStreak(habitCheckIns)
        const total = habitCheckIns.length
        const isExpanded = expandedId === habit.id

        // Month completion rate
        const thisMonth = today.slice(0, 7)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        const monthDone = habitCheckIns.filter((d) => d.startsWith(thisMonth)).length
        const monthRate = Math.round((monthDone / daysInMonth) * 100)

        return (
          <div key={habit.id}>
            <div
              className="card"
              style={{ cursor: 'pointer', borderColor: isExpanded ? habit.color + '60' : undefined }}
              onClick={() => handleExpand(habit.id)}
            >
              <div className="card-header">
                <div className="card-emoji">{habit.emoji}</div>
                <div className="card-info">
                  <div className="card-name">{habit.name}</div>
                  <div className="card-stats">
                    {streak > 0 && (
                      <span className="streak">🔥 {streak} 天连续</span>
                    )}
                    {streak === 0 && <span>暂无连续记录</span>}
                    <span>最长 {longest} 天</span>
                    <span>共 {total} 次</span>
                  </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`btn-check ${isDone ? 'done' : 'todo'}`}
                    onClick={() => handleToggle(habit.id)}
                  >
                    {isDone ? '✓ 已完成' : '打卡'}
                  </button>
                  <button
                    className="btn-icon"
                    title="删除习惯"
                    onClick={() => handleDelete(habit.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="detail-panel">
                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-value" style={{ color: '#ffa657' }}>🔥{streak}</div>
                    <div className="stat-label">当前连续</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{longest}</div>
                    <div className="stat-label">最长连续</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{total}</div>
                    <div className="stat-label">总打卡次数</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value" style={{ color: habit.color }}>{monthRate}%</div>
                    <div className="stat-label">本月完成率</div>
                  </div>
                </div>
                <div className="heatmap-title">过去 365 天打卡记录</div>
                <HeatMap checkIns={habitCheckIns} color={habit.color} />
              </div>
            )}
          </div>
        )
      })}

      <button className="btn-add" onClick={openModal}>
        ＋ 添加新习惯
      </button>

      {/* Add Habit Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>添加新习惯</h2>
            {storageError && <p className="storage-error" role="alert">{storageError}</p>}

            <div className="form-group">
              <label className="form-label">习惯名称</label>
              <input
                className="form-input"
                type="text"
                placeholder="例如：每天运动 30 分钟"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                autoFocus
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label className="form-label">选择图标</label>
              <div className="emoji-grid">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    className={`emoji-btn ${newEmoji === em ? 'selected' : ''}`}
                    onClick={() => setNewEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">热力图颜色</label>
              <div className="color-grid">
                {COLORS.map((c) => (
                  <div
                    key={c}
                    className={`color-swatch ${newColor === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button
                className="btn-primary"
                onClick={handleAddHabit}
                disabled={!newName.trim()}
                style={{ opacity: newName.trim() ? 1 : 0.5 }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
