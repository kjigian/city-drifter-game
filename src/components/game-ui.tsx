import type { GameStatus } from "@/types/game-types"
import { formatTime } from "@/utils/format-time"
import { Gamepad2 } from "lucide-react"

interface GameUIProps {
  score: number
  time: number
  gameStatus: GameStatus
}

export function GameUI({ score, time, gameStatus }: GameUIProps) {
  if (gameStatus !== "playing") return null

  return (
    <div className="pointer-events-none absolute inset-0 p-4">
      {/* Top HUD */}
      <div className="flex justify-between">
        <div className="rounded-lg bg-black/70 p-2 text-xl font-bold text-yellow-400">
          SCORE: {score.toLocaleString()}
        </div>
        <div className="rounded-lg bg-black/70 p-2 text-xl font-bold text-yellow-400">TIME: {formatTime(time)}</div>
      </div>

      {/* Mobile controls - only shown on touch devices */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden">
        <div className="pointer-events-auto flex gap-2">
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white"
            id="left-btn"
          >
            ←
          </button>
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white"
            id="right-btn"
          >
            →
          </button>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white"
            id="brake-btn"
          >
            ↓
          </button>
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600/70 text-white"
            id="accel-btn"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Controls guide */}
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 transform rounded-lg bg-black/70 p-2 text-white md:block">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          <span>Arrow keys to drive | Hold SHIFT while turning to drift</span>
        </div>
      </div>
    </div>
  )
}

