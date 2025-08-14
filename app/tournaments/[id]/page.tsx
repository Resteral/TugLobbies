import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Trophy, Users, Clock, Play } from "lucide-react"
import TournamentBracket from "@/components/tournament-bracket"
import GameScheduler from "@/components/game-scheduler"

interface Props {
  params: { id: string }
}

export default async function TournamentDetailsPage({ params }: Props) {
  const supabase = createClient()

  // Get tournament with all related data
  const { data: tournament } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams (
        id,
        name,
        captain_id,
        color,
        players:players!teams_captain_id_fkey (
          id,
          display_name,
          elo_rating,
          position,
          user_id
        ),
        team_members (
          id,
          player_id,
          is_captain,
          players (
            id,
            display_name,
            elo_rating,
            position
          )
        )
      ),
      games (
        id,
        team1_id,
        team2_id,
        team1_score,
        team2_score,
        status,
        scheduled_at,
        started_at,
        ended_at,
        created_at,
        team1:teams!games_team1_id_fkey (
          id,
          name,
          players:players!teams_captain_id_fkey (
            display_name
          )
        ),
        team2:teams!games_team2_id_fkey (
          id,
          name,
          players:players!teams_captain_id_fkey (
            display_name
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (!tournament) {
    redirect("/tournaments")
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentPlayer = null
  if (user) {
    const { data } = await supabase.from("players").select("*").eq("user_id", user.id).single()
    currentPlayer = data
  }

  const isCreator = currentPlayer?.id === tournament.created_by
  const registeredTeams = tournament.teams?.length || 0
  const totalGames = tournament.games?.length || 0
  const completedGames = tournament.games?.filter((g) => g.status === "completed").length || 0

  return (
    <div className="space-y-8">
      {/* Tournament Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
            <p className="text-slate-400 text-lg">{tournament.description}</p>
          </div>
          <Badge
            className={
              tournament.status === "active"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : tournament.status === "upcoming"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }
          >
            {tournament.status === "active"
              ? "Live Tournament"
              : tournament.status === "upcoming"
                ? "Upcoming"
                : "Completed"}
          </Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-white font-semibold">
                {tournament.start_date
                  ? new Date(tournament.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "TBD"}
              </div>
              <div className="text-slate-400 text-sm">Start Date</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-white font-semibold">{registeredTeams}</div>
              <div className="text-slate-400 text-sm">Teams</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-white font-semibold">
                {completedGames}/{totalGames}
              </div>
              <div className="text-slate-400 text-sm">Games</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-white font-semibold">${tournament.prize_pool || 0}</div>
              <div className="text-slate-400 text-sm">Prize Pool</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tournament Management */}
      {isCreator && tournament.status === "upcoming" && registeredTeams >= 4 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Tournament Management</CardTitle>
            <CardDescription>Generate bracket and start the tournament</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={`/api/tournaments/${params.id}/generate-bracket`} method="POST">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Generate Bracket & Start Tournament
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tournament Bracket */}
      {tournament.status === "active" && tournament.games && tournament.games.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Tournament Bracket</h2>
          <TournamentBracket games={tournament.games} teams={tournament.teams || []} />
        </div>
      )}

      {/* Game Scheduler */}
      {isCreator && tournament.status === "active" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Game Scheduler</h2>
          <GameScheduler games={tournament.games || []} />
        </div>
      )}

      {/* Teams List */}
      {tournament.teams && tournament.teams.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Participating Teams</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tournament.teams
              .sort((a, b) => (b.players?.elo_rating || 0) - (a.players?.elo_rating || 0))
              .map((team, index) => (
                <Card key={team.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{team.name}</h3>
                          <p className="text-slate-400 text-sm">
                            Captain: {team.players?.display_name} ({team.players?.elo_rating} ELO)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    {team.team_members && team.team_members.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-semibold text-sm">Roster:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {team.team_members.map((member) => (
                            <div key={member.id} className="bg-slate-800 rounded p-2 text-center">
                              <div className="text-white text-sm font-semibold">{member.players?.display_name}</div>
                              <div className="text-slate-400 text-xs">{member.players?.position}</div>
                              <div className="text-orange-500 text-xs">{member.players?.elo_rating}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Registration CTA */}
      {tournament.status === "upcoming" && registeredTeams < tournament.max_teams && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Join This Tournament</h3>
            <p className="text-slate-400 mb-6">Register as a captain and draft your team</p>
            <Link href={`/draft/${params.id}`}>
              <Button className="bg-orange-600 hover:bg-orange-700">Register Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
