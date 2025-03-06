"use client"

import { useRef, useState, useEffect } from "react"
import { useGameState } from "@/hooks/use-game-state"
import Script from "next/script"

// Define types for car state
interface SteeringInput {
  steering: number;
  time: number;
}

interface VisualFeedback {
  tireSmokeIntensity: number;
  bodyRoll: number;
  counterSteerIndicator: boolean;
  perfectCounterMoment: boolean;
  gripIndicator: number;
}

interface CarState {
  speed: number;
  acceleration: number;
  angularVelocity: number;
  drifting: boolean;
  driftPower: number;
  driftDirection: number;
  driftDuration: number;
  driftBoost: boolean;
  driftScore: number;
  driftMultiplier: number;
  boostTime: number;
  boostPower: number;
  inDriftZone: boolean;
  tireTracks: any[]; // Use any[] for Phaser image array since we don't have Phaser types imported
  miniTurboLevel: number;
  miniTurboCharge: number;
  driftTurnBonus: number;
  driftMomentum: number;
  hopActive: boolean;
  hopTime: number;
  currentGrip: number;
  weightTransfer: number;
  suspensionCompressionFront: number;
  suspensionCompressionRear: number;
  lastSteeringInput: number;
  steeringResponseDelay: number;
  slipAngle: number;
  inputHistory: SteeringInput[];
  styleMeter: number;
  styleLimit: number;
  visualFeedback: VisualFeedback;
  handbrakeWasPressed: boolean;
  handbrakeJustPressed: boolean;
  wasJustDrifting: boolean;
  driftKickApplied: boolean;
  driftRecoveryTimer: number;
  latestDriftAngle: number;
}

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null)
  const { score, setScore, time, setTime, gameStatus, setGameStatus } = useGameState()
  const gameInitializedRef = useRef(false)
  const [debugInfo, setDebugInfo] = useState<string>("Waiting for Phaser to load...")

  // Initialize the game after Phaser script is loaded
  const handlePhaserLoad = () => {
    if (!gameRef.current || gameInitializedRef.current || typeof window === "undefined") return

    try {
      setDebugInfo("Phaser script loaded, initializing game...")

      // Access Phaser from the global window object
      const Phaser = (window as any).Phaser

      if (!Phaser) {
        setDebugInfo("Error: Phaser is not loaded properly")
        console.error("Phaser is not loaded properly")
        return
      }

      // Mark as initialized
      gameInitializedRef.current = true
      setDebugInfo("Creating game instance...")

      // Create a simple game configuration
      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#1a1a1a",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false, // Set to true to see collision boxes
          },
        },
        scene: {
          preload: function (this: any) {
            setDebugInfo("Preloading assets...")

            // Create a loading text
            const loadingText = this.add
              .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Loading...", {
                fontSize: "32px",
                color: "#fff",
              })
              .setOrigin(0.5)

            // Create a simple car texture programmatically
            const carGraphics = this.make.graphics({ x: 0, y: 0 })
            carGraphics.fillStyle(0xff0000)
            carGraphics.fillRect(-20, -10, 40, 20)
            carGraphics.fillStyle(0xffff00)
            carGraphics.fillRect(10, -5, 10, 10)
            carGraphics.generateTexture("car", 40, 20)

            // Create tire mark texture
            const tireMarkGraphics = this.make.graphics({ x: 0, y: 0 })
            tireMarkGraphics.fillStyle(0x333333)
            tireMarkGraphics.fillRect(0, 0, 5, 5)
            tireMarkGraphics.generateTexture("tireMark", 5, 5)

            // Create smoke particle texture
            const smokeGraphics = this.make.graphics({ x: 0, y: 0 })
            smokeGraphics.fillStyle(0xcccccc)
            smokeGraphics.fillCircle(8, 8, 8)
            smokeGraphics.generateTexture("smoke", 16, 16)

            // Create road texture
            const roadGraphics = this.make.graphics({ x: 0, y: 0 })
            roadGraphics.fillStyle(0x333333)
            roadGraphics.fillRect(0, 0, 100, 100)
            // Add road markings
            roadGraphics.fillStyle(0xffffff)
            roadGraphics.fillRect(48, 0, 4, 40)
            roadGraphics.fillRect(48, 60, 4, 40)
            roadGraphics.generateTexture("road", 100, 100)

            // Create a coin texture
            const coinGraphics = this.make.graphics({ x: 0, y: 0 })
            coinGraphics.fillStyle(0xffff00)
            coinGraphics.fillCircle(10, 10, 10)
            coinGraphics.generateTexture("coin", 20, 20)

            // Create boost texture
            const boostGraphics = this.make.graphics({ x: 0, y: 0 })
            boostGraphics.fillStyle(0x00ffff)
            boostGraphics.fillCircle(10, 10, 10)
            boostGraphics.generateTexture("boost", 20, 20)

            // Create spark textures for different boost levels
            const blueSparkGraphics = this.make.graphics({ x: 0, y: 0 })
            blueSparkGraphics.fillStyle(0x00ffff)
            blueSparkGraphics.fillCircle(5, 5, 5)
            blueSparkGraphics.generateTexture("blueSpark", 10, 10)

            const orangeSparkGraphics = this.make.graphics({ x: 0, y: 0 })
            orangeSparkGraphics.fillStyle(0xff8800)
            orangeSparkGraphics.fillCircle(5, 5, 5)
            orangeSparkGraphics.generateTexture("orangeSpark", 10, 10)

            const purpleSparkGraphics = this.make.graphics({ x: 0, y: 0 })
            purpleSparkGraphics.fillStyle(0xff00ff)
            purpleSparkGraphics.fillCircle(5, 5, 5)
            purpleSparkGraphics.generateTexture("purpleSpark", 10, 10)
          },
          create: function (this: any) {
            setDebugInfo("Game created, setting up scene...")

            // Set game status
            setGameStatus("playing")

            // Create a larger world for the game
            const worldSize = 2000
            this.physics.world.setBounds(0, 0, worldSize, worldSize)

            // Create a background
            this.add.rectangle(0, 0, worldSize, worldSize, 0x222222).setOrigin(0)

            // Create different road surfaces with varying grip levels
            this.surfaces = {
              normal: { grip: 1.0, color: 0x333333 },
              slippery: { grip: 0.7, color: 0x2255aa },  // Blue-ish for wet/ice
              grippy: { grip: 1.2, color: 0x775533 }     // Brown-ish for dirt/gravel
            }

            // Create a grid of roads with different surfaces
            this.roads = this.add.group()
            this.roadSurfaces = {} // Track grip values by position
            for (let x = 0; x < worldSize; x += 200) {
              for (let y = 0; y < worldSize; y += 200) {
                // Only place roads on a grid pattern
                if (x % 400 === 0 || y % 400 === 0) {
                  // Randomly assign some roads as slippery or grippy
                  let surface = this.surfaces.normal
                  const surfaceRoll = Math.random()
                  if (surfaceRoll > 0.8) {
                    surface = this.surfaces.slippery
                  } else if (surfaceRoll > 0.6) {
                    surface = this.surfaces.grippy
                  }
                  
                  const road = this.add.image(x, y, "road").setTint(surface.color)
                  this.roads.add(road)
                  
                  // Store surface grip value keyed by grid position
                  const gridKey = `${Math.floor(x/100)},${Math.floor(y/100)}`
                  this.roadSurfaces[gridKey] = surface.grip
                }
              }
            }

            // Create drift zones (wider roads with different color)
            this.driftZones = this.add.group()
            // Circular drift zone
            const centerX = worldSize / 2
            const centerY = worldSize / 2
            const radius = 300
            const segments = 24
            const angleStep = (Math.PI * 2) / segments

            for (let i = 0; i < segments; i++) {
              const angle = i * angleStep
              const x = centerX + Math.cos(angle) * radius
              const y = centerY + Math.sin(angle) * radius
              
              const road = this.add.image(x, y, "road").setTint(0x555555)
              road.setRotation(angle + Math.PI / 2)
              road.setScale(1.5)
              this.driftZones.add(road)
            }

            // Create the player car
            this.car = this.physics.add.image(worldSize / 2, worldSize / 2, "car")
            this.car.setCollideWorldBounds(true)
            this.car.setDamping(true)
            this.car.setDrag(0.95)
            this.car.setMaxVelocity(300)

            // Create particles for drift smoke
            this.smokeParticles = this.add.particles("smoke")
            this.smokeEmitter = this.smokeParticles.createEmitter({
              speed: { min: 10, max: 30 },
              angle: { min: 0, max: 360 },
              scale: { start: 0.5, end: 0 },
              alpha: { start: 0.5, end: 0 },
              lifespan: 800,
              gravityY: 0,
              quantity: 2,
              on: false
            })

            // Create tire mark particles that persist longer
            this.tireMarks = []

            // Add some coins for collection
            this.coins = this.physics.add.group()
            for (let i = 0; i < 20; i++) {
              const x = Phaser.Math.Between(100, worldSize - 100)
              const y = Phaser.Math.Between(100, worldSize - 100)
              const coin = this.coins.create(x, y, "coin")
              coin.setCircle(10)
              coin.setBounce(0.2)
            }

            // Add boost pickups
            this.boosts = this.physics.add.group()
            for (let i = 0; i < 5; i++) {
              const x = Phaser.Math.Between(100, worldSize - 100)
              const y = Phaser.Math.Between(100, worldSize - 100)
              const boost = this.boosts.create(x, y, "boost")
              boost.setCircle(10)
              boost.setScale(1.5) // Make boost pickups larger
            }

            // Set up collision between car and collectibles
            this.physics.add.overlap(this.car, this.coins, this.collectCoin, null, this)
            this.physics.add.overlap(this.car, this.boosts, this.collectBoost, null, this)

            // Set up cursor keys
            this.cursors = this.input.keyboard.createCursorKeys()
            
            // Set up WASD keys for alternative control scheme
            this.wasdKeys = {
              up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
              down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
              left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
              right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            }
            
            this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

            // Initialize car physics state
            this.carState = {
              speed: 0,
              acceleration: 0,
              angularVelocity: 0,
              drifting: false,
              driftPower: 0,           // How powerful the drift is (0-1)
              driftDirection: 0,       // Direction of the drift (-1 left, 1 right)
              driftDuration: 0,        // How long the drift has been maintained
              driftBoost: false,       // If the player gets a boost after drifting
              driftScore: 0,           // Score accumulated during current drift
              driftMultiplier: 1,      // Score multiplier based on drift duration
              boostTime: 0,            // Time remaining for boost
              boostPower: 1,           // Boost multiplier
              inDriftZone: false,      // If the car is in a drift zone
              tireTracks: [],          // Array to store tire tracks
              // New Mario Kart-like properties
              miniTurboLevel: 0,       // 0 = none, 1 = blue, 2 = orange, 3 = purple
              miniTurboCharge: 0,      // Charge progress towards next mini-turbo level
              driftTurnBonus: 1.5,     // Tighter turning radius while drifting
              driftMomentum: 0,        // Maintains momentum through drifts
              hopActive: false,        // For the initial hop when starting a drift
              hopTime: 0,              // Time of the hop animation
              // New realistic physics properties
              currentGrip: 1.0,        // Current grip level (affected by surface, speed, etc.)
              weightTransfer: 0,       // Current weight transfer (-1 to 1, negative = left, positive = right)
              suspensionCompressionFront: 0, // Visual suspension compression for weight transfer
              suspensionCompressionRear: 0,  // Visual suspension compression for weight transfer
              lastSteeringInput: 0,    // Previous steering input for detecting changes
              steeringResponseDelay: 0, // Delay in steering response for weight transfer simulation
              slipAngle: 0,            // Current slip angle (0-1, higher means more drifting)
              inputHistory: [],        // Track recent inputs for predictive counter-steering
              styleMeter: 0,           // Accumulated style points that can be used for boost
              styleLimit: 1000,        // Max style points that can be accumulated
              visualFeedback: {        // Store visual indicators for grip, etc.
                tireSmokeIntensity: 0,
                bodyRoll: 0,
                counterSteerIndicator: false,
                perfectCounterMoment: false,
                gripIndicator: 1.0
              },
              // New arcade drift properties 
              handbrakeWasPressed: false, // Track if handbrake was pressed last frame
              handbrakeJustPressed: false, // Track if handbrake was just pressed this frame
              wasJustDrifting: false,   // Track if car was drifting last frame
              driftKickApplied: false, // Whether the initial drift kick has been applied
              driftRecoveryTimer: 0,   // Timer for drift recovery effects
              latestDriftAngle: 0     // Store the last drift angle for recovery effects
            }

            // Camera setup
            this.cameras.main.setBounds(0, 0, worldSize, worldSize)
            this.cameras.main.startFollow(this.car, true, 0.05, 0.05)

            // Score and UI
            this.gameScore = 0
            
            // Score text
            this.scoreText = this.add.text(16, 16, "Score: 0", {
              fontSize: "32px",
              color: "#fff",
              stroke: "#000",
              strokeThickness: 4
            }).setScrollFactor(0)

            // Drift score text (initially hidden)
            this.driftScoreText = this.add.text(16, 60, "Drift: 0", {
              fontSize: "24px",
              color: "#00ffff",
              stroke: "#000",
              strokeThickness: 3
            }).setScrollFactor(0).setAlpha(0)

            // Drift multiplier text
            this.multiplierText = this.add.text(16, 100, "x1", {
              fontSize: "24px",
              color: "#ff00ff",
              stroke: "#000",
              strokeThickness: 3
            }).setScrollFactor(0).setAlpha(0)

            // Instructions text for realistic drifting controls
            this.instructionsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 
              "W/UP to accelerate, S/DOWN to brake, A/D or LEFT/RIGHT to steer, SPACE for handbrake/drift, SHIFT for boost!", {
              fontSize: "18px",
              color: "#fff",
              backgroundColor: "#000",
              padding: { x: 10, y: 5 }
            }).setScrollFactor(0).setOrigin(0.5)

            // Add subtitle with more detailed instructions
            this.instructionsSubtitle = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 25,
              "Counter-steer (turn opposite direction) to recover from drift. Perfect timing gives style points!", {
              fontSize: "14px",
              color: "#fff",
              backgroundColor: "#000",
              padding: { x: 8, y: 4 }
            }).setScrollFactor(0).setOrigin(0.5)

            // Auto-fade instructions after 10 seconds (longer to read new instructions)
            this.time.delayedCall(10000, () => {
              this.tweens.add({
                targets: [this.instructionsText, this.instructionsSubtitle],
                alpha: 0,
                duration: 1000
              })
            })

            // Create spark emitters for different boost levels
            this.blueSparkEmitter = this.add.particles("blueSpark").createEmitter({
              speed: { min: 50, max: 100 },
              angle: { min: 0, max: 360 },
              scale: { start: 1, end: 0 },
              lifespan: 400,
              quantity: 2,
              on: false
            })

            this.orangeSparkEmitter = this.add.particles("orangeSpark").createEmitter({
              speed: { min: 50, max: 100 },
              angle: { min: 0, max: 360 },
              scale: { start: 1, end: 0 },
              lifespan: 400,
              quantity: 3,
              on: false
            })

            this.purpleSparkEmitter = this.add.particles("purpleSpark").createEmitter({
              speed: { min: 50, max: 100 },
              angle: { min: 0, max: 360 },
              scale: { start: 1, end: 0 },
              lifespan: 400,
              quantity: 4,
              on: false
            })

            // Create UI for drift angle and style meter
            this.angleIndicator = this.add.graphics()
              .setScrollFactor(0)
              .setPosition(120, this.cameras.main.height - 80)
            
            // Style meter (replaces mini-turbo system for boost)
            this.styleMeterBg = this.add.graphics()
              .setScrollFactor(0)
              .setPosition(this.cameras.main.width - 220, this.cameras.main.height - 50)
            
            this.styleMeterFill = this.add.graphics()
              .setScrollFactor(0)
              .setPosition(this.cameras.main.width - 220, this.cameras.main.height - 50)
            
            this.styleMeterText = this.add.text(
              this.cameras.main.width - 110, 
              this.cameras.main.height - 40,
              "STYLE",
              {
                fontSize: "18px",
                color: "#ffffff",
                stroke: "#000",
                strokeThickness: 3
              }
            ).setScrollFactor(0).setOrigin(0.5)
            
            // Add spacebar instruction for boost activation
            this.boostInstructionText = this.add.text(
              this.cameras.main.width - 110,
              this.cameras.main.height - 70,
              "SPACEBAR to boost",
              {
                fontSize: "14px",
                color: "#ffffff",
                stroke: "#000",
                strokeThickness: 2
              }
            ).setScrollFactor(0).setOrigin(0.5).setAlpha(0)

            setDebugInfo("Game ready! W/UP to accelerate, S/DOWN to brake, A/D or LEFT/RIGHT to steer, SPACE for handbrake/drift, SHIFT for boost!")
          },
          update: function (this: any, time: number, delta: number) {
            // Convert delta to seconds for physics calculations
            const dt = delta / 1000
            
            // ===== CAR CONTROLS =====
            // Get inputs with support for both arrow keys and WASD
            const accelerationInput = this.cursors.up.isDown || this.wasdKeys.up.isDown ? 1 : 0
            const brakeInput = this.cursors.down.isDown || this.wasdKeys.down.isDown ? 0.75 : 0
            const handbrakeInput = this.spaceKey.isDown ? 1 : 0 // SPACE for handbrake/drift (standard in many racing games)
            const boostInput = this.shiftKey.isDown ? 1 : 0 // SHIFT for boost activation
            
            // Detect if handbrake was just pressed this frame (for drift initiation)
            this.carState.handbrakeJustPressed = handbrakeInput && !this.carState.handbrakeWasPressed
            this.carState.handbrakeWasPressed = handbrakeInput
            
            // Get steering input from arrow keys or WASD
            let steeringInput = 0
            if (this.cursors.left.isDown || this.wasdKeys.left.isDown) steeringInput = -1
            else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) steeringInput = 1
            
            // ===== SURFACE GRIP CALCULATION =====
            // Get current grid position
            const gridX = Math.floor(this.car.x / 100)
            const gridY = Math.floor(this.car.y / 100)
            const gridKey = `${gridX},${gridY}`
            
            // Get surface grip from current position (default to 1.0 if not on a road)
            const surfaceGrip = this.roadSurfaces[gridKey] || 1.0
            
            // Calculate speed-based grip reduction (faster = less grip)
            const speedGripFactor = Math.max(0.6, 1.0 - (this.carState.speed / 500))
            
            // Calculate turn-based grip reduction (sharper turns = less grip)
            const turnGripFactor = Math.max(0.5, 1.0 - (Math.abs(steeringInput) * 0.3))
            
            // Progressive grip calculation
            this.carState.currentGrip = surfaceGrip * speedGripFactor * turnGripFactor
            
            // ===== WEIGHT TRANSFER SIMULATION =====
            // Calculate weight transfer based on steering changes
            const steeringChange = steeringInput - this.carState.lastSteeringInput
            this.carState.lastSteeringInput = steeringInput
            
            // Weight shifts in the opposite direction of steering
            const targetWeightTransfer = -steeringInput * 0.5
            
            // Gradually shift weight (simulates car suspension)
            this.carState.weightTransfer += (targetWeightTransfer - this.carState.weightTransfer) * dt * 3
            
            // Calculate suspension compression for visual feedback
            this.carState.suspensionCompressionFront = 0.5 + this.carState.weightTransfer * 0.5
            this.carState.suspensionCompressionRear = 0.5 - this.carState.weightTransfer * 0.5
            
            // Apply weight transfer to car visually
            const baseScale = 1.0
            this.car.scaleX = baseScale * (1 - Math.abs(this.carState.weightTransfer) * 0.1)
            this.car.scaleY = baseScale * (1 + Math.abs(this.carState.weightTransfer) * 0.1)
            
            // Simulate steering delay based on weight transfer
            if (Math.abs(steeringChange) > 0.1) {
              // Add steering response delay when weight is shifting
              this.carState.steeringResponseDelay = 0.15 // 150ms delay
            }
            
            // Apply steering delay - create a mutable copy of steeringInput
            let effectiveSteeringInput = steeringInput
            if (this.carState.steeringResponseDelay > 0) {
              this.carState.steeringResponseDelay -= dt
              // Reduce steering effectiveness during weight transfer
              effectiveSteeringInput *= 0.5
            }
            
            // ===== PHYSICS UPDATE =====
            // Handle boost timer
            if (this.carState.boostTime > 0) {
              this.carState.boostTime -= dt
              if (this.carState.boostTime <= 0) {
                this.carState.boostTime = 0
                this.carState.boostPower = 1
                this.car.clearTint() // Remove boost color
              }
            }

            // Base car physics
            let maxSpeed = 250 * this.carState.boostPower
            let accelerationForce = 200 * accelerationInput * this.carState.boostPower
            
            // Apply acceleration
            this.carState.acceleration = accelerationForce
            
            // Calculate car speed based on velocity
            const velocity = this.car.body.velocity
            this.carState.speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
            
            // Check if car is in a drift zone
            this.carState.inDriftZone = false
            this.driftZones.getChildren().forEach((zone: any) => {
              const distance = Phaser.Math.Distance.Between(
                this.car.x, this.car.y, 
                zone.x, zone.y
              )
              if (distance < 150) {
                this.carState.inDriftZone = true
              }
            })
            
            // Check drift conditions - need to be moving and pressing a direction
            const speedThreshold = 80 // Lower threshold for arcade-like feel
            const canInitiateDrift = this.carState.speed > speedThreshold && Math.abs(steeringInput) > 0.1
            
            // Store input history for counter-steering prediction
            this.carState.inputHistory.push({
              steering: steeringInput,
              time: time
            })
            
            // Only keep recent history (last 1 second)
            while (this.carState.inputHistory.length > 0 && 
                  time - this.carState.inputHistory[0].time > 1000) {
              this.carState.inputHistory.shift()
            }
            
            // Calculate average steering input over the last 0.5 seconds
            let recentInputs = this.carState.inputHistory.filter((input: SteeringInput) => time - input.time < 500)
            let avgSteeringInput = 0
            if (recentInputs.length > 0) {
              avgSteeringInput = recentInputs.reduce((sum: number, input: SteeringInput) => sum + input.steering, 0) / recentInputs.length
            }
            
            // ===== ARCADE DRIFT INITIATION =====
            // Apply an immediate "kick" into drift when handbrake is first pressed
            if (this.carState.handbrakeJustPressed && canInitiateDrift && !this.carState.driftKickApplied) {
              // Direction to kick the car based on steering input
              const kickDirection = Math.sign(steeringInput);
              
              // Non-linear kick magnitude based on speed (diminishing returns at higher speeds)
              // Square root function provides a good curve - more kick at low-mid speeds, less aggressive at high speeds
              const baseKickMagnitude = Math.sqrt(this.carState.speed) * 5;
              
              // Cap the maximum kick magnitude
              const maxKickMagnitude = 100;
              const kickMagnitude = Math.min(baseKickMagnitude, maxKickMagnitude);
              
              // Scale kick by grip (less kick on slippery surfaces)
              const gripAdjustedKick = kickMagnitude * this.carState.currentGrip;
              
              // Calculate lateral force vector (perpendicular to car's forward direction)
              const forwardAngle = this.car.rotation;
              const lateralAngle = forwardAngle + (Math.PI / 2 * kickDirection);
              
              // Apply a more moderate lateral velocity for the kick effect
              // Reduce the multiplier for a gentler kick
              this.car.body.velocity.x += Math.cos(lateralAngle) * gripAdjustedKick * 0.4;
              this.car.body.velocity.y += Math.sin(lateralAngle) * gripAdjustedKick * 0.4;
              
              // Initialize drift state
              this.carState.drifting = true;
              this.carState.driftDirection = kickDirection;
              this.carState.driftPower = 0.2; // Start with lower drift power
              this.carState.slipAngle = 0.2; // Start with lower slip angle for more gradual drift
              this.carState.driftKickApplied = true;
              this.carState.driftDuration = 0; // Reset drift duration
              this.carState.driftMomentum = 0; // Reset drift momentum
              
              // Visual feedback - car hop animation
              this.car.setScale(0.9, 1.1); // Squash
              this.tweens.add({
                targets: this.car,
                scaleX: 1.1,
                scaleY: 0.9,
                duration: 150,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => {
                  this.car.setScale(1, 1);
                }
              });
              
              // Start smoke emitter with more gradual initial burst
              this.smokeEmitter.explode(8, this.car.x, this.car.y);
              this.smokeEmitter.on = true;
              
              // Initialize visual feedback values
              this.carState.visualFeedback.tireSmokeIntensity = 2;
            }

            // Continue drift while handbrake is held - only requires speed, not steering
            if (handbrakeInput && this.carState.speed > speedThreshold) {
              if (!this.carState.drifting) {
                // Initialize drift if somehow not already drifting
                this.carState.drifting = true;
                // Use current steering input for direction, or maintain previous direction, or default to right
                this.carState.driftDirection = Math.sign(steeringInput) || this.carState.driftDirection || 1;
                this.carState.driftPower = 0.2;
                this.carState.slipAngle = 0.2;
                this.carState.driftDuration = 0;
                this.carState.driftMomentum = 0;
              }

              // Update drift direction if there's significant steering input
              if (Math.abs(steeringInput) > 0.5) {
                // Allow changing drift direction during a drift with significant steering input
                this.carState.driftDirection = Math.sign(steeringInput);
              }

              // More gradual drift power build-up
              this.carState.driftPower = Math.min(this.carState.driftPower + dt * 2.5, 1);
              this.carState.driftDuration += dt;
              
              // Build up drift momentum over time - makes drifts feel more committed
              this.carState.driftMomentum = Math.min(1.0, this.carState.driftMomentum + dt * 0.5);
              
              // Calculate target slip angle based on drift power with a lower maximum
              let targetSlipAngle = Math.min(0.9, this.carState.driftPower * 1.2);
              
              // Make maximum slip angle speed-dependent (lower at higher speeds)
              const speedFactor = Math.max(0.5, 1.0 - (this.carState.speed / 500));
              targetSlipAngle *= speedFactor;
              
              // Add drift stability factor based on speed
              // Higher speeds = more stable drifts (less chaotic)
              const driftStabilityFactor = Math.min(1.0, this.carState.speed / 200);
              
              // Apply stability to drift calculations
              // This will make drifts more controllable at higher speeds
              targetSlipAngle *= (0.7 + (driftStabilityFactor * 0.3));
              
              // Apply drift momentum to slip angle
              const momentumFactor = 0.5 + (this.carState.driftMomentum * 0.5);
              targetSlipAngle *= momentumFactor;
              
              // Adjust slip angle based on steering input with reduced effect
              if (Math.abs(steeringInput) > 0.1) {
                if (Math.sign(steeringInput) === Math.sign(this.carState.driftDirection)) {
                  // Steering in drift direction increases slip angle
                  targetSlipAngle *= (1.0 + Math.abs(steeringInput) * 0.4);
                } else {
                  // Counter-steering reduces slip angle but doesn't eliminate it completely
                  targetSlipAngle *= Math.max(0.6, 1.0 - Math.abs(steeringInput) * 0.3);
                }
              } else {
                // Maintain a minimum slip angle even without steering input
                targetSlipAngle = Math.max(targetSlipAngle, 0.3);
              }
              
              // Move toward target slip angle more gradually
              // Also make transition rate speed-dependent (slower at higher speeds)
              const transitionRate = 3 * (1 - (this.carState.speed / 800));
              this.carState.slipAngle += (targetSlipAngle - this.carState.slipAngle) * dt * transitionRate;
              
              // ===== ARCADE DRIFT PHYSICS =====
              // Calculate slide angle - angle between car forward direction and drift direction
              const carDirection = this.car.rotation;
              const slideAngle = carDirection + (Math.PI / 2.5 * this.carState.driftDirection * this.carState.slipAngle);
              
              // Arcade-style drift: maintain most momentum
              // Much lower speed reduction than in simulation
              const driftSpeedFactor = 1.0 - this.carState.slipAngle * 0.08; // Reduced from 0.3 to 0.08
              
              // Apply some speed boost during drift for arcade feel if accelerating
              const arcadeBoostFactor = accelerationInput > 0 ? 1.05 : 1.0;
              
              // Calculate new speed, maintaining more momentum
              const speed = this.carState.speed * driftSpeedFactor * arcadeBoostFactor;
              
              // Calculate drift velocity components
              const driftVelocityX = Math.cos(slideAngle) * speed;
              const driftVelocityY = Math.sin(slideAngle) * speed;
              
              // Apply drift velocity
              this.car.body.velocity.x = driftVelocityX;
              this.car.body.velocity.y = driftVelocityY;
              
              // Store latest drift angle for recovery effects
              this.carState.latestDriftAngle = slideAngle;
              
              // ===== ENHANCED DRIFT CONTROL =====
              // Less aggressive steering during drift
              const driftSteeringMultiplier = 1.8; // Reduced from 2.2
              
              // Make steering less responsive at higher speeds
              const speedSteeringFactor = Math.max(0.6, 1.0 - (this.carState.speed / 600));
              const adjustedSteeringMultiplier = driftSteeringMultiplier * speedSteeringFactor;
              
              // More moderate counter-steering effectiveness
              let steeringEffectiveness = 1.0;
              if (Math.sign(steeringInput) !== Math.sign(this.carState.driftDirection)) {
                steeringEffectiveness = 1.3; // Reduced from 1.5
              }
              
              const driftSteeringForce = steeringInput * adjustedSteeringMultiplier * steeringEffectiveness;
              
              // Calculate a visual rotation that shows the car drifting but still pointing in a natural direction
              // Get the movement direction from velocity
              const movementDirection = Math.atan2(driftVelocityY, driftVelocityX);
              
              // Calculate how much the car should visually rotate based on drift intensity
              // Less rotation at higher slip angles to prevent the car from looking backward
              const steeringInfluence = Math.max(0.3, Math.min(0.7, 0.7 - (this.carState.slipAngle * 0.4)));
              
              // Calculate target rotation - this blends the movement direction with the steering input
              // This makes the car look like it's drifting while still pointing somewhat where it's going
              const steeringDirection = movementDirection + (steeringInput * Math.PI * 0.2);
              const targetRotation = (steeringDirection * steeringInfluence) + 
                                    (movementDirection + this.carState.driftDirection * this.carState.slipAngle * Math.PI * 0.2) * 
                                    (1 - steeringInfluence);
              
              // Smoothly transition to the target rotation
              this.car.rotation = Phaser.Math.Angle.RotateTo(
                this.car.rotation,
                targetRotation,
                Math.PI * dt * 3 // Adjust rotation speed for smooth transitions
              );
              
              // Don't set angular velocity directly since we're controlling rotation manually
              // Instead, store the angular velocity for reference
              this.carState.angularVelocity = driftSteeringForce * 160;
              
              // ===== ENHANCED VISUAL EFFECTS =====
              // Base smoke quantity even without steering
              const baseSmokeQuantity = 3; // Minimum smoke when drifting
              const steeringAddedSmoke = Math.abs(steeringInput) * 5; // Additional smoke based on steering
              const targetSmokeQuantity = Math.min(8, baseSmokeQuantity + steeringAddedSmoke);
              
              // More gradual smoke intensity changes
              this.carState.visualFeedback.tireSmokeIntensity += (targetSmokeQuantity - this.carState.visualFeedback.tireSmokeIntensity) * dt * 3;
              this.smokeEmitter.setQuantity(Math.floor(this.carState.visualFeedback.tireSmokeIntensity));
              
              // Make smoke last longer and appear larger
              this.smokeEmitter.setScale({ start: 0.9, end: 0 });
              this.smokeEmitter.setLifespan(1200);
              
              // Position smoke at rear wheels with alternating pattern
              const rearOffsetX = -15;
              
              // Left rear wheel
              const leftWheelOffsetY = 10;
              const leftEmitterX = this.car.x + Math.cos(this.car.rotation + Math.PI) * rearOffsetX - 
                                  Math.sin(this.car.rotation) * leftWheelOffsetY;
              const leftEmitterY = this.car.y + Math.sin(this.car.rotation + Math.PI) * rearOffsetX + 
                                  Math.cos(this.car.rotation) * leftWheelOffsetY;
              
              // Right rear wheel
              const rightWheelOffsetY = -10;
              const rightEmitterX = this.car.x + Math.cos(this.car.rotation + Math.PI) * rearOffsetX - 
                                  Math.sin(this.car.rotation) * rightWheelOffsetY;
              const rightEmitterY = this.car.y + Math.sin(this.car.rotation + Math.PI) * rearOffsetX + 
                                  Math.cos(this.car.rotation) * rightWheelOffsetY;
              
              // Alternate emitter position between wheels
              const smokeX = time % 150 < 75 ? leftEmitterX : rightEmitterX;
              const smokeY = time % 150 < 75 ? leftEmitterY : rightEmitterY;
              this.smokeEmitter.setPosition(smokeX, smokeY);
              
              // Adjust smoke color based on surface
              const surface = this.roadSurfaces[gridKey] || 1.0;
              
              if (surface < 0.8) {
                // Slippery surface - blue smoke
                this.smokeEmitter.setTint(0x8888ff);
              } else if (surface > 1.1) {
                // Grippy surface - brown smoke
                this.smokeEmitter.setTint(0xaa8855);
              } else {
                // Normal surface - white/grey smoke
                this.smokeEmitter.setTint(0xcccccc);
              }
              
              // Create more dramatic, longer-lasting tire marks
              if (time % 60 < 20) { // More frequent marks (every 60ms instead of 100ms)
                if (Math.random() < this.carState.slipAngle * 2.0) { // More likely at higher slip angles
                  // Left tire mark with more dramatic appearance
                  const leftTireMark = this.add.image(leftEmitterX, leftEmitterY, "tireMark")
                    .setAlpha(Math.min(0.85, this.carState.slipAngle * 0.8))
                    .setRotation(this.car.rotation)
                    .setScale(Math.max(1.0, Math.min(3.0, this.carState.slipAngle * 3.0)));
                  
                  // Right tire mark
                  const rightTireMark = this.add.image(rightEmitterX, rightEmitterY, "tireMark")
                    .setAlpha(Math.min(0.85, this.carState.slipAngle * 0.8))
                    .setRotation(this.car.rotation)
                    .setScale(Math.max(1.0, Math.min(3.0, this.carState.slipAngle * 3.0)));
                  
                  // Longer-lasting tire marks for arcade feel
                  this.tweens.add({
                    targets: [leftTireMark, rightTireMark],
                    alpha: 0,
                    duration: 10000, // Much longer duration (10 seconds)
                    onComplete: () => {
                      leftTireMark.destroy();
                      rightTireMark.destroy();
                    }
                  });
                  
                  // Store reference to clean up later
                  this.carState.tireTracks.push(leftTireMark, rightTireMark);
                  
                  // Limit number of tire tracks
                  while (this.carState.tireTracks.length > 300) {
                    const oldTrack = this.carState.tireTracks.shift();
                    oldTrack.destroy();
                  }
                }
              }
              
              // ===== STYLE POINTS SYSTEM =====
              // Calculate style points based on drift angle, speed, and duration
              // Base points just for maintaining a drift
              let stylePointRate = this.carState.speed * 0.05;
              
              // Add bonus points for steering during drift
              if (Math.abs(steeringInput) > 0.1) {
                stylePointRate += this.carState.speed * 0.03 * Math.abs(steeringInput);
              }
              
              // Add bonus points for drift angle
              stylePointRate += this.carState.speed * 0.05 * this.carState.slipAngle;
              
              // Bonus for long drifts - increase multiplier over time
              const driftDurationBonus = Math.min(2.0, 1.0 + (this.carState.driftDuration / 5.0));
              stylePointRate *= driftDurationBonus;
              
              // Double points in drift zones
              if (this.carState.inDriftZone) {
                stylePointRate *= 2;
                // Visual indication for drift zone bonus
                if (!this.car.tintTopLeft || this.car.tintTopLeft === 0xffffff) {
                  this.car.setTint(0x00ffff); // Cyan tint for drift zone
                }
              } else if (this.carState.boostTime <= 0) {
                this.car.clearTint();
              }
              
              // Add style points based on duration and angle
              this.carState.styleMeter = Math.min(
                this.carState.styleLimit, 
                this.carState.styleMeter + stylePointRate * dt
              );
              
              // Update UI displays
              this.driftScoreText.setText(`Style: ${Math.floor(this.carState.styleMeter)}`);
              this.driftScoreText.setAlpha(1);
              
              // Update angle display with more dramatic coloring for arcade feel
              this.multiplierText.setText(`Angle: ${(this.carState.slipAngle * 100).toFixed(0)}°`);
              this.multiplierText.setColor(
                this.carState.slipAngle > 0.9 ? '#ff00ff' : // Purple for extreme angles
                this.carState.slipAngle > 0.7 ? '#ff0000' : 
                this.carState.slipAngle > 0.5 ? '#ff8800' : 
                this.carState.slipAngle > 0.3 ? '#ffff00' : '#ffffff'
              );
              this.multiplierText.setAlpha(1);
              
            } else if (this.carState.drifting) {
              // End drift with momentum conservation and recovery phase
              this.carState.wasJustDrifting = true;
              this.carState.drifting = false;
              this.carState.driftKickApplied = false;
              this.carState.driftMomentum = 0; // Reset drift momentum
              
              // Turn off smoke emitter
              this.smokeEmitter.on = false;
              
              // Remove color tint if not boosting
              if (this.carState.boostTime <= 0) {
                this.car.clearTint();
              }
              
              // Calculate a recovery force that helps stabilize the car
              // This prevents the car from suddenly spinning or jerking when drift ends
              const recoveryForce = this.carState.slipAngle * this.carState.speed * 0.3;
              const recoveryAngle = this.car.rotation;
              
              // Apply a stabilizing force in the car's forward direction
              this.car.body.velocity.x += Math.cos(recoveryAngle) * recoveryForce;
              this.car.body.velocity.y += Math.sin(recoveryAngle) * recoveryForce;
              
              // Add a recovery effect when ending drift
              // Create a tire "chirp" effect when regaining traction
              const recoverEmitter = this.add.particles("smoke").createEmitter({
                x: this.car.x,
                y: this.car.y,
                speed: { min: 50, max: 100 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                quantity: 15,
                tint: 0xaaaaaa
              });
              
              // Stop the emitter after a short burst
              this.time.delayedCall(100, () => {
                recoverEmitter.stop();
              });
              
              // Apply a bit of forward momentum as drift ends
              // This helps prevent the car from feeling like it suddenly stops
              if (accelerationInput > 0) {
                this.physics.velocityFromRotation(
                  this.car.rotation,
                  this.carState.speed * 1.1, // Small speed boost when exiting drift
                  this.car.body.velocity
                );
              }
              
              // Keep style points for boost, but hide drift UI
              this.tweens.add({
                targets: [this.driftScoreText, this.multiplierText],
                alpha: 0,
                duration: 500
              });
              
              // Gradually reduce slip angle for smoother transition
              // Make recovery time speed-dependent (longer at higher speeds)
              this.tweens.add({
                targets: this.carState,
                slipAngle: 0,
                duration: 300 * (1 + (this.carState.speed / 300)),
                ease: 'Quad.easeOut'
              });
            } else {
              // Reset drift state completely if not drifting
              this.carState.driftKickApplied = false;
              this.carState.wasJustDrifting = false;
              
              // Normal driving
              
              // ===== BOOST ACTIVATION =====
              // Activate boost if player has style points and presses spacebar
              if (boostInput && this.carState.styleMeter >= 250 && this.carState.boostTime <= 0) {
                // Calculate boost power based on style points
                let boostPower, boostDuration, boostColor, boostText
                
                if (this.carState.styleMeter >= 750) {
                  // Maximum boost
                  boostPower = 2.0
                  boostDuration = 3.0
                  boostColor = 0xff00ff
                  boostText = "DRIFT MASTER BOOST!"
                } else if (this.carState.styleMeter >= 500) {
                  // Medium boost
                  boostPower = 1.75
                  boostDuration = 2.0
                  boostColor = 0xff8800
                  boostText = "SUPER DRIFT BOOST!"
                } else {
                  // Basic boost
                  boostPower = 1.5
                  boostDuration = 1.0
                  boostColor = 0x00ffff
                  boostText = "DRIFT BOOST!"
                }
                
                // Apply boost
                this.carState.boostTime = boostDuration
                this.carState.boostPower = boostPower
                this.car.setTint(boostColor)
                
                // Add score based on style points
                const boostScore = Math.floor(this.carState.styleMeter)
                this.gameScore += boostScore
                this.scoreText.setText(`Score: ${this.gameScore}`)
                
                // Reset style meter after using boost
                this.carState.styleMeter = 0
                
                // Show boost message
                const boostMessage = this.add.text(
                  this.car.x,
                  this.car.y - 40,
                  `${boostText}\n+${boostScore}`,
                  {
                    fontSize: '20px',
                    color: this.carState.boostPower >= 2.0 ? '#ff00ff' : 
                            (this.carState.boostPower >= 1.75 ? '#ff8800' : '#00ffff'),
                    stroke: '#000',
                    strokeThickness: 4,
                    align: 'center'
                  }
                ).setOrigin(0.5)
                
                // Animate boost message
                this.tweens.add({
                  targets: boostMessage,
                  y: boostMessage.y - 80,
                  alpha: 0,
                  scale: 1.5,
                  duration: 1000,
                  ease: 'Power2',
                  onComplete: () => boostMessage.destroy()
                })
                
                // Visual flourish - burst of sparks
                const burstEmitter = this.add.particles(
                  this.carState.boostPower >= 2.0 ? "purpleSpark" :
                  (this.carState.boostPower >= 1.75 ? "orangeSpark" : "blueSpark")
                ).createEmitter({
                  x: this.car.x,
                  y: this.car.y,
                  speed: { min: 100, max: 200 },
                  angle: { min: 0, max: 360 },
                  scale: { start: 1, end: 0 },
                  lifespan: 800,
                  quantity: 20
                })
                
                // Stop the emitter after the burst
                this.time.delayedCall(100, () => {
                  burstEmitter.stop()
                })
              }
              
              // Normal driving physics with grip-based handling
              if (accelerationInput !== 0) {
                // Apply velocity based on car rotation and acceleration
                this.physics.velocityFromRotation(
                  this.car.rotation, 
                  this.carState.speed + accelerationForce * dt,
                  this.car.body.velocity
                )
                
                // Clamp to max speed
                if (this.carState.speed > maxSpeed) {
                  const currentDir = Math.atan2(velocity.y, velocity.x)
                  velocity.x = Math.cos(currentDir) * maxSpeed
                  velocity.y = Math.sin(currentDir) * maxSpeed
                }
              } else {
                // When not accelerating, apply natural deceleration but maintain steering control
                // Apply a gentle rolling resistance when not accelerating
                const rollingResistance = 20; // Adjust this value to control how quickly the car slows down
                this.carState.speed = Math.max(0, this.carState.speed - rollingResistance * dt);
                
                // Even when coasting, the car should respond to steering
                if (Math.abs(steeringInput) > 0.1 && this.carState.speed > 10) {
                  // Calculate new direction based on steering input
                  const steeringAmount = steeringInput * dt * 2.0; // Adjust for steering responsiveness
                  const newDirection = this.car.rotation + steeringAmount;
                  
                  // Apply the new direction to velocity while maintaining speed
                  this.physics.velocityFromRotation(
                    newDirection,
                    this.carState.speed,
                    this.car.body.velocity
                  );
                  
                  // Update car's visual rotation
                  this.car.rotation = newDirection;
                }
              }
              
              // Apply natural drag and rolling resistance for more realistic feel
              const dragFactor = 0.99; // Air resistance (higher = less drag)
              this.car.body.velocity.x *= dragFactor;
              this.car.body.velocity.y *= dragFactor;
              
              // Additional natural deceleration when not accelerating
              if (accelerationInput === 0 && !brakeInput) {
                // Apply stronger deceleration at higher speeds, gentler at lower speeds
                const naturalDeceleration = Math.min(10, this.carState.speed * 0.05);
                if (this.carState.speed > 1) {
                  const currentDir = Math.atan2(velocity.y, velocity.x);
                  velocity.x -= Math.cos(currentDir) * naturalDeceleration * dt;
                  velocity.y -= Math.sin(currentDir) * naturalDeceleration * dt;
                  
                  // Prevent very slow movement by stopping completely below a threshold
                  if (this.carState.speed < 5) {
                    velocity.x *= 0.95;
                    velocity.y *= 0.95;
                  }
                }
              }
              
              // Apply lateral grip to prevent sideways sliding (fixes the "floaty" feeling)
              const forwardDirection = this.car.rotation;
              const movementDirection = Math.atan2(this.car.body.velocity.y, this.car.body.velocity.x);
              const lateralAngle = Phaser.Math.Angle.Wrap(movementDirection - forwardDirection);
              
              // Only apply lateral grip when moving at sufficient speed
              if (this.carState.speed > 20) {
                // Calculate lateral force based on the angle between movement and facing direction
                const lateralFactor = Math.sin(lateralAngle);
                
                // Stronger grip effect for more planted feel
                const lateralGripStrength = 0.3 * this.carState.currentGrip;
                const lateralForce = lateralFactor * this.carState.speed * lateralGripStrength;
                
                // Apply lateral force to reduce sideways movement
                this.car.body.velocity.x -= Math.sin(forwardDirection) * lateralForce * dt * 5;
                this.car.body.velocity.y += Math.cos(forwardDirection) * lateralForce * dt * 5;
                
                // Apply additional forward force to maintain momentum when correcting sideways movement
                if (Math.abs(lateralAngle) > Math.PI * 0.25) {
                  const forwardBoost = this.carState.speed * 0.05 * dt;
                  this.car.body.velocity.x += Math.cos(forwardDirection) * forwardBoost;
                  this.car.body.velocity.y += Math.sin(forwardDirection) * forwardBoost;
                }
              }
              
              // Gradually reduce slip angle during normal driving
              if (this.carState.slipAngle > 0) {
                this.carState.slipAngle = Math.max(0, this.carState.slipAngle - dt * 2)
              }
              
              // Apply braking
              if (brakeInput > 0) {
                this.car.body.velocity.x *= 0.95
                this.car.body.velocity.y *= 0.95
              }
              
              // Apply grip-based steering
              const gripFactor = this.carState.currentGrip
              const steeringPower = effectiveSteeringInput * (3 - Math.min(this.carState.speed / maxSpeed, 0.8) * 2)
              
              // Apply return-to-center steering force when not actively steering
              // This makes the car naturally want to go straight when not steering
              if (Math.abs(steeringInput) < 0.1 && this.carState.speed > 30) {
                const returnStrength = 0.1 * Math.min(1.0, this.carState.speed / 200);
                this.car.body.angularVelocity *= (1 - returnStrength);
              }
              
              this.car.setAngularVelocity(steeringPower * 150 * gripFactor)
              
              // If moving fast + sharp turn + low grip, induce a natural drift
              if (this.carState.speed > 150 && Math.abs(effectiveSteeringInput) > 0.8 && this.carState.currentGrip < 0.7) {
                this.carState.slipAngle += dt * 0.5
                
                // Visual feedback for losing grip
                if (time % 300 < 10) {
                  const slipWarning = this.add.text(
                    this.car.x,
                    this.car.y - 30,
                    "LOSING GRIP!",
                    {
                      fontSize: "14px",
                      color: "#ff8800",
                      stroke: "#000",
                      strokeThickness: 2
                    }
                  ).setOrigin(0.5)
                  
                  // Animate and remove
                  this.tweens.add({
                    targets: slipWarning,
                    y: slipWarning.y - 30,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => slipWarning.destroy()
                  })
                }
              }
              
              // Slowly reduce style meter over time
              if (this.carState.styleMeter > 0) {
                this.carState.styleMeter = Math.max(0, this.carState.styleMeter - dt * 10)
              }
            }
            
            // Update score display and game state
            if (this.gameScore !== score) {
              setScore(this.gameScore)
            }
            
            // Update time
            setTime(time)

            // ===== VISUAL FEEDBACK =====
            // Update drift angle indicator
            this.angleIndicator.clear()
            if (this.carState.drifting || Math.abs(this.carState.slipAngle) > 0.1) {
              // Draw background
              this.angleIndicator.fillStyle(0x000000, 0.7)
              this.angleIndicator.fillRect(0, 0, 100, 20)
              
              // Draw angle indicator
              const angleWidth = Math.abs(this.carState.slipAngle) * 100
              const angleColor = this.carState.slipAngle > 0.7 ? 0xff0000 : (this.carState.slipAngle > 0.4 ? 0xffff00 : 0x00ff00)
              this.angleIndicator.fillStyle(angleColor, 0.8)
              this.angleIndicator.fillRect(0, 0, angleWidth, 20)
              
              // Draw label
              if (!this.angleText) {
                this.angleText = this.add.text(50, 10, "DRIFT ANGLE", {
                  fontSize: "12px",
                  color: "#ffffff"
                }).setScrollFactor(0).setOrigin(0.5)
              }
            } else if (this.angleIndicator) {
              this.angleIndicator.clear()
              if (this.angleText) this.angleText.setAlpha(0)
            }
            
            // Update style meter
            this.styleMeterBg.clear()
            this.styleMeterFill.clear()
            
            // Background
            this.styleMeterBg.fillStyle(0x000000, 0.7)
            this.styleMeterBg.fillRect(0, 0, 200, 20)
            
            // Fill based on current style points
            const fillPercent = this.carState.styleMeter / this.carState.styleLimit
            let fillColor = 0x00ff00
            if (fillPercent > 0.5) fillColor = 0xffff00
            if (fillPercent > 0.8) fillColor = 0xff0000
            
            this.styleMeterFill.fillStyle(fillColor, 0.8)
            this.styleMeterFill.fillRect(0, 0, 200 * fillPercent, 20)
            
            // Show boost instruction if style meter is at least 25% full
            this.boostInstructionText.setAlpha(fillPercent >= 0.25 ? 1 : 0)

            // Store input history for counter-steering prediction
            this.carState.inputHistory.push({
              steering: steeringInput,
              time: time
            })
            
            // Only keep recent history (last 1 second)
            while (this.carState.inputHistory.length > 0 && 
                  time - this.carState.inputHistory[0].time > 1000) {
              this.carState.inputHistory.shift()
            }
            
            // Calculate average steering input over the last 0.5 seconds
            recentInputs = this.carState.inputHistory.filter((input: SteeringInput) => time - input.time < 500)
            avgSteeringInput = 0
            if (recentInputs.length > 0) {
              avgSteeringInput = recentInputs.reduce((sum: number, input: SteeringInput) => sum + input.steering, 0) / recentInputs.length
            }
          },
          collectCoin: function (this: any, car: any, coin: any) {
            coin.destroy()
            
            // Increase the score
            this.gameScore += 100
            this.scoreText.setText(`Score: ${this.gameScore}`)
            
            // Create a score popup
            const scorePopup = this.add.text(car.x, car.y - 30, "+100", {
              fontSize: "24px",
              color: "#ffff00",
              stroke: "#000",
              strokeThickness: 3
            }).setOrigin(0.5)
            
            // Animate and remove the popup
            this.tweens.add({
              targets: scorePopup,
              y: car.y - 80,
              alpha: 0,
              scale: 1.5,
              duration: 1000,
              onComplete: () => scorePopup.destroy()
            })
            
            // Create a new coin in a random position
            const worldBounds = this.physics.world.bounds
            const x = Phaser.Math.Between(100, worldBounds.width - 100)
            const y = Phaser.Math.Between(100, worldBounds.height - 100)
            const newCoin = this.coins.create(x, y, "coin")
            newCoin.setCircle(10)
            newCoin.setBounce(0.2)
          },
          collectBoost: function (this: any, car: any, boost: any) {
            boost.destroy()
            
            // Apply boost
            this.carState.boostTime = 5 // 5 seconds of boost
            this.carState.boostPower = 2 // Double speed
            
            // Visual feedback
            car.setTint(0xff00ff) // Purple tint for boost
            
            // Create a boost popup
            const boostPopup = this.add.text(car.x, car.y - 30, "BOOST!", {
              fontSize: "24px",
              color: "#00ffff",
              stroke: "#000", 
              strokeThickness: 3
            }).setOrigin(0.5)
            
            // Animate and remove the popup
            this.tweens.add({
              targets: boostPopup,
              y: car.y - 80,
              alpha: 0,
              scale: 1.5,
              duration: 1000,
              onComplete: () => boostPopup.destroy()
            })
            
            // Create a new boost in a random position
            const worldBounds = this.physics.world.bounds
            const x = Phaser.Math.Between(100, worldBounds.width - 100)
            const y = Phaser.Math.Between(100, worldBounds.height - 100)
            const newBoost = this.boosts.create(x, y, "boost")
            newBoost.setCircle(10)
            newBoost.setScale(1.5)
          }
        }
      }

      // Create the game instance
      new Phaser.Game(config)
    } catch (error) {
      const errorMessage = `Failed to initialize Phaser game: ${error}`
      setDebugInfo(errorMessage)
      console.error(errorMessage)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Load Phaser from CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"
        onLoad={handlePhaserLoad}
        strategy="afterInteractive"
      />

      <div ref={gameRef} className="h-full w-full" />

      {/* Debug overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 p-2 text-white text-sm rounded">{debugInfo}</div>

      {gameStatus === "playing" && (
        <div className="absolute top-4 right-4 p-4 bg-black/70 text-white rounded">
          <div className="text-xl">Score: {score}</div>
          <div>Time: {Math.floor(time / 1000)}s</div>
        </div>
      )}
    </div>
  )
}

