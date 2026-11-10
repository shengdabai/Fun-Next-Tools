'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { generateHTML, downloadHTML } from '@/lib/export'
import { parseProfile } from '@/lib/profile'
import { copyText } from '@/lib/clipboard'
import type { LinkItem, Profile } from '@/lib/export'

// ── Types ────────────────────────────────────────────────────────────────────

type ThemeName = 'Minimal' | 'Dark' | 'Purple' | 'Ocean' | 'Sunset' | 'Forest'
type BtnRadius = 'rounded' | 'square' | 'pill'

interface ThemeConfig {
  bg: string
  text: string
  btn: string
  btnText: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const THEMES: Record<ThemeName, ThemeConfig> = {
  Minimal: { bg: '#ffffff', text: '#1a1a1a', btn: '#1a1a1a', btnText: '#ffffff' },
  Dark:    { bg: '#1a1a2e', text: '#e0e0e0', btn: '#6366f1', btnText: '#ffffff' },
  Purple:  { bg: '#6366f1', text: '#ffffff', btn: '#ffffff', btnText: '#6366f1' },
  Ocean:   { bg: '#0ea5e9', text: '#ffffff', btn: '#0c4a6e', btnText: '#ffffff' },
  Sunset:  { bg: '#f97316', text: '#ffffff', btn: '#7c2d12', btnText: '#ffffff' },
  Forest:  { bg: '#16a34a', text: '#ffffff', btn: '#14532d', btnText: '#ffffff' },
}

const THEME_NAMES = Object.keys(THEMES) as ThemeName[]

const DEFAULT_LINKS: LinkItem[] = [
  { id: '1', icon: '▶️', title: 'YouTube Channel',      url: 'https://youtube.com' },
  { id: '2', icon: '🐦', title: 'Twitter / X',           url: 'https://twitter.com' },
  { id: '3', icon: '🌐', title: 'Portfolio Website',     url: 'https://example.com' },
  { id: '4', icon: '📧', title: 'Newsletter',             url: 'https://substack.com' },
  { id: '5', icon: '☕', title: 'Buy Me A Coffee',        url: 'https://buymeacoffee.com' },
]

const DEFAULT_PROFILE: Profile = {
  name: 'Alex Johnson',
  bio: 'Creator & Developer',
  avatarUrl: '',
  links: DEFAULT_LINKS,
  theme: THEMES['Dark'],
  btnRadius: 'rounded',
  footerText: '© 2024 Alex Johnson',
}

const STORAGE_KEY = 'link-in-bio-profile'

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

function getBtnRadius(style: BtnRadius): string {
  switch (style) {
    case 'square': return '4px'
    case 'pill':   return '9999px'
    default:       return '12px'
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarCircle({ avatarUrl, name, bg, color }: {
  avatarUrl: string; name: string; bg: string; color: string
}) {
  if (avatarUrl) {
    return (
      <div className="profile-avatar" style={{ background: bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} />
      </div>
    )
  }
  return (
    <div className="profile-avatar" style={{ background: bg, color }}>
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

function PhonePreview({ profile }: { profile: Profile }) {
  const { name, bio, avatarUrl, links, theme, btnRadius, footerText } = profile
  const radius = getBtnRadius(btnRadius)

  return (
    <div
      className="profile-page"
      style={{ background: theme.bg, color: theme.text }}
    >
      <AvatarCircle
        avatarUrl={avatarUrl}
        name={name}
        bg={theme.btn}
        color={theme.btnText}
      />
      <div className="profile-name" style={{ color: theme.text }}>
        {name || 'Your Name'}
      </div>
      {bio && (
        <div className="profile-bio" style={{ color: theme.text }}>
          {bio}
        </div>
      )}
      <div className="profile-links">
        {links.map((link) => (
          <button
            key={link.id}
            className="profile-link-btn"
            style={{
              background: theme.btn,
              color: theme.btnText,
              borderRadius: radius,
              border: 'none',
            }}
          >
            {link.icon && <span style={{ fontSize: 16 }}>{link.icon}</span>}
            <span>{link.title || 'Untitled'}</span>
          </button>
        ))}
      </div>
      {footerText && (
        <div className="profile-footer" style={{ color: theme.text }}>
          {footerText}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [activeTheme, setActiveTheme] = useState<ThemeName>('Dark')
  const [copied, setCopied] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const savedProfile = useRef<Profile>(DEFAULT_PROFILE)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const parsed = parseProfile(localStorage.getItem(STORAGE_KEY))
      if (parsed) {
        savedProfile.current = parsed
        setProfile(parsed)
        // Try to detect active theme
        const match = THEME_NAMES.find(
          (t) => THEMES[t].bg === parsed.theme.bg && THEMES[t].btn === parsed.theme.btn
        )
        if (match) setActiveTheme(match)
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (!hydrated || profile === savedProfile.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      savedProfile.current = profile
    } catch {
      // ignore
    }
  }, [profile, hydrated])

  // ── Updaters ──────────────────────────────────────────────────────────────

  const update = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }))
  }, [])

  const updateThemeColor = useCallback((key: keyof ThemeConfig, value: string) => {
    setProfile((p) => ({ ...p, theme: { ...p.theme, [key]: value } }))
    setActiveTheme('' as ThemeName) // deselect preset when custom
  }, [])

  const applyPreset = useCallback((name: ThemeName) => {
    setActiveTheme(name)
    setProfile((p) => ({ ...p, theme: THEMES[name] }))
  }, [])

  const addLink = useCallback(() => {
    setProfile((p) => ({
      ...p,
      links: [...p.links, { id: uid(), icon: '🔗', title: '', url: '' }],
    }))
  }, [])

  const removeLink = useCallback((id: string) => {
    setProfile((p) => ({ ...p, links: p.links.filter((l) => l.id !== id) }))
  }, [])

  const updateLink = useCallback((id: string, field: keyof LinkItem, value: string) => {
    setProfile((p) => ({
      ...p,
      links: p.links.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }))
  }, [])

  const moveLink = useCallback((id: string, direction: 'up' | 'down') => {
    setProfile((p) => {
      const idx = p.links.findIndex((l) => l.id === id)
      if (idx === -1) return p
      const newLinks = [...p.links]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= newLinks.length) return p
      ;[newLinks[idx], newLinks[swapIdx]] = [newLinks[swapIdx], newLinks[idx]]
      return { ...p, links: newLinks }
    })
  }, [])

  // ── Export handlers ───────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    downloadHTML(profile)
  }, [profile])

  const handleCopy = useCallback(async () => {
    const html = generateHTML(profile)
    if (await copyText(html)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [profile])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="topbar">
        <span className="topbar-logo">⚡ Link In Bio</span>
        <div className="topbar-actions">
          <button className="btn btn-copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy HTML'}
          </button>
          <button className="btn btn-export" onClick={handleDownload}>
            ⬇️ Download HTML
          </button>
        </div>
      </header>

      <div className="main">
        {/* ── Editor Panel ── */}
        <aside className="editor-panel">

          {/* Profile Info */}
          <section>
            <div className="section-title">Profile</div>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={profile.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Bio</label>
              <input
                type="text"
                placeholder="Short description…"
                value={profile.bio}
                onChange={(e) => update('bio', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Avatar URL (optional)</label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={profile.avatarUrl}
                onChange={(e) => update('avatarUrl', e.target.value)}
              />
            </div>
          </section>

          <div className="divider" />

          {/* Links */}
          <section>
            <div className="section-title">Links</div>
            <div className="links-list">
              {profile.links.map((link, idx) => (
                <div key={link.id} className="link-item">
                  <div className="link-item-row">
                    <input
                      type="text"
                      className="icon-input"
                      value={link.icon}
                      onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                      placeholder="🔗"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                      placeholder="Link title"
                    />
                    <button
                      className="btn-icon"
                      onClick={() => moveLink(link.id, 'up')}
                      disabled={idx === 0}
                      title="Move up"
                    >↑</button>
                    <button
                      className="btn-icon"
                      onClick={() => moveLink(link.id, 'down')}
                      disabled={idx === profile.links.length - 1}
                      title="Move down"
                    >↓</button>
                    <button
                      className="btn-icon danger"
                      onClick={() => removeLink(link.id)}
                      title="Remove"
                    >✕</button>
                  </div>
                  <div className="link-item-row">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={addLink}>
              + Add Link
            </button>
          </section>

          <div className="divider" />

          {/* Theme Presets */}
          <section>
            <div className="section-title">Theme</div>
            <div className="theme-grid">
              {THEME_NAMES.map((name) => (
                <button
                  key={name}
                  className={`theme-chip ${activeTheme === name ? 'active' : ''}`}
                  style={{
                    background: THEMES[name].bg,
                    color: THEMES[name].text,
                    border: activeTheme === name
                      ? '2px solid #6366f1'
                      : `2px solid ${THEMES[name].bg === '#ffffff' ? '#e5e7eb' : THEMES[name].bg}`,
                  }}
                  onClick={() => applyPreset(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* Custom Colors */}
          <section>
            <div className="section-title">Custom Colors</div>
            {(
              [
                ['bg', 'Background'],
                ['text', 'Text'],
                ['btn', 'Button'],
                ['btnText', 'Button Text'],
              ] as [keyof ThemeConfig, string][]
            ).map(([key, label]) => (
              <div key={key} className="color-row" style={{ marginBottom: 8 }}>
                <label>{label}</label>
                <input
                  type="color"
                  value={profile.theme[key]}
                  onChange={(e) => updateThemeColor(key, e.target.value)}
                />
              </div>
            ))}
          </section>

          <div className="divider" />

          {/* Button Style */}
          <section>
            <div className="section-title">Button Style</div>
            <div className="btn-style-row">
              {(['rounded', 'square', 'pill'] as BtnRadius[]).map((style) => (
                <button
                  key={style}
                  className={`btn-style-opt ${profile.btnRadius === style ? 'active' : ''}`}
                  onClick={() => update('btnRadius', style)}
                >
                  {style === 'rounded' ? '⬜ Rounded' : style === 'square' ? '▪ Square' : '💊 Pill'}
                </button>
              ))}
            </div>
          </section>

          <div className="divider" />

          {/* Footer */}
          <section>
            <div className="section-title">Footer</div>
            <div className="field">
              <label>Copyright / footer text</label>
              <input
                type="text"
                placeholder="© 2024 Your Name"
                value={profile.footerText}
                onChange={(e) => update('footerText', e.target.value)}
              />
            </div>
          </section>

        </aside>

        {/* ── Preview Panel ── */}
        <main className="preview-panel">
          <span className="preview-label">Preview</span>
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              {hydrated && <PhonePreview profile={profile} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
