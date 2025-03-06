import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GameStateProvider } from "@/hooks/use-game-state"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "City Drifter",
  description: "A top-down drift racing game",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameStateProvider>
          {children}
        </GameStateProvider>
      </body>
    </html>
  )
}

