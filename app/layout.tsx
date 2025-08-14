import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { RealTimeProvider } from "@/components/real-time-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Zealot Hockey Draft",
  description: "The ultimate 4v4 hockey league management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
        <RealTimeProvider>
          <Navigation />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster />
        </RealTimeProvider>
      </body>
    </html>
  )
}
