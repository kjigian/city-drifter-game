import Phaser from "phaser"
import type { GameStatus, PlayerData } from "@/types/game-types"
import { getPlayerData, savePlayerData } from "../utils/player-data"

interface ShopSceneData {
  setGameStatus: (status: GameStatus) => void
}

export class ShopScene extends Phaser.Scene {
  private setGameStatus!: (status: GameStatus) => void
  private playerData!: PlayerData
  private moneyText!: Phaser.GameObjects.Text
  private upgradeButtons: { [key: string]: Phaser.GameObjects.Text } = {}
  private carPreview!: Phaser.GameObjects.Sprite
  private colorButtons: Phaser.GameObjects.Text[] = []

  constructor() {
    super({ key: "ShopScene" })
  }

  init(data: ShopSceneData) {
    this.setGameStatus = data.setGameStatus
  }

  preload() {
    this.load.image("shop_bg", "/assets/shop_background.png")
    this.load.image("car_preview", "/assets/car.png")
  }

  create() {
    this.setGameStatus("shop")
    this.playerData = getPlayerData()

    // Add background
    this.add
      .image(this.cameras.main.width / 2, this.cameras.main.height / 2, "shop_bg")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)

    // Add shop title
    this.add
      .text(this.cameras.main.width / 2, 50, "UPGRADE SHOP", {
        fontSize: "40px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Add money display
    this.moneyText = this.add
      .text(this.cameras.main.width / 2, 100, `CASH: $${this.playerData.money}`, {
        fontSize: "32px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Add car preview
    this.carPreview = this.add
      .sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, "car_preview")
      .setScale(0.3)

    // Tint car with selected color
    this.updateCarColor()

    // Create upgrade sections
    this.createUpgradeSection(
      "ENGINE",
      "Increases top speed and acceleration",
      this.cameras.main.width / 2 - 250,
      this.cameras.main.height / 2 + 100,
      "engine",
    )

    this.createUpgradeSection(
      "TIRES",
      "Improves grip and drift control",
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      "tires",
    )

    this.createUpgradeSection(
      "HANDLING",
      "Better steering response and stability",
      this.cameras.main.width / 2 + 250,
      this.cameras.main.height / 2 + 100,
      "handling",
    )

    // Create color selection
    this.createColorSelection()

    // Add back button
    const backButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height - 50, "BACK TO MENU", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#ff3300",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    backButton.on("pointerover", () => {
      backButton.setScale(1.1)
    })

    backButton.on("pointerout", () => {
      backButton.setScale(1)
    })

    backButton.on("pointerdown", () => {
      this.scene.start("MenuScene")
    })
  }

  private createUpgradeSection(title: string, description: string, x: number, y: number, upgradeType: string) {
    // Add title
    this.add
      .text(x, y - 60, title, {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    // Add description
    this.add
      .text(x, y - 30, description, {
        fontSize: "14px",
        color: "#cccccc",
        stroke: "#000000",
        strokeThickness: 2,
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5)

    // Add level indicator
    const level = this.playerData.upgrades[upgradeType as keyof typeof this.playerData.upgrades]
    this.add
      .text(x, y, `Level: ${level}/5`, {
        fontSize: "18px",
        color: "#ffff00",
      })
      .setOrigin(0.5)

    // Add upgrade button
    const cost = this.getUpgradeCost(upgradeType)
    const buttonText = level >= 5 ? "MAXED" : `UPGRADE ($${cost})`
    const buttonColor = level >= 5 ? "#666666" : cost <= this.playerData.money ? "#00cc00" : "#cc0000"

    const upgradeButton = this.add
      .text(x, y + 30, buttonText, {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: buttonColor,
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)

    if (level < 5 && cost <= this.playerData.money) {
      upgradeButton.setInteractive({ useHandCursor: true })

      upgradeButton.on("pointerover", () => {
        upgradeButton.setScale(1.1)
      })

      upgradeButton.on("pointerout", () => {
        upgradeButton.setScale(1)
      })

      upgradeButton.on("pointerdown", () => {
        this.purchaseUpgrade(upgradeType)
      })
    }

    this.upgradeButtons[upgradeType] = upgradeButton
  }

  private createColorSelection() {
    const colors = [
      { name: "RED", value: 0xff0000 },
      { name: "BLUE", value: 0x0000ff },
      { name: "GREEN", value: 0x00ff00 },
      { name: "YELLOW", value: 0xffff00 },
      { name: "PURPLE", value: 0x800080 },
    ]

    this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 150, "CAR COLOR", {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    // Create color buttons
    const buttonWidth = 80
    const totalWidth = colors.length * buttonWidth
    const startX = this.cameras.main.width / 2 - totalWidth / 2 + buttonWidth / 2

    colors.forEach((color, index) => {
      const x = startX + index * buttonWidth
      const y = this.cameras.main.height / 2 - 120

      const colorButton = this.add
        .text(x, y, color.name, {
          fontSize: "14px",
          color: "#ffffff",
          backgroundColor: `#${color.value.toString(16).padStart(6, "0")}`,
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)

      // Highlight selected color
      if (this.playerData.carColor === color.value.toString(16).padStart(6, "0")) {
        colorButton.setStyle({ stroke: "#ffffff", strokeThickness: 4 })
      }

      colorButton.setInteractive({ useHandCursor: true })

      colorButton.on("pointerover", () => {
        colorButton.setScale(1.1)
      })

      colorButton.on("pointerout", () => {
        colorButton.setScale(1)
      })

      colorButton.on("pointerdown", () => {
        this.selectCarColor(color.value.toString(16).padStart(6, "0"))
      })

      this.colorButtons.push(colorButton)
    })
  }

  private getUpgradeCost(upgradeType: string): number {
    const level = this.playerData.upgrades[upgradeType as keyof typeof this.playerData.upgrades]
    // Base cost is 500, doubles with each level
    return level >= 5 ? Number.POSITIVE_INFINITY : 500 * Math.pow(2, level)
  }

  private purchaseUpgrade(upgradeType: string) {
    const cost = this.getUpgradeCost(upgradeType)

    if (cost <= this.playerData.money) {
      // Update player data
      this.playerData.money -= cost
      this.playerData.upgrades[upgradeType as keyof typeof this.playerData.upgrades]++

      // Save player data
      savePlayerData(this.playerData)

      // Update UI
      this.moneyText.setText(`CASH: $${this.playerData.money}`)

      // Refresh upgrade sections
      this.scene.restart()
    }
  }

  private selectCarColor(colorHex: string) {
    // Update player data
    this.playerData.carColor = colorHex

    // Save player data
    savePlayerData(this.playerData)

    // Update car preview
    this.updateCarColor()

    // Update color buttons
    this.colorButtons.forEach((button) => {
      button.setStyle({ stroke: null, strokeThickness: 0 })

      const buttonColorHex = button.style.backgroundColor?.substring(1)
      if (buttonColorHex === this.playerData.carColor) {
        button.setStyle({ stroke: "#ffffff", strokeThickness: 4 })
      }
    })
  }

  private updateCarColor() {
    if (this.carPreview) {
      this.carPreview.setTint(Number.parseInt(this.playerData.carColor, 16))
    }
  }
}

