'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { HSK_COLORS, type VocabWord } from '@/data/hsk-words'

interface Props {
  words: VocabWord[]
}

interface StarNode extends VocabWord {
  x: number
  y: number
  r: number
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  word: VocabWord | null
}

export default function StarMap({ words }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, word: null })
  const [dims, setDims] = useState({ w: 800, h: 700 })

  // ResizeObserver — get real container dimensions
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setDims({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const showTooltip = useCallback((word: VocabWord, x: number, y: number) => {
    setTooltip({ visible: true, x, y, word })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(t => ({ ...t, visible: false }))
  }, [])

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return
    const { w: W, h: H } = dims

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // Seeded positions: use word index as deterministic offset instead of Math.random()
    const topicGroups = d3.group(words, d => d.topic)
    const topics = Array.from(topicGroups.keys())
    const nodes: StarNode[] = []

    topics.forEach((topic, ti) => {
      const angle = (ti / topics.length) * Math.PI * 2
      const clusterX = W / 2 + Math.cos(angle) * (W * 0.27)
      const clusterY = H / 2 + Math.sin(angle) * (H * 0.27)
      const groupWords = topicGroups.get(topic) ?? []

      groupWords.forEach((word, wi) => {
        const spread = 55 + groupWords.length * 7
        const innerAngle = (wi / groupWords.length) * Math.PI * 2
        // deterministic jitter from word char code — no Math.random()
        const jitter = ((word.char.charCodeAt(0) % 10) / 10) * 0.4 + 0.6
        const r = Math.max(7 - word.hsk * 0.7 + 1.5, 3)
        nodes.push({
          ...word,
          x: clusterX + Math.cos(innerAngle) * spread * jitter,
          y: clusterY + Math.sin(innerAngle) * spread * jitter,
          r,
        })
      })
    })

    // Force sim for collision avoidance
    const sim = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(-12))
      .force('collision', d3.forceCollide<StarNode>(d => d.r + 8))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.04))
      .stop()

    for (let i = 0; i < 120; i++) sim.tick()

    // Clamp to bounds
    nodes.forEach(n => {
      n.x = Math.max(n.r + 15, Math.min(W - n.r - 15, n.x))
      n.y = Math.max(n.r + 20, Math.min(H - n.r - 20, n.y))
    })

    // SVG accessibility
    svg.attr('role', 'img').attr('aria-label', `${words.length} 个词汇的星座图`)
    svg.append('title').text(`HSK词汇星图 — ${words.length}个词汇`)

    // Glow filter
    const defs = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'star-glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur')
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Constellation lines
    const lineG = svg.append('g').attr('aria-hidden', 'true')
    topicGroups.forEach(groupWords => {
      const gn = nodes.filter(n => groupWords.find(w => w.char === n.char))
      for (let i = 0; i < gn.length - 1; i++) {
        lineG.append('line')
          .attr('x1', gn[i].x).attr('y1', gn[i].y)
          .attr('x2', gn[i + 1].x).attr('y2', gn[i + 1].y)
          .attr('stroke', HSK_COLORS[gn[i].hsk])
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 0.18)
          .attr('stroke-dasharray', '3,3')
      }
    })

    // Topic labels
    topicGroups.forEach((groupWords, topic) => {
      const gn = nodes.filter(n => groupWords.find(w => w.char === n.char))
      if (!gn.length) return
      const cx = d3.mean(gn, n => n.x) ?? 0
      const cy = d3.mean(gn, n => n.y) ?? 0
      svg.append('text')
        .attr('x', cx).attr('y', cy - 28)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(140,140,200,0.45)')
        .attr('font-size', '9px')
        .attr('letter-spacing', '0.06em')
        .attr('aria-hidden', 'true')
        .text(topic)
    })

    // Stars — use D3 data join for proper update semantics
    const starG = svg.append('g')
    const stars = starG.selectAll<SVGGElement, StarNode>('g.star')
      .data(nodes, d => d.char)
      .join(
        enter => {
          const g = enter.append('g')
            .attr('class', 'star')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('tabindex', '0')
            .attr('role', 'button')
            .attr('aria-label', d => `${d.char} ${d.pinyin} — ${d.english}，HSK ${d.hsk}`)
            .style('cursor', 'pointer')
            .style('outline', 'none')

          // Outer glow
          g.append('circle').attr('class', 'glow')
            .attr('r', d => d.r + 5)
            .attr('fill', d => HSK_COLORS[d.hsk])
            .attr('opacity', 0.1)

          // Main circle
          g.append('circle').attr('class', 'main')
            .attr('r', d => d.r)
            .attr('fill', d => HSK_COLORS[d.hsk])
            .attr('opacity', 0.82)
            .attr('filter', 'url(#star-glow)')

          // Label
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.r + 11)
            .attr('fill', d => HSK_COLORS[d.hsk])
            .attr('font-size', '9px')
            .attr('font-weight', '600')
            .attr('opacity', 0.88)
            .attr('aria-hidden', 'true')
            .text(d => d.char)

          // Entry animation
          g.attr('opacity', 0)
            .transition().delay((_, i) => i * 8).duration(350)
            .attr('opacity', 1)

          return g
        }
      )

    // Mouse + keyboard interactions
    stars
      .on('mouseenter focus', function(event: MouseEvent | FocusEvent, d) {
        d3.select(this).select('circle.main')
          .transition().duration(120)
          .attr('r', d.r * 1.7).attr('opacity', 1)
        const rect = (event.target as Element).getBoundingClientRect()
        const ex = event instanceof MouseEvent ? event.clientX : rect.right
        const ey = event instanceof MouseEvent ? event.clientY : rect.top
        showTooltip(d, ex + 14, ey - 8)
      })
      .on('mousemove', function(event: MouseEvent) {
        setTooltip(t => ({ ...t, x: event.clientX + 14, y: event.clientY - 8 }))
      })
      .on('mouseleave blur', function(_event, d) {
        d3.select(this).select('circle.main')
          .transition().duration(120)
          .attr('r', d.r).attr('opacity', 0.82)
        hideTooltip()
      })
      .on('keydown', function(event: KeyboardEvent, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const rect = (event.target as Element).getBoundingClientRect()
          showTooltip(d, rect.right + 8, rect.top)
        }
      })
  }, [words, dims, showTooltip, hideTooltip])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />

      {tooltip.visible && tooltip.word && (
        <div
          className="tooltip"
          role="tooltip"
          aria-live="polite"
          style={{ left: tooltip.x, top: tooltip.y, opacity: tooltip.visible ? 1 : 0 }}
        >
          <span className="tooltip-chinese" style={{ color: HSK_COLORS[tooltip.word.hsk] }}>
            {tooltip.word.char}
          </span>
          <div className="tooltip-pinyin">{tooltip.word.pinyin}</div>
          <div className="tooltip-wbw">「{tooltip.word.wordByWord}」</div>
          <div className="tooltip-english">{tooltip.word.english}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: HSK_COLORS[tooltip.word.hsk], fontWeight: 700 }}>
            HSK {tooltip.word.hsk} · {tooltip.word.topic}
          </div>
        </div>
      )}
    </div>
  )
}
