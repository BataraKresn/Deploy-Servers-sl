import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Trigger Deploy",
  description: "Welcome to your deployment dashboard.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
