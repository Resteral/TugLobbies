"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp, Crown } from "lucide-react"
import Link from "next/link"

interface LeaderboardProps {
  players: any[]
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case "legend":
        return "text-purple-400 bg-purple-600/20"
      case "master":
        return "text-red-400 bg-red-600/20"
      case "expert":
        return "text-orange-400 bg-orange-600/20"
      case "advanced":
        return "text-yellow-400 bg-yellow-600/20"
      case "intermediate":
        return "text-green-400 bg-green-600/20"
      case "beginner":
        return "text-blue-400 bg-blue-600/20"
      default:
        return "text-gray-400 bg-gray-600/20"
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{position}</span>
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span>Top Players</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player, index) => (
            <Link key={player.id} href={`/player/${encodeURIComponent(player.player_name)}`}>
              <div className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">{getPositionIcon(index + 1)}</div>
                    <div>
                      <div className="text-white font-semibold">{player.player_name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getRankColor(player.rank)} border-current`}>
                          {player.rank || "Rookie"}
                        </Badge>
                        <span className="text-xs text-gray-400">{player.total_games || 0} games</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-blue-400">
                        <Target className="h-4 w-4" />
                        <span className="font-bold">{player.elo || 1000}</span>
                      </div>
                      <div className="text-xs text-gray-400">ELO</div>
                    </div>

                    <div className="text-center">
                      <div className="text-green-400 font-bold">{player.wins || 0}</div>
                      <div className="text-xs text-gray-400">Wins</div>
                    </div>

                    <div className="text-center">
                      <div className="text-red-400 font-bold">{player.losses || 0}</div>
                      <div className="text-xs text-gray-400">Losses</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-purple-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">{Math.round((player.win_rate || 0) * 100)}%</span>
                      </div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
