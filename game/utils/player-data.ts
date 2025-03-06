import type { PlayerData } from "@/types/game-types"

// Default player data
const defaultPlayerData: PlayerData = {
  money: 0,
  highScore: 0,
  upgrades: {
    engine: 0,
    tires: 0,
    handling: 0,
  },
  carColor: "ff0000", // Red
}

// Get player data from localStorage
export function getPlayerData(): PlayerData {
  if (typeof window === "undefined") {
    return defaultPlayerData
  }

  try {
    const savedData = localStorage.getItem("cityDrifterPlayerData")

    if (savedData) {
      return JSON.parse(savedData) as PlayerData
    }
  } catch (error) {
    console.error("Error parsing player data:", error)
  }

  return defaultPlayerData
}

// Save player data to localStorage
export function savePlayerData(data: PlayerData): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem("cityDrifterPlayerData", JSON.stringify(data))
  } catch (error) {
    console.error("Error saving player data:", error)
  }
}

// Reset player data
export function resetPlayerData(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("cityDrifterPlayerData", JSON.stringify(defaultPlayerData))
}

