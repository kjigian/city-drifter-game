"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"

// Dynamically import the Game component with no SSR
const Game = dynamic(() => import("@/components/game"), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure we're running on the client before showing the game
    setIsClient(true)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      {isClient ? <Game /> : <LoadingScreen />}
    </main>
  )
}

