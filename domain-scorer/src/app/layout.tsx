import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Domain Scorer — Instant Domain Value Analysis',
  description:
    'Multi-dimensional domain name value scoring for investors, founders, and SEO professionals. Get instant length, memorability, TLD, SEO, and brand analysis.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
