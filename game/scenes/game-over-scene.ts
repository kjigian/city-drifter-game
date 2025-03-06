import Phaser from "phaser"
import type { GameStatus } from "@/types/game-types"
import { getPlayerData, savePlayerData } from "../utils/player-data"

interface GameOverSceneData {
  setGameStatus: (status: GameStatus) => void
  score?: number
}

export class GameOverScene extends Phaser.Scene {
  private setGameStatus!: (status: GameStatus) => void
  private finalScore = 0

  constructor() {
    super({ key: "GameOverScene" })
  }

  init(data: GameOverSceneData) {
    this.setGameStatus = data.setGameStatus
    this.finalScore = data.score || 0

    // Update player data
    const playerData = getPlayerData()
    playerData.money += Math.floor(this.finalScore / 100) // Convert score to money

    // Update high score if needed
    if (this.finalScore > playerData.highScore) {
      playerData.highScore = this.finalScore
    }

    // Save updated player data
    savePlayerData(playerData)
  }

  create() {
    this.setGameStatus("gameOver")

    // Add background
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8,
    )

    // Add game over text
    this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 3, "GAME OVER", {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Add score text
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 50,
        `SCORE: ${this.finalScore.toLocaleString()}`,
        {
          fontSize: "48px",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)

    // Add money earned text
    const moneyEarned = Math.floor(this.finalScore / 100)
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 20,
        `CASH EARNED: $${moneyEarned.toLocaleString()}`,
        {
          fontSize: "32px",
          color: "#00ff00",
          stroke: "#000000",
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)

    // Add buttons
    const buttonY = this.cameras.main.height / 2 + 120
    const buttonSpacing = 200

    // Retry button
    const retryButton = this.add
      .text(this.cameras.main.width / 2 - buttonSpacing / 2, buttonY, "PLAY AGAIN", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#00cc00",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    // Menu button
    const menuButton = this.add
      .text(this.cameras.main.width / 2 + buttonSpacing / 2, buttonY, "MAIN MENU", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#3366ff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    // Button hover effects
    ;[retryButton, menuButton].forEach((button) => {
      button.on("pointerover", () => {
        button.setScale(1.1)
      })

      button.on("pointerout", () => {
        button.setScale(1)
      })
    })

    // Button click handlers
    retryButton.on("pointerdown", () => {
      this.scene.start("GameScene")
    })

    menuButton.on("pointerdown", () => {
      this.scene.start("MenuScene")
    })
  }
}

