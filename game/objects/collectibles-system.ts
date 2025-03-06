import Phaser from "phaser"
import type { CollectibleType } from "@/types/game-types"

export class CollectiblesSystem {
  private scene: Phaser.Scene
  private collectiblesGroup: Phaser.Physics.Arcade.Group
  private spawnTimer: Phaser.Time.TimerEvent
  private collectibleTypes: CollectibleType[] = [
    { type: "coin", value: 100 },
    { type: "boost", value: 1.5, duration: 3000 },
    { type: "multiplier", value: 2, duration: 5000 },
  ]

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Create physics group for collectibles
    this.collectiblesGroup = scene.physics.add.group()

    // Start spawning collectibles
    this.spawnTimer = scene.time.addEvent({
      delay: 1000,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    })

    // Initial spawn
    for (let i = 0; i < 50; i++) {
      this.spawnCollectible()
    }
  }

  update(delta: number) {
    // Rotate collectibles for visual effect
    this.collectiblesGroup.getChildren().forEach((collectible: Phaser.GameObjects.GameObject) => {
      const sprite = collectible as Phaser.Physics.Arcade.Sprite
      sprite.angle += 1
    })
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.collectiblesGroup
  }

  private spawnCollectible() {
    // Get world bounds
    const worldBounds = this.scene.physics.world.bounds

    // Choose random position (avoid edges)
    const margin = 200
    const x = Phaser.Math.Between(margin, worldBounds.width - margin)
    const y = Phaser.Math.Between(margin, worldBounds.height - margin)

    // Choose random collectible type
    const typeIndex = Phaser.Math.Between(0, this.collectibleTypes.length - 1)
    const collectibleType = this.collectibleTypes[typeIndex]

    // Create sprite based on type
    const sprite = this.scene.physics.add.sprite(x, y, collectibleType.type)
    sprite.setScale(0.5)

    // Store collectible data
    sprite.setData("type", collectibleType.type)
    sprite.setData("value", collectibleType.value)
    if (collectibleType.duration) {
      sprite.setData("duration", collectibleType.duration)
    }

    // Add to group
    this.collectiblesGroup.add(sprite)

    // Add simple animation
    this.scene.tweens.add({
      targets: sprite,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    })
  }
}

