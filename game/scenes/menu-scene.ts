import Phaser from "phaser"
import type { GameStatus } from "@/types/game-types"

interface MenuSceneData {
  setGameStatus: (status: GameStatus) => void
}

export class MenuScene extends Phaser.Scene {
  private setGameStatus!: (status: GameStatus) => void

  constructor() {
    super({ key: "MenuScene" })
  }

  init(data: MenuSceneData) {
    this.setGameStatus = data.setGameStatus
  }

  preload() {
    this.load.image("logo", "/assets/logo.png")
    this.load.image("car", "/assets/car.png")
    this.load.image("background", "/assets/city-background.png")
  }

  create() {
    this.setGameStatus("menu")

    // Add background
    this.add
      .image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)

    // Add logo
    const logo = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 3, "logo").setScale(0.5)

    // Add start button
    const startButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "START GAME", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#ff9900",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    // Add shop button
    const shopButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, "SHOP", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#3366ff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    // Button hover effects
    ;[startButton, shopButton].forEach((button) => {
      button.on("pointerover", () => {
        button.setScale(1.1)
      })

      button.on("pointerout", () => {
        button.setScale(1)
      })
    })

    // Button click handlers
    startButton.on("pointerdown", () => {
      this.scene.start("GameScene")
    })

    shopButton.on("pointerdown", () => {
      this.scene.start("ShopScene")
    })

    // Add animated car
    const car = this.add.sprite(-100, this.cameras.main.height - 100, "car").setScale(0.15)

    // Animate car driving across screen
    this.tweens.add({
      targets: car,
      x: this.cameras.main.width + 100,
      duration: 4000,
      ease: "Linear",
      repeat: -1,
      delay: 1000,
    })

    // Add version text
    this.add.text(10, this.cameras.main.height - 30, "v0.1.0", {
      fontSize: "16px",
      color: "#ffffff",
    })
  }
}

