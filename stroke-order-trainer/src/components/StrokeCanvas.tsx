'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  strokes: string[]
  currentStroke: number
  isAnimating: boolean
}

export default function StrokeCanvas({ strokes, currentStroke, isAnimating }: Props) {
  const size = 280

  return (
    <div className="stroke-canvas">
      <svg
        className="stroke-svg"
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        {/* Grid lines */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="#1e1e3a" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#1e1e3a" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#1a1a30" strokeWidth="0.3" strokeDasharray="2,2" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#1a1a30" strokeWidth="0.3" strokeDasharray="2,2" />

        {/* Completed strokes */}
        {strokes.slice(0, currentStroke).map((path, i) => (
          <path
            key={`done-${i}`}
            d={path}
            fill="none"
            stroke="#888899"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Current stroke (animated) */}
        {currentStroke < strokes.length && (
          <path
            key={`current-${currentStroke}-${isAnimating}`}
            d={strokes[currentStroke]}
            fill="none"
            stroke="#e94560"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: isAnimating ? 200 : 0,
              transition: isAnimating ? 'stroke-dashoffset 0.6s ease' : 'none',
            }}
          />
        )}

        {/* Stroke order numbers for completed */}
        {strokes.slice(0, currentStroke).map((path, i) => {
          const parts = path.replace(/[MLQ]/g, '').trim().split(/\s+/)
          const [x, y] = parts[0]?.split(',').map(Number) ?? [0, 0]
          return (
            <text
              key={`num-${i}`}
              x={x}
              y={y - 2}
              fontSize="4"
              fill="#444466"
              textAnchor="middle"
            >
              {i + 1}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
