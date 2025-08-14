import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react"

interface PlayerStatsCardProps {
  playerData: any
}

export default function PlayerStatsCard({ playerData }: PlayerStatsCardProps) {
  const winRate = playerData?.win_rate || 0
  const rank = playerData?.rank || "Rookie"

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Player Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData?.elo || 1000}</div>
            <div className="text-sm text-gray-400">ELO Rating</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData?.wins || 0}</div>
            <div className="text-sm text-gray-400">Wins</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData?.losses || 0}</div>
            <div className="text-sm text-gray-400">Losses</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(winRate * 100)}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Current Rank</span>
            <span className="text-lg font-semibold text-blue-400">{rank}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
