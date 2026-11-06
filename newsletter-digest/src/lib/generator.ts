import { escapeHtml, safeUrl } from './export-safety'
import type { Article, FeedSource } from './mockFeeds'

export interface DigestConfig {
  title: string
  subtitle: string
  articlesPerFeed: number
  timeRange: '24h' | '48h' | '7d'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTimeRangeMs(range: DigestConfig['timeRange']): number {
  switch (range) {
    case '24h': return 24 * 60 * 60 * 1000
    case '48h': return 48 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
  }
}

export function filterArticles(
  feeds: FeedSource[],
  config: DigestConfig
): FeedSource[] {
  const cutoff = new Date(Date.now() - getTimeRangeMs(config.timeRange))
  return feeds.map((feed) => ({
    ...feed,
    articles: feed.articles
      .filter((a) => a.publishedAt >= cutoff)
      .slice(0, config.articlesPerFeed),
  })).filter((feed) => feed.articles.length > 0)
}

export function generateDigestHTML(
  config: DigestConfig,
  feeds: FeedSource[]
): string {
  const date = formatDate(new Date())
  const safeTitle = escapeHtml(config.title || 'Weekly Digest')
  const safeSubtitle = escapeHtml(config.subtitle || 'Your curated newsletter')

  const sectionsHTML = feeds
    .map((feed) => {
      if (feed.articles.length === 0) return ''
      const articlesHTML = feed.articles
        .map(
          (article) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e4e4e7;">
            <a href="${safeUrl(article.url)}" style="
              font-size: 15px;
              font-weight: 700;
              color: #1d4ed8;
              text-decoration: none;
              display: block;
              margin-bottom: 6px;
              line-height: 1.4;
            ">${escapeHtml(article.title)}</a>
            <p style="
              font-size: 13px;
              color: #71717a;
              line-height: 1.6;
              margin: 0 0 8px 0;
            ">${escapeHtml(article.summary.slice(0, 200))}${article.summary.length > 200 ? '…' : ''}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="${safeUrl(article.url)}" style="
                    font-size: 12px;
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                  ">Read more →</a>
                </td>
                <td align="right" style="font-size: 11px; color: #a1a1aa;">
                  ${formatShortDate(article.publishedAt)}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
        )
        .join('')

      return `
      <!-- Feed section -->
      <tr>
        <td style="padding: 20px 0 4px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="
                padding-bottom: 12px;
                border-bottom: 2px solid #6366f1;
              ">
                <span style="
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: #6366f1;
                ">● ${escapeHtml(feed.name)}</span>
              </td>
            </tr>
            ${articlesHTML}
          </table>
        </td>
      </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: #6366f1; padding: 32px 40px; text-align: center;">
              <h1 style="
                margin: 0 0 4px 0;
                font-size: 26px;
                font-weight: 800;
                color: #ffffff;
                letter-spacing: -0.02em;
              ">${safeTitle}</h1>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.8);">${safeSubtitle}</p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.65);">${date}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #71717a; line-height: 1.6; border-bottom: 1px solid #e4e4e7; padding-bottom: 20px;">
                Here's your curated digest of the latest stories. Handpicked from ${feeds.length} source${feeds.length !== 1 ? 's' : ''} for you.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${sectionsHTML}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; border-top: 1px solid #e4e4e7; padding: 20px 40px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #a1a1aa;">
                You're receiving this because you subscribed to ${safeTitle}.
              </p>
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #6366f1; text-decoration: none;">View in browser</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #6366f1; text-decoration: none;">Manage preferences</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #d4d4d8;">
                © ${new Date().getFullYear()} ${safeTitle}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function generateDigestMarkdown(
  config: DigestConfig,
  feeds: FeedSource[]
): string {
  const date = formatDate(new Date())
  const safeTitle = config.title || 'Weekly Digest'
  const safeSubtitle = config.subtitle || 'Your curated newsletter'

  const lines: string[] = [
    `# ${safeTitle}`,
    ``,
    `> ${safeSubtitle}`,
    ``,
    `**${date}**`,
    ``,
    `---`,
    ``,
  ]

  for (const feed of feeds) {
    if (feed.articles.length === 0) continue
    lines.push(`## ${feed.name}`)
    lines.push(``)
    for (const article of feed.articles) {
      lines.push(`### [${article.title}](${article.url})`)
      lines.push(``)
      lines.push(article.summary)
      lines.push(``)
      lines.push(`*${formatShortDate(article.publishedAt)}* · [Read more →](${article.url})`)
      lines.push(``)
    }
    lines.push(`---`)
    lines.push(``)
  }

  lines.push(`*Generated by Newsletter Digest · [Unsubscribe](#)*`)

  return lines.join('\n')
}
