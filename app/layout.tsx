import type React from "react"

import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Super Mario AI Boardroom",
  description: "Mario-themed AI boardroom experience with ElevenLabs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
