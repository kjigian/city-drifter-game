import Phaser from "phaser"
import { getPlayerData } from "../utils/player-data"
import type { CarStats } from "@/types/game-types"

export class CarController {
  private scene: Phaser.Scene
  private sprite: Phaser.Physics.Arcade.Sprite
  private velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0)
  private acceleration: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0)
  private direction = 0 // Angle in radians
  private speed = 0
  private drifting = false
  private driftFactor = 0
  private driftDirection = 0
  private smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null
  private engineSound: Phaser.Sound.BaseSound | null = null
  private driftSound: Phaser.Sound.BaseSound | null = null
  private stats: CarStats

  // Input state
  private throttleInput = 0
  private brakeInput = 0
  private steeringInput = 0
  private driftInput = 0

  // Boost state
  private boosting = false
  private boostFactor = 1
  private boostTimer: Phaser.Time.TimerEvent | null = null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, "car")
    this.sprite.setScale(0.15)
    this.sprite.setCollideWorldBounds(false)
    this.sprite.setDepth(10)

    // Get player stats from upgrades
    const playerData = getPlayerData()

    // Apply car color
    if (playerData.carColor) {
      this.sprite.setTint(Number.parseInt(playerData.carColor, 16))
    }

    // Calculate car stats based on upgrades
    this.stats = {
      maxSpeed: 300 + playerData.upgrades.engine * 30,
      acceleration: 200 + playerData.upgrades.engine * 20,
      handling: 2.5 + playerData.upgrades.handling * 0.3,
      driftFactor: 0.7 + playerData.upgrades.tires * 0.06,
    }

    // Create smoke particle emitter
    this.createSmokeEmitter()

    // Set up sounds
    this.setupSounds()

    // Set up keyboard input
    this.setupKeyboardInput()
  }

  update(delta: number) {
    // Convert delta to seconds
    const dt = delta / 1000

    // Handle input
    this.handleInput(dt)

    // Apply physics
    this.applyPhysics(dt)

    // Update sprite
    this.updateSprite()

    // Update particles
    this.updateParticles()

    // Update sounds
    this.updateSounds()
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite
  }

  getSpeed(): number {
    return this.speed
  }

  isDrifting(): boolean {
    return this.drifting
  }

  getDriftFactor(): number {
    return this.driftFactor
  }

  setThrottleInput(value: number) {
    this.throttleInput = Phaser.Math.Clamp(value, 0, 1)
  }

  setBrakeInput(value: number) {
    this.brakeInput = Phaser.Math.Clamp(value, 0, 1)
  }

  setSteeringInput(value: number) {
    this.steeringInput = Phaser.Math.Clamp(value, -1, 1)
  }

  setDriftInput(value: number) {
    this.driftInput = Phaser.Math.Clamp(value, 0, 1)
  }

  applyBoost(factor: number, duration: number) {
    this.boosting = true
    this.boostFactor = factor

    // Clear existing boost timer if any
    if (this.boostTimer) {
      this.boostTimer.remove()
    }

    // Set timer to end boost
    this.boostTimer = this.scene.time.delayedCall(duration, () => {
      this.boosting = false
      this.boostFactor = 1
    })
  }

  private handleInput(dt: number) {
    // Check keyboard input
    const cursors = this.scene.input.keyboard?.createCursorKeys()

    if (cursors) {
      if (cursors.up.isDown) {
        this.throttleInput = 1
      } else if (!cursors.up.isDown && this.throttleInput === 1) {
        this.throttleInput = 0
      }

      if (cursors.down.isDown) {
        this.brakeInput = 1
      } else if (!cursors.down.isDown && this.brakeInput === 1) {
        this.brakeInput = 0
      }

      if (cursors.left.isDown) {
        this.steeringInput = -1
      } else if (cursors.right.isDown) {
        this.steeringInput = 1
      } else if (!cursors.left.isDown && !cursors.right.isDown) {
        this.steeringInput = 0
      }

      // Shift key for drifting
      if (
        this.scene.input.keyboard?.checkDown(this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT), 0)
      ) {
        this.driftInput = 1
      } else {
        this.driftInput = 0
      }
    }
  }

  private applyPhysics(dt: number) {
    // Calculate acceleration
    const accelerationForce = this.throttleInput * this.stats.acceleration * (this.boosting ? this.boostFactor : 1)
    const brakeForce = this.brakeInput * this.stats.acceleration * 1.5

    // Apply acceleration or braking
    if (this.throttleInput > 0) {
      this.speed += accelerationForce * dt
    } else {
      // Natural deceleration
      this.speed *= 0.98
    }

    // Apply braking
    if (this.brakeInput > 0) {
      this.speed -= brakeForce * dt
    }

    // Clamp speed
    const maxSpeed = this.stats.maxSpeed * (this.boosting ? this.boostFactor : 1)
    this.speed = Phaser.Math.Clamp(this.speed, 0, maxSpeed)

    // Handle steering
    const steeringForce = this.steeringInput * this.stats.handling * (1 - (this.speed / maxSpeed) * 0.5)

    // Check if drifting
    if (this.driftInput > 0 && this.speed > maxSpeed * 0.4 && Math.abs(this.steeringInput) > 0.5) {
      if (!this.drifting) {
        this.drifting = true
        this.driftDirection = Math.sign(this.steeringInput)

        // Play drift sound
        if (this.driftSound && !this.driftSound.isPlaying) {
          this.driftSound.play({ volume: 0.3, loop: true })
        }
      }

      // Increase drift factor gradually
      this.driftFactor = Math.min(this.driftFactor + dt * 2, this.stats.driftFactor * 5)
    } else {
      if (this.drifting) {
        this.drifting = false

        // Stop drift sound
        if (this.driftSound && this.driftSound.isPlaying) {
          this.driftSound.stop()
        }
      }

      // Decrease drift factor gradually
      this.driftFactor = Math.max(this.driftFactor - dt * 4, 0)
    }

    // Apply steering with drift effect
    if (this.drifting) {
      // When drifting, the car slides more in the direction it was already going
      this.direction += steeringForce * dt * 1.5

      // Calculate velocity with drift
      const driftAngle = this.driftDirection * this.driftFactor * 0.3
      const movementAngle = this.direction + driftAngle

      this.velocity.x = Math.cos(movementAngle) * this.speed
      this.velocity.y = Math.sin(movementAngle) * this.speed
    } else {
      // Normal steering
      this.direction += steeringForce * dt

      // Calculate velocity
      this.velocity.x = Math.cos(this.direction) * this.speed
      this.velocity.y = Math.sin(this.direction) * this.speed
    }
  }

  private updateSprite() {
    // Update position
    this.sprite.x += this.velocity.x * 0.016
    this.sprite.y += this.velocity.y * 0.016

    // Update rotation (convert from radians to degrees)
    this.sprite.setRotation(this.direction + Math.PI / 2)

    // Apply visual effects for boosting
    if (this.boosting) {
      this.sprite.setTint(0xffff00)
    } else {
      // Reset tint if not boosting
      const playerData = getPlayerData()
      if (playerData.carColor) {
        this.sprite.setTint(Number.parseInt(playerData.carColor, 16))
      } else {
        this.sprite.clearTint()
      }
    }
  }

  private createSmokeEmitter() {
    if (!this.scene.particles) {
      this.scene.particles = this.scene.add.particles(0, 0, "smoke", {
        frame: 0,
        lifespan: 1000,
        speed: { min: 10, max: 30 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        blendMode: "ADD",
        emitting: false,
      })
    }

    this.smokeEmitter = this.scene.particles.createEmitter({
      frame: 0,
      lifespan: 800,
      speed: { min: 5, max: 20 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.3, end: 0 },
      blendMode: "ADD",
      emitting: false,
    })
  }

  private updateParticles() {
    if (this.smokeEmitter) {
      // Position the emitter behind the car
      const angle = this.direction + Math.PI // Opposite direction of car
      const distance = 20
      const x = this.sprite.x + Math.cos(angle) * distance
      const y = this.sprite.y + Math.sin(angle) * distance

      this.smokeEmitter.setPosition(x, y)

      // Emit particles when drifting or at high speed
      if (this.drifting || this.speed > this.stats.maxSpeed * 0.7) {
        this.smokeEmitter.start()

        // Adjust particle properties based on speed and drift
        const particleCount = this.drifting ? 3 : 1
        this.smokeEmitter.setQuantity(particleCount)

        const particleSpeed = this.drifting ? 30 : 10
        this.smokeEmitter.setSpeed({ min: particleSpeed / 2, max: particleSpeed })
      } else {
        this.smokeEmitter.stop()
      }
    }
  }

  private setupSounds() {
    // Engine sound
    this.engineSound = this.scene.sound.add("engine", {
      volume: 0.2,
      loop: true,
    })

    // Drift sound
    this.driftSound = this.scene.sound.add("drift", {
      volume: 0,
      loop: true,
    })

    // Start engine sound
    if (this.engineSound) {
      this.engineSound.play()
    }
  }

  private updateSounds() {
    // Update engine sound pitch based on speed
    if (this.engineSound) {
      const speedFactor = this.speed / this.stats.maxSpeed
      const pitch = 0.8 + speedFactor * 0.4
      this.engineSound.setRate(pitch)
    }
  }

  private setupKeyboardInput() {
    // This is handled in the handleInput method
  }
}

