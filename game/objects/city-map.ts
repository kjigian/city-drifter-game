import Phaser from "phaser"

export class CityMap {
  private scene: Phaser.Scene
  private tileSize = 128
  private mapWidth = 40
  private mapHeight = 40
  private roadTiles: Phaser.GameObjects.TileSprite[] = []
  private buildings: Phaser.GameObjects.Sprite[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createMap()
  }

  private createMap() {
    // Create a grid-based city map

    // First, create a background
    const background = this.scene.add.rectangle(
      0,
      0,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize,
      0x222222,
    )
    background.setOrigin(0, 0)

    // Create road grid
    this.createRoadGrid()

    // Add buildings
    this.addBuildings()

    // Set world bounds
    this.scene.physics.world.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize)

    // Set camera bounds
    this.scene.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize)
  }

  private createRoadGrid() {
    // Create horizontal roads
    for (let y = 3; y < this.mapHeight; y += 5) {
      const road = this.scene.add.tileSprite(0, y * this.tileSize, this.mapWidth * this.tileSize, this.tileSize, "road")
      road.setOrigin(0, 0)
      road.setAngle(90)
      this.roadTiles.push(road)
    }

    // Create vertical roads
    for (let x = 3; x < this.mapWidth; x += 5) {
      const road = this.scene.add.tileSprite(
        x * this.tileSize,
        0,
        this.mapHeight * this.tileSize,
        this.tileSize,
        "road",
      )
      road.setOrigin(0, 0)
      this.roadTiles.push(road)
    }
  }

  private addBuildings() {
    // Add buildings in the grid cells between roads
    for (let x = 0; x < this.mapWidth; x += 5) {
      for (let y = 0; y < this.mapHeight; y += 5) {
        // Skip road intersections
        if (x % 5 === 3 || y % 5 === 3) continue

        // Create a block of buildings
        this.createBuildingBlock(x, y)
      }
    }
  }

  private createBuildingBlock(startX: number, startY: number) {
    const blockSize = 5

    for (let x = 0; x < blockSize; x++) {
      for (let y = 0; y < blockSize; y++) {
        // Skip road cells
        if (x === 3 || y === 3) continue

        const worldX = (startX + x) * this.tileSize
        const worldY = (startY + y) * this.tileSize

        // Randomly choose building type
        const buildingType = Phaser.Math.Between(1, 3)
        const buildingKey = `building${buildingType}`

        // Random scale for variety
        const scale = Phaser.Math.FloatBetween(0.8, 1.2)

        const building = this.scene.add.sprite(worldX + this.tileSize / 2, worldY + this.tileSize / 2, buildingKey)

        building.setScale(scale)

        // Random rotation (0, 90, 180, or 270 degrees)
        const rotation = Phaser.Math.Between(0, 3) * 90
        building.setAngle(rotation)

        this.buildings.push(building)
      }
    }
  }
}

