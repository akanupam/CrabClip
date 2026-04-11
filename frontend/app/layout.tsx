import type { Metadata } from "next"
import "./globals.css"

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
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-4 bg-warm-cream">{children}</body>
    </html>
  )
}
