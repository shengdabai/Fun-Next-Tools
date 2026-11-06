import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resume Scorer — Get Your Resume Rated Instantly',
  description: 'Paste your resume and get an instant AI-powered score with actionable improvement tips. Free, no signup required.',
  keywords: 'resume scorer, resume rating, CV analyzer, resume feedback, job application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
