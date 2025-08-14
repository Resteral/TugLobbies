import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Trophy } from "lucide-react"

interface RecentGamesProps {
  games: any[]
}

export default function RecentGames({ games }: RecentGamesProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-400" />
          <span>Recent Games</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent games</p>
            <p className="text-sm">Join a lobby to start playing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      Team 1: {game.team1_score} - {game.team2_score} :Team 2
                    </div>
                    <div className="text-sm text-gray-400">{new Date(game.created_at).toLocaleDateString()}</div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      game.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {game.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
