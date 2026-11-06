'use client'

import { useMemo, useState } from 'react'
import { localDateKey } from '@/lib/storage'

interface HeatMapProps {
  checkIns: string[]
  color: string
}

interface DayCell {
  date: string
  filled: boolean
  col: number
  row: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function HeatMap({ checkIns, color }: HeatMapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const checkSet = useMemo(() => new Set(checkIns), [checkIns])

  const { cells, monthLabels } = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    // Align to Sunday
    const dayOfWeek = start.getDay()
    start.setDate(start.getDate() - dayOfWeek)

    const cells: DayCell[] = []
    const monthLabels: { col: number; month: string }[] = []

    let col = 0
    let lastMonth = -1
    const cursor = new Date(start)

    while (cursor <= today) {
      const row = cursor.getDay()
      if (row === 0) {
        // New week col
        if (cursor.getMonth() !== lastMonth) {
          monthLabels.push({ col, month: MONTHS[cursor.getMonth()] })
          lastMonth = cursor.getMonth()
        }
      }
      const dateStr = localDateKey(cursor)
      cells.push({
        date: dateStr,
        filled: checkSet.has(dateStr),
        col: Math.floor(cells.length / 7),
        row,
      })
      cursor.setDate(cursor.getDate() + 1)
      if (row === 6) col++
    }

    // recalculate col properly
    const recalcCells: DayCell[] = []
    let c = 0
    for (let i = 0; i < cells.length; i++) {
      const r = i % 7
      if (r === 0 && i > 0) c++
      recalcCells.push({ ...cells[i], col: c, row: r })
    }

    return { cells: recalcCells, monthLabels }
  }, [checkSet])

  const totalCols = cells.length > 0 ? cells[cells.length - 1].col + 1 : 53
  const CELL = 13
  const GAP = 3
  const LEFT_OFFSET = 28
  const TOP_OFFSET = 22

  const svgWidth = LEFT_OFFSET + totalCols * (CELL + GAP)
  const svgHeight = TOP_OFFSET + 7 * (CELL + GAP)

  function getColor(filled: boolean) {
    if (!filled) return '#161b22'
    return color
  }

  function handleMouseEnter(cell: DayCell, e: React.MouseEvent<SVGRectElement>) {
    const rect = (e.target as SVGRectElement).getBoundingClientRect()
    const label = cell.filled ? '✓ 已完成' : '未完成'
    setTooltip({ text: `${cell.date}  ${label}`, x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {monthLabels.map(({ col, month }) => (
          <text
            key={`${col}-${month}`}
            x={LEFT_OFFSET + col * (CELL + GAP)}
            y={14}
            fontSize={10}
            fill="#8b949e"
          >
            {month}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((label, i) => (
          label ? (
            <text
              key={i}
              x={10}
              y={TOP_OFFSET + i * (CELL + GAP) + CELL - 2}
              fontSize={9}
              fill="#8b949e"
              textAnchor="middle"
            >
              {label}
            </text>
          ) : null
        ))}

        {/* Cells */}
        {cells.map((cell) => (
          <rect
            key={cell.date}
            x={LEFT_OFFSET + cell.col * (CELL + GAP)}
            y={TOP_OFFSET + cell.row * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={2}
            fill={getColor(cell.filled)}
            stroke="#21262d"
            strokeWidth={0.5}
            style={{ cursor: 'pointer', transition: 'opacity 0.1s' }}
            onMouseEnter={(e) => handleMouseEnter(cell, e)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            color: '#e6edf3',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
