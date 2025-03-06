import Phaser from "phaser"
import type { TrafficCarData } from "@/types/game-types"

export class TrafficSystem {
  private scene: Phaser.Scene
  private trafficGroup: Phaser.Physics.Arcade.Group
  private spawnTimer: Phaser.Time.TimerEvent
  private trafficCars: TrafficCarData[] = []
  private carTypes: string[] = ["traffic1", "traffic2", "traffic3"]
  private roadPositions: { x: number; y: number; direction: number }[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Create physics group for traffic cars
    this.trafficGroup = scene.physics.add.group({
      collideWorldBounds: true,
      bounceX: 0.5,
      bounceY: 0.5,
    })

    // Generate road positions
    this.generateRoadPositions()

    // Start spawning traffic
    this.spawnTimer = scene.time.addEvent({
      delay: 2000,
      callback: this.spawnTrafficCar,
      callbackScope: this,
      loop: true,
    })

    // Initial spawn
    for (let i = 0; i < 20; i++) {
      this.spawnTrafficCar()
    }
  }

  update(delta: number) {
    // Update traffic car movement
    this.trafficGroup.getChildren().forEach((car: Phaser.GameObjects.GameObject) => {
      const trafficCar = car as Phaser.Physics.Arcade.Sprite
      const data = trafficCar.getData("data") as TrafficCarData

      if (data) {
        // Move car in its direction
        const speed = data.speed * (delta / 1000)
        const dx = Math.cos(data.direction) * speed
        const dy = Math.sin(data.direction) * speed

        trafficCar.x += dx
        trafficCar.y += dy

        // Set rotation to match direction
        trafficCar.setRotation(data.direction + Math.PI / 2)

        // Check if car is out of bounds and respawn it
        const bounds = 200 // Extra margin
        if (
          trafficCar.x < -bounds ||
          trafficCar.x > this.scene.physics.world.bounds.width + bounds ||
          trafficCar.y < -bounds ||
          trafficCar.y > this.scene.physics.world.bounds.height + bounds
        ) {
          this.respawnTrafficCar(trafficCar)
        }
      }
    })
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.trafficGroup
  }

  private generateRoadPositions() {
    const tileSize = 128
    const mapWidth = 40
    const mapHeight = 40

    // Horizontal roads
    for (let y = 3; y < mapHeight; y += 5) {
      // Cars going right
      this.roadPositions.push({
        x: 0,
        y: y * tileSize + tileSize * 0.25,
        direction: 0, // Right
      })

      // Cars going left
      this.roadPositions.push({
        x: mapWidth * tileSize,
        y: y * tileSize + tileSize * 0.75,
        direction: Math.PI, // Left
      })
    }

    // Vertical roads
    for (let x = 3; x < mapWidth; x += 5) {
      // Cars going down
      this.roadPositions.push({
        x: x * tileSize + tileSize * 0.25,
        y: 0,
        direction: Math.PI / 2, // Down
      })

      // Cars going up
      this.roadPositions.push({
        x: x * tileSize + tileSize * 0.75,
        y: mapHeight * tileSize,
        direction: -Math.PI / 2, // Up
      })
    }
  }

  private spawnTrafficCar() {
    if (this.roadPositions.length === 0) return

    // Choose random road position
    const roadPosIndex = Phaser.Math.Between(0, this.roadPositions.length - 1)
    const roadPos = this.roadPositions[roadPosIndex]

    // Choose random car type
    const carType = this.carTypes[Phaser.Math.Between(0, this.carTypes.length - 1)]

    // Create traffic car data
    const carData: TrafficCarData = {
      x: roadPos.x,
      y: roadPos.y,
      speed: Phaser.Math.Between(50, 150),
      direction: roadPos.direction,
      sprite: carType,
    }

    // Create sprite
    const car = this.scene.physics.add.sprite(carData.x, carData.y, carData.sprite)
    car.setScale(0.15)
    car.setData("data", carData)
    car.setRotation(carData.direction + Math.PI / 2)

    // Add to group
    this.trafficGroup.add(car)

    // Store car data
    this.trafficCars.push(carData)
  }

  private respawnTrafficCar(car: Phaser.Physics.Arcade.Sprite) {
    if (this.roadPositions.length === 0) return

    // Choose random road position
    const roadPosIndex = Phaser.Math.Between(0, this.roadPositions.length - 1)
    const roadPos = this.roadPositions[roadPosIndex]

    // Update car data
    const carData = car.getData("data") as TrafficCarData
    carData.x = roadPos.x
    carData.y = roadPos.y
    carData.speed = Phaser.Math.Between(50, 150)
    carData.direction = roadPos.direction

    // Update car position
    car.x = carData.x
    car.y = carData.y
    car.setRotation(carData.direction + Math.PI / 2)
  }
}

