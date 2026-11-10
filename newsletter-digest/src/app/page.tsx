'use client'

import { useState, useCallback } from 'react'
import { MOCK_FEEDS, type FeedSource, type Article } from '@/lib/mockFeeds'
import { copyText } from '@/lib/clipboard'
import {
  generateDigestHTML,
  generateDigestMarkdown,
  filterArticles,
  type DigestConfig,
} from '@/lib/generator'

const FREE_FEED_LIMIT = 3

interface ActiveFeed extends FeedSource {
  enabled: boolean
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Home() {
  // Config state
  const [title, setTitle] = useState('Weekly Tech Digest')
  const [subtitle, setSubtitle] = useState('by Newsletter Digest')
  const [articlesPerFeed, setArticlesPerFeed] = useState(3)
  const [timeRange, setTimeRange] = useState<DigestConfig['timeRange']>('48h')

  // Feeds state — start with all 4 mock feeds enabled
  const [feeds, setFeeds] = useState<ActiveFeed[]>(
    MOCK_FEEDS.map((f) => ({ ...f, enabled: true }))
  )
  const [newFeedUrl, setNewFeedUrl] = useState('')

  // Generated digest
  const [digestFeeds, setDigestFeeds] = useState<FeedSource[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Toast
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const enabledFeeds = feeds.filter((f) => f.enabled)
  const isPro = enabledFeeds.length <= FREE_FEED_LIMIT // simplified: no real auth

  // Add a new feed (simulated — uses mock data from the closest matching feed)
  function handleAddFeed() {
    const url = newFeedUrl.trim()
    if (!url) return
    if (feeds.some((f) => f.url === url)) {
      showToast('Feed already added')
      return
    }
    if (enabledFeeds.length >= FREE_FEED_LIMIT) {
      showToast('Free plan: max 3 sources. Upgrade to Pro for unlimited!')
      setNewFeedUrl('')
      return
    }

    // Pick a random mock feed as data source for the simulated feed
    const base = MOCK_FEEDS[feeds.length % MOCK_FEEDS.length]
    const domain = (() => {
      try { return new URL(url).hostname.replace('www.', '') } catch { return url }
    })()
    const newFeed: ActiveFeed = {
      id: `custom-${Date.now()}`,
      name: domain,
      url,
      enabled: true,
      articles: base.articles.map((a) => ({
        ...a,
        id: `${domain}-${a.id}`,
        source: domain,
        sourceId: `custom-${Date.now()}`,
      })),
    }
    setFeeds((prev) => [...prev, newFeed])
    setNewFeedUrl('')
    showToast(`Added "${domain}" (simulated data)`)
  }

  function handleDeleteFeed(id: string) {
    setFeeds((prev) => prev.filter((f) => f.id !== id))
    setDigestFeeds(null)
  }

  function handleToggleFeed(id: string) {
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    )
  }

  function handleGenerate() {
    setIsGenerating(true)
    // Simulate a brief "processing" delay for UX
    setTimeout(() => {
      const config: DigestConfig = { title, subtitle, articlesPerFeed, timeRange }
      const selected = feeds.filter((f) => f.enabled)
      const filtered = filterArticles(selected, config)
      setDigestFeeds(filtered)
      setIsGenerating(false)
    }, 600)
  }

  async function handleCopyHTML() {
    if (!digestFeeds) return
    const config: DigestConfig = { title, subtitle, articlesPerFeed, timeRange }
    const html = generateDigestHTML(config, digestFeeds)
    const copied = await copyText(html)
    showToast(copied ? 'HTML copied to clipboard!' : 'Unable to copy. Check clipboard permissions.')
  }

  async function handleCopyMarkdown() {
    if (!digestFeeds) return
    const config: DigestConfig = { title, subtitle, articlesPerFeed, timeRange }
    const md = generateDigestMarkdown(config, digestFeeds)
    const copied = await copyText(md)
    showToast(copied ? 'Markdown copied to clipboard!' : 'Unable to copy. Check clipboard permissions.')
  }

  function handleDownloadHTML() {
    if (!digestFeeds) return
    const config: DigestConfig = { title, subtitle, articlesPerFeed, timeRange }
    const html = generateDigestHTML(config, digestFeeds)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
    showToast('HTML file downloaded!')
  }

  function handleRegenerate() {
    setDigestFeeds(null)
    setTimeout(handleGenerate, 50)
  }

  const totalEnabledArticles = enabledFeeds.reduce(
    (sum, f) => sum + Math.min(f.articles.length, articlesPerFeed),
    0
  )

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✉</div>
            <span className="sidebar-logo-text">Newsletter Digest</span>
          </div>
          <div className="sidebar-tagline">RSS feeds → beautiful digests</div>
        </div>

        <div className="sidebar-body">
          {/* Newsletter title */}
          <div className="sidebar-section">
            <div className="sidebar-label">Newsletter Title</div>
            <input
              className="sidebar-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Tech Digest"
            />
          </div>

          {/* Subtitle / byline */}
          <div className="sidebar-section">
            <div className="sidebar-label">Subtitle / Byline</div>
            <input
              className="sidebar-input"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. by Your Name"
            />
          </div>

          {/* RSS Sources */}
          <div className="sidebar-section">
            <div className="sidebar-label">
              RSS Sources ({enabledFeeds.length}/{feeds.length} active
              {feeds.length > FREE_FEED_LIMIT ? '' : `, ${FREE_FEED_LIMIT - feeds.length} free slots left`})
            </div>
            <div className="feed-list">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`feed-item ${feed.enabled ? 'active' : ''}`}
                  onClick={() => handleToggleFeed(feed.id)}
                >
                  <div className="feed-item-info">
                    <div className="feed-item-name">{feed.name}</div>
                    <div className="feed-item-url">{feed.url}</div>
                    <div className="feed-item-simulated">
                      {feed.id.startsWith('custom-') ? '⚡ Simulated feed' : '✓ Demo feed'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="feed-item-badge">
                      {Math.min(feed.articles.length, articlesPerFeed)} art.
                    </span>
                    <button
                      className="feed-delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFeed(feed.id) }}
                      title="Remove feed"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add feed */}
            <div className="add-feed-row">
              <input
                className="add-feed-input"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="https://example.com/feed.rss"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeed()}
              />
              <button className="add-feed-btn" onClick={handleAddFeed}>
                + Add
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-muted)', marginTop: 2 }}>
              Note: CORS prevents live fetching. Feeds use simulated data.
            </div>
          </div>

          {/* Articles per feed */}
          <div className="sidebar-section">
            <div className="sidebar-label">Articles per Source</div>
            <div className="articles-row">
              <label>Show top articles from each feed</label>
              <select
                className="articles-select"
                value={articlesPerFeed}
                onChange={(e) => setArticlesPerFeed(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time range */}
          <div className="sidebar-section">
            <div className="sidebar-label">Time Range</div>
            <div className="time-range-group">
              {(['24h', '48h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  className={`time-btn ${timeRange === r ? 'active' : ''}`}
                  onClick={() => setTimeRange(r)}
                >
                  {r === '24h' ? 'Last 24h' : r === '48h' ? 'Last 48h' : 'Last 7 days'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || enabledFeeds.length === 0}
          >
            {isGenerating ? '⏳ Generating…' : `✨ Generate Digest (${totalEnabledArticles} articles)`}
          </button>

          {/* Pro upsell */}
          {feeds.length >= FREE_FEED_LIMIT && (
            <div className="pro-banner">
              <div className="pro-banner-title">🚀 Upgrade to Pro</div>
              <div className="pro-banner-desc">
                Add unlimited RSS sources, custom branding, and scheduled delivery.
              </div>
              <button className="pro-banner-btn" onClick={() => showToast('Pro plan coming soon!')}>
                Get Pro — $12/mo
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {/* Toolbar */}
        <div className="main-toolbar">
          <span className="toolbar-title">
            {digestFeeds
              ? `Preview: ${title}`
              : 'Configure your digest on the left, then hit Generate'}
          </span>
          {digestFeeds && (
            <div className="toolbar-actions">
              <button className="toolbar-btn" onClick={handleCopyMarkdown}>
                📋 Copy Markdown
              </button>
              <button className="toolbar-btn" onClick={handleCopyHTML}>
                📋 Copy HTML
              </button>
              <button className="toolbar-btn" onClick={handleDownloadHTML}>
                ⬇ Download HTML
              </button>
              <button className="toolbar-btn primary" onClick={handleRegenerate}>
                ↺ Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Preview area */}
        <div className="preview-area">
          {!digestFeeds ? (
            <div className="empty-state">
              <div className="empty-state-icon">✉️</div>
              <div className="empty-state-title">Your digest preview will appear here</div>
              <div className="empty-state-desc">
                Select your RSS sources on the left, configure the settings, then click
                &ldquo;Generate Digest&rdquo; to create a ready-to-send newsletter.
              </div>
            </div>
          ) : (
            <div className="email-preview">
              {/* Email header */}
              <div className="email-header">
                <div className="email-header-title">{title}</div>
                <div className="email-header-subtitle">{subtitle}</div>
                <div className="email-header-date">{formatDate(new Date())}</div>
              </div>

              {/* Email body */}
              <div className="email-body">
                <p className="email-intro">
                  Here&apos;s your curated digest of the latest stories. Handpicked from{' '}
                  {digestFeeds.length} source{digestFeeds.length !== 1 ? 's' : ''} for you.
                </p>

                {digestFeeds.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                    No articles found in the selected time range. Try widening the range.
                  </div>
                ) : (
                  digestFeeds.map((feed) => (
                    <div key={feed.id} className="email-section">
                      <div className="email-section-header">
                        <div className="email-section-dot" />
                        <div className="email-section-title">{feed.name}</div>
                      </div>
                      {feed.articles.map((article) => (
                        <div key={article.id} className="article-card">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="article-title"
                          >
                            {article.title}
                          </a>
                          <p className="article-summary">{article.summary}</p>
                          <div className="article-meta">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="article-read-more"
                            >
                              Read more →
                            </a>
                            <span className="article-date">
                              {formatRelativeTime(article.publishedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Email footer */}
              <div className="email-footer">
                <p>You&apos;re receiving this because you subscribed to {title}.</p>
                <p>
                  <a href="#">Unsubscribe</a>
                  {' · '}
                  <a href="#">View in browser</a>
                  {' · '}
                  <a href="#">Manage preferences</a>
                </p>
                <p style={{ fontSize: 10, color: '#d4d4d8', marginTop: 8 }}>
                  © {new Date().getFullYear()} {title}. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
