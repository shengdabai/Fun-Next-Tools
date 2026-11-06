import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HSK 词汇星图 | Vocab Starmap',
  description: 'Visualize your Chinese vocabulary as a constellation map',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
