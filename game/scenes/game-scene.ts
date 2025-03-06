import Phaser from "phaser"
import { CarController } from "../objects/car-controller"
import { CityMap } from "../objects/city-map"
import { TrafficSystem } from "../objects/traffic-system"
import { CollectiblesSystem } from "../objects/collectibles-system"
import type { GameStatus } from "@/types/game-types"

interface GameSceneData {
  setScore: (score: number) => void
  setTime: (time: number) => void
  setGameStatus: (status: GameStatus) => void
}

export class GameScene extends Phaser.Scene {
  private car!: CarController
  private cityMap!: CityMap
  private trafficSystem!: TrafficSystem
  private collectiblesSystem!: CollectiblesSystem
  private score = 0
  private startTime = 0
  private setScoreCallback!: (score: number) => void
  private setTimeCallback!: (time: number) => void
  private setGameStatusCallback!: (status: GameStatus) => void
  private gameTime = 0
  private lastUpdateTime = 0

  constructor() {
    super({ key: "GameScene" })
  }

  init(data: GameSceneData) {
    this.setScoreCallback = data.setScore
    this.setTimeCallback = data.setTime
    this.setGameStatusCallback = data.setGameStatus
  }

  preload() {
    // Load game assets
    this.load.image("car", "/assets/car.png")
    this.load.image("traffic1", "/assets/traffic1.png")
    this.load.image("traffic2", "/assets/traffic2.png")
    this.load.image("traffic3", "/assets/traffic3.png")
    this.load.image("road", "/assets/road.png")
    this.load.image("building1", "/assets/building1.png")
    this.load.image("building2", "/assets/building2.png")
    this.load.image("building3", "/assets/building3.png")
    this.load.image("coin", "/assets/coin.png")
    this.load.image("boost", "/assets/boost.png")
    this.load.image("multiplier", "/assets/multiplier.png")
    this.load.spritesheet("smoke", "/assets/smoke.png", {
      frameWidth: 32,
      frameHeight: 32,
    })

    // Load audio
    this.load.audio("engine", "/assets/sounds/engine.mp3")
    this.load.audio("drift", "/assets/sounds/drift.mp3")
    this.load.audio("coin_pickup", "/assets/sounds/coin_pickup.mp3")
    this.load.audio("crash", "/assets/sounds/crash.mp3")
  }

  create() {
    this.setGameStatusCallback("playing")
    this.score = 0
    this.startTime = this.time.now
    this.lastUpdateTime = this.time.now

    // Create city map
    this.cityMap = new CityMap(this)

    // Create player car
    this.car = new CarController(this, this.cameras.main.width / 2, this.cameras.main.height / 2)

    // Create traffic system
    this.trafficSystem = new TrafficSystem(this)

    // Create collectibles system
    this.collectiblesSystem = new CollectiblesSystem(this)

    // Set up camera to follow the car
    this.cameras.main.startFollow(this.car.getSprite(), true, 0.1, 0.1)
    this.cameras.main.setZoom(0.8)

    // Set up collisions
    this.physics.add.collider(
      this.car.getSprite(),
      this.trafficSystem.getGroup(),
      this.handleCollision,
      undefined,
      this,
    )

    // Set up collectible overlaps
    this.physics.add.overlap(
      this.car.getSprite(),
      this.collectiblesSystem.getGroup(),
      this.handleCollectible,
      undefined,
      this,
    )

    // Set up mobile controls
    this.setupMobileControls()
  }

  update(time: number, delta: number) {
    // Update game time
    this.gameTime = time - this.startTime

    // Update UI every 100ms to avoid excessive React renders
    if (time - this.lastUpdateTime > 100) {
      this.setScoreCallback(this.score)
      this.setTimeCallback(this.gameTime)
      this.lastUpdateTime = time
    }

    // Update game objects
    this.car.update(delta)
    this.trafficSystem.update(delta)
    this.collectiblesSystem.update(delta)

    // Check if car is drifting and add points
    if (this.car.isDrifting()) {
      // Add points based on drift angle and speed
      const driftPoints = Math.floor((this.car.getDriftFactor() * this.car.getSpeed()) / 10)
      this.score += driftPoints

      // Show drift score popup
      if (driftPoints > 0 && time % 5 === 0) {
        this.showScorePopup(driftPoints)
      }
    }
  }

  private handleCollision(carObj: Phaser.GameObjects.GameObject, trafficObj: Phaser.GameObjects.GameObject) {
    // Play crash sound
    this.sound.play("crash", { volume: 0.5 })

    // Apply penalty
    this.score = Math.max(0, this.score - 500)

    // Show penalty popup
    this.showScorePopup(-500, 0xff0000)

    // Camera shake effect
    this.cameras.main.shake(200, 0.01)
  }

  private handleCollectible(carObj: Phaser.GameObjects.GameObject, collectibleObj: Phaser.GameObjects.GameObject) {
    const collectible = collectibleObj as Phaser.Physics.Arcade.Sprite
    const collectibleType = collectible.getData("type")
    const collectibleValue = collectible.getData("value")

    // Play pickup sound
    this.sound.play("coin_pickup", { volume: 0.5 })

    // Apply collectible effect
    switch (collectibleType) {
      case "coin":
        this.score += collectibleValue
        this.showScorePopup(collectibleValue)
        break
      case "boost":
        this.car.applyBoost(collectibleValue, 3000) // 3 seconds boost
        break
      case "multiplier":
        // TODO: Implement score multiplier
        break
    }

    // Remove the collectible
    collectible.destroy()
  }

  private showScorePopup(points: number, color = 0xffff00) {
    const x = this.car.getSprite().x
    const y = this.car.getSprite().y - 50

    const text = this.add
      .text(x, y, points > 0 ? `+${points}` : `${points}`, {
        fontSize: "24px",
        color: points > 0 ? "#ffff00" : "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy()
      },
    })
  }

  private setupMobileControls() {
    // Get mobile control buttons from DOM
    const leftBtn = document.getElementById("left-btn")
    const rightBtn = document.getElementById("right-btn")
    const accelBtn = document.getElementById("accel-btn")
    const brakeBtn = document.getElementById("brake-btn")

    if (leftBtn && rightBtn && accelBtn && brakeBtn) {
      // Left button
      leftBtn.addEventListener("touchstart", () => {
        this.car.setSteeringInput(-1)
      })
      leftBtn.addEventListener("touchend", () => {
        this.car.setSteeringInput(0)
      })

      // Right button
      rightBtn.addEventListener("touchstart", () => {
        this.car.setSteeringInput(1)
      })
      rightBtn.addEventListener("touchend", () => {
        this.car.setSteeringInput(0)
      })

      // Accelerate button
      accelBtn.addEventListener("touchstart", () => {
        this.car.setThrottleInput(1)
      })
      accelBtn.addEventListener("touchend", () => {
        this.car.setThrottleInput(0)
      })

      // Brake button
      brakeBtn.addEventListener("touchstart", () => {
        this.car.setBrakeInput(1)
        // Enable drift when braking
        this.car.setDriftInput(1)
      })
      brakeBtn.addEventListener("touchend", () => {
        this.car.setBrakeInput(0)
        this.car.setDriftInput(0)
      })
    }
  }
}

