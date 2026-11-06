import { escapeHtml, safeUrl, safeColor } from './export-safety'

export interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
}

export interface Profile {
  name: string
  bio: string
  avatarUrl: string
  links: LinkItem[]
  theme: {
    bg: string
    text: string
    btn: string
    btnText: string
  }
  btnRadius: 'rounded' | 'square' | 'pill'
  footerText: string
}

function getBtnRadius(style: Profile['btnRadius']): string {
  switch (style) {
    case 'square': return '4px'
    case 'pill':   return '9999px'
    default:       return '12px'
  }
}

export function generateHTML(profile: Profile): string {
  const { avatarUrl, links, btnRadius } = profile
  const name = escapeHtml(profile.name)
  const bio = escapeHtml(profile.bio)
  const footerText = escapeHtml(profile.footerText)
  const theme = {
    bg: safeColor(profile.theme.bg, '#ffffff'), text: safeColor(profile.theme.text, '#1a1a1a'),
    btn: safeColor(profile.theme.btn, '#1a1a1a'), btnText: safeColor(profile.theme.btnText, '#ffffff'),
  }
  const radius = getBtnRadius(btnRadius)

  const avatarContent = avatarUrl
    ? `<img src="${safeUrl(avatarUrl)}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`
    : `<span>${escapeHtml(profile.name.charAt(0).toUpperCase())}</span>`

  const linksHTML = links
    .map(
      (link) => `
      <a href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer" class="link-btn">
        ${link.icon ? `<span class="link-icon">${escapeHtml(link.icon)}</span>` : ''}
        <span>${escapeHtml(link.title)}</span>
      </a>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Link In Bio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      background-color: ${theme.bg};
      color: ${theme.text};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 16px 60px;
    }

    .container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 700;
      background-color: ${theme.btn};
      color: ${theme.btnText};
      border: 3px solid rgba(255,255,255,0.25);
      flex-shrink: 0;
    }

    .name {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: ${theme.text};
    }

    .bio {
      font-size: 14px;
      text-align: center;
      opacity: 0.75;
      line-height: 1.5;
      color: ${theme.text};
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      margin-top: 8px;
    }

    .link-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 15px 20px;
      background-color: ${theme.btn};
      color: ${theme.btnText};
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      border-radius: ${radius};
      transition: opacity 0.15s, transform 0.15s;
      width: 100%;
    }

    .link-btn:hover {
      opacity: 0.85;
      transform: translateY(-2px);
    }

    .link-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .footer {
      margin-top: 24px;
      font-size: 12px;
      opacity: 0.45;
      color: ${theme.text};
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar">${avatarContent}</div>
    <div class="name">${name}</div>
    ${bio ? `<div class="bio">${bio}</div>` : ''}
    <div class="links">
      ${linksHTML}
    </div>
    ${footerText ? `<div class="footer">${footerText}</div>` : ''}
  </div>
</body>
</html>`
}

export function downloadHTML(profile: Profile): void {
  const html = generateHTML(profile)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-links.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
