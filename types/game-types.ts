export type GameStatus = "menu" | "playing" | "shop" | "gameOver"

export interface PlayerData {
  money: number
  highScore: number
  upgrades: {
    engine: number
    tires: number
    handling: number
  }
  carColor: string
}

export interface CarStats {
  maxSpeed: number
  acceleration: number
  handling: number
  driftFactor: number
}

export interface TrafficCarData {
  x: number
  y: number
  speed: number
  direction: number
  sprite: string
}

export interface CollectibleType {
  type: "coin" | "boost" | "multiplier"
  value: number
  duration?: number
}

