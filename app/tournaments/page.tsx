import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Trophy, Users, Clock, Award } from "lucide-react"

export default async function TournamentsPage() {
  const supabase = createClient()

  // Get all tournaments with team counts
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams (
        id,
        name,
        captain_id,
        players:players!teams_captain_id_fkey (
          display_name,
          elo_rating
        )
      ),
      games (
        id,
        status,
        team1_score,
        team2_score
      )
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "active":
        return <Trophy className="h-4 w-4" />
      case "completed":
        return <Award className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-white">Tournaments</h1>
        </div>
        <p className="text-slate-400 text-lg">Compete in bracket-style tournaments</p>
      </div>

      {tournaments && tournaments.length > 0 ? (
        <div className="grid gap-6">
          {tournaments.map((tournament) => {
            const registeredTeams = tournament.teams?.length || 0
            const totalGames = tournament.games?.length || 0
            const completedGames = tournament.games?.filter((g) => g.status === "completed").length || 0
            const progress = totalGames > 0 ? (completedGames / totalGames) * 100 : 0

            return (
              <Card
                key={tournament.id}
                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-white text-xl">{tournament.name}</CardTitle>
                      <CardDescription>{tournament.description}</CardDescription>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {tournament.start_date
                              ? new Date(tournament.start_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Date TBD"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>{registeredTeams} teams</span>
                        </div>
                        {tournament.status === "active" && (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Trophy className="h-4 w-4" />
                            <span>
                              {completedGames}/{totalGames} games
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(tournament.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(tournament.status)}
                        <span className="capitalize">{tournament.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tournament Progress */}
                  {tournament.status === "active" && totalGames > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Tournament Progress</span>
                        <span className="text-white font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Prize Pool */}
                  {tournament.prize_pool > 0 && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-semibold">Prize Pool</span>
                        <span className="text-yellow-400 text-lg font-bold">${tournament.prize_pool}</span>
                      </div>
                    </div>
                  )}

                  {/* Top Teams Preview */}
                  {tournament.teams && tournament.teams.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-sm">Top Teams</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {tournament.teams
                          .sort((a, b) => (b.players?.elo_rating || 0) - (a.players?.elo_rating || 0))
                          .slice(0, 4)
                          .map((team, index) => (
                            <div key={team.id} className="bg-slate-800 rounded p-2 text-center">
                              <div className="text-xs text-slate-400 mb-1">#{index + 1}</div>
                              <div className="text-white text-sm font-semibold truncate">
                                {team.players?.display_name || "Unknown"}
                              </div>
                              <div className="text-orange-500 text-xs">{team.players?.elo_rating || 0}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-2">
                    <Link href={`/tournaments/${tournament.id}`}>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        {tournament.status === "active" ? "View Bracket" : "View Details"}
                      </Button>
                    </Link>

                    {tournament.status === "upcoming" && (
                      <Link href={`/draft/${tournament.id}`}>
                        <Button variant="outline">Join Draft</Button>
                      </Link>
                    )}

                    {tournament.status === "completed" && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-slate-400 mb-6">Create your first tournament to get started!</p>
            <Link href="/draft">
              <Button className="bg-orange-600 hover:bg-orange-700">Create Tournament</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
