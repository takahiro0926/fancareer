import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'カルチャーウォーク',
  description: 'シニアの「観たい」を「健康」に変える、歩いておでかけプラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-body min-h-screen bg-cw-bg text-cw-ink antialiased">
        {children}
      </body>
    </html>
  )
}
