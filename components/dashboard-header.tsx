import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions"
import { LogOut, User, Trophy, Target } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: any
  playerData: any
}

export default function DashboardHeader({ user, playerData }: DashboardHeaderProps) {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Zealot Hockey</h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm">ELO: {playerData?.elo || 1000}</span>
              </div>
              <Link href="/profile" className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                <User className="h-4 w-4 text-green-400" />
                <span className="text-sm">{playerData?.player_name || "Player"}</span>
              </Link>
            </div>

            <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </Link>

            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
