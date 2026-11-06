import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoice Generator — Free Professional Invoices',
  description: 'Create professional invoices instantly. No signup required. Generate PDF-ready invoices for free.',
  keywords: 'invoice generator, free invoice, freelancer invoice, pdf invoice',
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
