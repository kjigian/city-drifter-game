import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
        <p className="text-yellow-400 text-xl font-bold">Loading Game...</p>
      </div>
    </div>
  )
}

