"use client"

import { createContext, useContext, useState, ReactNode } from "react"

// Define the type for the game state
type GameStatus = "menu" | "playing" | "paused" | "shop" | "gameOver"

interface GameState {
  score: number
  setScore: (score: number) => void
  time: number 
  setTime: (time: number) => void
  gameStatus: GameStatus
  setGameStatus: (status: GameStatus) => void
}

// Create the context
const GameStateContext = createContext<GameState | undefined>(undefined)

// Provider component
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu")

  return (
    <GameStateContext.Provider
      value={{
        score,
        setScore,
        time,
        setTime,
        gameStatus,
        setGameStatus,
      }}
    >
      {children}
    </GameStateContext.Provider>
  )
}

// Hook to use the game state
export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider")
  }
  return context
}

