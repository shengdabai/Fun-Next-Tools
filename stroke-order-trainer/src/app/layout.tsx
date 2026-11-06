import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '汉字笔顺练习器 | Chinese Stroke Order Trainer',
  description: 'Practice Chinese character stroke order with animated guides and four-layer translation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
