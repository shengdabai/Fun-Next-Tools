import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '声调闯关 | Tone Trainer',
  description: 'Master Mandarin tones with daily challenges and streak tracking',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
