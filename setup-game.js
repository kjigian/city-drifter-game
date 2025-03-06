const fs = require('fs');
const path = require('path');

// Define the file structure and content
const files = [
  {
    path: 'app/page.tsx',
    content: `"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"

// Dynamically import the Game component with no SSR
const Game = dynamic(() => import("@/components/game"), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Set a timeout to show a message if the game takes too long to load
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true)
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      {isClient ? <Game /> : <LoadingScreen />}

      {loadingTimeout && (
        <div className="absolute bottom-8 left-0 right-0 text-center text-yellow-400 bg-black/80 p-2">
          Game is taking longer than expected to load. Please be patient or try refreshing the page.
        </div>
      )}
    </main>
  )
}`
  },
  {
    path: 'app/layout.tsx',
    content: `import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { GameStateProvider } from "@/hooks/use-game-state"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "City Drifter",
  description: "A top-down drift racing game",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  )
}`
  },
  {
    path: 'app/globals.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 0, 0, 0;
  --background-end-rgb: 0, 0, 0;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom, transparent, rgb(var(--background-end-rgb))) rgb(var(--background-start-rgb));
  overflow: hidden;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
  },
  {
    path: 'tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`
  },
  {
    path: 'components/loading-screen.tsx',
    content: `import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-yellow-400 md:text-6xl">CITY DRIFTER</h1>
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
        </div>
        <p className="mt-4 text-xl text-white">Loading game engine...</p>
        <p className="mt-2 text-sm text-gray-400">Use arrow keys to drive. Up to accelerate, Left/Right to steer.</p>
      </div>
    </div>
  )
}`
  },
  {
    path: 'components/game-ui.tsx',
    content: `import type { GameStatus } from "@/types/game-types"
import { formatTime } from "@/utils/format-time"
import { Gamepad2 } from 'lucide-react'

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
}`
  },
  {
    path: 'components/game.tsx',
    content: `"use client"

import { useRef, useState } from "react"
import { useGameState } from "@/hooks/use-game-state"
import Script from "next/script"

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

            // Show loading progress
            this.load.on("progress", (value: number) => {
              loadingText.setText(\`Loading: \${Math.floor(value * 100)}%\`)
            })

            // Create a simple car texture programmatically
            const carGraphics = this.make.graphics({ x: 0, y: 0 })
            carGraphics.fillStyle(0xff0000)
            carGraphics.fillRect(-20, -10, 40, 20)
            carGraphics.fillStyle(0xffff00)
            carGraphics.fillRect(10, -5, 10, 10)
            carGraphics.generateTexture("car", 40, 20)

            // Create drift trail texture
            const trailGraphics = this.make.graphics({ x: 0, y: 0 })
            trailGraphics.fillStyle(0x333333)
            trailGraphics.fillRect(0, 0, 8, 8)
            trailGraphics.generateTexture("trail", 8, 8)

            // Create smoke particle texture
            const smokeGraphics = this.make.graphics({ x: 0, y: 0 })
            smokeGraphics.fillStyle(0xcccccc)
            smokeGraphics.fillCircle(8, 8, 8)
            smokeGraphics.generateTexture("smoke", 16, 16)

            // Create spark particle texture
            const sparkGraphics = this.make.graphics({ x: 0, y: 0 })
            sparkGraphics.fillStyle(0xffff00)
            sparkGraphics.fillCircle(4, 4, 4)
            sparkGraphics.generateTexture("spark", 8, 8)

            // Create cloud texture
            const cloudGraphics = this.make.graphics({ x: 0, y: 0 })
            cloudGraphics.fillStyle(0xaaaaaa)
            cloudGraphics.fillCircle(20, 20, 20)
            cloudGraphics.fillCircle(35, 15, 15)
            cloudGraphics.fillCircle(50, 20, 20)
            cloudGraphics.fillCircle(30, 25, 15)
            cloudGraphics.generateTexture("cloud", 70, 40)

            // Create building textures
            const buildingTypes = [
              { name: "building1", color: 0x444444 },
              { name: "building2", color: 0x555555 },
              { name: "building3", color: 0x666666 },
            ]

            buildingTypes.forEach((building) => {
              const buildingGraphics = this.make.graphics({ x: 0, y: 0 })
              buildingGraphics.fillStyle(building.color)
              buildingGraphics.fillRect(0, 0, 80, 80)
              buildingGraphics.generateTexture(building.name, 80, 80)
            })

            // Create road texture
            const roadGraphics = this.make.graphics({ x: 0, y: 0 })
            roadGraphics.fillStyle(0x333333)
            roadGraphics.fillRect(0, 0, 100, 100)

            // Add road markings
            roadGraphics.fillStyle(0xffffff)
            roadGraphics.fillRect(48, 0, 4, 40)
            roadGraphics.fillRect(48, 60, 4, 40)
            roadGraphics.generateTexture("road", 100, 100)

            // Create intersection texture
            const intersectionGraphics = this.make.graphics({ x: 0, y: 0 })
            intersectionGraphics.fillStyle(0x333333)
            intersectionGraphics.fillRect(0, 0, 100, 100)
            intersectionGraphics.generateTexture("intersection", 100, 100)

            this.load.on("complete", () => {
              loadingText.setText("Loading complete!")
              setDebugInfo("Assets loaded successfully")
            })
          },
          create: function (this: any) {
            setDebugInfo("Game created, setting up scene...")

            // Set game status
            setGameStatus("playing")

            // Create a larger world
            const worldSize = 3000
            this.physics.world.setBounds(0, 0, worldSize, worldSize)

            // Create a background
            this.add.rectangle(worldSize / 2, worldSize / 2, worldSize, worldSize, 0x222222)

            // Add ambient clouds
            this.clouds = []
            for (let i = 0; i < 20; i++) {
              const x = Phaser.Math.Between(0, worldSize)
              const y = Phaser.Math.Between(0, worldSize)
              const cloud = this.add.image(x, y, "cloud")
              cloud.setAlpha(0.2)
              cloud.setScale(Phaser.Math.FloatBetween(0.5, 2))
              cloud.setDepth(-10) // Behind everything

              // Add movement animation
              this.tweens.add({
                targets: cloud,
                x: x + Phaser.Math.Between(-200, 200),
                y: y + Phaser.Math.Between(-200, 200),
                duration: Phaser.Math.Between(30000, 60000),
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
              })

              this.clouds.push(cloud)
            }

            // Create groups for roads and buildings
            this.roadsGroup = this.add.group()
            this.buildingsGroup = this.physics.add.staticGroup()
            this.driftZonesGroup = this.add.group()

            // Create a more natural city layout - INLINE IMPLEMENTATION
            // ===== START CITY CREATION =====
            const gridSize = 100
            const citySize = Math.floor(worldSize / gridSize)

            // Create horizontal roads with some variation
            for (let y = 3; y < citySize; y += Phaser.Math.Between(3, 5)) {
              // Add some curves and variations to roads
              let prevX = 0
              let prevY = y * gridSize

              for (let x = 0; x < citySize; x += 1) {
                const worldX = x * gridSize
                // Add slight vertical variation to make roads less straight
                const variation = x % 5 === 0 ? Phaser.Math.Between(-20, 20) : 0
                const worldY = prevY + variation

                // Create road segment
                const roadTile = this.add.image(worldX, worldY, "road")

                // Calculate angle based on previous position
                if (x > 0) {
                  const angle = Phaser.Math.Angle.Between(prevX, prevY, worldX, worldY)
                  roadTile.setRotation(angle + Math.PI / 2)
                } else {
                  roadTile.setAngle(90)
                }

                this.roadsGroup.add(roadTile)

                prevX = worldX
                prevY = worldY
              }
            }

            // Create vertical roads with some variation
            for (let x = 3; x < citySize; x += Phaser.Math.Between(3, 5)) {
              // Add some curves and variations to roads
              let prevX = x * gridSize
              let prevY = 0

              for (let y = 0; y < citySize; y += 1) {
                const worldY = y * gridSize
                // Add slight horizontal variation to make roads less straight
                const variation = y % 5 === 0 ? Phaser.Math.Between(-20, 20) : 0
                const worldX = prevX + variation

                // Create road segment
                const roadTile = this.add.image(worldX, worldY, "road")

                // Calculate angle based on previous position
                if (y > 0) {
                  const angle = Phaser.Math.Angle.Between(prevX, prevY, worldX, worldY)
                  roadTile.setRotation(angle)
                }

                this.roadsGroup.add(roadTile)

                prevX = worldX
                prevY = worldY
              }
            }

            // Create some circular/curved roads for better drifting
            const numCircuits = 3

            for (let i = 0; i < numCircuits; i++) {
              // Create a circular or oval track
              const centerX = Phaser.Math.Between(worldSize * 0.2, worldSize * 0.8)
              const centerY = Phaser.Math.Between(worldSize * 0.2, worldSize * 0.8)
              const radiusX = Phaser.Math.Between(200, 400)
              const radiusY = Phaser.Math.Between(200, 400)

              // Create a circular road
              const segments = 24
              const angleStep = (Math.PI * 2) / segments

              for (let j = 0; j < segments; j++) {
                const angle = j * angleStep
                const x = centerX + Math.cos(angle) * radiusX
                const y = centerY + Math.sin(angle) * radiusY

                const roadTile = this.add.image(x, y, "road")
                roadTile.setRotation(angle + Math.PI / 2)
                roadTile.setTint(0x666666) // Slightly different color

                this.roadsGroup.add(roadTile)
              }

              // Mark this as a drift zone with a subtle indicator
              const driftZone = this.add.ellipse(centerX, centerY, radiusX * 2 + 50, radiusY * 2 + 50, 0x00ffff, 0.05)
              driftZone.setDepth(-5)
              this.driftZonesGroup.add(driftZone)

              // Add "DRIFT ZONE" text
              const driftText = this.add
                .text(centerX, centerY - radiusY - 30, "DRIFT ZONE", {
                  fontSize: "24px",
                  color: "#00ffff",
                  stroke: "#000000",
                  strokeThickness: 4,
                })
                .setOrigin(0.5)

              // Add pulsing animation to the text
              this.tweens.add({
                targets: driftText,
                alpha: { from: 0.7, to: 1 },
                scale: { from: 0.9, to: 1.1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
              })
            }

            // Create some open areas/parking lots for freestyle drifting
            const numOpenAreas = 4

            for (let i = 0; i < numOpenAreas; i++) {
              const areaX = Phaser.Math.Between(worldSize * 0.1, worldSize * 0.9)
              const areaY = Phaser.Math.Between(worldSize * 0.1, worldSize * 0.9)
              const areaWidth = Phaser.Math.Between(300, 600)
              const areaHeight = Phaser.Math.Between(300, 600)

              // Create an open area with asphalt texture
              const openArea = this.add.rectangle(areaX, areaY, areaWidth, areaHeight, 0x444444)
              openArea.setDepth(-5)

              // Add some markings/patterns to the open area
              for (let j = 0; j < 10; j++) {
                const markingX = areaX + Phaser.Math.Between(-areaWidth / 2 + 20, areaWidth / 2 - 20)
                const markingY = areaY + Phaser.Math.Between(-areaHeight / 2 + 20, areaHeight / 2 - 20)

                const marking = this.add.rectangle(markingX, markingY, 20, 20, 0xffffff, 0.3)
                marking.setDepth(-4)
              }

              // Mark as a drift zone
              const driftZone = this.add.rectangle(areaX, areaY, areaWidth + 20, areaHeight + 20, 0xff00ff, 0.05)
              driftZone.setDepth(-5)
              this.driftZonesGroup.add(driftZone)

              // Add "FREESTYLE ZONE" text
              const freestyleText = this.add
                .text(areaX, areaY - areaHeight / 2 - 20, "FREESTYLE ZONE", {
                  fontSize: "24px",
                  color: "#ff00ff",
                  stroke: "#000000",
                  strokeThickness: 4,
                })
                .setOrigin(0.5)

              // Add pulsing animation to the text
              this.tweens.add({
                targets: freestyleText,
                alpha: { from: 0.7, to: 1 },
                scale: { from: 0.9, to: 1.1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
              })
            }

            // Add buildings, avoiding roads and special areas
            for (let x = 0; x < citySize; x++) {
              for (let y = 0; y < citySize; y++) {
                const worldX = x * gridSize
                const worldY = y * gridSize

                // Skip if too close to a road (roads are at x or y % 3 === 1)
                if (x % 3 === 1 || y % 3 === 1 || x % 3 === 2 || y % 3 === 2 || x % 3 === 0 || y % 3 === 0) {
                  // Check if we're near a road
                  const nearRoad = this.roadsGroup.getChildren().some((road: any) => {
                    return Phaser.Math.Distance.Between(worldX, worldY, road.x, road.y) < gridSize * 1.2
                  })

                  // Check if we're in a drift zone
                  const inDriftZone = this.driftZonesGroup.getChildren().some((zone: any) => {
                    return Phaser.Geom.Rectangle.Contains(zone.getBounds(), worldX, worldY)
                  })

                  // Only place buildings if not near a road and not in a drift zone
                  if (!nearRoad && !inDriftZone && Phaser.Math.Between(0, 10) > 5) {
                    // Choose random building type
                    const buildingType = Phaser.Math.Between(1, 3)
                    const buildingKey = \`building\${buildingType}\`

                    // Create building with random scale for variety
                    const scale = Phaser.Math.FloatBetween(0.8, 1.2)
                    const building = this.physics.add.staticImage(worldX, worldY, buildingKey)
                    building.setScale(scale)

                    // Add subtle animation to some buildings
                    if (Phaser.Math.Between(0, 10) > 7) {
                      this.tweens.add({
                        targets: building,
                        scaleX: scale * 1.05,
                        scaleY: scale * 0.95,
                        duration: Phaser.Math.Between(2000, 5000),
                        ease: "Sine.easeInOut",
                        yoyo: true,
                        repeat: -1,
                      })
                    }

                    // Add to buildings group
                    this.buildingsGroup.add(building)
                  }
                }
              }
            }

            // Add a helper text about drift zones
            const helpText = this.add
              .text(this.cameras.main.width / 2, 180, "Find DRIFT ZONES for better scoring!", {
                fontSize: "20px",
                color: "#00ffff",
                stroke: "#000000",
                strokeThickness: 3,
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
              })
              .setOrigin(0.5)
              .setScrollFactor(0)
              .setDepth(100)

            // Make it disappear after a few seconds
            this.tweens.add({
              targets: helpText,
              alpha: 0,
              delay: 5000,
              duration: 1000,
              onComplete: () => helpText.destroy(),
            })
            // ===== END CITY CREATION =====

            // Create a car using our generated texture
            this.car = this.physics.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "car")

            // Set car physics properties
            this.car.setDamping(true)
            this.car.setDrag(0.95)
            this.car.setMaxVelocity(400)
            this.car.setCollideWorldBounds(true)
            this.car.setBounce(0.2)

            // Add car shadow for depth effect
            this.carShadow = this.add.image(this.car.x, this.car.y, "car")
            this.carShadow.setTint(0x000000)
            this.carShadow.setAlpha(0.3)
            this.carShadow.setDepth(this.car.depth - 1)

            // Add collision between car and buildings
            this.physics.add.collider(this.car, this.buildingsGroup, this.handleCollision, null, this)

            // Set up camera to follow the car
            this.cameras.main.startFollow(this.car, true, 0.1, 0.1)
            this.cameras.main.setZoom(1)

            // Create particle manager for smoke
            this.smokeParticles = this.add.particles("smoke")

            // Create smoke emitter
            this.smokeEmitter = this.smokeParticles.createEmitter({
              speed: { min: 20, max: 50 },
              angle: { min: 0, max: 360 },
              scale: { start: 0.6, end: 0 },
              alpha: { start: 0.5, end: 0 },
              lifespan: 800,
              gravityY: 0,
              quantity: 2,
              blendMode: "ADD",
              on: false, // Start with emitter off
            })

            // Create particle manager for trail
            this.trailParticles = this.add.particles("trail")

            // Create trail emitter
            this.trailEmitter = this.trailParticles.createEmitter({
              speed: 0,
              lifespan: 1000,
              scale: { start: 1, end: 0.5 },
              alpha: { start: 0.7, end: 0 },
              quantity: 1,
              frequency: 50,
              on: false, // Start with emitter off
            })

            // Create spark particles for collisions and boosts
            this.sparkParticles = this.add.particles("spark")
            this.sparkEmitter = this.sparkParticles.createEmitter({
              speed: { min: 50, max: 150 },
              angle: { min: 0, max: 360 },
              scale: { start: 1, end: 0 },
              alpha: { start: 1, end: 0 },
              lifespan: 600,
              gravityY: 0,
              quantity: 10,
              on: false,
            })

            // Set up keyboard controls
            this.cursors = this.input.keyboard.createCursorKeys()
            this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)

            // Set up mouse/touch input
            this.input.on("pointermove", (pointer: any) => {
              this.pointer = pointer
            })

            // Initialize car physics state
            this.carState = {
              speed: 0,
              acceleration: 0,
              steering: 0,
              drifting: false,
              driftFactor: 0,
              driftDirection: 0,
              driftTime: 0,
              driftScore: 0,
              driftMultiplier: 1,
              boostTime: 0,
              boostFactor: 1,
              controlMode: "keys", // 'keys' or 'mouse'
              driftInitialSpeed: 0,
              driftInitialDirection: 0
            }

            // Initialize score
            this.gameScore = 0
            this.startTime = this.time.now

            // Create score text
            this.scoreText = this.add
              .text(16, 16, "Score: 0", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
              })
              .setScrollFactor(0)

            // Add pulsing animation to score when it changes
            this.lastScore = 0

            // Add drift score text
            this.driftScoreText = this.add
              .text(16, 60, "Drift: 0", {
                fontSize: "24px",
                color: "#ffff00",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
              })
              .setScrollFactor(0)
              .setAlpha(0)

            // Add multiplier text
            this.multiplierText = this.add
              .text(16, 100, "x1", {
                fontSize: "24px",
                color: "#ff00ff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
              })
              .setScrollFactor(0)
              .setAlpha(0)

            // Add boost text
            this.boostText = this.add
              .text(16, 140, "BOOST!", {
                fontSize: "24px",
                color: "#00ffff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
              })
              .setScrollFactor(0)
              .setAlpha(0)

            // Add control mode text
            this.controlModeText = this.add
              .text(16, this.cameras.main.height - 50, "Control Mode: KEYS", {
                fontSize: "18px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
              })
              .setScrollFactor(0)

            // Add control instructions
            this.controlsText = this.add
              .text(
                this.cameras.main.width / 2,
                this.cameras.main.height - 50,
                "Arrow keys to drive, SHIFT to drift, SPACE to toggle control mode",
                {
                  fontSize: "18px",
                  color: "#fff",
                  backgroundColor: "#000",
                  padding: { x: 20, y: 10 },
                },
              )
              .setOrigin(0.5)
              .setScrollFactor(0)

            // Add key press listener for toggling control mode
            this.spaceKey.on("down", () => {
              this.carState.controlMode = this.carState.controlMode === "keys" ? "mouse" : "keys"
              this.controlModeText.setText(`Control Mode: ${this.carState.controlMode.toUpperCase()}`)

              if (this.carState.controlMode === "mouse") {
                this.controlsText.setText("Move cursor to steer, CTRL to accelerate, SHIFT to drift")
              } else {
                this.controlsText.setText("Arrow keys to drive, SHIFT to drift, SPACE to toggle control mode")
              }

              // Add animation for control mode change
              this.tweens.add({
                targets: [this.controlModeText, this.controlsText],
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                ease: "Bounce.easeOut",
              })
            })

            setDebugInfo("Game ready! Use arrow keys to drive, SHIFT to drift, SPACE to toggle control mode")
          },
          handleCollision: function (this: any, car: any, building: any) {
            // Calculate collision impact based on car speed
            const impact = this.carState.speed * 0.5

            // Apply visual feedback for collision
            this.cameras.main.shake(100, Math.min(0.01 * impact, 0.05))

            // Emit sparks at collision point
            if (this.sparkEmitter) {
              this.sparkEmitter.setPosition(car.x, car.y)
              this.sparkEmitter.on = true
              this.sparkEmitter.explode(20)

              // Turn off after a short time
              this.time.delayedCall(200, () => {
                if (this.sparkEmitter) {
                  this.sparkEmitter.on = false
                }
              })
            }

            // Apply score penalty for collision
            if (impact > 5) {
              const penalty = Math.floor(impact * 10)
              this.gameScore = Math.max(0, this.gameScore - penalty)

              // Show penalty text - inline instead of calling showScorePopup
              const x = this.car.x
              const y = this.car.y - 50

              const text = this.add
                .text(x, y, `-${penalty}`, {
                  fontSize: "24px",
                  color: "#ff0000",
                  stroke: "#000000",
                  strokeThickness: 4,
                })
                .setOrigin(0.5)

              // Add more dramatic animation for penalty
              this.tweens.add({
                targets: text,
                y: y - 80,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 1000,
                ease: "Bounce.easeOut",
                onComplete: () => {
                  text.destroy()
                },
              })

              // Reset drift directly (not calling resetDrift function)
              // If we were drifting, add the accumulated drift score
              if (this.carState.drifting && this.carState.driftScore > 0) {
                const finalDriftScore = Math.floor(this.carState.driftScore * this.carState.driftMultiplier)
                this.gameScore += finalDriftScore

                // Show drift score popup - inline
                const driftText = this.add
                  .text(x + 30, y - 30, `+${finalDriftScore}`, {
                    fontSize: "24px",
                    color: "#00ffff",
                    stroke: "#000000",
                    strokeThickness: 4,
                  })
                  .setOrigin(0.5)

                this.tweens.add({
                  targets: driftText,
                  y: y - 100,
                  alpha: 0,
                  duration: 1000,
                  onComplete: () => {
                    driftText.destroy()
                  },
                })
              }

              // Reset drift state
              this.carState.drifting = false
              this.carState.driftFactor = 0
              this.carState.driftTime = 0
              this.carState.driftScore = 0
              this.carState.driftMultiplier = 1

              // Hide drift score text
              this.tweens.add({
                targets: [this.driftScoreText, this.multiplierText],
                alpha: 0,
                duration: 300,
              })

              // Stop emitting smoke and trail
              if (this.smokeEmitter) {
                this.smokeEmitter.on = false
              }
              if (this.trailEmitter) {
                this.trailEmitter.on = false
              }
            }
          },

          update: function (this: any, time: number, delta: number) {
            // Convert delta to seconds for physics calculations
            const dt = delta / 1000

            // Get input based on control mode
            let accelerationInput = 0
            let steeringInput = 0
            let driftInput = 0

            if (this.carState.controlMode === "keys") {
              // Keyboard controls
              accelerationInput = this.cursors.up.isDown ? 1 : this.cursors.down.isDown ? -0.5 : 0
              steeringInput = this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0
              driftInput = this.shiftKey.isDown ? 1 : 0
            } else {
              // Mouse/cursor controls
              if (this.pointer) {
                // Calculate angle to pointer
                const dx = this.pointer.worldX - this.car.x
                const dy = this.pointer.worldY - this.car.y
                const targetAngle = Math.atan2(dy, dx)

                // Get current car angle (Phaser uses a different angle system)
                const carAngle = this.car.rotation

                // Calculate the difference between angles
                let angleDiff = targetAngle - carAngle

                // Normalize angle difference to be between -PI and PI
                if (angleDiff > Math.PI) angleDiff -= Math.PI * 2
                if (angleDiff < -Math.PI) angleDiff += Math.PI * 2

                // Convert angle difference to steering input (-1 to 1)
                steeringInput = Phaser.Math.Clamp(angleDiff * 2, -1, 1)

                // Acceleration based on distance to pointer
                const distance = Math.sqrt(dx * dx + dy * dy)
                const minDistance = 100 // Minimum distance to maintain
                const maxDistance = 300 // Distance at which to reach max speed

                // Accelerate if CTRL is pressed or if pointer is far enough
                if (this.ctrlKey.isDown || distance > minDistance) {
                  accelerationInput = Phaser.Math.Clamp((distance - minDistance) / (maxDistance - minDistance), 0, 1)
                }

                // Drift input from SHIFT key
                driftInput = this.shiftKey.isDown ? 1 : 0
              }
            }

            // Update boost timer
            if (this.carState.boostTime > 0) {
              this.carState.boostTime -= dt
              if (this.carState.boostTime <= 0) {
                this.carState.boostTime = 0
                this.carState.boostFactor = 1
              }
            }

            // ---- CAR PHYSICS UPDATE ----
            // Calculate base acceleration force with boost
            const accelerationForce = accelerationInput * 300 * this.carState.boostFactor // Increased base acceleration

            // Apply acceleration to speed
            this.carState.acceleration = accelerationForce
            this.carState.speed += this.carState.acceleration * dt

            // Apply natural deceleration when not accelerating
            if (accelerationInput === 0) {
              this.carState.speed *= 0.97 // Slightly more deceleration
            }

            // Clamp speed with boost factor
            const maxSpeed = 350 * this.carState.boostFactor // Increased max speed
            this.carState.speed = Phaser.Math.Clamp(this.carState.speed, -200, maxSpeed)

            // Calculate steering force based on speed
            const speedFactor = Math.min(Math.abs(this.carState.speed) / maxSpeed, 1)
            const steeringForce = steeringInput * (3.5 - speedFactor * 2) // More responsive steering

            // Check if conditions are right for drifting - easier to initiate
            const canDrift = Math.abs(this.carState.speed) > 120 && Math.abs(steeringInput) > 0.2;

            // Handle drifting
            if (driftInput > 0 && canDrift) {
              if (!this.carState.drifting) {
                // Start drifting
                this.carState.drifting = true;
                this.carState.driftDirection = Math.sign(steeringInput);
                this.carState.driftTime = 0;
                this.carState.driftScore = 0;
                this.carState.driftMultiplier = 1;
                
                // Store the car's velocity at drift initiation for momentum
                this.carState.driftInitialSpeed = this.carState.speed;
                this.carState.driftInitialDirection = this.car.rotation;
                
                // Apply a slight counter-steer effect at drift initiation
                this.car.setAngularVelocity(steeringForce * -100);
                
                // Start emitting smoke and trail
                if (this.smokeEmitter) {
                  this.smokeEmitter.on = true;
                }
                if (this.trailEmitter) {
                  this.trailEmitter.on = true;
                }
                
                // Add car tilt animation when starting drift
                this.tweens.add({
                  targets: this.car,
                  scaleY: 0.9,
                  scaleX: 1.1,
                  duration: 200,
                  ease: "Sine.easeOut",
                });
              }
              
              // Increase drift factor more gradually for smoother drifting
              this.carState.driftFactor = Math.min(this.carState.driftFactor + dt * 2, 1.8);
              
              // Accumulate drift time and score
              this.carState.driftTime += dt;
              
              // Calculate drift score based on speed, drift factor, and steering
              // More points for higher speeds and sharper turns
              let driftPoints = dt * Math.abs(this.carState.speed) * 0.15 * Math.abs(steeringInput);
              
              // Check if in a drift zone for bonus points
              const inDriftZone = this.driftZonesGroup.getChildren().some((zone: any) => {
                return Phaser.Geom.Rectangle.Contains(zone.getBounds(), this.car.x, this.car.y);
              });
              
              if (inDriftZone) {
                // Double points in drift zones
                driftPoints *= 2;
                
                // Visual indicator that you're in a drift zone
                if (!this.inDriftZoneEffect) {
                  this.inDriftZoneEffect = true;
                  
                  // Add a subtle glow effect to the car
                  this.car.setTint(0x00ffff);
                  
                  // Show a "DRIFT ZONE BONUS" text
                  const bonusText = this.add
                    .text(this.car.x, this.car.y - 70, "DRIFT ZONE BONUS x2", {
                      fontSize: "18px",
                      color: "#00ffff",
                      stroke: "#000000",
                      strokeThickness: 3,
                    })
                    .setOrigin(0.5);
                  
                  // Animate and remove the text
                  this.tweens.add({
                    targets: bonusText,
                    y: bonusText.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => bonusText.destroy(),
                  });
                }
              } else if (this.inDriftZoneEffect) {
                this.inDriftZoneEffect = false;
                
                // Remove the glow effect if not boosting
                if (this.carState.boostTime <= 0) {
                  this.car.clearTint();
                }
              }
              
              this.carState.driftScore += driftPoints;
              
              // Increase multiplier based on drift time - faster multiplier growth
              if (this.carState.driftTime > 0.5) {
                this.carState.driftMultiplier = Math.min(1 + (this.carState.driftTime - 0.5) * 0.5, 5);
              }
              
              // ===== IMPROVED DRIFT PHYSICS =====
              // Calculate the blend between the car's forward direction and the drift direction
              // This creates a more realistic sliding effect where the car maintains some forward momentum
              const forwardWeight = 0.4; // How much the car continues in its forward direction
              const driftWeight = 1 - forwardWeight; // How much the car slides sideways
              
              // Calculate the drift angle - more exaggerated for better visual effect
              const driftAngle = this.carState.driftDirection * this.carState.driftFactor * 0.8;
              
              // Apply counter-steering effect - allows the player to control the drift
              // This makes the drift feel more controllable and realistic
              const counterSteerFactor = 0.7; // How much counter-steering affects the drift
              const counterSteer = -steeringInput * counterSteerFactor * this.carState.driftFactor;
              
              // Combine the drift angle with counter-steering
              const effectiveDriftAngle = driftAngle + counterSteer;
              
              // Calculate the forward and drift components of velocity
              const forwardVelocity = this.carState.speed * forwardWeight;
              const driftVelocity = this.carState.speed * driftWeight;
              
              // Apply velocity with drift - more realistic sliding
              const moveAngle = this.car.rotation;
              const driftMoveAngle = moveAngle + effectiveDriftAngle;
              
              // Apply the forward component
              const forwardVelocityX = Math.cos(moveAngle) * forwardVelocity;
              const forwardVelocityY = Math.sin(moveAngle) * forwardVelocity;
              
              // Apply the drift component
              const driftVelocityX = Math.cos(driftMoveAngle) * driftVelocity;
              const driftVelocityY = Math.sin(driftMoveAngle) * driftVelocity;
              
              // Combine the components
              this.car.body.velocity.x = forwardVelocityX + driftVelocityX;
              this.car.body.velocity.y = forwardVelocityY + driftVelocityY;
              
              // Apply steering during drift - more responsive to allow counter-steering
              const driftSteeringForce = steeringInput * (2.5 + this.carState.driftFactor * 0.5);
              this.car.setAngularVelocity(driftSteeringForce * 150);
              
              // Adjust smoke emission rate based on drift intensity
              if (this.smokeEmitter) {
                this.smokeEmitter.setQuantity(Math.floor(3 + this.carState.driftFactor * 10));
                
                // Make smoke more visible during intense drifts
                const smokeAlpha = 0.3 + this.carState.driftFactor * 0.3;
                this.smokeEmitter.setAlpha({ start: smokeAlpha, end: 0 });
              }
              
              // Position trail emitters at both rear wheels for better visual effect
              if (this.trailEmitter) {
                // Left rear wheel
                const trailOffsetX = -15;
                const trailOffsetY = 8;
                const leftTrailX = this.car.x + 
                  Math.cos(this.car.rotation + Math.PI) * trailOffsetX - 
                  Math.sin(this.car.rotation) * trailOffsetY;
                const leftTrailY = this.car.y + 
                  Math.sin(this.car.rotation + Math.PI) * trailOffsetX + 
                  Math.cos(this.car.rotation) * trailOffsetY;
                
                // Right rear wheel
                const rightTrailX = this.car.x + 
                  Math.cos(this.car.rotation + Math.PI) * trailOffsetX - 
                  Math.sin(this.car.rotation) * -trailOffsetY;
                const rightTrailY = this.car.y + 
                  Math.sin(this.car.rotation + Math.PI) * trailOffsetX + 
                  Math.cos(this.car.rotation) * -trailOffsetY;
                
                // Alternate between wheels for trail effect
                const trailX = (time % 200 < 100) ? leftTrailX : rightTrailX;
                const trailY = (time % 200 < 100) ? leftTrailY : rightTrailY;
                
                this.trailEmitter.setPosition(trailX, trailY);
              }
            } else {
              // Not drifting
              if (this.carState.drifting) {
                // Reset drift logic moved directly into update function
                // If we were drifting, add the accumulated drift score
                if (this.carState.driftScore > 0) {
                  const finalDriftScore = Math.floor(this.carState.driftScore * this.carState.driftMultiplier);
                  this.gameScore += finalDriftScore;
                  
                  // Show drift score popup - inline instead of calling showScorePopup
                  const x = this.car.x;
                  const y = this.car.y - 50;
                  
                  const text = this.add
                    .text(x, y, `+${finalDriftScore}`, {
                      fontSize: "28px",
                      color: "#00ffff",
                      stroke: "#000000",
                      strokeThickness: 4,
                    })
                    .setOrigin(0.5);
                  
                  // Add more dynamic animation for drift score
                  this.tweens.add({
                    targets: text,
                    y: y - 80,
                    alpha: 0,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 1200,
                    ease: "Back.easeOut",
                    onComplete: () => {
                      text.destroy();
                    },
                  });
                  
                  // Apply boost after successful drift - stronger boost for longer drifts
                  if (this.carState.driftTime > 1 && this.carState.driftScore > 100) {
                    const boostDuration = Math.min(1 + this.carState.driftTime * 0.5, 3); // Up to 3 seconds
                    const boostStrength = Math.min(1.3 + this.carState.driftMultiplier * 0.1, 1.8); // Up to 1.8x
                    
                    this.carState.boostTime = boostDuration;
                    this.carState.boostFactor = boostStrength;
                    
                    // Show boost text
                    this.boostText.setText(`BOOST! x${boostStrength.toFixed(1)}`);
                    this.boostText.setAlpha(1);
                    this.tweens.add({
                      targets: this.boostText,
                      alpha: 0,
                      duration: 2000,
                      delay: 500,
                    });
                    
                    // Add spark effect for boost
                    if (this.sparkEmitter) {
                      this.sparkEmitter.setPosition(this.car.x, this.car.y);
                      this.sparkEmitter.on = true;
                      this.sparkEmitter.explode(15);
                      
                      // Turn off after a short time
                      this.time.delayedCall(300, () => {
                        if (this.sparkEmitter) {
                          this.sparkEmitter.on = false;
                        }
                      });
                    }
                  }
                }
                
                // Reset car scale animation when ending drift
                this.tweens.add({
                  targets: this.car,
                  scaleX: 1,
                  scaleY: 1,
                  duration: 200,
                  ease: "Sine.easeOut",
                });
                
                // Reset drift state
                this.carState.drifting = false;
                this.carState.driftFactor = 0;
                this.carState.driftTime = 0;
                this.carState.driftScore = 0;
                this.carState.driftMultiplier = 1;
                
                // Hide drift score text
                this.tweens.add({
                  targets: [this.driftScoreText, this.multiplierText],
                  alpha: 0,
                  duration: 300,
                });
                
                // Stop emitting smoke and trail
                if (this.smokeEmitter) {
                  this.smokeEmitter.on = false;
                }
                if (this.trailEmitter) {
                  this.trailEmitter.on = false;
                }
              }
              
              // Normal steering and movement
              this.car.setAngularVelocity(steeringForce * 120); // Slightly more responsive
              this.physics.velocityFromRotation(this.car.rotation, this.carState.speed, this.car.body.velocity);
            }
            // ---- END CAR PHYSICS UPDATE ----

            // Update car shadow position
            if (this.carShadow) {
              this.carShadow.x = this.car.x + 5
              this.carShadow.y = this.car.y + 5
              this.carShadow.rotation = this.car.rotation
              this.carShadow.scaleX = this.car.scaleX
              this.carShadow.scaleY = this.car.scaleY
            }

            // Update smoke particles position
            if (this.carState.drifting && this.smokeEmitter) {
              const smokeOffsetX = -15
              const smokeOffsetY = 8 * this.carState.driftDirection
              const smokeX =
                this.car.x +
                Math.cos(this.car.rotation + Math.PI) * smokeOffsetX -
                Math.sin(this.car.rotation) * smokeOffsetY
              const smokeY =
                this.car.y +
                Math.sin(this.car.rotation + Math.PI) * smokeOffsetX +
                Math.cos(this.car.rotation) * smokeOffsetY
              this.smokeEmitter.setPosition(smokeX, smokeY)
            }

            // Visual effect for boost
            if (this.carState.boostTime > 0) {
              // Pulsing effect on car during boost
              const boostScale = 1 + Math.sin(time / 50) * 0.05
              this.car.setScale(boostScale)

              // Add a color tint during boost
              this.car.setTint(0x00ffff)

              // Emit occasional sparks during boost
              if (this.sparkEmitter && Phaser.Math.Between(0, 100) > 95) {
                this.sparkEmitter.setPosition(this.car.x, this.car.y)
                this.sparkEmitter.explode(5)
              }
            } else {
              // Only reset scale if not drifting
              if (!this.carState.drifting) {
                this.car.setScale(1)
              }
              this.car.clearTint()
            }

            // Update score display
            this.scoreText.setText(`Score: ${this.gameScore}`)

            // Animate score text when score changes
            if (this.gameScore !== this.lastScore) {
              this.tweens.add({
                targets: this.scoreText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true,
                ease: "Sine.easeOut",
              })
              this.lastScore = this.gameScore
            }

            // Update drift score display
            if (this.carState.drifting) {
              this.driftScoreText.setText(`Drift: ${Math.floor(this.carState.driftScore)}`)
              this.driftScoreText.setAlpha(1)

              this.multiplierText.setText(`x${this.carState.driftMultiplier.toFixed(1)}`)
              this.multiplierText.setAlpha(1)

              // Pulse multiplier text based on value
              const pulseScale = 1 + (this.carState.driftMultiplier - 1) * 0.1
              this.multiplierText.setScale(pulseScale + Math.sin(time / 100) * 0.1)
            }

            // Update React state (but not too frequently)
            if (time % 10 === 0) {
              setScore(this.gameScore)
              setTime(time - this.startTime)
            }
          },
        },
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
}`
  },
  {
    path: 'hooks/use-game-state.tsx',
    content: `"use client"

import type React from "react"

import type { GameStatus } from "@/types/game-types"
import { createContext, useContext, useState } from "react"

interface GameStateContextType {
  score: number
  setScore: (score: number) => void
  time: number
  setTime: (time: number) => void
  gameStatus: GameStatus
  setGameStatus: (status: GameStatus) => void
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined)

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu")

  return (
    <GameStateContext.Provider
      value={{
        score,
        setScore,
        time,
        setTime,
        gameStatus,
        setGameStatus,
      }}
    >
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider")
  }
  return context
}`
  },
  {
    path: 'types/game-types.ts',
    content: `export type GameStatus = "menu" | "playing" | "shop" | "gameOver"

export interface PlayerData {
  money: number
  highScore: number
  upgrades: {
    engine: number
    tires: number
    handling: number
  }
  carColor: string
}

export interface CarStats {
  maxSpeed: number
  acceleration: number
  handling: number
  driftFactor: number
}

export interface TrafficCarData {
  x: number
  y: number
  speed: number
  direction: number
  sprite: string
}

export interface CollectibleType {
  type: "coin" | "boost" | "multiplier"
  value: number
  duration?: number
}`
  },
  {
    path: 'utils/format-time.ts',
    content: `export function formatTime(timeInMs: number): string {
  const totalSeconds = Math.floor(timeInMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return \`\${minutes.toString().padStart(2, "0")}:\${seconds.toString().padStart(2, "0")}\`
}`
  },
  {
    path: 'public/placeholder.svg',
    content: `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
<rect width="64" height="64" fill="#333"/>
<text x="32" y="32" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">Placeholder</text>
</svg>`
  }
];

// Create directories and files
function createDirectoryIfNotExists(dirPath) {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function createFile(filePath, content) {
  const fullPath = path.resolve(filePath);
  const directory = path.dirname(fullPath);
  
  createDirectoryIfNotExists(directory);
  
  fs.writeFileSync(fullPath, content);
  console.log(`Created file: ${filePath}`);
}

// Execute the script
console.log('Setting up City Drifter project...');

files.forEach(file => {
  createFile(file.path, file.content);
});

// Create asset directories
createDirectoryIfNotExists('public/assets');
createDirectoryIfNotExists('public/assets/sounds');

console.log('Setup complete! You can now run "npm run dev" to start the development server.');
console.log('Open Cursor to continue working on the project: open -a Cursor .');