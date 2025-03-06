export type GameStatus = "menu" | "playing" | "paused" | "shop" | "gameOver"

export interface CarState {
  speed: number
  acceleration: number
  steering: number
  drifting: boolean
  driftFactor: number
}

export interface GameConfig {
  width: number
  height: number
  debug: boolean
} 