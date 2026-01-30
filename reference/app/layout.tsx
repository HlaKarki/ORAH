import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ExplainBack - Master Any Topic',
  description: 'If you can\'t explain it, you don\'t understand it',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-white antialiased">
        {children}
      </body>
    </html>
  )
}
