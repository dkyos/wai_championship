import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WAi Championship',
  description: 'WAi 챗봇 활성화 전사 이벤트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
