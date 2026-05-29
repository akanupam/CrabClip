import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "CrabClip - Secure Online Clipboard",
  description: "Seamless paste sharing with OTP protection",
  icons: {
    icon: "/crab-mascot.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen font-sans bg-zinc-950 text-zinc-100 transition-colors duration-500">{children}</body>
    </html>
  )
}
