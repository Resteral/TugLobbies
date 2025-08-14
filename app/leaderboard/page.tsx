import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Target } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = createClient()

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", true)
    .order("elo_rating", { ascending: false })
    .limit(50)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-slate-400 font-bold text-lg">#{rank}</span>
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Forward":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Defense":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Goalie":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Target className="h-8 w-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-slate-400 text-lg">Current ELO rankings for all active players</p>
      </div>

      {players && players.length > 0 ? (
        <div className="space-y-4">
          {/* Top 3 Players - Special Display */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {players.slice(0, 3).map((player, index) => (
              <Card key={player.id} className="bg-slate-900 border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">{getRankIcon(index + 1)}</div>
                  <CardTitle className="text-white text-xl">{player.display_name}</CardTitle>
                  <div className="text-2xl font-bold text-orange-500">{player.elo_rating} ELO</div>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <Badge className={getPositionColor(player.position)}>{player.position}</Badge>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-400">Games</div>
                      <div className="text-white font-semibold">{player.games_played}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Wins</div>
                      <div className="text-green-400 font-semibold">{player.wins}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">W/L</div>
                      <div className="text-white font-semibold">
                        {player.games_played > 0 ? ((player.wins / player.games_played) * 100).toFixed(0) + "%" : "0%"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rest of Players - List Format */}
          <div className="space-y-2">
            {players.slice(3).map((player, index) => (
              <Card key={player.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full">
                        {getRankIcon(index + 4)}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">{player.display_name}</div>
                        <div className="text-slate-400 text-sm">@{player.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <Badge className={getPositionColor(player.position)}>{player.position}</Badge>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">{player.elo_rating}</div>
                        <div className="text-slate-400 text-sm">ELO</div>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="text-white font-semibold">
                          {player.wins}-{player.losses}
                        </div>
                        <div className="text-slate-400 text-sm">{player.games_played} games</div>
                      </div>

                      {(player.goals > 0 || player.assists > 0 || player.saves > 0) && (
                        <div className="text-right min-w-[60px]">
                          <div className="text-white font-semibold">
                            {player.position === "Goalie" ? player.saves : player.goals + player.assists}
                          </div>
                          <div className="text-slate-400 text-sm">{player.position === "Goalie" ? "saves" : "pts"}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
            <p className="text-slate-400">Be the first to join the league and claim the top spot!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
